const express = require('express');
const router = express.Router();
const UnifiedPaymentController = require('../controllers/unifiedPaymentController');

// Crear instancia del controlador
const controller = new UnifiedPaymentController();

// Rutas de información de pasarelas
router.get('/gateways', controller.getAvailableGateways.bind(controller));
router.get('/gateways/recommend', controller.recommendGateway.bind(controller));
router.get('/gateways/stats/:id?', controller.getGatewayStats.bind(controller));
router.get('/gateways/test', controller.testGateways.bind(controller));

// Rutas de pagos unificados
router.post('/apoderados/:id/create', controller.createPayment.bind(controller));
router.post('/confirm', controller.confirmPayment.bind(controller));
router.get('/apoderados/:id/history', controller.getPaymentHistory.bind(controller));

// Rutas de webhooks unificados
router.post('/webhooks/:gateway', controller.processWebhook.bind(controller));

// Ruta de información del sistema unificado
router.get('/info', (req, res) => {
  res.json({
    name: 'Sistema Unificado de Pagos',
    version: '4.0.0',
    description: 'Sistema que integra múltiples pasarelas de pago para ofrecer la mejor experiencia y costos',
    supported_gateways: [
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Pasarela internacional premium'
      },
      {
        id: 'transbank',
        name: 'Transbank',
        description: 'Líder en Chile, costos optimizados'
      },
      {
        id: 'mercadopago',
        name: 'MercadoPago',
        description: 'Líder en Latinoamérica'
      },
      {
        id: 'bancoestado',
        name: 'BancoEstado',
        description: 'Banco estatal chileno, transferencias económicas'
      }
    ],
    features: [
      'Selección automática de pasarela más económica',
      'Soporte para múltiples métodos de pago',
      'Webhooks unificados',
      'Historial consolidado',
      'Recomendaciones inteligentes'
    ],
    endpoints: {
      gateways: '/api/payments/gateways',
      create_payment: '/api/payments/apoderados/:id/create',
      confirm_payment: '/api/payments/confirm',
      history: '/api/payments/apoderados/:id/history',
      webhooks: '/api/payments/webhooks/:gateway'
    }
  });
});

module.exports = router;

