// src/controllers/webhookController.js
const PaymentService = require('../services/paymentService');
const Logger = require('../utils/logger');

class WebhookController {
  /**
   * Webhook de Mercado Pago
   * Ruta sugerida: POST /api/payments/webhooks/mercadopago
   */
  static async mercadopago(req, res) {
    try {
      const result = await PaymentService.handleWebhook('mercadopago', req.body, req.query);
      // Responder 200 rápido para evitar reintentos de MP
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      Logger.error('Webhook MP error', { error: err.message });
      return res.status(500).json({ success: false, error: 'Webhook processing failed' });
    }
  }

  /**
   * Endpoint de prueba opcional
   * Ruta sugerida: POST /api/payments/webhooks/test
   */
  static async testWebhook(req, res) {
    try {
      Logger.info('Webhook de prueba recibido', {
        headers: req.headers,
        body: req.body,
      });
      return res.json({
        success: true,
        message: 'Test webhook received',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      Logger.error('Error en webhook de prueba', { error: err.message });
      return res.status(500).json({ success: false, error: 'Error in test webhook' });
    }
  }
}

module.exports = WebhookController;
