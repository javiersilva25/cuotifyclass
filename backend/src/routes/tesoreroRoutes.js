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

/** -------------------- Administración -------------------- */
router.get('/',                 authenticateToken, requireAdmin, TesoreroController.getAll);
router.post('/',                authenticateToken, requireAdmin, TesoreroController.create);
router.get('/active',           authenticateToken, requireAdmin, TesoreroController.getActive);
router.get('/estadisticas',     authenticateToken, requireAdmin, TesoreroController.getEstadisticas);
router.put('/:id',              authenticateToken, requireAdmin, TesoreroController.update);
router.delete('/:id',           authenticateToken, requireAdmin, TesoreroController.delete);
router.patch('/:id/activate',   authenticateToken, requireAdmin, TesoreroController.activate);
router.patch('/:id/deactivate', authenticateToken, requireAdmin, TesoreroController.deactivate);

/** -------------------- Tesorero (token actual) -------------------- */
router.get('/me',               authenticateToken, requireTesorero, TesoreroController.getMyData);
router.get('/me/curso',         authenticateToken, requireTesorero, TesoreroController.getMiCurso);

// Dashboard del tesorero (deriva curso desde el token/persona_roles)
router.get('/me/dashboard/kpis',               authenticateToken, requireTesorero, TesoreroController.getKpisMe);
router.get('/me/dashboard/cobros-pendientes',  authenticateToken, requireTesorero, TesoreroController.getCobrosPendientesMe);

/** -------------------- Consultas / verificaciones -------------------- */
router.get('/usuario/:usuarioId',                          authenticateToken, requireAdminOrTesorero, TesoreroController.getByUsuario);
router.get('/curso/:cursoId',                              authenticateToken, requireAdminOrTesorero, requireTesoreroCourseAccess, TesoreroController.getByCurso);
router.get('/curso/:cursoId/kpis',                         authenticateToken, requireAdminOrTesorero, requireTesoreroCourseAccess, TesoreroController.getKpisByCurso);
router.get('/curso/:cursoId/cobros-pendientes',            authenticateToken, requireAdminOrTesorero, requireTesoreroCourseAccess, TesoreroController.getCobrosPendientesByCurso);
router.get('/check/is-tesorero/:rut',                      authenticateToken, requireAdminOrTesorero, TesoreroController.checkIsTesorero);
router.get('/check/course-access/:usuarioId/:cursoId',     authenticateToken, requireAdminOrTesorero, TesoreroController.checkCourseAccess);
router.get('/:rut/curso',                                  authenticateToken, requireAdminOrTesorero, TesoreroController.getCursoAsignadoByRut);

/** -------------------- Detalle por ID -------------------- */
router.get('/:id', authenticateToken, requireAdminOrTesorero, TesoreroController.getById);
router.get('/me/alumnos/:alumnoId/resumen',
  authenticateToken, requireTesorero, TesoreroController.getAlumnoResumenMe);

router.get('/me/alumnos/:alumnoId/cobros-pendientes',
  authenticateToken, requireTesorero, TesoreroController.getAlumnoCobrosPendientesMe);

module.exports = router;
