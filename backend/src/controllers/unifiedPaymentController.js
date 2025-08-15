// src/controllers/unifiedPaymentController.js
const UnifiedPaymentService = require('../services/unifiedPaymentService');
const Logger = require('../utils/logger');

const getApoderadoId = (req) => {
  // Prioriza path param, luego token decodificado o header
  return (
    req.params?.id ??
    req.user?.id ??
    req.user?.rut ??
    req.headers['x-user-id'] ??
    null
  );
};

const firstArray = (...cands) => {
  for (const c of cands) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
};

class UnifiedPaymentController {
  constructor() {
    this.paymentService = new UnifiedPaymentService();
  }

  // --- Pasarelas disponibles ---
  async getAvailableGateways(_req, res) {
    try {
      const gateways = this.paymentService.getAvailableGateways();
      res.json({ success: true, data: gateways, default_gateway: this.paymentService.defaultGateway });
    } catch (error) {
      Logger.error('getAvailableGateways', { error: error.message });
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  // --- Recomendación ---
  async recommendGateway(req, res) {
    try {
      const { amount, country = 'CL', priority = 'cost', payment_method = 'card' } = req.query;
      const recommendation = this.paymentService.recommendGateway({
        amount: amount ? parseFloat(amount) : undefined,
        country,
        priority,
        paymentMethod: payment_method,
      });
      res.json({
        success: true,
        data: recommendation,
        gateway_info: this.paymentService.getGatewayInfo(recommendation.gateway),
      });
    } catch (error) {
      Logger.error('recommendGateway', { error: error.message });
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  // --- Crear pago unificado ---
  async createPayment(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) {
        return res.status(400).json({ success: false, message: 'No se pudo determinar el apoderado' });
      }

      // Normalizamos ids (preferimos deudas)
      const deudaIds = firstArray(
        req.body?.deuda_ids,
        req.body?.cuota_ids,
        req.body?.cobro_ids,
        req.body?.ids
      );

      if (!deudaIds.length) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar al menos una deuda a pagar' });
      }

      const gateway = (req.body?.gateway || this.paymentService.defaultGateway || 'mercadopago').toLowerCase();
      const alumnoId = req.body?.alumno_id ?? null;
      const paymentMethod = req.body?.payment_method || 'card';
      const country = req.body?.country || 'CL';

      const result = await this.paymentService.createPayment(apoderadoId, deudaIds, {
        gateway,
        alumnoId,
        paymentMethod,
        country,
      });

      Logger.info('Pago unificado creado', { apoderadoId, gateway, deudaIds });

      res.json({ success: true, message: 'Pago creado exitosamente', data: result });
    } catch (error) {
      Logger.error('createPayment', { error: error.message, apoderadoId: req.params?.id });
      res.status(500).json({ success: false, message: error.message || 'Error interno del servidor', error: error.message });
    }
  }

  // --- Confirmación (para gateways que la requieren) ---
  async confirmPayment(req, res) {
    try {
      const { gateway, ...paymentData } = req.body;
      if (!gateway) return res.status(400).json({ success: false, message: 'gateway es requerido' });

      const result = await this.paymentService.confirmPayment(gateway, paymentData);
      Logger.info('Pago unificado confirmado', { gateway });

      res.json({ success: true, message: 'Pago confirmado exitosamente', data: result });
    } catch (error) {
      Logger.error('confirmPayment', { error: error.message, gateway: req.body?.gateway });
      res.status(500).json({ success: false, message: error.message || 'Error interno del servidor', error: error.message });
    }
  }

  // --- Historial consolidado ---
  async getPaymentHistory(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      const limit = parseInt(req.query?.limit ?? 50, 10);
      if (!apoderadoId) return res.status(400).json({ success: false, message: 'apoderado_id requerido' });

      const history = await this.paymentService.getConsolidatedPaymentHistory(apoderadoId, limit);
      res.json({ success: true, data: history, total: history.length });
    } catch (error) {
      Logger.error('getPaymentHistory', { error: error.message });
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  // --- Estadísticas por pasarela ---
  async getGatewayStats(req, res) {
    try {
      const apoderadoId = req.params?.id ?? null;
      const stats = await this.paymentService.getGatewayStats(apoderadoId);
      res.json({ success: true, data: stats });
    } catch (error) {
      Logger.error('getGatewayStats', { error: error.message });
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  // --- Webhook unificado (/api/payments/webhook/:gateway) ---
  async processWebhook(req, res) {
    try {
      const gateway = (req.params?.gateway || req.query?.gateway || '').toLowerCase();
      if (!gateway) return res.status(400).json({ success: false, message: 'gateway es requerido' });

      // Pasamos body y query para soportar MP (usa a veces query params)
      const result = await this.paymentService.processWebhook(gateway, req.body, req.query);

      Logger.info('Webhook procesado', { gateway, status: result?.status });
      // Importante para MP: responder 200 siempre que proceses el evento
      res.json({ success: true, message: 'Webhook procesado', data: result });
    } catch (error) {
      Logger.error('processWebhook', { error: error.message, gateway: req.params?.gateway });
      // Para MP, responder 200 aunque haya duplicados; si es error real, 500:
      res.status(200).json({ success: false, message: 'Evento recibido', error: error.message });
    }
  }

  // --- Smoke test de configuración ---
  async testGateways(_req, res) {
    try {
      const testResults = {};
      for (const gw of this.paymentService.enabledGateways) {
        try {
          const svc = this.paymentService.services[gw];
          const cfg = svc.validateConfiguration ? svc.validateConfiguration() : { configured: true };
          testResults[gw] = { status: 'OK', configuration: cfg };
        } catch (e) {
          testResults[gw] = { status: 'ERROR', error: e.message };
        }
      }
      res.json({
        success: true,
        message: 'Prueba de pasarelas completada',
        data: { enabled_gateways: this.paymentService.enabledGateways, test_results: testResults },
      });
    } catch (error) {
      Logger.error('testGateways', { error: error.message });
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }
}

module.exports = UnifiedPaymentController;
