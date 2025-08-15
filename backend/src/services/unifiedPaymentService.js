// src/services/unifiedPaymentService.js
const PaymentService = require('./paymentService');          // Stripe
const TransbankService = require('./transbankService');
const MercadoPagoService = require('./mercadopagoService');
const BancoEstadoService = require('./bancoestadoService');
const Logger = require('../utils/logger');

class UnifiedPaymentService {
  constructor() {
    // Instancias de servicios
    this.services = {
      stripe:       new PaymentService(),
      transbank:    new TransbankService(),
      mercadopago:  new MercadoPagoService(),
      bancoestado:  new BancoEstadoService(),
    };

    // Gateway por defecto (cae a MP si no hay env var)
    this.defaultGateway = (process.env.DEFAULT_PAYMENT_GATEWAY || 'mercadopago').toLowerCase();

    // Resuelve una vez las pasarelas habilitadas
    this.enabledGateways = this.getEnabledGateways();
  }

  /** Detecta pasarelas habilitadas */
  getEnabledGateways() {
    const enabled = [];

    // Stripe
    try {
      if (process.env.STRIPE_SECRET_KEY) enabled.push('stripe');
    } catch (e) {
      Logger.warn('Stripe no disponible', { error: e.message });
    }

    // Transbank
    try {
      const ok = this.services.transbank.validateConfiguration();
      if (ok?.configured) enabled.push('transbank');
    } catch (e) {
      Logger.warn('Transbank no disponible', { error: e.message });
    }

    // MercadoPago
    try {
      const ok = this.services.mercadopago.validateConfiguration();
      if (ok?.configured) enabled.push('mercadopago');
    } catch (e) {
      Logger.warn('MercadoPago no disponible', { error: e.message });
    }

    // BancoEstado
    try {
      const ok = this.services.bancoestado.validateConfiguration();
      if (ok?.configured) enabled.push('bancoestado');
    } catch (e) {
      Logger.warn('BancoEstado no disponible', { error: e.message });
    }

    Logger.info('Pasarelas habilitadas', { enabled });
    return enabled;
  }

  /** Info legible por UI */
  getGatewayInfo(gateway) {
    const info = {
      stripe: {
        name: 'Stripe',
        description: 'Pasarela internacional con amplia cobertura',
        fees: '3.6% + $30 CLP (nacional), 4.4% + $30 CLP (internacional)',
        supported_methods: ['Tarjetas de crédito', 'Tarjetas de débito', 'Apple Pay', 'Google Pay'],
        recommended_for: ['Pagos internacionales', 'UX premium'],
      },
      transbank: {
        name: 'Transbank',
        description: 'Líder en pagos electrónicos en Chile',
        fees: '~3.19% + IVA',
        supported_methods: ['Crédito', 'Redcompra (débito)'],
        recommended_for: ['Mercado chileno', 'Costos bajos'],
      },
      mercadopago: {
        name: 'MercadoPago',
        description: 'Líder en pagos de Latinoamérica',
        fees: '3.49% + IVA',
        supported_methods: ['Tarjetas', 'Transferencias', 'Efectivo', 'Cuotas sin interés'],
        recommended_for: ['Cobertura regional', 'Múltiples métodos'],
      },
      bancoestado: {
        name: 'BancoEstado',
        description: 'Transferencias y tarjetas con tarifas preferenciales',
        fees: 'Desde 0.013 UF + IVA (transferencias)',
        supported_methods: ['Transferencias', 'Tarjetas', 'Cuotas'],
        recommended_for: ['Transferencias económicas'],
      },
    };
    return info[gateway] || { name: gateway, description: 'Información no disponible' };
  }

  /** Listado de pasarelas disponibles */
  getAvailableGateways() {
    return this.enabledGateways.map((gw) => ({
      id: gw,
      ...this.getGatewayInfo(gw),
    }));
  }

