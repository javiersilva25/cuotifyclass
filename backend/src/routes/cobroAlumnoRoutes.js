// routes/cobrosAlumnos.js
const express = require('express');
const CobroAlumnoController = require('../controllers/cobroAlumnoController');
// const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/* --- Normalización de query (?params=JSON, alias camel->snake) --- */
router.use((req, _res, next) => {
  const q = req.query || {};
  if (typeof q.params === 'string') { try { Object.assign(q, JSON.parse(q.params)); } catch {} }
  if (q.cursoId && !q.curso_id) q.curso_id = q.cursoId;
  if (q.alumnoId && !q.alumno_id) q.alumno_id = q.alumnoId;
  req.query = q;
  next();
});

/* --- Tipado básico de params numéricos --- */
router.param('id',       (req, _res, next, v) => { req.params.id = parseInt(v, 10); return next(); });
router.param('cursoId',  (req, _res, next, v) => { req.params.cursoId = parseInt(v, 10); return next(); });
router.param('alumnoId', (req, _res, next, v) => { req.params.alumnoId = parseInt(v, 10); return next(); });
router.param('cobroId',  (req, _res, next, v) => { req.params.cobroId = parseInt(v, 10); return next(); });

/* ------ Listado / consultas ------ */
router.get('/', CobroAlumnoController.getAll);
router.get('/pendientes', CobroAlumnoController.getPendientes);
router.get('/search', CobroAlumnoController.searchByConcepto);
router.get('/grouped-by-curso', CobroAlumnoController.getGroupedByCurso);
router.get('/stats', CobroAlumnoController.getEstadisticas);

/* ------ Por curso / alumno / padre ------ */
router.get('/curso/:cursoId', CobroAlumnoController.getByCurso);
router.get('/curso/:cursoId/total', CobroAlumnoController.getTotalByCurso);
router.get('/alumno/:alumnoId', CobroAlumnoController.getByAlumno);
router.get('/parent/:cobroId', CobroAlumnoController.getByParent);

/* ------ Bulk por curso ------ */
router.post('/curso/:cursoId/bulk', CobroAlumnoController.createBulk);

/* ------ CRUD / acciones ------ */
// router.use(authenticateToken); // opcional
router.post('/', CobroAlumnoController.create);
router.put('/:id', CobroAlumnoController.update);
router.delete('/:id', CobroAlumnoController.delete);
router.patch('/:id/restore', CobroAlumnoController.restore);

/* Pagos / estado */
router.patch('/:id/pagar', CobroAlumnoController.registrarPago);
router.patch('/:id/revertir-pago', CobroAlumnoController.revertirPago);
router.patch('/:id/anular', CobroAlumnoController.anular);
router.patch('/:id/reasignar-alumno', CobroAlumnoController.reasignarAlumno);

/* ------ Detalle ------ */
router.get('/:id', CobroAlumnoController.getById);

module.exports = router;
