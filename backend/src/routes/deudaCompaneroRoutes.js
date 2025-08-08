const express = require('express');
const DeudaCompaneroController = require('../controllers/deudaCompaneroController');

const router = express.Router();

// Rutas para deudas de compañeros
router.post('/', DeudaCompaneroController.create);
router.get('/', DeudaCompaneroController.getAll);
router.get('/grouped-by-cobro-alumnos', DeudaCompaneroController.getGroupedByCobroAlumnos);
router.get('/stats', DeudaCompaneroController.getEstadisticas);
router.get('/:id', DeudaCompaneroController.getById);
router.put('/:id', DeudaCompaneroController.update);
router.delete('/:id', DeudaCompaneroController.delete);
router.patch('/:id/restore', DeudaCompaneroController.restore);

// Rutas específicas de estado
router.patch('/:id/marcar-pagado', DeudaCompaneroController.marcarPagado);
router.patch('/marcar-multiples-pagadas', DeudaCompaneroController.marcarMultiplesPagadas);

// Rutas específicas
router.get('/alumno/:alumnoId', DeudaCompaneroController.getByAlumno);
router.get('/alumno/:alumnoId/pendientes', DeudaCompaneroController.getPendientesByAlumno);
router.get('/cobro-alumnos/:cobroAlumnosId', DeudaCompaneroController.getByCobroAlumnos);
router.get('/cobro-alumnos/:cobroAlumnosId/count-pendientes', DeudaCompaneroController.countPendientesByCobroAlumnos);
router.get('/cobro-alumnos/:cobroAlumnosId/count-pagadas', DeudaCompaneroController.countPagadasByCobroAlumnos);
router.get('/curso/:cursoId/resumen', DeudaCompaneroController.getResumenByCurso);

// Rutas masivas
router.post('/cobro-alumnos/:cobroAlumnosId/bulk', DeudaCompaneroController.createBulkForCobroAlumnos);

module.exports = router;