  /** Recomendación simple (cost/speed/coverage) */
  recommendGateway(criteria = {}) {
    const {
      amount,
      country = 'CL',
      priority = 'cost', // 'cost' | 'speed' | 'coverage'
      paymentMethod = 'card',
    } = criteria;

    const recs = [];

    if (country === 'CL') {
      if (priority === 'cost') {
        if (paymentMethod === 'transfer' && this.enabledGateways.includes('bancoestado')) {
          recs.push({ gateway: 'bancoestado', score: 10, reason: 'Transferencias económicas en Chile' });
        }
        if (this.enabledGateways.includes('transbank')) {
          recs.push({ gateway: 'transbank', score: 9, reason: 'Tarifas preferenciales locales' });
        }
        if (this.enabledGateways.includes('mercadopago')) {
          recs.push({ gateway: 'mercadopago', score: 7, reason: 'Buena tarifa regional' });
        }
        if (this.enabledGateways.includes('stripe')) {
          recs.push({ gateway: 'stripe', score: 6, reason: 'Opción internacional confiable' });
        }
      } else if (priority === 'speed') {
        if (this.enabledGateways.includes('stripe')) recs.push({ gateway: 'stripe', score: 10, reason: 'Procesamiento rápido' });
        if (this.enabledGateways.includes('mercadopago')) recs.push({ gateway: 'mercadopago', score: 8, reason: 'Integración ágil' });
      }
    } else {
      if (this.enabledGateways.includes('stripe')) recs.push({ gateway: 'stripe', score: 10, reason: 'Cobertura internacional' });
      if (this.enabledGateways.includes('mercadopago')) recs.push({ gateway: 'mercadopago', score: 8, reason: 'LatAm friendly' });
    }

    recs.sort((a, b) => b.score - a.score);
    return recs[0] || { gateway: this.defaultGateway, score: 5, reason: 'Pasarela por defecto' };
  }

  /**
   * Crear pago (ahora usando DEUDAS del alumno)
   * @param {string|number} apoderadoId
   * @param {number[]} deudaIds  // alias de cuotaIds/cobroIds
   */
  async createPayment(apoderadoId, deudaIds, options = {}) {
    const { gateway, alumnoId, paymentMethod = 'card', country = 'CL' } = options;

    try {
      // Elige pasarela
      let selectedGateway = (gateway || this.recommendGateway({ country, paymentMethod, priority: 'cost' }).gateway || this.defaultGateway).toLowerCase();

      if (!this.enabledGateways.includes(selectedGateway)) {
        throw new Error(`Pasarela ${selectedGateway} no está habilitada`);
      }

      // Ejecuta creación según pasarela
      let result;
      switch (selectedGateway) {
        case 'stripe':
          // Si tu Stripe sigue esperando "cuotaIds", pásale deudaIds (misma semántica)
          result = await this.services.stripe.createPaymentIntent(apoderadoId, deudaIds, alumnoId);
          break;
        case 'transbank':
          result = await this.services.transbank.createTransaction(apoderadoId, deudaIds, alumnoId);
          break;
        case 'mercadopago':
          // Mercado Pago: preferencia con deudas dirigidas
          result = await this.services.mercadopago.createPreference(apoderadoId, deudaIds, alumnoId);
          break;
        case 'bancoestado':
          result = await this.services.bancoestado.createPaymentOrder(apoderadoId, deudaIds, alumnoId);
          break;
        default:
          throw new Error(`Pasarela ${selectedGateway} no soportada`);
      }

      Logger.info('Pago creado', { gateway: selectedGateway, apoderadoId, deudaIds });

      return {
        gateway: selectedGateway,
        gateway_info: this.getGatewayInfo(selectedGateway),
        ...result,
      };
    } catch (error) {
      Logger.error('createPayment error', { error: error.message, apoderadoId, deudaIds, options });
      throw error;
    }
  }

