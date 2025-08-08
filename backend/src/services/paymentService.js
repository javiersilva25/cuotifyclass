const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Usuario } = require('../models/apoderado');
const Pago = require('../models/pago');
const Cuota = require('../models/cuota');
const EstadoPago = require('../models/estadoPago');
const Logger = require('../utils/logger');

class PaymentService {
  /**
   * Crear un cliente en Stripe para un apoderado
   */
  static async createStripeCustomer(apoderado) {
    try {
      const customer = await stripe.customers.create({
        email: apoderado.email,
        name: `${apoderado.nombre} ${apoderado.apellido}`,
        metadata: {
          apoderado_id: apoderado.id.toString(),
          sistema: 'gestion-escolar'
        }
      });

      // Actualizar el apoderado con el ID del cliente de Stripe
      await apoderado.update({
        stripe_customer_id: customer.id
      });

      Logger.info('Cliente de Stripe creado exitosamente', {
        apoderadoId: apoderado.id,
        stripeCustomerId: customer.id
      });

      return customer;
    } catch (error) {
      Logger.error('Error al crear cliente de Stripe', {
        error: error.message,
        apoderadoId: apoderado.id
      });
      throw new Error('Error al configurar el cliente de pagos');
    }
  }

  /**
   * Obtener o crear un cliente de Stripe para un apoderado
   */
  static async getOrCreateStripeCustomer(apoderado) {
    try {
      // Si ya tiene un customer ID, verificar que existe en Stripe
      if (apoderado.stripe_customer_id) {
        try {
          const customer = await stripe.customers.retrieve(apoderado.stripe_customer_id);
          if (!customer.deleted) {
            return customer;
          }
        } catch (error) {
          Logger.warn('Cliente de Stripe no encontrado, creando uno nuevo', {
            apoderadoId: apoderado.id,
            oldCustomerId: apoderado.stripe_customer_id
          });
        }
      }

      // Crear nuevo cliente
      return await this.createStripeCustomer(apoderado);
    } catch (error) {
      Logger.error('Error al obtener/crear cliente de Stripe', {
        error: error.message,
        apoderadoId: apoderado.id
      });
      throw error;
    }
  }

  /**
   * Crear un Payment Intent para procesar un pago
   */
  static async createPaymentIntent(apoderadoId, cuotaIds, alumnoId = null) {
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
      const montoEnCentavos = Math.round(montoTotal * 100); // Stripe maneja centavos

      // Obtener o crear cliente de Stripe
      const customer = await this.getOrCreateStripeCustomer(apoderado);

      // Crear Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: montoEnCentavos,
        currency: 'clp', // Peso chileno, cambiar según el país
        customer: customer.id,
        metadata: {
          apoderado_id: apoderadoId.toString(),
          cuota_ids: cuotaIds.join(','),
          alumno_id: alumnoId ? alumnoId.toString() : '',
          sistema: 'gestion-escolar'
        },
        description: `Pago de cuotas escolares - ${cuotas.map(c => c.nombre).join(', ')}`,
        automatic_payment_methods: {
          enabled: true
        }
      });

      // Crear registros de pago pendientes
      const estadoPendiente = await EstadoPago.getIdByEstado('Pendiente');
      
      for (const cuota of cuotas) {
        await Pago.create({
          cuota_id: cuota.id,
          alumno_id: alumnoId || 0, // Si no se especifica alumno, usar 0
          apoderado_id: apoderadoId,
          monto_pagado: cuota.monto,
          estado_id: estadoPendiente,
          metodo_pago: 'Stripe',
          stripe_payment_intent_id: paymentIntent.id,
          datos_pago: {
            payment_intent_id: paymentIntent.id,
            customer_id: customer.id,
            amount: montoEnCentavos,
            currency: 'clp'
          }
        });
      }

      Logger.info('Payment Intent creado exitosamente', {
        apoderadoId,
        paymentIntentId: paymentIntent.id,
        monto: montoTotal,
        cuotas: cuotaIds
      });

      return {
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: montoTotal,
        currency: 'clp',
        cuotas: cuotas.map(c => ({
          id: c.id,
          nombre: c.nombre,
          monto: c.monto
        }))
      };
    } catch (error) {
      Logger.error('Error al crear Payment Intent', {
        error: error.message,
        apoderadoId,
        cuotaIds
      });
      throw error;
    }
  }

  /**
   * Confirmar un pago exitoso
   */
  static async confirmPayment(paymentIntentId) {
    try {
      // Obtener el Payment Intent de Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('El pago no ha sido completado exitosamente');
      }

      // Buscar los pagos asociados a este Payment Intent
      const pagos = await Pago.findAll({
        where: { stripe_payment_intent_id: paymentIntentId }
      });

      if (pagos.length === 0) {
        throw new Error('No se encontraron pagos asociados a este Payment Intent');
      }

      // Marcar los pagos como completados
      const estadoPagado = await EstadoPago.getIdByEstado('Pagado');
      
      for (const pago of pagos) {
        await pago.update({
          estado_id: estadoPagado,
          transaccion_id: paymentIntent.charges.data[0]?.id || paymentIntentId,
          stripe_charge_id: paymentIntent.charges.data[0]?.id,
          fecha_pago: new Date(),
          datos_pago: {
            ...pago.datos_pago,
            payment_intent: paymentIntent,
            confirmed_at: new Date().toISOString()
          }
        });
      }

      Logger.info('Pago confirmado exitosamente', {
        paymentIntentId,
        cantidadPagos: pagos.length,
        monto: paymentIntent.amount / 100
      });

      return {
        success: true,
        payment_intent_id: paymentIntentId,
        transaction_id: paymentIntent.charges.data[0]?.id || paymentIntentId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        pagos_actualizados: pagos.length
      };
    } catch (error) {
      Logger.error('Error al confirmar pago', {
        error: error.message,
        paymentIntentId
      });
      throw error;
    }
  }

  /**
   * Obtener historial de pagos de un apoderado
   */
  static async getPaymentHistory(apoderadoId, limit = 50) {
    try {
      const pagos = await Pago.findAll({
        where: { apoderado_id: apoderadoId },
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
        stripe_payment_intent_id: pago.stripe_payment_intent_id
      }));
    } catch (error) {
      Logger.error('Error al obtener historial de pagos', {
        error: error.message,
        apoderadoId
      });
      throw error;
    }
  }

  /**
   * Procesar webhook de Stripe
   */
  static async handleStripeWebhook(event) {
    try {
      Logger.info('Procesando webhook de Stripe', {
        eventType: event.type,
        eventId: event.id
      });

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object.id);
          break;
        
        default:
          Logger.info('Evento de webhook no manejado', { eventType: event.type });
      }

      return { received: true };
    } catch (error) {
      Logger.error('Error al procesar webhook de Stripe', {
        error: error.message,
        eventType: event.type,
        eventId: event.id
      });
      throw error;
    }
  }

  /**
   * Manejar pago fallido
   */
  static async handlePaymentFailed(paymentIntentId) {
    try {
      const pagos = await Pago.findAll({
        where: { stripe_payment_intent_id: paymentIntentId }
      });

      // Marcar pagos como fallidos o mantener pendientes para reintento
      for (const pago of pagos) {
        await pago.update({
          datos_pago: {
            ...pago.datos_pago,
            payment_failed_at: new Date().toISOString()
          }
        });
      }

      Logger.info('Pago fallido procesado', {
        paymentIntentId,
        cantidadPagos: pagos.length
      });
    } catch (error) {
      Logger.error('Error al procesar pago fallido', {
        error: error.message,
        paymentIntentId
      });
      throw error;
    }
  }
}

module.exports = PaymentService;

