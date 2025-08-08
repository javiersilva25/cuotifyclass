const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');

// Middleware para procesar raw body (necesario para webhooks de Stripe)
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// Webhook de Stripe (requiere raw body)
router.post('/stripe', rawBodyMiddleware, WebhookController.handleStripeWebhook);

// Webhook de prueba
router.post('/test', WebhookController.testWebhook);

// Endpoint de salud para webhooks
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoints are healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

