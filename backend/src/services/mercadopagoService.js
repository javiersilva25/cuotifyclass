// src/services/mercadoPagoService.js
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { CobroAlumno, Alumno, Curso, Usuario } = require('../models');
const Logger = require('../utils/logger');

class MercadoPagoService {
  constructor() {
    const token =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      throw new Error('Mercado Pago: falta MP_ACCESS_TOKEN/MERCADOPAGO_ACCESS_TOKEN');
    }

    this.client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 10000 }
    });

    this.preferences = new Preference(this.client);
    this.payments = new Payment(this.client);

    // URLs
    this.apiUrl = process.env.API_URL || process.env.BASE_URL || 'http://localhost:3001';
    this.appUrl = process.env.APP_URL || 'http://localhost:3002';
  }

  /**
   * Crea una preferencia para pagar deudas (CobroAlumno).
   * @param {number|string} apoderadoId
   * @param {Array<number>} deudaIds
   */
  async createPreference(apoderadoId, deudaIds = []) {
    if (!apoderadoId) throw new Error('apoderadoId requerido');
    if (!Array.isArray(deudaIds) || deudaIds.length === 0) {
      throw new Error('deudaIds vacío');
    }

    // Payer opcional (no bloquea)
    const payer = await Usuario.findByPk(apoderadoId).catch(() => null);

    // Traer deudas pendientes
    const deudas = await CobroAlumno.findAll({
      where: { id: deudaIds, estado: 'pendiente' },
      include: [
        { model: Alumno, as: 'alumno', attributes: ['id', 'nombre'] },
        { model: Curso,  as: 'curso',  attributes: ['id', 'nombre_curso'] },
      ],
    });

    if (!deudas.length) {
      throw new Error('No hay deudas pendientes para pagar');
    }

    const items = deudas.map(d => ({
      title: `${d.concepto || 'Cuota'} - ${d.alumno?.nombre || 'Alumno'}`,
      quantity: 1,
      currency_id: 'CLP',
      unit_price: Number(d.monto || 0),
    }));

    const external_reference = `APO-${apoderadoId}-${Date.now()}`;

    const body = {
      items,
      payer: payer ? {
        name: payer.nombres || payer.nombre || undefined,
        email: payer.email || undefined,
      } : undefined,
      external_reference,
      back_urls: {
        success: `${this.appUrl}/apoderado/pago-exitoso`,
        pending: `${this.appUrl}/apoderado/pago-pendiente`,
        failure: `${this.appUrl}/apoderado/pago-error`,
      },
      auto_return: 'approved',
      notification_url: `${this.apiUrl}/api/payments/mercadopago/webhook`,
      metadata: {
        apoderado_id: apoderadoId,
        deuda_ids: deudas.map(d => d.id),
      },
    };

    const pref = await this.preferences.create({ body });

    Logger.info('MP preference creada', {
      preference_id: pref.id,
      apoderado_id: apoderadoId,
      deuda_ids: deudas.map(d => d.id),
    });

    return {
      preference_id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
    };
  }

  /**
   * Webhook de Mercado Pago (llámalo desde tu ruta /mercadopago/webhook)
   * Acepta payload con { type, data:{ id } } o query ?topic=payment&id=...
   */
  async processWebhook(payload = {}, query = {}) {
    const topic = payload?.type || query?.topic;
    const id    = payload?.data?.id || query?.id;

    if (topic !== 'payment' || !id) {
      return { processed: false, reason: 'Ignorado' };
    }
    return this._processPayment(id);
  }

  // ---- internos ----
  async _processPayment(paymentId) {
    const payment = await this.payments.get({ id: paymentId });
    Logger.info('MP payment recibido', { id: paymentId, status: payment?.status });

    const deudaIds = Array.isArray(payment?.metadata?.deuda_ids)
      ? payment.metadata.deuda_ids
      : [];

    const apoderadoId = payment?.metadata?.apoderado_id || null;

    if (payment?.status === 'approved' && deudaIds.length) {
      await CobroAlumno.update(
        {
          estado: 'pagado',
          metodo_pago: 'mercadopago',
          transaccion_id: String(payment.id),
          fecha_pago: new Date(),
          monto_pagado: payment.transaction_amount || null,
          actualizado_por: apoderadoId || null,
        },
        { where: { id: deudaIds } }
      );
      Logger.info('Deudas marcadas pagadas', { deuda_ids: deudaIds, payment_id: payment.id });
    }

    return { processed: true, status: payment?.status || 'unknown' };
  }
}

module.exports = MercadoPagoService;
