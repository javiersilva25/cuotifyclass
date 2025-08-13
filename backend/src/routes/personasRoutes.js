const router = require('express').Router();
const { sequelize } = require('../models');

router.get('/buscar', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const offset = (page - 1) * limit;
    const q = (req.query.search || '').trim();

    const where = q ? `
      WHERE p.rut LIKE :q OR p.rut_formateado LIKE :q
         OR p.nombres LIKE :q OR p.apellido_paterno LIKE :q
         OR p.apellido_materno LIKE :q OR p.email LIKE :q
    ` : '';

    const [[{ total }]] = await sequelize.query(
      `SELECT COUNT(*) total FROM personas p ${where}`,
      { replacements: q ? { q: `%${q}%` } : {} }
    );

    const [rows] = await sequelize.query(`
      SELECT p.rut,
             CONCAT(p.nombres,' ',p.apellido_paterno,' ',COALESCE(p.apellido_materno,'')) AS nombre_completo,
             p.email, p.activo,
             GROUP_CONCAT(DISTINCT r.nombre_rol ORDER BY r.nombre_rol SEPARATOR ', ') AS roles
      FROM personas p
      LEFT JOIN persona_roles pr ON pr.rut = p.rut AND (pr.activo = 1 OR pr.activo IS NULL)
      LEFT JOIN roles r ON r.id = pr.rol_id
      ${where}
      GROUP BY p.rut, p.nombres, p.apellido_paterno, p.apellido_materno, p.email, p.activo
      ORDER BY p.created_at DESC, p.rut ASC
      LIMIT :limit OFFSET :offset
    `, { replacements: { ...(q ? { q: `%${q}%` } : {}), limit, offset } });

    res.json({ success: true, data: { items: rows, total, page, pages: Math.ceil(total/limit) } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error cargando datos' });
  }
});

// Actualizar persona por RUT
// routes/personas.js  (añade/ajusta esta ruta)
router.put('/:rut', async (req, res) => {
  try {
    const { rut } = req.params;
    const {
      nombres = '',
      apellidoPaterno = null,
      apellidoMaterno = null,
      email = '',
      activo = 1,   // 1/0
    } = req.body || {};

    const [result] = await sequelize.query(
      `
      UPDATE personas
      SET
        nombres          = :nombres,
        apellido_paterno = :ap,
        apellido_materno = :am,
        email            = :email,
        activo           = :activo,
        updated_at       = NOW()
      WHERE REPLACE(REPLACE(REPLACE(rut,'.',''),'-',''),' ','') =
            REPLACE(REPLACE(REPLACE(:rut,'.',''),'-',''),' ','')
      `,
      {
        replacements: {
          nombres,
          ap: apellidoPaterno || null,
          am: apellidoMaterno || null,
          email,
          activo: activo ? 1 : 0,
          rut
        }
      }
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Persona no encontrada' });
    }

    return res.json({ success: true, message: 'Actualizado' });
  } catch (e) {
    console.error('PUT /api/personas/:rut error:', e.sqlMessage || e.message);
    return res.status(500).json({ success: false, message: 'Error actualizando persona' });
  }
});



module.exports = router;
