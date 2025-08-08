const PaymentService = require('./paymentService'); // Stripe
const TransbankService = require('./transbankService');
const MercadoPagoService = require('./mercadopagoService');
const BancoEstadoService = require('./bancoestadoService');
const Logger = require('../utils/logger');

class UnifiedPaymentService {
  constructor() {
    // Inicializar todos los servicios de pago
    this.services = {
      stripe: new PaymentService(),
      transbank: new TransbankService(),
      mercadopago: new MercadoPagoService(),
      bancoestado: new BancoEstadoService()
    };

    // Configuración de pasarelas por defecto
    this.defaultGateway = process.env.DEFAULT_PAYMENT_GATEWAY || 'stripe';
    this.enabledGateways = this.getEnabledGateways();
  }

  /**
   * Obtener pasarelas habilitadas según configuración
   */
  getEnabledGateways() {
    const enabled = [];

    try {
      // Verificar Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        enabled.push('stripe');
      }
    } catch (error) {
      Logger.warn('Stripe no disponible', { error: error.message });
    }

    try {
      // Verificar Transbank
      const transbankConfig = this.services.transbank.validateConfiguration();
      if (transbankConfig.configured) {
        enabled.push('transbank');
      }
    } catch (error) {
      Logger.warn('Transbank no disponible', { error: error.message });
    }

    try {
      // Verificar MercadoPago
      const mpConfig = this.services.mercadopago.validateConfiguration();
      if (mpConfig.configured) {
        enabled.push('mercadopago');
      }
    } catch (error) {
      Logger.warn('MercadoPago no disponible', { error: error.message });
    }

    try {
      // Verificar BancoEstado
      const beConfig = this.services.bancoestado.validateConfiguration();
      if (beConfig.configured) {
        enabled.push('bancoestado');
      }
    } catch (error) {
      Logger.warn('BancoEstado no disponible', { error: error.message });
    }

