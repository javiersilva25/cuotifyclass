const express = require('express');
const AlumnoController = require('../controllers/alumnoController');

const router = express.Router();

// Rutas para alumnos
router.post('/', AlumnoController.create);
router.get('/', AlumnoController.getAll);
router.get('/search', AlumnoController.searchByName);
router.get('/:id', AlumnoController.getById);
router.put('/:id', AlumnoController.update);
router.delete('/:id', AlumnoController.delete);
router.patch('/:id/restore', AlumnoController.restore);

// Rutas específicas
router.get('/curso/:cursoId', AlumnoController.getByCurso);
router.get('/apoderado/:apoderadoId', AlumnoController.getByApoderado);
router.get('/curso/:cursoId/count', AlumnoController.countByCurso);
router.get('/usuario/:usuarioId/exists', AlumnoController.existsByUsuarioId);

module.exports = router;

