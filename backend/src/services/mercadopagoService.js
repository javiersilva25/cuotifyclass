// src/services/mercadoPagoService.js
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const models = require('../models');
const Logger = require('../utils/logger');

const CobroAlumno = models?.CobroAlumno;
const Alumno      = models?.Alumno;
const Curso       = models?.Curso;
const Usuario     = models?.Usuario || null;

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
    this.payments    = new Payment(this.client);

    // Bases para construir URLs
    this.publicBase = process.env.PUBLIC_BASE_URL || process.env.API_URL || process.env.BASE_URL || 'http://localhost:3000';
    this.appUrl     = process.env.APP_URL || this.publicBase; // si no hay front público, usa el back

    // Back URLs (en orden de prioridad)
    this.successUrl =
      process.env.MP_SUCCESS_URL ||
      process.env.PAYMENT_SUCCESS_URL ||
      `${this.appUrl.replace(/\/+$/, '')}/payment/success`;

    this.failureUrl =
      process.env.MP_FAILURE_URL ||
      process.env.PAYMENT_CANCEL_URL ||
      `${this.appUrl.replace(/\/+$/, '')}/payment/failure`;

    this.pendingUrl =
      process.env.MP_PENDING_URL ||
      `${this.appUrl.replace(/\/+$/, '')}/payment/pending`;

    // Webhook unificado
    this.webhookUrl = `${this.publicBase.replace(/\/+$/, '')}/api/payments/webhooks/mercadopago`;
  }

  async createPreference(apoderadoId, deudaIds = []) {
    if (!apoderadoId) throw new Error('apoderadoId requerido');
    if (!Array.isArray(deudaIds) || deudaIds.length === 0) {
      throw new Error('deudaIds vacío');
    }

    // Payer opcional y protegido
    let payer = null;
    if (Usuario?.findByPk) {
      try { payer = await Usuario.findByPk(apoderadoId); } catch {}
    }

    // include condicional para no romper si no existen asociaciones
    const include = [];
    if (CobroAlumno?.associations?.alumno) include.push({ association: 'alumno', attributes: ['id', 'nombre'] });
    if (CobroAlumno?.associations?.curso)  include.push({ association: 'curso',  attributes: ['id', 'nombre_curso'] });

    const where = { id: deudaIds, estado: 'pendiente' };
    let deudas;
    try {
      deudas = await CobroAlumno.findAll(include.length ? { where, include } : { where });
    } catch {
      deudas = await CobroAlumno.findAll({ where });
    }
    if (!deudas?.length) throw new Error('No hay deudas pendientes para pagar');

    const getAlumnoNombre = (d) =>
      d?.alumno?.nombre || d?.Alumno?.nombre || d?.alumno_nombre || (d?.alumno_id ? `Alumno ${d.alumno_id}` : 'Alumno');

    const items = deudas.map(d => ({
      title: `${d.concepto || d.descripcion || 'Cuota'} - ${getAlumnoNombre(d)}`,
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
        success: this.successUrl,
        pending: this.pendingUrl,
        failure: this.failureUrl,
      },
      auto_return: 'approved',
      notification_url: this.webhookUrl,
      metadata: {
        apoderado_id: String(apoderadoId),
        deuda_ids: deudas.map(d => d.id),
      },
    };

    const pref = await this.preferences.create({ body });

    Logger.info('MP preference creada', {
      preference_id: pref.id,
      apoderado_id: apoderadoId,
      deuda_ids: deudas.map(d => d.id),
      back_urls: body.back_urls,
      notification_url: body.notification_url,
    });

    return {
      gateway: 'mercadopago',
      preference_id: pref.id,
      init_point: pref.init_point,
      sandbox_init_point: pref.sandbox_init_point,
    };
  }

  async processWebhook(payload = {}, query = {}) {
    const topic = payload?.type || payload?.topic || query?.topic || query?.type;
    const id    = payload?.data?.id || payload?.id || query?.id;
    if ((topic !== 'payment' && topic !== 'payments') || !id) return { processed: false, reason: 'Ignorado' };
    return this._processPayment(id);
  }

  async _processPayment(paymentId) {
    const payment = await this.payments.get({ id: paymentId });
    Logger.info('MP payment recibido', { id: paymentId, status: payment?.status });

    const deudaIds = Array.isArray(payment?.metadata?.deuda_ids) ? payment.metadata.deuda_ids : [];
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

  validateConfiguration() {
    const token = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error('MP access token no configurado');
    const isProd = token.startsWith('APP_USR');
    const isTest = token.startsWith('TEST');
    return { configured: true, environment: isProd ? 'production' : (isTest ? 'test' : 'unknown') };
  }
}

module.exports = MercadoPagoService;