    Logger.info('Pasarelas de pago habilitadas', { enabled });
    return enabled;
  }

  /**
   * Obtener información de todas las pasarelas disponibles
   */
  getAvailableGateways() {
    return this.enabledGateways.map(gateway => {
      const info = this.getGatewayInfo(gateway);
      return {
        id: gateway,
        name: info.name,
        description: info.description,
        fees: info.fees,
        supported_methods: info.supported_methods,
        recommended_for: info.recommended_for
      };
    });
  }

  /**
   * Obtener información específica de una pasarela
   */
  getGatewayInfo(gateway) {
    const gatewayInfo = {
      stripe: {
        name: 'Stripe',
        description: 'Pasarela internacional con amplia cobertura',
        fees: '3.6% + $30 CLP (nacional), 4.4% + $30 CLP (internacional)',
        supported_methods: ['Tarjetas de crédito', 'Tarjetas de débito', 'Apple Pay', 'Google Pay'],
        recommended_for: ['Pagos internacionales', 'Experiencia de usuario premium']
      },
      transbank: {
        name: 'Transbank',
        description: 'Líder en pagos electrónicos en Chile',
        fees: '~3.19% + IVA (más económico para Chile)',
        supported_methods: ['Tarjetas de crédito', 'Redcompra (débito)'],
        recommended_for: ['Mercado chileno', 'Costos más bajos']
      },
      mercadopago: {
        name: 'MercadoPago',
        description: 'Líder en pagos de Latinoamérica',
        fees: '3.49% + IVA',
        supported_methods: ['Tarjetas', 'Transferencias', 'Efectivo', 'Cuotas sin interés'],
        recommended_for: ['Cobertura regional', 'Múltiples métodos de pago']
      },
      bancoestado: {
        name: 'BancoEstado',
        description: 'Banco estatal chileno con tarifas preferenciales',
        fees: 'Desde 0.013 UF + IVA (transferencias)',
        supported_methods: ['Transferencias bancarias', 'Tarjetas', 'Cuotas sin interés'],
        recommended_for: ['Transferencias económicas', 'Respaldo estatal']
      }
    };

    return gatewayInfo[gateway] || { name: gateway, description: 'Información no disponible' };
  }

  /**
   * Recomendar la mejor pasarela según criterios
   */
  recommendGateway(criteria = {}) {
    const { 
      amount, 
      country = 'CL', 
      priority = 'cost', // 'cost', 'speed', 'coverage'
      paymentMethod = 'card' 
    } = criteria;

    let recommendations = [];

    // Lógica de recomendación
    if (country === 'CL') {
      if (priority === 'cost') {
        if (paymentMethod === 'transfer' && this.enabledGateways.includes('bancoestado')) {
          recommendations.push({ gateway: 'bancoestado', score: 10, reason: 'Transferencias más económicas en Chile' });
        }
        if (this.enabledGateways.includes('transbank')) {
          recommendations.push({ gateway: 'transbank', score: 9, reason: 'Tarifas preferenciales para Chile' });
        }
        if (this.enabledGateways.includes('mercadopago')) {
          recommendations.push({ gateway: 'mercadopago', score: 7, reason: 'Buenas tarifas regionales' });
        }
        if (this.enabledGateways.includes('stripe')) {
          recommendations.push({ gateway: 'stripe', score: 6, reason: 'Opción internacional confiable' });
        }
      } else if (priority === 'speed') {
        if (this.enabledGateways.includes('stripe')) {
          recommendations.push({ gateway: 'stripe', score: 10, reason: 'Procesamiento más rápido' });
        }
        if (this.enabledGateways.includes('mercadopago')) {
          recommendations.push({ gateway: 'mercadopago', score: 8, reason: 'Integración ágil' });
        }
      }
    } else {
      // Para otros países, priorizar cobertura internacional
      if (this.enabledGateways.includes('stripe')) {
        recommendations.push({ gateway: 'stripe', score: 10, reason: 'Mejor cobertura internacional' });
      }
      if (this.enabledGateways.includes('mercadopago')) {
        recommendations.push({ gateway: 'mercadopago', score: 8, reason: 'Buena cobertura en Latinoamérica' });
      }
    }

    // Ordenar por score y retornar la mejor opción
    recommendations.sort((a, b) => b.score - a.score);
    
    return recommendations.length > 0 
      ? recommendations[0] 
      : { gateway: this.defaultGateway, score: 5, reason: 'Pasarela por defecto' };
  }

  /**
   * Crear pago usando la pasarela especificada o recomendada
   */
  async createPayment(apoderadoId, cuotaIds, options = {}) {
    try {
      const { 
        gateway, 
        alumnoId, 
        paymentMethod = 'card',
        country = 'CL'
      } = options;

      // Determinar pasarela a usar
      let selectedGateway = gateway;
      if (!selectedGateway) {
        const recommendation = this.recommendGateway({
          country,
          paymentMethod,
          priority: 'cost'
        });
        selectedGateway = recommendation.gateway;
        Logger.info('Pasarela recomendada automáticamente', {
          gateway: selectedGateway,
          reason: recommendation.reason
        });
      }

      // Verificar que la pasarela esté habilitada
      if (!this.enabledGateways.includes(selectedGateway)) {
        throw new Error(`Pasarela ${selectedGateway} no está habilitada`);
      }

      // Crear pago según la pasarela seleccionada
      let result;
      switch (selectedGateway) {
        case 'stripe':
          result = await this.services.stripe.createPaymentIntent(apoderadoId, cuotaIds, alumnoId);
          break;
        case 'transbank':
          result = await this.services.transbank.createTransaction(apoderadoId, cuotaIds, alumnoId);
          break;
        case 'mercadopago':
          result = await this.services.mercadopago.createPreference(apoderadoId, cuotaIds, alumnoId);
          break;
        case 'bancoestado':
          result = await this.services.bancoestado.createPaymentOrder(apoderadoId, cuotaIds, alumnoId);
          break;
        default:
          throw new Error(`Pasarela ${selectedGateway} no soportada`);
      }

      Logger.info('Pago creado exitosamente', {
        gateway: selectedGateway,
        apoderadoId,
        cuotaIds
      });

      return {
        gateway: selectedGateway,
        gateway_info: this.getGatewayInfo(selectedGateway),
        ...result
      };
    } catch (error) {
      Logger.error('Error al crear pago unificado', {
        error: error.message,
        apoderadoId,
        cuotaIds,
        options
      });
      throw error;
    }
  }

  /**
   * Confirmar pago según la pasarela
   */
  async confirmPayment(gateway, paymentData) {
    try {
      if (!this.enabledGateways.includes(gateway)) {
        throw new Error(`Pasarela ${gateway} no está habilitada`);
      }

      let result;
      switch (gateway) {
        case 'stripe':
          result = await this.services.stripe.confirmPayment(paymentData.payment_intent_id);
          break;
        case 'transbank':
          result = await this.services.transbank.confirmTransaction(paymentData.token);
          break;
        case 'mercadopago':
          result = await this.services.mercadopago.processPaymentNotification(paymentData.payment_id);
          break;
        case 'bancoestado':
          result = await this.services.bancoestado.processWebhook(paymentData);
          break;
        default:
          throw new Error(`Confirmación no soportada para ${gateway}`);
      }

      Logger.info('Pago confirmado exitosamente', {
        gateway,
        paymentData
      });

      return {
        gateway,
        ...result
      };
    } catch (error) {
      Logger.error('Error al confirmar pago unificado', {
        error: error.message,
        gateway,
        paymentData
      });
      throw error;
    }
  }

  /**
   * Obtener historial consolidado de pagos
   */
  async getConsolidatedPaymentHistory(apoderadoId, limit = 50) {
    try {
      const histories = await Promise.allSettled([
        this.enabledGateways.includes('stripe') 
          ? this.services.stripe.getPaymentHistory(apoderadoId, limit)
          : Promise.resolve([]),
        this.enabledGateways.includes('transbank')
          ? this.services.transbank.getPaymentHistory(apoderadoId, limit)
          : Promise.resolve([]),
        this.enabledGateways.includes('mercadopago')
          ? this.services.mercadopago.getPaymentHistory(apoderadoId, limit)
          : Promise.resolve([]),
        this.enabledGateways.includes('bancoestado')
          ? this.services.bancoestado.getPaymentHistory(apoderadoId, limit)
          : Promise.resolve([])
      ]);

      // Consolidar resultados
      const allPayments = [];
      histories.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allPayments.push(...result.value);
        } else {
          Logger.warn('Error al obtener historial de una pasarela', {
            gateway: this.enabledGateways[index],
            error: result.reason
          });
        }
      });

      // Ordenar por fecha de pago descendente
      allPayments.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));

      return allPayments.slice(0, limit);
    } catch (error) {
      Logger.error('Error al obtener historial consolidado', {
        error: error.message,
        apoderadoId
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso de pasarelas
   */
  async getGatewayStats(apoderadoId = null) {
    try {
      // Esta función requeriría consultas más complejas a la base de datos
      // Por ahora retornamos información básica
      return {
        enabled_gateways: this.enabledGateways,
        default_gateway: this.defaultGateway,
        gateway_info: this.enabledGateways.map(g => ({
          id: g,
          ...this.getGatewayInfo(g)
        }))
      };
    } catch (error) {
      Logger.error('Error al obtener estadísticas de pasarelas', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Procesar webhook según la pasarela
   */
  async processWebhook(gateway, webhookData) {
    try {
      if (!this.enabledGateways.includes(gateway)) {
        throw new Error(`Pasarela ${gateway} no está habilitada`);
      }

      let result;
      switch (gateway) {
        case 'stripe':
          result = await this.services.stripe.handleStripeWebhook(webhookData);
          break;
        case 'transbank':
          // Transbank no usa webhooks tradicionales, usa confirmación directa
          result = { processed: false, reason: 'Transbank no usa webhooks' };
          break;
        case 'mercadopago':
          result = await this.services.mercadopago.processWebhook(webhookData);
          break;
        case 'bancoestado':
          result = await this.services.bancoestado.processWebhook(webhookData);
          break;
        default:
          throw new Error(`Webhook no soportado para ${gateway}`);
      }

      Logger.info('Webhook procesado exitosamente', {
        gateway,
        result
      });

      return {
        gateway,
        ...result
      };
    } catch (error) {
      Logger.error('Error al procesar webhook unificado', {
        error: error.message,
        gateway,
        webhookData
      });
      throw error;
    }
  }
}

module.exports = UnifiedPaymentService;

