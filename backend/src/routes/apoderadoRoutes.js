const express = require('express');
const router = express.Router();
const ApoderadoController = require('../controllers/apoderadoController');
const { 
  validateApoderado, 
  validateApoderadoUpdate, 
  validateLogin,
  validatePaymentPreferences 
} = require('../validators/apoderadoValidator');

// Rutas públicas (sin autenticación)
router.post('/login', validateLogin, ApoderadoController.login);

// Rutas protegidas (requieren autenticación)
// Nota: El middleware de autenticación se aplicará en el archivo principal de rutas

// CRUD básico de apoderados
router.get('/', ApoderadoController.getAll);
router.get('/:id', ApoderadoController.getById);
router.post('/', validateApoderado, ApoderadoController.create);
router.put('/:id', validateApoderadoUpdate, ApoderadoController.update);
router.delete('/:id', ApoderadoController.delete);

// Rutas específicas del apoderado
router.get('/:id/hijos', ApoderadoController.getChildren);
router.get('/:id/deudas-pendientes', ApoderadoController.getPendingDebts);
router.put('/:id/preferencias-pago', validatePaymentPreferences, ApoderadoController.updatePaymentPreferences);

// Rutas para gestión de pagos
router.post('/:id/pagos/crear-intencion', ApoderadoController.createPaymentIntent);
router.post('/:id/pagos/confirmar', ApoderadoController.confirmPayment);
router.get('/:id/pagos/historial', ApoderadoController.getPaymentHistory);

module.exports = router;

