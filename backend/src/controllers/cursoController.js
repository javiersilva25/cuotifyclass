// controllers/cursoController.js
const { sequelize } = require('../config/database');

const toInt = v => (v == null || v === '' ? null : parseInt(v, 10) || null);
const clean = s => (s ? String(s).trim().toUpperCase().replace(/[.\-\s]/g, '') : '');

function calcDV(body) {
  let s = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--) { s += Number(body[i]) * m; m = m === 7 ? 2 : m + 1; }
  const r = 11 - (s % 11);
  return r === 11 ? '0' : r === 10 ? 'K' : String(r);
}

async function resolveProfesorRut(input) {
  const c = clean(input);
  if (!c) return null;

  const [[r1]] = await sequelize.query(`
    SELECT p.rut AS rut
    FROM personas p
    WHERE REPLACE(REPLACE(REPLACE(UPPER(p.rut),'.',''),'-',''),' ','') = :rut
    LIMIT 1
  `, { replacements: { rut: c } });
  if (r1?.rut) return String(r1.rut);

  if (/^\d+$/.test(c)) {
    const rutFull = c + calcDV(c);
    const [[r2]] = await sequelize.query(`
      SELECT p.rut AS rut
      FROM personas p
      WHERE REPLACE(REPLACE(REPLACE(UPPER(p.rut),'.',''),'-',''),' ','') = :rut
      LIMIT 1
    `, { replacements: { rut: rutFull } });
    return String(r2?.rut || rutFull);
  }
  return c;
}

const mapRow = r => ({
  id: r.id,
  nombre_curso: r.nombre_curso,
  nivel_id: r.nivel_id,
  nivel_nombre: r.nivel_nombre ?? null,
  ano_escolar: r.ano_escolar,
  profesor_id: r.profesor_id ?? null,          // RUT
  profesor_nombre: r.profesor_nombre ?? null,
  activo: r.activo,                             // alias calculado (1/0)
});

class CursoController {
  // GET /api/cursos
  static async list(_req, res) {
    try {
      const [rows] = await sequelize.query(`
        SELECT
          c.id, c.nombre_curso, c.nivel_id, n.nombre_nivel AS nivel_nombre,
          c.ano_escolar, c.profesor_id,
          CONCAT_WS(' ', p.nombres, p.apellido_paterno, p.apellido_materno) AS profesor_nombre,
          CASE WHEN c.eliminado_por IS NULL AND c.fecha_eliminacion IS NULL THEN 1 ELSE 0 END AS activo
        FROM cursos c
        LEFT JOIN niveles  n ON n.id = c.nivel_id
        LEFT JOIN personas p
          ON REPLACE(REPLACE(REPLACE(UPPER(p.rut),'.',''),'-',''),' ','')
           = REPLACE(REPLACE(REPLACE(UPPER(c.profesor_id),'.',''),'-',''),' ','')
        WHERE c.eliminado_por IS NULL AND c.fecha_eliminacion IS NULL
        ORDER BY c.ano_escolar DESC, c.nombre_curso ASC
      `);
      return res.json({ success: true, data: rows.map(mapRow) });
    } catch (e) {
      console.error('list cursos:', e.message);
      return res.status(500).json({ success: false, message: 'Error listando cursos' });
    }
  }

