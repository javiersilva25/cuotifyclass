// routes/cobros.js
const express = require('express');
const CobroController = require('../controllers/cobroController');
// const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/** Normaliza ?params={} y alias camel->snake en query */
router.use((req, _res, next) => {
  const q = req.query || {};
  if (typeof q.params === 'string') {
    try { Object.assign(q, JSON.parse(q.params)); } catch {}
  }
  if (q.cursoId && !q.curso_id) q.curso_id = q.cursoId;
  if (q.fechaDesde && !q.fecha_desde) q.fecha_desde = q.fechaDesde;
  if (q.fechaHasta && !q.fecha_hasta) q.fecha_hasta = q.fechaHasta;
  req.query = q;
  next();
});

/** Tipado básico de params numéricos */
router.param('id', (req, _res, next, v) => { req.params.id = parseInt(v, 10); return next(); });
router.param('cursoId', (req, _res, next, v) => { req.params.cursoId = parseInt(v, 10); return next(); });

/* ------ Listado / consultas ------ */
router.get('/', CobroController.getAll);
router.get('/vencidos', CobroController.getVencidos);
router.get('/proximos-vencer', CobroController.getProximosAVencer);
router.get('/date-range', CobroController.getByDateRange);
router.get('/stats', CobroController.getEstadisticas);

/* ------ Por curso / métricas ------ */
router.get('/curso/:cursoId', CobroController.getByCurso);
router.get('/curso/:cursoId/total', CobroController.getTotalByCurso);

/* ------ CRUD ------ */
// router.use(authenticateToken); // opcional
router.post('/', CobroController.create);
router.put('/:id', CobroController.update);
router.delete('/:id', CobroController.delete);
router.patch('/:id/restore', CobroController.restore);

/* ------ Detalle ------ */
router.get('/:id', CobroController.getById);

module.exports = router;
