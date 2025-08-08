const express = require('express');
const CursoController = require('../controllers/cursoController');

const router = express.Router();

// Rutas para cursos
router.post('/', CursoController.create);
router.get('/', CursoController.getAll);
router.get('/current-year', CursoController.getCurrentYear);
router.get('/search', CursoController.searchByName);
router.get('/stats', CursoController.getEstadisticas);
router.get('/with-alumnos-count', CursoController.getWithAlumnosCount);
router.get('/anos-escolares', CursoController.getAnosEscolares);
router.get('/:id', CursoController.getById);
router.put('/:id', CursoController.update);
router.delete('/:id', CursoController.delete);
router.patch('/:id/restore', CursoController.restore);

// Rutas específicas
router.get('/nivel/:nivelId', CursoController.getByNivel);
router.get('/ano-escolar/:anoEscolar', CursoController.getByAnoEscolar);
router.get('/profesor/:profesorId', CursoController.getByProfesor);
router.get('/tesorero/:tesoreroId', CursoController.getByTesorero);

module.exports = router;

