const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PaymentService = require('../services/paymentService');
const Logger = require('../utils/logger');

class WebhookController {
  /**
   * Manejar webhooks de Stripe
   */
  static async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      // Verificar la firma del webhook
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      Logger.error('Error al verificar webhook de Stripe', {
        error: err.message,
        signature: sig
      });
      
      return res.status(400).json({
        success: false,
        message: 'Webhook signature verification failed'
      });
    }

    try {
      // Procesar el evento
      await PaymentService.handleStripeWebhook(event);

      Logger.info('Webhook de Stripe procesado exitosamente', {
        eventType: event.type,
        eventId: event.id
      });

      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      Logger.error('Error al procesar webhook de Stripe', {
        error: error.message,
        eventType: event.type,
        eventId: event.id
      });

      res.status(500).json({
        success: false,
        message: 'Error processing webhook',
        error: error.message
      });
    }
  }

  /**
   * Endpoint de prueba para webhooks
   */
  static async testWebhook(req, res) {
    try {
      Logger.info('Webhook de prueba recibido', {
        body: req.body,
        headers: req.headers
      });

      res.json({
        success: true,
        message: 'Test webhook received',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      Logger.error('Error en webhook de prueba', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error in test webhook',
        error: error.message
      });
    }
  }
}

module.exports = WebhookController;

