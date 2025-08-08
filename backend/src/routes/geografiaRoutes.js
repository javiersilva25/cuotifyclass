const express = require('express');
const router = express.Router();
const geografiaController = require('../controllers/geografiaController');
const { param, query } = require('express-validator');

/**
 * Rutas para gestión de geografía de Chile
 * Basado en CUT 2018 - Código Único Territorial
 */

/**
 * @route GET /api/geografia/regiones
 * @desc Obtener todas las regiones de Chile
 * @access Public
 */
router.get('/regiones', geografiaController.getRegiones);

/**
 * @route GET /api/geografia/regiones/:codigoRegion/provincias
 * @desc Obtener provincias de una región específica
 * @access Public
 */
router.get('/regiones/:codigoRegion/provincias', [
  param('codigoRegion')
    .isInt({ min: 1, max: 16 })
    .withMessage('Código de región debe ser un número entre 1 y 16')
], geografiaController.getProvinciasByRegion);

/**
 * @route GET /api/geografia/provincias/:codigoProvincia/comunas
 * @desc Obtener comunas de una provincia específica
 * @access Public
 */
router.get('/provincias/:codigoProvincia/comunas', [
  param('codigoProvincia')
    .isInt({ min: 1 })
    .withMessage('Código de provincia debe ser un número válido')
], geografiaController.getComunasByProvincia);

/**
 * @route GET /api/geografia/regiones/:codigoRegion/comunas
 * @desc Obtener todas las comunas de una región
 * @access Public
 */
router.get('/regiones/:codigoRegion/comunas', [
  param('codigoRegion')
    .isInt({ min: 1, max: 16 })
    .withMessage('Código de región debe ser un número entre 1 y 16')
], geografiaController.getComunasByRegion);

/**
 * @route GET /api/geografia/comunas/:codigoComuna
 * @desc Obtener información completa de una comuna
 * @access Public
 */
router.get('/comunas/:codigoComuna', [
  param('codigoComuna')
    .isInt({ min: 1 })
    .withMessage('Código de comuna debe ser un número válido')
], geografiaController.getUbicacionByComuna);

/**
 * @route GET /api/geografia/buscar
 * @desc Buscar ubicaciones por nombre
 * @access Public
 */
router.get('/buscar', [
  query('q')
    .isLength({ min: 2 })
    .withMessage('El término de búsqueda debe tener al menos 2 caracteres')
], geografiaController.buscarUbicaciones);

/**
 * @route GET /api/geografia/estadisticas
 * @desc Obtener estadísticas geográficas
 * @access Public
 */
router.get('/estadisticas', geografiaController.getEstadisticas);

module.exports = router;

