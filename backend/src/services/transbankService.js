const { WebpayPlus, Options, Environment } = require('transbank-sdk');
const { Usuario } = require('../models/apoderado');
const Pago = require('../models/pago');
const Cuota = require('../models/cuota');
const EstadoPago = require('../models/estadoPago');
const Logger = require('../utils/logger');

class TransbankService {
  constructor() {
    // Configurar Transbank según el entorno
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Configuración para producción
      this.options = new Options(
        process.env.TRANSBANK_COMMERCE_CODE,
        process.env.TRANSBANK_API_KEY,
        Environment.Production
      );
    } else {
      // Configuración para desarrollo/testing
      this.options = new Options(
        '597055555532',
        '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C',
        Environment.Integration
      );
    }
    
    this.webpayPlus = new WebpayPlus.Transaction(this.options);
  }

  /**
   * Crear una transacción de pago con Transbank
   */
  async createTransaction(apoderadoId, cuotaIds, alumnoId = null) {
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

      // Generar orden de compra única
      const buyOrder = `PAY_${apoderadoId}_${Date.now()}`;
      const sessionId = `SESSION_${apoderadoId}_${Date.now()}`;

      // URLs de retorno
      const returnUrl = process.env.TRANSBANK_RETURN_URL || 'http://localhost:3000/api/transbank/return';

      // Crear transacción en Transbank
      const response = await this.webpayPlus.create(
        buyOrder,
        sessionId,
        Math.round(montoTotal), // Transbank requiere monto en pesos chilenos enteros
        returnUrl
      );

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
          metodo_pago: 'Transbank',
          transaccion_id: response.token, // Token de Transbank
          datos_pago: {
            buy_order: buyOrder,
            session_id: sessionId,
            token: response.token,
            url: response.url,
            amount: Math.round(montoTotal),
            created_at: new Date().toISOString()
          }
        });
        pagosCreados.push(pago);
      }

      Logger.info('Transacción de Transbank creada exitosamente', {
        apoderadoId,
        buyOrder,
        token: response.token,
        monto: montoTotal,
        cuotas: cuotaIds
      });

      return {
        token: response.token,
        url: response.url,
        buy_order: buyOrder,
        session_id: sessionId,
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
      Logger.error('Error al crear transacción de Transbank', {
        error: error.message,
        apoderadoId,
        cuotaIds
      });
      throw error;
    }
  }

  /**
   * Confirmar una transacción de Transbank
   */
  async confirmTransaction(token) {
    try {
      // Confirmar transacción con Transbank
      const response = await this.webpayPlus.commit(token);

      Logger.info('Respuesta de confirmación de Transbank', {
        token,
        response_code: response.response_code,
        status: response.status,
        amount: response.amount
      });

      // Verificar que la transacción fue exitosa
      if (response.response_code !== 0 || response.status !== 'AUTHORIZED') {
        throw new Error(`Transacción rechazada: ${response.response_code} - ${response.status}`);
      }

      // Buscar los pagos asociados a este token
      const pagos = await Pago.findAll({
        where: { transaccion_id: token }
      });

      if (pagos.length === 0) {
        throw new Error('No se encontraron pagos asociados a este token');
      }

      // Marcar los pagos como completados
      const estadoPagado = await EstadoPago.getIdByEstado('Pagado');
      
      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoPagado,
          fecha_pago: new Date(),
          datos_pago: {
            ...pago.datos_pago,
            transbank_response: response,
            confirmed_at: new Date().toISOString(),
            authorization_code: response.authorization_code,
            card_detail: response.card_detail
          }
        });
      }

      Logger.info('Transacción de Transbank confirmada exitosamente', {
        token,
        authorization_code: response.authorization_code,
        amount: response.amount,
        pagos_actualizados: pagos.length
      });

      return {
        success: true,
        token,
        authorization_code: response.authorization_code,
        amount: response.amount,
        currency: 'CLP',
        transaction_date: response.transaction_date,
        card_detail: {
          card_number: response.card_detail?.card_number || 'XXXX'
        },
        pagos_actualizados: pagos.length
      };
    } catch (error) {
      Logger.error('Error al confirmar transacción de Transbank', {
        error: error.message,
        token
      });
      throw error;
    }
  }

  /**
   * Obtener el estado de una transacción
   */
  async getTransactionStatus(token) {
    try {
      const response = await this.webpayPlus.status(token);

      return {
        token,
        status: response.status,
        amount: response.amount,
        authorization_code: response.authorization_code,
        response_code: response.response_code,
        transaction_date: response.transaction_date
      };
    } catch (error) {
      Logger.error('Error al obtener estado de transacción de Transbank', {
        error: error.message,
        token
      });
      throw error;
    }
  }

  /**
   * Refundar una transacción (anular)
   */
  async refundTransaction(token, amount = null) {
    try {
      // Si no se especifica monto, se reembolsa el total
      const response = amount 
        ? await this.webpayPlus.refund(token, amount)
        : await this.webpayPlus.refund(token);

      // Actualizar los pagos asociados
      const pagos = await Pago.findAll({
        where: { transaccion_id: token }
      });

      const estadoCancelado = await EstadoPago.getIdByEstado('Cancelado');

      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoCancelado,
          datos_pago: {
            ...pago.datos_pago,
            refund_response: response,
            refunded_at: new Date().toISOString()
          }
        });
      }

      Logger.info('Transacción de Transbank reembolsada exitosamente', {
        token,
        refund_amount: response.amount,
        pagos_actualizados: pagos.length
      });

      return {
        success: true,
        token,
        refund_amount: response.amount,
        refund_type: response.type,
        pagos_actualizados: pagos.length
      };
    } catch (error) {
      Logger.error('Error al reembolsar transacción de Transbank', {
        error: error.message,
        token,
        amount
      });
      throw error;
    }
  }

  /**
   * Obtener historial de pagos de Transbank para un apoderado
   */
  async getPaymentHistory(apoderadoId, limit = 50) {
    try {
      const pagos = await Pago.findAll({
        where: { 
          apoderado_id: apoderadoId,
          metodo_pago: 'Transbank'
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
        authorization_code: pago.datos_pago?.authorization_code,
        card_detail: pago.datos_pago?.card_detail
      }));
    } catch (error) {
      Logger.error('Error al obtener historial de pagos de Transbank', {
        error: error.message,
        apoderadoId
      });
      throw error;
    }
  }

  /**
   * Validar configuración de Transbank
   */
  validateConfiguration() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      if (!process.env.TRANSBANK_COMMERCE_CODE || !process.env.TRANSBANK_API_KEY) {
        throw new Error('Configuración de Transbank incompleta para producción');
      }
    }

    return {
      environment: isProduction ? 'production' : 'test',
      commerce_code: isProduction ? process.env.TRANSBANK_COMMERCE_CODE : 'TEST',
      configured: true
    };
  }
}

module.exports = TransbankService;

