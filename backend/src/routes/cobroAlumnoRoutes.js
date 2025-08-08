const express = require('express');
const CobroAlumnoController = require('../controllers/cobroAlumnoController');

const router = express.Router();

// Rutas para cobros de alumnos
router.post('/', CobroAlumnoController.create);
router.get('/', CobroAlumnoController.getAll);
router.get('/search', CobroAlumnoController.searchByConcepto);
router.get('/grouped-by-curso', CobroAlumnoController.getGroupedByCurso);
router.get('/stats', CobroAlumnoController.getEstadisticas);
router.get('/:id', CobroAlumnoController.getById);
router.put('/:id', CobroAlumnoController.update);
router.delete('/:id', CobroAlumnoController.delete);
router.patch('/:id/restore', CobroAlumnoController.restore);

// Rutas específicas
router.get('/curso/:cursoId', CobroAlumnoController.getByCurso);
router.get('/curso/:cursoId/total', CobroAlumnoController.getTotalByCurso);
router.post('/curso/:cursoId/bulk', CobroAlumnoController.createBulk);

module.exports = router;

