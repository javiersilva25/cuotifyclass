// controllers/profesorController.js
const { sequelize } = require('../config/database');

class ProfesorController {
  // Lista simple de profesores activos para <select>
  static async listActivos(_req, res) {
    try {
      const [rows] = await sequelize.query(`
        SELECT DISTINCT
          p.rut AS id,
          p.rut,
          p.nombres,
          p.apellido_paterno,
          p.apellido_materno
        FROM persona_roles pr
        JOIN personas p
          ON REPLACE(REPLACE(REPLACE(p.rut, '.', ''), '-', ''), ' ', '') = CAST(pr.rut_persona AS CHAR)
        WHERE pr.activo = 1
          AND EXISTS (
            SELECT 1 FROM roles r
            WHERE r.id = pr.rol_id AND UPPER(TRIM(r.nombre_rol)) = 'PROFESOR'
          )
        ORDER BY
          COALESCE(p.nombres, '') ASC,
          COALESCE(p.apellido_paterno, '') ASC,
          COALESCE(p.apellido_materno, '') ASC
      `);

      const data = rows.map(p => ({
        id: p.rut,
        rut: p.rut,
        nombre_completo: [p.nombres, p.apellido_paterno, p.apellido_materno]
          .map(x => (x || '').trim())
          .filter(Boolean)
          .join(' '),
      }));

      return res.json({ success: true, data });
    } catch (e) {
      console.error('Error listActivos profesores:', e?.message);
      return res.status(500).json({ success: false, message: 'Error obteniendo profesores' });
    }
  }

  // Detalle por RUT (acepta con o sin puntos/guión)
  static async getById(req, res) {
    try {
      const { rut } = req.params;
      const [rows] = await sequelize.query(
        `
        SELECT p.rut, p.nombres, p.apellido_paterno, p.apellido_materno, p.email
        FROM personas p
        WHERE REPLACE(REPLACE(REPLACE(p.rut, '.', ''), '-', ''), ' ', '') =
              REPLACE(REPLACE(REPLACE(:rut, '.', ''), '-', ''), ' ', '')
        LIMIT 1
        `,
        { replacements: { rut } }
      );

      if (!rows?.length) {
        return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
      }

      const p = rows[0];
      return res.json({
        success: true,
        data: {
          id: p.rut,
          rut: p.rut,
          nombres: p.nombres,
          apellido_paterno: p.apellido_paterno,
          apellido_materno: p.apellido_materno,
          email: p.email,
          nombre_completo: [p.nombres, p.apellido_paterno, p.apellido_materno]
            .map(x => (x || '').trim())
            .filter(Boolean)
            .join(' '),
        },
      });
    } catch (e) {
      console.error('Error getById profesor:', e?.message);
      return res.status(500).json({ success: false, message: 'Error obteniendo profesor' });
    }
  }
}

module.exports = ProfesorController;
