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

router.get('/select-options', async (req, res) => {
  try {
    const { Curso } = require('../models');
    const cursos = await Curso.findAll({
      attributes: ['id', ['nombre_curso', 'nombre']],
      order: [['nombre_curso', 'ASC'], ['id', 'ASC']],
    });
    res.json({ data: cursos.map(c => ({ id: c.id, nombre: c.get('nombre') })) });
  } catch (e) {
    res.status(500).json({ message: 'Error al cargar cursos' });
  }
});

module.exports = router;
