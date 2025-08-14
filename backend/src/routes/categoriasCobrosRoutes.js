const express = require('express');
const CategoriaCobroController = require('../controllers/categoriaCobroController');

const router = express.Router();
router.get('/', CategoriaCobroController.getAll);

module.exports = router;
