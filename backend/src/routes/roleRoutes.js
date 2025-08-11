const router = require('express').Router();
const { sequelize } = require('../models');

router.get('/', async (_req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT id, nombre_rol FROM roles ORDER BY id');
    res.json({ success: true, data: { items: rows } });
  } catch {
    res.status(500).json({ success: false, message: 'Error cargando roles' });
  }
});

module.exports = router;