  // GET /api/cursos/:id
  static async get(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await sequelize.query(`
        SELECT c.id, c.nombre_curso, c.nivel_id, c.ano_escolar, c.profesor_id,
               CASE WHEN c.eliminado_por IS NULL AND c.fecha_eliminacion IS NULL THEN 1 ELSE 0 END AS activo
        FROM cursos c
        WHERE c.id = :id
        LIMIT 1
      `, { replacements: { id } });
      if (!rows.length) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      return res.json({ success: true, data: rows[0] });
    } catch (e) {
      console.error('get curso:', e.message);
      return res.status(500).json({ success: false, message: 'Error obteniendo curso' });
    }
  }

  // POST /api/cursos
  static async create(req, res) {
    try {
      const { nombre_curso, nivel_id, ano_escolar, profesor_id, profesor_rut } = req.body || {};
      if (!nombre_curso?.trim() || isNaN(+nivel_id) || isNaN(+ano_escolar)) {
        return res.status(400).json({ success: false, message: 'nombre_curso, nivel_id y ano_escolar son obligatorios' });
      }

      const profRut = (profesor_id || profesor_rut) ? await resolveProfesorRut(profesor_id ?? profesor_rut) : null;
      const actor = req.user?.rut ?? req.user?.id ?? 'system';

      const [result] = await sequelize.query(`
        INSERT INTO cursos
          (nombre_curso, nivel_id, ano_escolar, profesor_id, creado_por, fecha_creacion)
        VALUES
          (:nc, :niv, :ano, :prof, :actor, NOW())
      `, {
        replacements: {
          nc: nombre_curso.trim(),
          niv: parseInt(nivel_id, 10),
          ano: parseInt(ano_escolar, 10),
          prof: profRut,
          actor
        }
      });

      const newId = result?.insertId;
      const [rows] = await sequelize.query(`
        SELECT id, nombre_curso, nivel_id, ano_escolar, profesor_id,
               1 AS activo
        FROM cursos WHERE id = :id LIMIT 1
      `, { replacements: { id: newId } });

      return res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
      console.error('create curso:', e?.sqlMessage || e?.message);
      return res.status(500).json({ success: false, message: 'Error creando curso' });
    }
  }

  // PUT /api/cursos/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre_curso, nivel_id, ano_escolar, profesor_id, profesor_rut } = req.body || {};

      let setProfesor = '', profRut = null;
      if ('profesor_id' in req.body || 'profesor_rut' in req.body) {
        profRut = await resolveProfesorRut(profesor_id ?? profesor_rut);
        setProfesor = `, profesor_id = :prof`;
      }
      const actor = req.user?.rut ?? req.user?.id ?? 'system';

      await sequelize.query(`
        UPDATE cursos
           SET nombre_curso = COALESCE(:nc,  nombre_curso),
               nivel_id     = COALESCE(:niv, nivel_id),
               ano_escolar  = COALESCE(:ano, ano_escolar)
               ${setProfesor},
               actualizado_por = :actor,
               fecha_actualizacion = NOW()
         WHERE id = :id
      `, {
        replacements: {
          id,
          nc: nombre_curso?.trim() ?? null,
          niv: nivel_id != null ? toInt(nivel_id) : null,
          ano: ano_escolar != null ? toInt(ano_escolar) : null,
          prof: profRut,
          actor
        }
      });

      const [rows] = await sequelize.query(`
        SELECT id, nombre_curso, nivel_id, ano_escolar, profesor_id,
               CASE WHEN eliminado_por IS NULL AND fecha_eliminacion IS NULL THEN 1 ELSE 0 END AS activo
        FROM cursos WHERE id = :id LIMIT 1
      `, { replacements: { id } });

      if (!rows.length) return res.status(404).json({ success: false, message: 'Curso no encontrado' });
      return res.json({ success: true, data: rows[0] });
    } catch (e) {
      console.error('update curso:', e.message);
      return res.status(500).json({ success: false, message: 'Error actualizando curso' });
    }
  }

  // DELETE (soft) /api/cursos/:id
  static async remove(req, res) {
    try {
      const { id } = req.params;
      const actor = req.user?.rut ?? req.user?.id ?? 'system';
      await sequelize.query(`
        UPDATE cursos
           SET eliminado_por = :actor,
               fecha_eliminacion = NOW()
         WHERE id = :id
      `, { replacements: { id, actor } });
      return res.json({ success: true, message: 'Eliminado' });
    } catch (e) {
      console.error('delete curso:', e.message);
      return res.status(500).json({ success: false, message: 'Error eliminando curso' });
    }
  }

  // RESTORE /api/cursos/:id/restore
  static async restore(req, res) {
    try {
      const { id } = req.params;
      await sequelize.query(`
        UPDATE cursos
           SET eliminado_por = NULL,
               fecha_eliminacion = NULL
         WHERE id = :id
      `, { replacements: { id } });
      return res.json({ success: true, message: 'Restaurado' });
    } catch (e) {
      console.error('restore curso:', e.message);
      return res.status(500).json({ success: false, message: 'Error restaurando curso' });
    }
  }

  static async assignTesorero(req, res) {
    const trx = await sequelize.transaction();
    try {
      const cursoId = parseInt(req.params.id, 10);
      const raw = req.body?.tesorero_rut ?? req.body?.tesorero_id;
      if (!cursoId || !raw) {
        return ResponseHelper.validationError(res, [
          { field: 'cursoId/tesorero_rut', message: 'cursoId y tesorero_rut son requeridos' },
        ]);
      }

      // Normaliza RUT
      const rutClean = String(raw).replace(/[.\-\s]/g, '');

      // 1) Persona por RUT
      const [pers] = await sequelize.query(
        `
        SELECT p.rut
          FROM personas p
         WHERE REPLACE(REPLACE(REPLACE(p.rut,'.',''),'-',''),' ','') = :rut
         LIMIT 1
        `,
        { replacements: { rut: rutClean }, transaction: trx }
      );
      if (!pers?.length) {
        await trx.rollback();
        return ResponseHelper.notFound(res, 'Persona (RUT no existe en personas)');
      }
      const tesoreroRut = pers[0].rut; // guardamos el RUT tal cual está en la tabla

      // 2) Actualiza curso
      await sequelize.query(
        `UPDATE cursos SET tesorero_id = :rut WHERE id = :cursoId`,
        { replacements: { rut: tesoreroRut, cursoId }, transaction: trx }
      );

      // 3) Asegura rol TESORERO
      const [[rol]] = await sequelize.query(
        `SELECT id FROM roles WHERE UPPER(TRIM(nombre_rol))='TESORERO' LIMIT 1`,
        { transaction: trx }
      );
      if (rol?.id) {
        // persona_roles exige fecha_inicio -> la incluimos
        await sequelize.query(
          `
          INSERT INTO persona_roles (rut_persona, rol_id, curso_id, fecha_inicio, activo, created_at)
          SELECT :rut, :rolId, :cursoId, NOW(), 1, NOW()
            FROM DUAL
           WHERE NOT EXISTS (
                 SELECT 1
                   FROM persona_roles pr
                  WHERE (pr.rut_persona = :rut OR pr.rut = :rut)
                    AND pr.rol_id = :rolId
                    AND (pr.curso_id = :cursoId OR pr.curso_id IS NULL)
                )
          `,
          { replacements: { rut: tesoreroRut, rolId: rol.id, cursoId }, transaction: trx }
        );
      }

      await trx.commit();
      Logger.info('Tesorero asignado al curso', { cursoId, tesoreroRut });
      return ResponseHelper.success(res, { cursoId, tesorero_rut: tesoreroRut }, 'Tesorero asignado');
    } catch (err) {
      await trx.rollback();
      Logger.error('Error asignando tesorero', { error: err.message, stack: err.stack });
      return ResponseHelper.error(res, 'Error interno al asignar tesorero');
    }
  }
}


module.exports = CursoController;
