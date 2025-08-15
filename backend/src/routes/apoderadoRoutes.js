// src/routes/apoderadoRoutes.js
const express = require('express');
const router = express.Router();
const ApoderadoController = require('../controllers/apoderadoController');
const { authenticateToken } = require('../middleware/auth');

// Admin o Apoderado
const requireApoderadoOrAdmin = (req, res, next) => {
  const roles = Array.isArray(req.user?.roles)
    ? req.user.roles
    : (req.user?.role ? [req.user.role] : []);
  const ok = roles
    .map(r => String(r).toLowerCase())
    .some(r => ['admin', 'administrador', 'apoderado'].includes(r));
  return ok ? next() : res.status(403).json({ success: false, message: 'Acceso denegado' });
};

/** ---------- Listado simple (para selects) ---------- */
router.get('/', authenticateToken, requireApoderadoOrAdmin, ApoderadoController.listActivos);

/** ---------------- Portal de Apoderados (ME) ---------------- */
router.get('/me/hijos',              authenticateToken, requireApoderadoOrAdmin, ApoderadoController.getMisHijos);
router.get('/me/metricas',           authenticateToken, requireApoderadoOrAdmin, ApoderadoController.getMetricasRapidas);
router.get('/me/resumen',            authenticateToken, requireApoderadoOrAdmin, ApoderadoController.getResumenGeneral);
router.get('/me/deudas-pendientes',  authenticateToken, requireApoderadoOrAdmin, ApoderadoController.getDeudasPendientes);

/** --------------------- Por Alumno --------------------- */
router.get('/me/hijos/:alumnoId/resumen', authenticateToken, requireApoderadoOrAdmin, ApoderadoController.getResumenPorAlumno);
router.get('/me/hijos/:alumnoId/deudas',  authenticateToken, requireApoderadoOrAdmin, ApoderadoController.getDeudasPorAlumno);

module.exports = router;
