const axios = require('axios');
const crypto = require('crypto');
const { Usuario } = require('../models/apoderado');
const Pago = require('../models/pago');
const Cuota = require('../models/cuota');
const EstadoPago = require('../models/estadoPago');
const Logger = require('../utils/logger');

class BancoEstadoService {
  constructor() {
    // Configuración de BancoEstado
    this.baseUrl = process.env.BANCOESTADO_BASE_URL || 'https://www.bancoestado.cl/api';
    this.merchantId = process.env.BANCOESTADO_MERCHANT_ID;
    this.secretKey = process.env.BANCOESTADO_SECRET_KEY;
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // URLs de prueba vs producción
    if (!this.isProduction) {
      this.baseUrl = 'https://test.bancoestado.cl/api'; // URL de prueba (hipotética)
    }

    if (!this.merchantId || !this.secretKey) {
      Logger.warn('Configuración de BancoEstado incompleta');
    }
  }

  /**
   * Generar firma para autenticación
   */
  generateSignature(data, timestamp) {
    const message = `${this.merchantId}${timestamp}${JSON.stringify(data)}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
  }

  /**
   * Realizar petición autenticada a BancoEstado
   */
  async makeAuthenticatedRequest(endpoint, data, method = 'POST') {
    try {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature(data, timestamp);

      const headers = {
        'Content-Type': 'application/json',
        'X-Merchant-Id': this.merchantId,
        'X-Timestamp': timestamp,
        'X-Signature': signature
      };

      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
        timeout: 30000
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      Logger.error('Error en petición a BancoEstado', {
        error: error.message,
        endpoint,
        status: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Crear una orden de pago con BancoEstado
   */
  async createPaymentOrder(apoderadoId, cuotaIds, alumnoId = null) {
    try {
      // Obtener el apoderado
      const apoderado = await Usuario.findOne({
        where: { id: apoderadoId, rol: 'apoderado' }
      });

      if (!apoderado) {
        throw new Error('Apoderado no encontrado');
      }

      // Obtener las cuotas a pagar
      const cuotas = await Cuota.findAll({
        where: { id: cuotaIds }
      });

      if (cuotas.length === 0) {
        throw new Error('No se encontraron cuotas para pagar');
      }

      // Calcular el monto total
      const montoTotal = cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0);

      // Generar orden única
      const orderNumber = `BE_${apoderadoId}_${Date.now()}`;
      
      // URLs de retorno
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      // Datos de la orden para BancoEstado
      const orderData = {
        merchant_id: this.merchantId,
        order_number: orderNumber,
        amount: Math.round(montoTotal), // BancoEstado requiere enteros
        currency: 'CLP',
        description: `Pago cuotas escolares - ${cuotas.map(c => c.nombre).join(', ')}`,
        customer: {
          name: `${apoderado.nombre} ${apoderado.apellido}`,
          email: apoderado.email,
          phone: apoderado.telefono || '',
          document_type: 'RUT',
          document_number: apoderado.rut || ''
        },
        return_url: `${baseUrl}/api/bancoestado/return`,
        cancel_url: `${baseUrl}/api/bancoestado/cancel`,
        notification_url: `${baseUrl}/api/bancoestado/webhook`,
        metadata: {
          apoderado_id: apoderadoId.toString(),
          alumno_id: alumnoId ? alumnoId.toString() : '',
          cuota_ids: cuotaIds.join(',')
        }
      };

      // Crear orden en BancoEstado
      const response = await this.makeAuthenticatedRequest('/payments/create', orderData);

      // Crear registros de pago pendientes
      const estadoPendiente = await EstadoPago.getIdByEstado('Pendiente');
      
      const pagosCreados = [];
      for (const cuota of cuotas) {
        const pago = await Pago.create({
          cuota_id: cuota.id,
          alumno_id: alumnoId || 0,
          apoderado_id: apoderadoId,
          monto_pagado: cuota.monto,
          estado_id: estadoPendiente,
          metodo_pago: 'BancoEstado',
          transaccion_id: response.payment_id || orderNumber,
          datos_pago: {
            order_number: orderNumber,
            payment_id: response.payment_id,
            payment_url: response.payment_url,
            amount: montoTotal,
            created_at: new Date().toISOString(),
            bancoestado_response: response
          }
        });
        pagosCreados.push(pago);
      }

      Logger.info('Orden de pago de BancoEstado creada exitosamente', {
        apoderadoId,
        orderNumber,
        paymentId: response.payment_id,
        monto: montoTotal,
        cuotas: cuotaIds
      });

      return {
        payment_id: response.payment_id,
        payment_url: response.payment_url,
        order_number: orderNumber,
        amount: montoTotal,
        currency: 'CLP',
        cuotas: cuotas.map(c => ({
          id: c.id,
          nombre: c.nombre,
          monto: c.monto
        })),
        pagos_creados: pagosCreados.length
      };
    } catch (error) {
      Logger.error('Error al crear orden de pago de BancoEstado', {
        error: error.message,
        apoderadoId,
        cuotaIds
      });
      throw error;
    }
  }

  /**
   * Procesar webhook de BancoEstado
   */
  async processWebhook(webhookData) {
    try {
      Logger.info('Procesando webhook de BancoEstado', {
        payment_id: webhookData.payment_id,
        status: webhookData.status
      });

      // Verificar firma del webhook
      const isValid = this.verifyWebhookSignature(webhookData);
      if (!isValid) {
        throw new Error('Firma de webhook inválida');
      }

      // Buscar los pagos asociados
      const pagos = await Pago.findAll({
        where: { 
          transaccion_id: webhookData.payment_id
        }
      });

      if (pagos.length === 0) {
        Logger.warn('No se encontraron pagos asociados al webhook', {
          payment_id: webhookData.payment_id
        });
        return { processed: false, reason: 'Pagos no encontrados' };
      }

      // Procesar según el estado
      let estadoId;
      switch (webhookData.status) {
        case 'approved':
        case 'completed':
          estadoId = await EstadoPago.getIdByEstado('Pagado');
          break;
        case 'rejected':
        case 'cancelled':
          estadoId = await EstadoPago.getIdByEstado('Cancelado');
          break;
        case 'pending':
        case 'processing':
          estadoId = await EstadoPago.getIdByEstado('Pendiente');
          break;
        default:
          Logger.warn('Estado de pago no reconocido', { status: webhookData.status });
          return { processed: false, reason: 'Estado no reconocido' };
      }

      // Actualizar los pagos
      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoId,
          fecha_pago: webhookData.status === 'approved' || webhookData.status === 'completed' 
            ? new Date() : pago.fecha_pago,
          datos_pago: {
            ...pago.datos_pago,
            webhook_data: webhookData,
            processed_at: new Date().toISOString(),
            transaction_reference: webhookData.transaction_reference
          }
        });
      }

      Logger.info('Webhook de BancoEstado procesado exitosamente', {
        payment_id: webhookData.payment_id,
        status: webhookData.status,
        pagos_actualizados: pagos.length
      });

      return {
        processed: true,
        payment_id: webhookData.payment_id,
        status: webhookData.status,
        pagos_actualizados: pagos.length
      };
    } catch (error) {
      Logger.error('Error al procesar webhook de BancoEstado', {
        error: error.message,
        webhookData
      });
      throw error;
    }
  }

  /**
   * Verificar firma del webhook
   */
  verifyWebhookSignature(webhookData) {
    try {
      const { signature, timestamp, ...data } = webhookData;
      const expectedSignature = this.generateSignature(data, timestamp);
      return signature === expectedSignature;
    } catch (error) {
      Logger.error('Error al verificar firma de webhook', { error: error.message });
      return false;
    }
  }

  /**
   * Consultar estado de un pago
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/payments/${paymentId}/status`, 
        {}, 
        'GET'
      );

