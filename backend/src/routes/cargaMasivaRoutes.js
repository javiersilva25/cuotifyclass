const express = require('express');
const router = express.Router();
const CargaMasivaController = require('../controllers/cargaMasivaController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * Rutas de Carga Masiva v7.0
 * Todas las rutas requieren autenticación de administrador
 */

// Middleware de autenticación para todas las rutas
router.use(requireAuth);
router.use(requireAdmin);

/**
 * @route POST /api/carga-masiva/procesar
 * @desc Procesar archivo de carga masiva
 * @access Admin
 */
router.post('/procesar', 
  CargaMasivaController.subirArchivo,
  CargaMasivaController.procesarCargaMasiva
);

/**
 * @route POST /api/carga-masiva/validar
 * @desc Validar archivo antes de procesar
 * @access Admin
 */
router.post('/validar',
  CargaMasivaController.subirArchivo,
  CargaMasivaController.validarArchivo
);

/**
 * @route GET /api/carga-masiva/plantilla/csv
 * @desc Descargar plantilla CSV
 * @access Admin
 */
router.get('/plantilla/csv', CargaMasivaController.descargarPlantillaCSV);

/**
 * @route GET /api/carga-masiva/plantilla/excel
 * @desc Descargar plantilla Excel
 * @access Admin
 */
router.get('/plantilla/excel', CargaMasivaController.descargarPlantillaExcel);

/**
 * @route GET /api/carga-masiva/roles
 * @desc Obtener roles disponibles para asignación
 * @access Admin
 */
router.get('/roles', CargaMasivaController.obtenerRolesDisponibles);

/**
 * @route GET /api/carga-masiva/estadisticas
 * @desc Obtener estadísticas del sistema de usuarios
 * @access Admin
 */
router.get('/estadisticas', CargaMasivaController.obtenerEstadisticas);

/**
 * @route DELETE /api/carga-masiva/datos-prueba
 * @desc Limpiar todos los datos marcados como prueba
 * @access Admin
 */
router.delete('/datos-prueba', CargaMasivaController.limpiarDatosPrueba);

/**
 * @route GET /api/carga-masiva/personas
 * @desc Buscar personas con filtros
 * @access Admin
 */
router.get('/personas', CargaMasivaController.buscarPersonas);

module.exports = router;

