// routes/profesores.js
const express = require('express');
const router = express.Router();
const ProfesorController = require('../controllers/profesorController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, ProfesorController.listActivos);
router.get('/:rut', authenticateToken, ProfesorController.getById); // antes era :id

module.exports = router;
