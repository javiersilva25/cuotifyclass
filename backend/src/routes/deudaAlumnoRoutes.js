const express = require('express');
const DeudaAlumnoController = require('../controllers/deudaAlumnoController');

const router = express.Router();

// Rutas para deudas de alumnos
router.post('/', DeudaAlumnoController.create);
router.get('/', DeudaAlumnoController.getAll);
router.get('/stats', DeudaAlumnoController.getEstadisticas);
router.get('/:id', DeudaAlumnoController.getById);
router.put('/:id', DeudaAlumnoController.update);
router.delete('/:id', DeudaAlumnoController.delete);
router.patch('/:id/restore', DeudaAlumnoController.restore);

// Rutas específicas de estado
router.patch('/:id/marcar-pagado', DeudaAlumnoController.marcarPagado);
router.patch('/:id/marcar-parcial', DeudaAlumnoController.marcarParcial);
router.patch('/:id/anular', DeudaAlumnoController.anular);

// Rutas específicas
router.get('/alumno/:alumnoId', DeudaAlumnoController.getByAlumno);
router.get('/alumno/:alumnoId/pendientes', DeudaAlumnoController.getPendientesByAlumno);
router.get('/alumno/:alumnoId/total-adeudado', DeudaAlumnoController.getTotalAdeudadoByAlumno);
router.get('/cobro/:cobroId', DeudaAlumnoController.getByCobro);
router.get('/curso/:cursoId/resumen', DeudaAlumnoController.getResumenByCurso);

// Rutas masivas
router.post('/cobro/:cobroId/bulk', DeudaAlumnoController.createBulkForCobro);

module.exports = router;

