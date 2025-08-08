const UnifiedPaymentService = require('../services/unifiedPaymentService');
const Logger = require('../utils/logger');

class UnifiedPaymentController {
  constructor() {
    this.paymentService = new UnifiedPaymentService();
  }

  /**
   * Obtener pasarelas de pago disponibles
   */
  async getAvailableGateways(req, res) {
    try {
      const gateways = this.paymentService.getAvailableGateways();
      
      res.json({
        success: true,
        data: gateways,
        default_gateway: this.paymentService.defaultGateway
      });
    } catch (error) {
      Logger.error('Error al obtener pasarelas disponibles', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Recomendar pasarela de pago
   */
  async recommendGateway(req, res) {
    try {
      const { amount, country, priority, payment_method } = req.query;
      
      const recommendation = this.paymentService.recommendGateway({
        amount: amount ? parseFloat(amount) : undefined,
        country: country || 'CL',
        priority: priority || 'cost',
        paymentMethod: payment_method || 'card'
      });

      res.json({
        success: true,
        data: recommendation,
        gateway_info: this.paymentService.getGatewayInfo(recommendation.gateway)
      });
    } catch (error) {
      Logger.error('Error al recomendar pasarela', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear pago usando el sistema unificado
   */
  async createPayment(req, res) {
    try {
      const { id } = req.params; // apoderado_id
      const { 
        cuota_ids, 
        alumno_id, 
        gateway, 
        payment_method = 'card',
        country = 'CL'
      } = req.body;

      if (!cuota_ids || !Array.isArray(cuota_ids) || cuota_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos una cuota para pagar'
        });
      }

      const result = await this.paymentService.createPayment(id, cuota_ids, {
        gateway,
        alumnoId: alumno_id,
        paymentMethod: payment_method,
        country
      });

      Logger.info('Pago unificado creado exitosamente', {
        apoderadoId: id,
        gateway: result.gateway,
        cuotaIds: cuota_ids
      });

      res.json({
        success: true,
        message: 'Pago creado exitosamente',
        data: result
      });
    } catch (error) {
      Logger.error('Error al crear pago unificado', {
        error: error.message,
        apoderadoId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Confirmar pago
   */
  async confirmPayment(req, res) {
    try {
      const { gateway, ...paymentData } = req.body;

      if (!gateway) {
        return res.status(400).json({
          success: false,
          message: 'Gateway es requerido para confirmar el pago'
        });
      }

      const result = await this.paymentService.confirmPayment(gateway, paymentData);

      Logger.info('Pago unificado confirmado exitosamente', {
        gateway,
        paymentData
      });

      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        data: result
      });
    } catch (error) {
      Logger.error('Error al confirmar pago unificado', {
        error: error.message,
        gateway: req.body.gateway
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener historial consolidado de pagos
   */
  async getPaymentHistory(req, res) {
    try {
      const { id } = req.params; // apoderado_id
      const { limit = 50 } = req.query;

      const history = await this.paymentService.getConsolidatedPaymentHistory(id, limit);

      res.json({
        success: true,
        data: history,
        total: history.length
      });
    } catch (error) {
      Logger.error('Error al obtener historial consolidado', {
        error: error.message,
        apoderadoId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de pasarelas
   */
  async getGatewayStats(req, res) {
    try {
      const { id } = req.params; // apoderado_id (opcional)
      
      const stats = await this.paymentService.getGatewayStats(id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      Logger.error('Error al obtener estadísticas de pasarelas', {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Procesar webhook unificado
   */
  async processWebhook(req, res) {
    try {
      const { gateway } = req.params;
      const webhookData = req.body;

      if (!gateway) {
        return res.status(400).json({
          success: false,
          message: 'Gateway es requerido'
        });
      }

      const result = await this.paymentService.processWebhook(gateway, webhookData);

      Logger.info('Webhook unificado procesado', {
        gateway,
        result
      });

      res.json({
        success: true,
        message: 'Webhook procesado exitosamente',
        data: result
      });
    } catch (error) {
      Logger.error('Error al procesar webhook unificado', {
        error: error.message,
        gateway: req.params.gateway
      });
      res.status(500).json({
        success: false,
        message: 'Error al procesar webhook',
        error: error.message
      });
    }
  }

  /**
   * Endpoint de prueba para validar configuraciones
   */
  async testGateways(req, res) {
    try {
      const testResults = {};

      // Probar cada pasarela habilitada
      for (const gateway of this.paymentService.enabledGateways) {
        try {
          const service = this.paymentService.services[gateway];
          const config = service.validateConfiguration();
          testResults[gateway] = {
            status: 'OK',
            configuration: config
          };
        } catch (error) {
          testResults[gateway] = {
            status: 'ERROR',
            error: error.message
          };
        }
      }

      res.json({
        success: true,
        message: 'Prueba de pasarelas completada',
        data: {
          enabled_gateways: this.paymentService.enabledGateways,
          test_results: testResults
        }
      });
    } catch (error) {
      Logger.error('Error al probar pasarelas', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = UnifiedPaymentController;

