// src/routes/payments.js
const express = require('express');
const router = express.Router();
const UnifiedPaymentController = require('../controllers/unifiedPaymentController');

// instancia única
const controller = new UnifiedPaymentController();

/* ---------------------------- Middlewares útiles --------------------------- */

// MP a veces pega el webhook por GET (?type=payment&id=...) y otras por POST.
// Este middleware copia los query params al body si el body viene vacío.
function mergeQueryIntoBody(req, _res, next) {
  if ((!req.body || Object.keys(req.body).length === 0) && req.query && Object.keys(req.query).length > 0) {
    req.body = { ...req.query };
  }
  next();
}

// Acepta ambos nombres para las deudas: deuda_ids y cuota_ids.
// Normaliza para que el controller actual siga usando req.body.cuota_ids.
function normalizeCreateBody(req, _res, next) {
  if (!req.body) req.body = {};
  if (!req.body.cuota_ids && Array.isArray(req.body.deuda_ids)) {
    req.body.cuota_ids = req.body.deuda_ids;
  }
  next();
}

/* ------------------------------ Info pasarelas ----------------------------- */

router.get('/gateways', controller.getAvailableGateways.bind(controller));
router.get('/gateways/recommend', controller.recommendGateway.bind(controller));
router.get('/gateways/test', controller.testGateways.bind(controller));
router.get('/gateways/stats/:id?', controller.getGatewayStats.bind(controller));

/* --------------------------------- Pagos ---------------------------------- */

// Crear pago unificado (ruta “oficial”)
router.post(
  '/apoderados/:id/create',
  normalizeCreateBody,
  controller.createPayment.bind(controller)
);

// Alias para compatibilidad con el frontend que llama /api/payments/create
router.post(
  '/create',
  normalizeCreateBody,
  (req, res, next) => {
    const apoderadoId = req.body?.apoderado_id || req.body?.apoderadoId || req.query?.apoderado_id;
    if (!apoderadoId) {
      return res.status(400).json({ success: false, message: 'apoderado_id es requerido' });
    }
    req.params.id = apoderadoId; // reusa el controller “oficial”
    return controller.createPayment(req, res, next);
  }
);

// Confirmación genérica (si alguna pasarela la usa explícitamente)
router.post('/confirm', controller.confirmPayment.bind(controller));

// Historial consolidado
router.get('/apoderados/:id/history', controller.getPaymentHistory.bind(controller));

/* ----------------------------- Return URLs MP ------------------------------ */

// Mercado Pago redirige aquí tras el checkout (success/failure/pending).
// Confirmamos usando payment_id (o id) y redirigimos a las URLs del .env si existen.
router.get('/return/mercadopago', async (req, res) => {
  try {
    const paymentId =
      req.query.payment_id || req.query['data.id'] || req.query.id || req.body?.payment_id;
    const status = (req.query.status || '').toLowerCase();

    if (paymentId) {
      // Confirmación explícita para asegurar consistencia si el webhook aún no llega
      await controller.paymentService.confirmPayment('mercadopago', { payment_id: paymentId });
    }

    const SUCCESS_URL = process.env.PAYMENT_SUCCESS_URL || '/';
    const CANCEL_URL  = process.env.PAYMENT_CANCEL_URL  || '/';
    const PENDING_URL = process.env.PAYMENT_PENDING_URL || SUCCESS_URL;

    if (status === 'approved') return res.redirect(SUCCESS_URL);
    if (status === 'pending')  return res.redirect(PENDING_URL);
    if (status === 'rejected') return res.redirect(CANCEL_URL);

    // Fallback si no viene status: responde JSON útil
    return res.json({
      success: true,
      message: 'Retorno MercadoPago recibido',
      data: { payment_id: paymentId, status: status || 'desconocido' }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error en retorno MercadoPago', error: err?.message });
  }
});

/* -------------------------------- Webhooks -------------------------------- */

// Endpoint unificado de webhooks: soporta POST y GET (necesario para MP)
router.post('/webhooks/:gateway', mergeQueryIntoBody, controller.processWebhook.bind(controller));
router.get('/webhooks/:gateway',  mergeQueryIntoBody, controller.processWebhook.bind(controller));

/* --------------------------------- Info ----------------------------------- */

router.get('/info', (_req, res) => {
  res.json({
    name: 'Sistema Unificado de Pagos',
    version: '4.0.0',
    description:
      'Integra múltiples pasarelas y elige la mejor opción (costos/velocidad/cobertura).',
    supported_gateways: [
      { id: 'stripe', name: 'Stripe', description: 'Pasarela internacional premium' },
      { id: 'transbank', name: 'Transbank', description: 'Líder en Chile, costos optimizados' },
      { id: 'mercadopago', name: 'MercadoPago', description: 'Líder en Latinoamérica' },
      { id: 'bancoestado', name: 'BancoEstado', description: 'Transferencias económicas' },
    ],
    endpoints: {
      gateways: '/api/payments/gateways',
      recommend: '/api/payments/gateways/recommend',
      create_payment: '/api/payments/apoderados/:id/create',
      create_payment_alias: '/api/payments/create',
      confirm_payment: '/api/payments/confirm',
      history: '/api/payments/apoderados/:id/history',
      webhook: '/api/payments/webhooks/:gateway',
      mp_return: '/api/payments/return/mercadopago'
    },
  });
});

module.exports = router;
