const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { Usuario } = require('../models/apoderado');
const Pago = require('../models/pago');
const Cuota = require('../models/cuota');
const EstadoPago = require('../models/estadoPago');
const Logger = require('../utils/logger');

class MercadoPagoService {
  constructor() {
    // Configurar MercadoPago
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    this.client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });

    this.preference = new Preference(this.client);
    this.payment = new Payment(this.client);
  }

  /**
   * Crear una preferencia de pago con MercadoPago
   */
  async createPreference(apoderadoId, cuotaIds, alumnoId = null) {
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

      // Preparar items para MercadoPago
      const items = cuotas.map(cuota => ({
        id: cuota.id.toString(),
        title: cuota.nombre,
        description: `Cuota escolar - ${cuota.nombre}`,
        quantity: 1,
        unit_price: parseFloat(cuota.monto),
        currency_id: 'CLP'
      }));

      // Calcular monto total
      const montoTotal = cuotas.reduce((sum, cuota) => sum + parseFloat(cuota.monto), 0);

      // Generar external_reference único
      const externalReference = `PAY_${apoderadoId}_${Date.now()}`;

      // URLs de notificación y retorno
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      
      const preferenceData = {
        items: items,
        payer: {
          name: apoderado.nombre,
          surname: apoderado.apellido,
          email: apoderado.email
        },
        external_reference: externalReference,
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/payment/failure`,
          pending: `${baseUrl}/payment/pending`
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12 // Permitir hasta 12 cuotas
        },
        statement_descriptor: 'COLEGIO CUOTAS',
        metadata: {
          apoderado_id: apoderadoId.toString(),
          alumno_id: alumnoId ? alumnoId.toString() : '',
          cuota_ids: cuotaIds.join(',')
        }
      };

      // Crear preferencia en MercadoPago
      const preference = await this.preference.create({ body: preferenceData });

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
          metodo_pago: 'MercadoPago',
          transaccion_id: preference.id,
          datos_pago: {
            preference_id: preference.id,
            external_reference: externalReference,
            init_point: preference.init_point,
            sandbox_init_point: preference.sandbox_init_point,
            amount: montoTotal,
            created_at: new Date().toISOString()
          }
        });
        pagosCreados.push(pago);
      }

      Logger.info('Preferencia de MercadoPago creada exitosamente', {
        apoderadoId,
        preferenceId: preference.id,
        externalReference,
        monto: montoTotal,
        cuotas: cuotaIds
      });

      return {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        external_reference: externalReference,
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
      Logger.error('Error al crear preferencia de MercadoPago', {
        error: error.message,
        apoderadoId,
        cuotaIds
      });
      throw error;
    }
  }

  /**
   * Procesar notificación de webhook de MercadoPago
   */
  async processWebhook(notificationData) {
    try {
      const { type, data } = notificationData;

      Logger.info('Procesando webhook de MercadoPago', {
        type,
        id: data?.id
      });

      if (type === 'payment') {
        return await this.processPaymentNotification(data.id);
      }

      Logger.info('Tipo de webhook no manejado', { type });
      return { processed: false, reason: 'Tipo de webhook no manejado' };
    } catch (error) {
      Logger.error('Error al procesar webhook de MercadoPago', {
        error: error.message,
        notificationData
      });
      throw error;
    }
  }

  /**
   * Procesar notificación de pago
   */
  async processPaymentNotification(paymentId) {
    try {
      // Obtener información del pago desde MercadoPago
      const paymentInfo = await this.payment.get({ id: paymentId });

      Logger.info('Información de pago de MercadoPago', {
        paymentId,
        status: paymentInfo.status,
        external_reference: paymentInfo.external_reference
      });

      // Buscar los pagos asociados por external_reference
      const pagos = await Pago.findAll({
        where: { 
          transaccion_id: paymentInfo.external_reference || paymentId.toString()
        }
      });

      if (pagos.length === 0) {
        Logger.warn('No se encontraron pagos asociados', { paymentId });
        return { processed: false, reason: 'Pagos no encontrados' };
      }

      // Procesar según el estado del pago
      let estadoId;
      switch (paymentInfo.status) {
        case 'approved':
          estadoId = await EstadoPago.getIdByEstado('Pagado');
          break;
        case 'rejected':
        case 'cancelled':
          estadoId = await EstadoPago.getIdByEstado('Cancelado');
          break;
        case 'pending':
        case 'in_process':
          estadoId = await EstadoPago.getIdByEstado('Pendiente');
          break;
        default:
          Logger.warn('Estado de pago no reconocido', { status: paymentInfo.status });
          return { processed: false, reason: 'Estado no reconocido' };
      }

      // Actualizar los pagos
      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoId,
          fecha_pago: paymentInfo.status === 'approved' ? new Date() : pago.fecha_pago,
          datos_pago: {
            ...pago.datos_pago,
            mercadopago_payment: paymentInfo,
            processed_at: new Date().toISOString(),
            payment_id: paymentId,
            status: paymentInfo.status
          }
        });
      }

      Logger.info('Notificación de pago de MercadoPago procesada', {
        paymentId,
        status: paymentInfo.status,
        pagos_actualizados: pagos.length
      });

      return {
        processed: true,
        payment_id: paymentId,
        status: paymentInfo.status,
        pagos_actualizados: pagos.length
      };
    } catch (error) {
      Logger.error('Error al procesar notificación de pago de MercadoPago', {
        error: error.message,
        paymentId
      });
      throw error;
    }
  }

  /**
   * Obtener información de un pago
   */
  async getPaymentInfo(paymentId) {
    try {
      const paymentInfo = await this.payment.get({ id: paymentId });
      
      return {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        transaction_amount: paymentInfo.transaction_amount,
        currency_id: paymentInfo.currency_id,
        date_created: paymentInfo.date_created,
        date_approved: paymentInfo.date_approved,
        external_reference: paymentInfo.external_reference,
        payment_method: {
          id: paymentInfo.payment_method_id,
          type: paymentInfo.payment_type_id
        },
        payer: paymentInfo.payer
      };
    } catch (error) {
      Logger.error('Error al obtener información de pago de MercadoPago', {
        error: error.message,
        paymentId
      });
      throw error;
    }
  }

  /**
   * Reembolsar un pago
   */
  async refundPayment(paymentId, amount = null) {
    try {
      const refundData = amount ? { amount } : {};
      
      // MercadoPago maneja reembolsos a través de la API de refunds
      // Nota: Esta funcionalidad puede requerir permisos especiales
      const refund = await this.payment.refund({
        id: paymentId,
        body: refundData
      });

      // Actualizar los pagos asociados
      const pagos = await Pago.findAll({
        where: { 
          datos_pago: {
            payment_id: paymentId
          }
        }
      });

      const estadoCancelado = await EstadoPago.getIdByEstado('Cancelado');

      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoCancelado,
          datos_pago: {
            ...pago.datos_pago,
            refund_info: refund,
            refunded_at: new Date().toISOString()
          }
        });
      }

      Logger.info('Pago de MercadoPago reembolsado exitosamente', {
        paymentId,
        refund_id: refund.id,
        amount: refund.amount
      });

      return {
        success: true,
        refund_id: refund.id,
        amount: refund.amount,
        status: refund.status
      };
    } catch (error) {
      Logger.error('Error al reembolsar pago de MercadoPago', {
        error: error.message,
        paymentId,
        amount
      });
      throw error;
    }
  }

  /**
   * Obtener historial de pagos de MercadoPago para un apoderado
   */
  async getPaymentHistory(apoderadoId, limit = 50) {
    try {
      const pagos = await Pago.findAll({
        where: { 
          apoderado_id: apoderadoId,
          metodo_pago: 'MercadoPago'
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
        payment_id: pago.datos_pago?.payment_id,
        preference_id: pago.datos_pago?.preference_id
      }));
    } catch (error) {
      Logger.error('Error al obtener historial de pagos de MercadoPago', {
        error: error.message,
        apoderadoId
      });
      throw error;
    }
  }

  /**
   * Validar configuración de MercadoPago
   */
  validateConfiguration() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    const isProduction = accessToken.startsWith('APP_USR');
    const isTest = accessToken.startsWith('TEST');

    return {
      environment: isProduction ? 'production' : (isTest ? 'test' : 'unknown'),
      configured: true,
      access_token_type: isProduction ? 'production' : (isTest ? 'test' : 'unknown')
    };
  }
}

module.exports = MercadoPagoService;

