const express = require('express');
const GastoController = require('../controllers/gastoController');

const router = express.Router();

// Rutas para gastos
router.post('/', GastoController.create);
router.get('/', GastoController.getAll);
router.get('/with-boleta', GastoController.getWithBoleta);
router.get('/without-boleta', GastoController.getWithoutBoleta);
router.get('/search', GastoController.searchByConcepto);
router.get('/stats', GastoController.getEstadisticas);
router.get('/grouped-by-categoria', GastoController.getGroupedByCategoria);
router.get('/grouped-by-month', GastoController.getGroupedByMonth);
router.get('/:id', GastoController.getById);
router.put('/:id', GastoController.update);
router.delete('/:id', GastoController.delete);
router.patch('/:id/restore', GastoController.restore);

// Rutas específicas
router.get('/curso/:cursoId', GastoController.getByCurso);
router.get('/curso/:cursoId/total', GastoController.getTotalByCurso);
router.get('/curso/:cursoId/date-range', GastoController.getByDateRange);
router.get('/categoria/:categoriaId', GastoController.getByCategoria);
router.get('/categoria/:categoriaId/total', GastoController.getTotalByCategoria);

module.exports = router;