  /** Confirmación según gateway */
  async confirmPayment(gateway, paymentData) {
    try {
      const gw = (gateway || '').toLowerCase();
      if (!this.enabledGateways.includes(gw)) throw new Error(`Pasarela ${gw} no está habilitada`);

      let result;
      switch (gw) {
        case 'stripe':
          result = await this.services.stripe.confirmPayment(paymentData.payment_intent_id);
          break;
        case 'transbank':
          result = await this.services.transbank.confirmTransaction(paymentData.token);
          break;
        case 'mercadopago':
          // Para MP puedes mandar { payment_id } o { id }
          result = await this.services.mercadopago.processPaymentNotification(
            paymentData.payment_id || paymentData.id
          );
          break;
        case 'bancoestado':
          result = await this.services.bancoestado.processWebhook(paymentData);
          break;
        default:
          throw new Error(`Confirmación no soportada para ${gw}`);
      }

      Logger.info('Pago confirmado', { gateway: gw });
      return { gateway: gw, ...result };
    } catch (error) {
      Logger.error('confirmPayment error', { error: error.message, gateway, paymentData });
      throw error;
    }
  }

  /** Historial consolidado (sin desfases de índice) */
  async getConsolidatedPaymentHistory(apoderadoId, limit = 50) {
    try {
      const tasks = [];

      if (this.enabledGateways.includes('stripe')) {
        tasks.push(['stripe', this.services.stripe.getPaymentHistory(apoderadoId, limit)]);
      }
      if (this.enabledGateways.includes('transbank')) {
        tasks.push(['transbank', this.services.transbank.getPaymentHistory(apoderadoId, limit)]);
      }
      if (this.enabledGateways.includes('mercadopago')) {
        tasks.push(['mercadopago', this.services.mercadopago.getPaymentHistory(apoderadoId, limit)]);
      }
      if (this.enabledGateways.includes('bancoestado')) {
        tasks.push(['bancoestado', this.services.bancoestado.getPaymentHistory(apoderadoId, limit)]);
      }

      const settled = await Promise.allSettled(tasks.map(([, p]) => p));
      const all = [];

      settled.forEach((r, idx) => {
        const gw = tasks[idx][0];
        if (r.status === 'fulfilled') {
          all.push(...(r.value || []));
        } else {
          Logger.warn('Historial pasarela falló', { gateway: gw, error: r.reason?.message || String(r.reason) });
        }
      });

      all.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
      return all.slice(0, limit);
    } catch (error) {
      Logger.error('getConsolidatedPaymentHistory error', { error: error.message, apoderadoId });
      throw error;
    }
  }

  /** Estadísticas básicas */
  async getGatewayStats(_apoderadoId = null) {
    try {
      return {
        enabled_gateways: this.enabledGateways,
        default_gateway: this.defaultGateway,
        gateway_info: this.enabledGateways.map((g) => ({ id: g, ...this.getGatewayInfo(g) })),
      };
    } catch (error) {
      Logger.error('getGatewayStats error', { error: error.message });
      throw error;
    }
  }

  /**
   * Webhook unificado — para MP aceptamos body o query
   * @param {string} gateway
   * @param {object} body
   * @param {object} query
   */
  async processWebhook(gateway, body = {}, query = {}) {
    try {
      const gw = (gateway || '').toLowerCase();
      if (!this.enabledGateways.includes(gw)) throw new Error(`Pasarela ${gw} no está habilitada`);

      let result;
      switch (gw) {
        case 'stripe':
          result = await this.services.stripe.handleStripeWebhook(body);
          break;
        case 'transbank':
          result = { processed: false, reason: 'Transbank no usa webhooks' };
          break;
        case 'mercadopago': {
          // MP a veces envía ?type=payment&id=... como query, otras veces JSON { type, data:{id} }
          const payload = Object.keys(body || {}).length ? body : query;
          result = await this.services.mercadopago.processWebhook(payload);
          break;
        }
        case 'bancoestado':
          result = await this.services.bancoestado.processWebhook(body);
          break;
        default:
          throw new Error(`Webhook no soportado para ${gw}`);
      }

      Logger.info('Webhook procesado', { gateway: gw, ok: true });
      return { gateway: gw, ...result };
    } catch (error) {
      Logger.error('processWebhook error', { error: error.message, gateway, body, query });
      throw error;
    }
  }
}

module.exports = UnifiedPaymentService;
