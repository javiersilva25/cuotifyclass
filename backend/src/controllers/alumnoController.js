const { sequelize } = require('../config/database');

// Helpers de normalización de RUT
const cleanAll = (s = '') => String(s).replace(/[.\-\s]/g, '').toUpperCase();
const onlyDigits = (s = '') => cleanAll(s).replace(/[^0-9]/g, '');

// --- CRUD BÁSICO + endpoints que tus vistas usan ---
class AlumnoController {
  // Crear alumno (versión simple)
  static async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        rut,                  // requerido para crear: RUT de la persona
        nombre_completo = null,
        fecha_nacimiento = null,
        curso_id = null,
        apoderado_id = null,  // RUT (con o sin DV) del apoderado
        usuario_id = null,
      } = req.body || {};

      if (!rut) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'rut es requerido' });
      }

      const rutClean = cleanAll(rut);

      // 1) Crear/alinear rol ALUMNO a la persona del RUT si corresponde
      // (esto es opcional; si tu flujo no necesita tocar persona_roles, puedes omitir)
      // Asegura que exista rol 'ALUMNO'
      const [[rolRow]] = await sequelize.query(
        `SELECT id FROM roles WHERE UPPER(TRIM(nombre_rol))='ALUMNO' LIMIT 1`,
        { transaction: t }
      );
      if (rolRow?.id) {
        // Inserta relación solo si no existe (incluye fecha_inicio para tu esquema)
        await sequelize.query(
          `
          INSERT INTO persona_roles (rut_persona, rol_id, activo, fecha_inicio, created_at)
          SELECT :rut, :rol, 1, NOW(), NOW()
            FROM DUAL
           WHERE NOT EXISTS (
                 SELECT 1
                   FROM persona_roles pr
                  WHERE (pr.rut_persona = :rut OR pr.rut = :rut)
                    AND pr.rol_id = :rol
           )
          `,
          { replacements: { rut: rutClean, rol: rolRow.id }, transaction: t }
        );
      }

      // 2) Asegura nombre desde personas si no vino
      let nombre = nombre_completo;
      if (!nombre) {
        const [pRows] = await sequelize.query(
          `
          SELECT CONCAT_WS(' ', p.nombres, p.apellido_paterno, p.apellido_materno) AS nombre
            FROM personas p
           WHERE REPLACE(REPLACE(REPLACE(p.rut,'.',''),'-',''),' ','') = :rut
           LIMIT 1
          `,
          { replacements: { rut: rutClean }, transaction: t }
        );
        nombre = pRows?.[0]?.nombre || null;
      }

      // 3) Insert alumno
      const [result] = await sequelize.query(
        `
        INSERT INTO alumnos (nombre_completo, fecha_nacimiento, curso_id, apoderado_id, usuario_id, fecha_creacion)
        VALUES (:nombre, :fecha_nacimiento, :curso_id, :apoderado_id, :usuario_id, NOW())
        `,
        {
          replacements: {
            nombre,
            fecha_nacimiento: fecha_nacimiento || null,
            curso_id: curso_id ?? null,
            apoderado_id: apoderado_id ? cleanAll(apoderado_id) : null, // guarda RUT limpio del apoderado
            usuario_id: usuario_id ?? null,
          },
          transaction: t
        }
      );

      const insertId = result?.insertId;
      await t.commit();
      return res.status(201).json({ success: true, data: { id: insertId } });
    } catch (err) {
      await t.rollback();
      console.error('alumnos.create:', err);
      return res.status(500).json({ success: false, message: 'Error creando alumno' });
    }
  }

  // Listado paginado simple
  static async getAll(req, res) {
    try {
      const page  = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
      const offset = (page - 1) * limit;
      const q = (req.query.search || '').trim();

      const where = q
        ? `WHERE a.nombre_completo LIKE :q OR CAST(a.usuario_id AS CHAR) LIKE :q`
        : '';

      const [[{ total }]] = await sequelize.query(
        `SELECT COUNT(*) total FROM alumnos a ${where}`,
        { replacements: q ? { q: `%${q}%` } : {} }
      );

      const [rows] = await sequelize.query(
        `
        SELECT a.id, a.nombre_completo, a.fecha_nacimiento, a.curso_id, a.apoderado_id, a.usuario_id,
               a.fecha_creacion, a.fecha_actualizacion,
               c.nombre_curso, c.ano_escolar, n.id AS nivel_id, n.nombre_nivel
          FROM alumnos a
          LEFT JOIN cursos  c ON c.id = a.curso_id
          LEFT JOIN niveles n ON n.id = c.nivel_id
          ${where}
         ORDER BY a.nombre_completo ASC
         LIMIT :limit OFFSET :offset
        `,
        { replacements: { ...(q ? { q: `%${q}%` } : {}), limit, offset } }
      );

      return res.json({
        success: true,
        data: {
          items: rows,
          page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (err) {
      console.error('alumnos.getAll:', err);
      return res.status(500).json({ success: false, message: 'Error listando alumnos' });
    }
  }

  // Detalle
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await sequelize.query(
        `
        SELECT a.id, a.nombre_completo, a.fecha_nacimiento, a.curso_id, a.apoderado_id, a.usuario_id,
               c.nombre_curso, c.ano_escolar, n.id AS nivel_id, n.nombre_nivel
          FROM alumnos a
          LEFT JOIN cursos  c ON c.id = a.curso_id
          LEFT JOIN niveles n ON n.id = c.nivel_id
         WHERE a.id = :id
         LIMIT 1
        `,
        { replacements: { id } }
      );
      if (!rows?.length) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      return res.json({ success: true, data: rows[0] });
    } catch (err) {
      console.error('alumnos.getById:', err);
      return res.status(500).json({ success: false, message: 'Error obteniendo alumno' });
    }
  }

  // Actualizar
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre_completo = null,
        fecha_nacimiento = null,
        curso_id = null,
        apoderado_id = null,
        usuario_id = null,
      } = req.body || {};

      const [result] = await sequelize.query(
        `
        UPDATE alumnos
           SET nombre_completo  = :nombre,
               fecha_nacimiento = :fecha_nacimiento,
               curso_id         = :curso_id,
               apoderado_id     = :apoderado_id,
               usuario_id       = :usuario_id,
               fecha_actualizacion = NOW()
         WHERE id = :id
        `,
        {
          replacements: {
            id,
            nombre: nombre_completo,
            fecha_nacimiento,
            curso_id,
            apoderado_id: apoderado_id ? cleanAll(apoderado_id) : null,
            usuario_id
          }
        }
      );

      if (!result?.affectedRows) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      return res.json({ success: true, message: 'Alumno actualizado' });
    } catch (err) {
      console.error('alumnos.update:', err);
      return res.status(500).json({ success: false, message: 'Error actualizando alumno' });
    }
  }

  // Eliminar (soft si tienes columnas; si no, hard delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const [result] = await sequelize.query(
        `DELETE FROM alumnos WHERE id = :id`,
        { replacements: { id } }
      );
      if (!result?.affectedRows) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
      }
      return res.json({ success: true, message: 'Alumno eliminado' });
    } catch (err) {
      console.error('alumnos.delete:', err);
      return res.status(500).json({ success: false, message: 'Error eliminando alumno' });
    }
  }

  // Restaurar (si usas soft delete; aquí devolvemos 501 para no romper rutas)
  static async restore(_req, res) {
    return res.status(501).json({ success: false, message: 'No implementado' });
  }

  // Buscar por nombre (simple)
  static async searchByName(req, res) {
    try {
      const { nombre = '' } = req.query;
      if (nombre.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'min 2 caracteres' });
      }
      const [rows] = await sequelize.query(
        `
        SELECT id, nombre_completo, curso_id
          FROM alumnos
         WHERE nombre_completo LIKE :q
         ORDER BY nombre_completo ASC
        `,
        { replacements: { q: `%${nombre.trim()}%` } }
      );
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error('alumnos.searchByName:', err);
      return res.status(500).json({ success: false, message: 'Error en búsqueda' });
    }
  }

  // Por curso (simple)
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const [rows] = await sequelize.query(
        `
        SELECT id, nombre_completo, curso_id
          FROM alumnos
         WHERE curso_id = :cursoId
         ORDER BY nombre_completo ASC
        `,
        { replacements: { cursoId } }
      );
      return res.json({ success: true, data: rows });
    } catch (err) {
      console.error('alumnos.getByCurso:', err);
      return res.status(500).json({ success: false, message: 'Error listando por curso' });
    }
  }

  // 👉 Por apoderado (RUT con o sin DV; NO usa tabla apoderados)
  static async getByApoderado(req, res) {
    try {
      const { rutOrId } = req.params;
      const cAll = cleanAll(rutOrId);
      const cNum = onlyDigits(rutOrId);

      const [rows] = await sequelize.query(
        `
        SELECT
          a.id,
          a.nombre_completo,
          a.fecha_nacimiento,
          a.curso_id,
          a.apoderado_id,
          a.usuario_id,
          c.nombre_curso,
          c.ano_escolar,
          n.id     AS nivel_id,
          n.nombre_nivel
        FROM alumnos a
        LEFT JOIN cursos  c ON c.id = a.curso_id
        LEFT JOIN niveles n ON n.id = c.nivel_id
        WHERE 
          REPLACE(REPLACE(REPLACE(UPPER(COALESCE(a.apoderado_id,'')),'.',''),'-',''),' ','') = :cAll
          OR
          REPLACE(REPLACE(REPLACE(REPLACE(UPPER(COALESCE(a.apoderado_id,'')),'.',''),'-',''),' ',''),'K','') = :cNum
        ORDER BY a.nombre_completo ASC
        `,
        { replacements: { cAll, cNum } }
      );

      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error('getByApoderado error:', error?.message);
      return res.status(500).json({ success: false, message: 'Error obteniendo alumnos del apoderado' });
    }
  }

  // Contar por curso (si alguna vista lo usa)
  static async countByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const [[{ total }]] = await sequelize.query(
        `SELECT COUNT(*) AS total FROM alumnos WHERE curso_id = :cursoId`,
        { replacements: { cursoId } }
      );
      return res.json({ success: true, data: { count: Number(total) } });
    } catch (err) {
      console.error('alumnos.countByCurso:', err);
      return res.status(500).json({ success: false, message: 'Error contando alumnos' });
    }
  }

  // Exists by usuarioId (stub útil para no romper)
  static async existsByUsuarioId(req, res) {
    try {
      const { usuarioId } = req.params;
      const [[{ total }]] = await sequelize.query(
        `SELECT COUNT(*) AS total FROM alumnos WHERE usuario_id = :usuarioId`,
        { replacements: { usuarioId } }
      );
      return res.json({ success: true, data: { exists: Number(total) > 0 } });
    } catch (err) {
      console.error('alumnos.existsByUsuarioId:', err);
      return res.status(500).json({ success: false, message: 'Error verificando existencia' });
    }
  }
}

module.exports = AlumnoController;
