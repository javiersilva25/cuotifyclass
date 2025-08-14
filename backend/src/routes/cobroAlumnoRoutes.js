const express = require('express');
const CobroAlumnoController = require('../controllers/cobroAlumnoController');
// const { authGuard } = require('../middleware/auth');

const router = express.Router();

// router.use(authGuard);

router.post('/', CobroAlumnoController.create);
router.get('/', CobroAlumnoController.getAll);
router.get('/:id', CobroAlumnoController.getById);
router.put('/:id', CobroAlumnoController.update);
router.patch('/:id/pagar', CobroAlumnoController.pagar);
router.delete('/:id', CobroAlumnoController.delete);

module.exports = router;
