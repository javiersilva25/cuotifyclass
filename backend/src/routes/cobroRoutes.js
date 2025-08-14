const express = require('express');
const CobrosController = require('../controllers/cobroController');
// const { authGuard } = require('../middleware/auth'); // si usas auth

const router = express.Router();

// router.use(authGuard);

router.post('/', CobrosController.create);
router.get('/', CobrosController.getAll);
router.get('/:id', CobrosController.getById);
router.put('/:id', CobrosController.update);
router.delete('/:id', CobrosController.delete);

module.exports = router;
