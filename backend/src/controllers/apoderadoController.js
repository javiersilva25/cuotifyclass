// src/controllers/apoderadoController.js
const { sequelize } = require('../config/database');

class ApoderadoController {
  // Listado simple para selects: usa RUT como id
  static async listActivos(_req, res) {
    try {
      const [rows] = await sequelize.query(`
        SELECT 
          p.rut  AS id,              -- usamos RUT como id
          p.rut,
          CONCAT_WS(' ', p.nombres, p.apellido_paterno, p.apellido_materno) AS nombre_completo
        FROM persona_roles pr
        JOIN personas p ON p.rut = pr.rut_persona
        JOIN roles r    ON r.id = pr.rol_id
        WHERE pr.activo = 1
          AND UPPER(r.nombre_rol) = 'APODERADO'
        ORDER BY p.nombres, p.apellido_paterno, p.apellido_materno
      `);

      return res.json({ success: true, data: rows });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Error obteniendo apoderados' });
    }
  }
}

module.exports = ApoderadoController;
