// routes/cursos.js
const express = require('express');
const CursoController = require('../controllers/cursoController');
const router = express.Router();

router.get('/',    CursoController.list);
router.patch('/:id/tesorero', CursoController.assignTesorero);
router.get('/:id', CursoController.get);
router.post('/',   CursoController.create);
router.put('/:id', CursoController.update);
router.delete('/:id', CursoController.remove);

module.exports = router;
