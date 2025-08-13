// routes/niveles.js
const express = require('express');
const router = express.Router();
const NivelesController = require('../controllers/nivelesController');
const { authenticateToken } = require('../middleware/auth');

// Para selects (activos)
router.get('/', authenticateToken, NivelesController.listActivos);

// (Opcional) detalle
router.get('/:id', authenticateToken, NivelesController.getById);

module.exports = router;
