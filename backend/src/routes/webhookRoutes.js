// src/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhookController');

// <-- acepta urlencoded y json (orden importante)
router.post(
  '/mercadopago',
  express.urlencoded({ extended: false }),
  express.json(),
  WebhookController.mercadopago
);

router.post('/test', express.json(), WebhookController.testWebhook);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Webhook endpoints are healthy', timestamp: new Date().toISOString() });
});

module.exports = router;
