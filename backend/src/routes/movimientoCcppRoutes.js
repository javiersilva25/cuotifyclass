const express = require('express');
const MovimientoCcppController = require('../controllers/movimientoCcppController');

const router = express.Router();

// Rutas para movimientos CCPP
router.post('/', MovimientoCcppController.create);
router.post('/bulk', MovimientoCcppController.createBulk);
router.get('/', MovimientoCcppController.getAll);
router.get('/search', MovimientoCcppController.searchByConcepto);
router.get('/stats', MovimientoCcppController.getEstadisticas);
router.get('/grouped-by-month', MovimientoCcppController.getGroupedByMonth);
router.get('/:id', MovimientoCcppController.getById);
router.put('/:id', MovimientoCcppController.update);
router.delete('/:id', MovimientoCcppController.delete);
router.patch('/:id/restore', MovimientoCcppController.restore);

// Rutas específicas por curso
router.get('/curso/:cursoId', MovimientoCcppController.getByCurso);
router.get('/curso/:cursoId/ingresos', MovimientoCcppController.getIngresosByCurso);
router.get('/curso/:cursoId/gastos', MovimientoCcppController.getGastosByCurso);
router.get('/curso/:cursoId/total-ingresos', MovimientoCcppController.getTotalIngresosByCurso);
router.get('/curso/:cursoId/total-gastos', MovimientoCcppController.getTotalGastosByCurso);
router.get('/curso/:cursoId/balance', MovimientoCcppController.getBalanceByCurso);
router.get('/curso/:cursoId/grouped-by-alumno', MovimientoCcppController.getGroupedByAlumno);
router.get('/curso/:cursoId/alumno/:alumnoId/date-range', MovimientoCcppController.getByDateRange);

// Rutas específicas por alumno
router.get('/alumno/:alumnoId', MovimientoCcppController.getByAlumno);
router.get('/alumno/:alumnoId/total', MovimientoCcppController.getTotalByAlumno);

// Rutas combinadas
router.get('/curso/:cursoId/alumno/:alumnoId', MovimientoCcppController.getByCursoAndAlumno);

module.exports = router;

