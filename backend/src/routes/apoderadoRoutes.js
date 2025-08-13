// src/routes/apoderadoRoutes.js
const express = require('express');
const router = express.Router();
const ApoderadoController = require('../controllers/apoderadoController');
const { authenticateToken } = require('../middleware/auth');

// ÚNICA ruta (evita duplicados)
router.get('/', authenticateToken, ApoderadoController.listActivos);

module.exports = router;
