const express = require('express');
const TesoreroController = require('../controllers/tesoreroController');
const { authenticateToken, requireAdmin, requireTesorero } = require('../middleware/auth');
const { requireTesoreroCourseAccess } = require('../middleware/courseAccess');

const router = express.Router();

// Rutas públicas (requieren autenticación básica)

/**
 * @route GET /api/tesoreros
 * @desc Obtener todos los tesoreros (solo admin)
 * @access Admin
 */
router.get('/', authenticateToken, requireAdmin, TesoreroController.getAll);

/**
 * @route POST /api/tesoreros
 * @desc Crear un nuevo tesorero (solo admin)
 * @access Admin
 */
router.post('/', authenticateToken, requireAdmin, TesoreroController.create);

/**
 * @route GET /api/tesoreros/active
 * @desc Obtener tesoreros activos (solo admin)
 * @access Admin
 */
router.get('/active', authenticateToken, requireAdmin, TesoreroController.getActive);

/**
 * @route GET /api/tesoreros/estadisticas
 * @desc Obtener estadísticas de tesoreros (solo admin)
 * @access Admin
 */
router.get('/estadisticas', authenticateToken, requireAdmin, TesoreroController.getEstadisticas);

/**
 * @route GET /api/tesoreros/me
 * @desc Obtener datos del tesorero actual
 * @access Tesorero
 */
router.get('/me', authenticateToken, requireTesorero, TesoreroController.getMyData);

/**
 * @route GET /api/tesoreros/:id
 * @desc Obtener un tesorero por ID (admin o el mismo tesorero)
 * @access Admin, Tesorero (propio)
 */
router.get('/:id', authenticateToken, requireTesorero, TesoreroController.getById);

/**
 * @route PUT /api/tesoreros/:id
 * @desc Actualizar un tesorero (solo admin)
 * @access Admin
 */
router.put('/:id', authenticateToken, requireAdmin, TesoreroController.update);

/**
 * @route DELETE /api/tesoreros/:id
 * @desc Eliminar un tesorero (solo admin)
 * @access Admin
 */
router.delete('/:id', authenticateToken, requireAdmin, TesoreroController.delete);

/**
 * @route PATCH /api/tesoreros/:id/activate
 * @desc Activar un tesorero (solo admin)
 * @access Admin
 */
router.patch('/:id/activate', authenticateToken, requireAdmin, TesoreroController.activate);

/**
 * @route PATCH /api/tesoreros/:id/deactivate
 * @desc Desactivar un tesorero (solo admin)
 * @access Admin
 */
router.patch('/:id/deactivate', authenticateToken, requireAdmin, TesoreroController.deactivate);

// Rutas de consulta por relaciones

/**
 * @route GET /api/tesoreros/usuario/:usuarioId
 * @desc Obtener tesorero por usuario
 * @access Admin, Tesorero (propio)
 */
router.get('/usuario/:usuarioId', authenticateToken, requireTesorero, TesoreroController.getByUsuario);

/**
 * @route GET /api/tesoreros/curso/:cursoId
 * @desc Obtener tesorero por curso
 * @access Admin, Tesorero (del curso)
 */
router.get('/curso/:cursoId', authenticateToken, requireTesorero, TesoreroController.getByCurso);

/**
 * @route GET /api/tesoreros/usuario/:usuarioId/curso-asignado
 * @desc Obtener curso asignado a un tesorero
 * @access Admin, Tesorero (propio)
 */
router.get('/usuario/:usuarioId/curso-asignado', authenticateToken, requireTesorero, TesoreroController.getCursoAsignado);

// Rutas de verificación

/**
 * @route GET /api/tesoreros/check/is-tesorero/:usuarioId
 * @desc Verificar si un usuario es tesorero
 * @access Admin, Tesorero
 */
router.get('/check/is-tesorero/:usuarioId', authenticateToken, requireTesorero, TesoreroController.checkIsTesorero);

/**
 * @route GET /api/tesoreros/check/course-access/:usuarioId/:cursoId
 * @desc Verificar acceso de tesorero a curso
 * @access Admin, Tesorero
 */
router.get('/check/course-access/:usuarioId/:cursoId', authenticateToken, requireTesorero, TesoreroController.checkCourseAccess);

module.exports = router;

