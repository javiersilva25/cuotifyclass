const express = require('express');
const CategoriaGastoController = require('../controllers/categoriaGastoController');

const router = express.Router();

// Rutas para categorías de gasto
router.post('/', CategoriaGastoController.create);
router.get('/', CategoriaGastoController.getAll);
router.get('/active', CategoriaGastoController.getAllActive);
router.get('/search', CategoriaGastoController.searchByName);
router.get('/stats', CategoriaGastoController.getUsageStats);
router.get('/:id', CategoriaGastoController.getById);
router.put('/:id', CategoriaGastoController.update);
router.delete('/:id', CategoriaGastoController.delete);
router.patch('/:id/restore', CategoriaGastoController.restore);

module.exports = router;

