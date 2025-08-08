const express = require('express');
const MovimientoCcaaController = require('../controllers/movimientoCcaaController');

const router = express.Router();

// Rutas para movimientos CCAA
router.post('/', MovimientoCcaaController.create);
router.post('/bulk', MovimientoCcaaController.createBulk);
router.get('/', MovimientoCcaaController.getAll);
router.get('/search', MovimientoCcaaController.searchByConcepto);
router.get('/stats', MovimientoCcaaController.getEstadisticas);
router.get('/grouped-by-tipo', MovimientoCcaaController.getGroupedByTipo);
router.get('/grouped-by-month', MovimientoCcaaController.getGroupedByMonth);
router.get('/:id', MovimientoCcaaController.getById);
router.put('/:id', MovimientoCcaaController.update);
router.delete('/:id', MovimientoCcaaController.delete);
router.patch('/:id/restore', MovimientoCcaaController.restore);

// Rutas específicas por curso
router.get('/curso/:cursoId', MovimientoCcaaController.getByCurso);
router.get('/curso/:cursoId/ingresos', MovimientoCcaaController.getIngresosByCurso);
router.get('/curso/:cursoId/gastos', MovimientoCcaaController.getGastosByCurso);
router.get('/curso/:cursoId/total-ingresos', MovimientoCcaaController.getTotalIngresosByCurso);
router.get('/curso/:cursoId/total-gastos', MovimientoCcaaController.getTotalGastosByCurso);
router.get('/curso/:cursoId/balance', MovimientoCcaaController.getBalanceByCurso);
router.get('/curso/:cursoId/date-range', MovimientoCcaaController.getByDateRange);

module.exports = router;