      return {
        payment_id: paymentId,
        status: response.status,
        amount: response.amount,
        currency: response.currency,
        transaction_date: response.transaction_date,
        transaction_reference: response.transaction_reference
      };
    } catch (error) {
      Logger.error('Error al consultar estado de pago de BancoEstado', {
        error: error.message,
        paymentId
      });
      throw error;
    }
  }

  /**
   * Anular un pago
   */
  async cancelPayment(paymentId) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/payments/${paymentId}/cancel`,
        { reason: 'Cancelación solicitada por el comercio' }
      );

      // Actualizar los pagos asociados
      const pagos = await Pago.findAll({
        where: { transaccion_id: paymentId }
      });

      const estadoCancelado = await EstadoPago.getIdByEstado('Cancelado');

      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoCancelado,
          datos_pago: {
            ...pago.datos_pago,
            cancellation_response: response,
            cancelled_at: new Date().toISOString()
          }
        });
      }

      Logger.info('Pago de BancoEstado cancelado exitosamente', {
        paymentId,
        pagos_actualizados: pagos.length
      });

      return {
        success: true,
        payment_id: paymentId,
        status: response.status,
        pagos_actualizados: pagos.length
      };
    } catch (error) {
      Logger.error('Error al cancelar pago de BancoEstado', {
        error: error.message,
        paymentId
      });
      throw error;
    }
  }

  /**
   * Obtener historial de pagos de BancoEstado para un apoderado
   */
  async getPaymentHistory(apoderadoId, limit = 50) {
    try {
      const pagos = await Pago.findAll({
        where: { 
          apoderado_id: apoderadoId,
          metodo_pago: 'BancoEstado'
        },
        limit: parseInt(limit),
        order: [['fecha_pago', 'DESC']],
        include: [
          {
            model: Cuota,
            as: 'cuota',
            attributes: ['id', 'nombre', 'monto', 'fecha_limite_pago']
          },
          {
            model: EstadoPago,
            as: 'estado',
            attributes: ['id', 'estado']
          }
        ]
      });

      return pagos.map(pago => ({
        id: pago.id,
        cuota: pago.cuota,
        monto_pagado: pago.monto_pagado,
        fecha_pago: pago.fecha_pago,
        estado: pago.estado?.estado || 'Desconocido',
        metodo_pago: pago.metodo_pago,
        transaccion_id: pago.transaccion_id,
        order_number: pago.datos_pago?.order_number,
        transaction_reference: pago.datos_pago?.transaction_reference
      }));
    } catch (error) {
      Logger.error('Error al obtener historial de pagos de BancoEstado', {
        error: error.message,
        apoderadoId
      });
      throw error;
    }
  }

  /**
   * Validar configuración de BancoEstado
   */
  validateConfiguration() {
    const isConfigured = !!(this.merchantId && this.secretKey);
    
    return {
      environment: this.isProduction ? 'production' : 'test',
      configured: isConfigured,
      merchant_id: this.merchantId ? 'SET' : 'NOT_SET',
      secret_key: this.secretKey ? 'SET' : 'NOT_SET'
    };
  }

  /**
   * Simular respuesta para modo de prueba
   */
  async simulateTestResponse(action, data) {
    if (this.isProduction) {
      throw new Error('Simulación solo disponible en modo de prueba');
    }

    Logger.info('Simulando respuesta de BancoEstado', { action, data });

    switch (action) {
      case 'create_payment':
        return {
          payment_id: `TEST_${Date.now()}`,
          payment_url: `https://test.bancoestado.cl/pay/${Date.now()}`,
          status: 'pending'
        };
      
      case 'webhook':
        return {
          payment_id: data.payment_id,
          status: 'approved',
          amount: data.amount,
          transaction_reference: `TXN_${Date.now()}`,
          timestamp: Date.now().toString(),
          signature: 'test_signature'
        };
      
      default:
        throw new Error('Acción de simulación no reconocida');
    }
  }
}

module.exports = BancoEstadoService;

