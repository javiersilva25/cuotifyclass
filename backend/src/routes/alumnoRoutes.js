const express = require('express');
const AlumnoController = require('../controllers/alumnoController');

const router = express.Router();

// Colección
router.post('/', AlumnoController.create);
router.get('/',  AlumnoController.getAll);
router.get('/search', AlumnoController.searchByName);

// ESPECÍFICAS (antes de "/:id")
router.get('/apoderado/:rutOrId', AlumnoController.getByApoderado);
router.get('/curso/:cursoId',      AlumnoController.getByCurso);
router.get('/curso/:cursoId/count', AlumnoController.countByCurso);
router.get('/usuario/:usuarioId/exists', AlumnoController.existsByUsuarioId);

// Por ID (al final)
router.get('/:id',    AlumnoController.getById);
router.put('/:id',    AlumnoController.update);
router.delete('/:id', AlumnoController.delete);
router.patch('/:id/restore', AlumnoController.restore);

module.exports = router;
