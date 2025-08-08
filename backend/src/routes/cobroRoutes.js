const express = require('express');
const CobroController = require('../controllers/cobroController');

const router = express.Router();

// Rutas para cobros
router.post('/', CobroController.create);
router.get('/', CobroController.getAll);
router.get('/vencidos', CobroController.getVencidos);
router.get('/proximos-vencer', CobroController.getProximosAVencer);
router.get('/date-range', CobroController.getByDateRange);
router.get('/stats', CobroController.getEstadisticas);
router.get('/:id', CobroController.getById);
router.put('/:id', CobroController.update);
router.delete('/:id', CobroController.delete);
router.patch('/:id/restore', CobroController.restore);

// Rutas específicas
router.get('/curso/:cursoId', CobroController.getByCurso);
router.get('/curso/:cursoId/total', CobroController.getTotalByCurso);

module.exports = router;

