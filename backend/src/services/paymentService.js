// src/services/paymentService.js
const MercadoPagoService = require('./mercadopagoService');

class PaymentService {
  /**
   * Crea la preferencia de pago en Mercado Pago
   * @param {Object} params
   * @param {string|number} params.apoderadoId
   * @param {Array<number>} params.deudaIds
   */
  static async createPayment({ apoderadoId, deudaIds }) {
    const mp = new MercadoPagoService();
    return mp.createPreference(apoderadoId, deudaIds);
  }

  /**
   * Procesa webhooks de pago
   * @param {'mercadopago'} provider
   * @param {Object} payload
   * @param {Object} query
   */
  static async handleWebhook(provider, payload = {}, query = {}) {
    if (provider !== 'mercadopago') {
      return { processed: false, reason: 'provider no soportado' };
    }
    const mp = new MercadoPagoService();
    return mp.processWebhook(payload, query);
  }

  static getDefaultGateway() {
    return 'mercadopago';
  }
}

module.exports = PaymentService;
