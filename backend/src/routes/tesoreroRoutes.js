// src/routes/tesoreroRoutes.js
const express = require('express');
const TesoreroController = require('../controllers/tesoreroController');
const { authenticateToken, requireAdmin, requireTesorero } = require('../middleware/auth');
const { requireTesoreroCourseAccess } = require('../middleware/courseAccess');

const router = express.Router();

// Admin OR Tesorero
const requireAdminOrTesorero = (req, res, next) => {
  const roles = Array.isArray(req.user?.roles)
    ? req.user.roles
    : (req.user?.role ? [req.user.role] : []);
  const ok = roles.map(r => String(r).toLowerCase())
                  .some(r => ['admin', 'administrador', 'tesorero'].includes(r));
  return ok ? next() : res.status(403).json({ success: false, message: 'Acceso denegado' });
};

/** -------------------- Rutas de administración -------------------- */
router.get('/',                 authenticateToken, requireAdmin, TesoreroController.getAll);
router.post('/',                authenticateToken, requireAdmin, TesoreroController.create);
router.get('/active',           authenticateToken, requireAdmin, TesoreroController.getActive);
router.get('/estadisticas',     authenticateToken, requireAdmin, TesoreroController.getEstadisticas);
router.put('/:id',              authenticateToken, requireAdmin, TesoreroController.update);
router.delete('/:id',           authenticateToken, requireAdmin, TesoreroController.delete);
router.patch('/:id/activate',   authenticateToken, requireAdmin, TesoreroController.activate);
router.patch('/:id/deactivate', authenticateToken, requireAdmin, TesoreroController.deactivate);

/** -------------------- Tesorero actual (por token) -------------------- */
// Alias que pide tu frontend:
router.get('/me',       authenticateToken, requireTesorero, TesoreroController.getMyData);
// Versión explícita por si la usas en otro lado:
router.get('/me/curso', authenticateToken, requireTesorero, TesoreroController.getMiCurso);

/** -------------------- Consultas y verificaciones -------------------- */
// ¡OJO al orden! Las específicas antes que "/:id"
router.get('/usuario/:usuarioId',              authenticateToken, requireAdminOrTesorero, TesoreroController.getByUsuario);
router.get('/curso/:cursoId',                  authenticateToken, requireAdminOrTesorero, requireTesoreroCourseAccess, TesoreroController.getByCurso);
router.get('/check/is-tesorero/:rut',          authenticateToken, requireAdminOrTesorero, TesoreroController.checkIsTesorero);
router.get('/check/course-access/:usuarioId/:cursoId', authenticateToken, requireAdminOrTesorero, TesoreroController.checkCourseAccess);
router.get('/:rut/curso',                      authenticateToken, requireAdminOrTesorero, TesoreroController.getCursoAsignadoByRut);

/** -------------------- Detalle por ID -------------------- */
router.get('/:id', authenticateToken, requireAdminOrTesorero, TesoreroController.getById);

module.exports = router;
