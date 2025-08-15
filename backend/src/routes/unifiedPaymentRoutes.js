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

// Crear pago unificado (MP, TBK, Stripe, BancoEstado)
router.post(
  '/apoderados/:id/create',
  normalizeCreateBody,
  controller.createPayment.bind(controller)
);

// Confirmación genérica (si alguna pasarela la usa explícitamente)
router.post('/confirm', controller.confirmPayment.bind(controller));

// Historial consolidado
router.get('/apoderados/:id/history', controller.getPaymentHistory.bind(controller));

/* -------------------------------- Webhooks -------------------------------- */

// Endpoint unificado de webhooks: soporta POST y GET (necesario para MP)
router.post('/webhooks/:gateway', mergeQueryIntoBody, controller.processWebhook.bind(controller));
router.get('/webhooks/:gateway', mergeQueryIntoBody, controller.processWebhook.bind(controller));

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
      confirm_payment: '/api/payments/confirm',
      history: '/api/payments/apoderados/:id/history',
      webhooks: '/api/payments/webhooks/:gateway',
    },
  });
});

module.exports = router;
