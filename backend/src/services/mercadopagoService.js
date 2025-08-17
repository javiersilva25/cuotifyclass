// src/services/mercadoPagoService.js
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const models = require('../models');
const Logger = require('../utils/logger');

const CobroAlumno = models?.CobroAlumno;
const Alumno      = models?.Alumno;
const Curso       = models?.Curso;
const Usuario     = models?.Usuario || null;

// --- Helpers estrictos de URL (HTTPS y absolutas) ---
function mustHttpsAbsolute(u, name = 'URL') {
  if (!u) throw new Error(`${name} no definida`);
  let url;
  try { url = new URL(u); } catch { throw new Error(`${name} inválida: ${u}`); }
  if (url.protocol !== 'https:') throw new Error(`${name} debe ser HTTPS absoluta: ${u}`);
  return url.toString();
}
function join(base, path) {
  const b = new URL(base);
  return new URL(path, b).toString();
}

class MercadoPagoService {
  constructor() {
    const token =
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN;

    if (!token) {
      throw new Error('Mercado Pago: falta MERCADOPAGO_ACCESS_TOKEN/MP_ACCESS_TOKEN');
    }

    this.client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 10000 }
    });

    this.preferences = new Preference(this.client);
    this.payments    = new Payment(this.client);

    // Bases públicas (debe ser HTTPS cuando trabajes con MP)
    const FRONTEND = process.env.FRONTEND_URL || process.env.APP_URL;
    const BACKEND  = process.env.BACKEND_URL  || process.env.PUBLIC_BASE_URL || process.env.API_URL || process.env.BASE_URL;

    // Construcción estricta de URLs
    // back_urls siempre deben apuntar al FRONT (páginas visibles)
    this.successUrl = mustHttpsAbsolute(
      process.env.MP_SUCCESS_URL || join(FRONTEND, '/pagos/retorno?status=success'),
      'MP_SUCCESS_URL'
    );
    this.failureUrl = mustHttpsAbsolute(
      process.env.MP_FAILURE_URL || join(FRONTEND, '/pagos/retorno?status=failure'),
      'MP_FAILURE_URL'
    );
    this.pendingUrl = mustHttpsAbsolute(
      process.env.MP_PENDING_URL || join(FRONTEND, '/pagos/retorno?status=pending'),
      'MP_PENDING_URL'
    );

    // Webhook público en el BACK
    this.webhookUrl = mustHttpsAbsolute(
      process.env.MP_WEBHOOK_URL || join(BACKEND, '/api/payments/webhooks/mercadopago'),
      'MP_WEBHOOK_URL'
    );
  }

  async createPreference(apoderadoId, deudaIds = []) {
    if (!apoderadoId) throw new Error('apoderadoId requerido');
    if (!Array.isArray(deudaIds) || deudaIds.length === 0) {
      throw new Error('deudaIds vacío');
    }

    // Payer opcional
    let payer = null;
    if (Usuario?.findByPk) {
      try { payer = await Usuario.findByPk(apoderadoId); } catch {}
    }

    // include condicional
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

    // Log defensivo de URLs antes de llamar a MP
    Logger.info('MP URLs', { back_urls: body.back_urls, notification_url: body.notification_url });

    const resp = await this.preferences.create({ body });
    // SDKs v2/v3 pueden devolver campos en body; resolvemos de forma segura:
    const prefId            = resp?.id || resp?.body?.id;
    const initPoint         = resp?.init_point || resp?.body?.init_point;
    const sandboxInitPoint  = resp?.sandbox_init_point || resp?.body?.sandbox_init_point;

    Logger.info('MP preference creada', {
      preference_id: prefId,
      apoderado_id: apoderadoId,
      deuda_ids: deudas.map(d => d.id),
    });

    return {
      gateway: 'mercadopago',
      preference_id: prefId,
      init_point: initPoint,
      sandbox_init_point: sandboxInitPoint,
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

    const deudaIds    = Array.isArray(payment?.metadata?.deuda_ids) ? payment.metadata.deuda_ids : [];
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
    const token =
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error('MP access token no configurado');
    const isProd = token.startsWith('APP_USR');
    const isTest = token.startsWith('TEST');
    return { configured: true, environment: isProd ? 'production' : (isTest ? 'test' : 'unknown') };
  }
}

module.exports = MercadoPagoService;
