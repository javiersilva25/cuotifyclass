// controllers/nivelesController.js
const { sequelize } = require('../config/database');

class NivelesController {
  // Lista para selects: solo activos
  static async listActivos(_req, res) {
    try {
      const [rows] = await sequelize.query(`
        SELECT id, nombre_nivel, orden
        FROM niveles
        WHERE activo = 1
        ORDER BY orden ASC, nombre_nivel ASC
      `);
      return res.json({ success: true, data: rows });
    } catch (e) {
      console.error('Error listActivos niveles:', e?.message);
      return res.status(500).json({ success: false, message: 'Error obteniendo niveles' });
    }
  }

  // (Opcional) detalle por id
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await sequelize.query(
        `SELECT id, nombre_nivel, orden, activo, created_at, updated_at
         FROM niveles WHERE id = :id LIMIT 1`,
        { replacements: { id } }
      );
      if (!rows?.length) return res.status(404).json({ success: false, message: 'Nivel no encontrado' });
      return res.json({ success: true, data: rows[0] });
    } catch (e) {
      console.error('Error getById nivel:', e?.message);
      return res.status(500).json({ success: false, message: 'Error obteniendo nivel' });
    }
  }
}

module.exports = NivelesController;
