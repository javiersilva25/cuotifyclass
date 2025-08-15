// src/controllers/tesoreroController.js
const TesoreroService = require('../services/tesoreroService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, tesoreroValidator } = require('../utils/validators');
const Logger = require('../utils/logger');
const { sequelize } = require('../config/database');

const TESORERO_ROLE_ID = 2; // id del rol TESORERO en tu tabla roles

class TesoreroController {
  // ---- helpers internos ----
  static async _getCursoIdFromToken(req) {
    const rut = req.rut_persona || req.user?.rut || req.user?.id;
    if (!rut) return null;
    const [rows] = await sequelize.query(
      `
      SELECT pr.curso_id
      FROM persona_roles pr
      WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') =
            REPLACE(REPLACE(UPPER(:rut),          '.', ''), '-', '')
        AND pr.rol_id = :rolId
        AND pr.activo = 1
        AND pr.curso_id IS NOT NULL
      LIMIT 1
      `,
      { replacements: { rut, rolId: TESORERO_ROLE_ID } }
    );
    return rows?.[0]?.curso_id ?? null;
  }

  // ---- CRUD admin ----
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(tesoreroValidator, req.body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      const cursoDisponible = await TesoreroService.isCursoDisponible(data.curso_id);
      if (!cursoDisponible) return ResponseHelper.conflict(res, 'El curso ya tiene un tesorero asignado');

      const usuarioDisponible = await TesoreroService.isUsuarioDisponible(data.usuario_id);
      if (!usuarioDisponible) return ResponseHelper.conflict(res, 'El usuario ya es tesorero de otro curso');

      const userId = req.user?.id || 'system';
      const tesorero = await TesoreroService.create(data, userId);

      Logger.info('Tesorero creado exitosamente', {
        tesoreroId: tesorero.id, usuarioId: data.usuario_id, cursoId: data.curso_id, createdBy: userId
      });
      return ResponseHelper.created(res, tesorero, 'Tesorero asignado exitosamente');
    } catch (error) {
      Logger.error('Error al crear tesorero', { error: error.message, stack: error.stack });
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un tesorero para este curso o usuario');
      }
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
        activo: req.query.activo,
        curso_id: req.query.curso_id,
        usuario_id: req.query.usuario_id
      };
      const result = await TesoreroService.findAll(options);
      return ResponseHelper.paginated(res, result.tesoreros, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener tesoreros', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const tesorero = await TesoreroService.findById(id);
      if (!tesorero) return ResponseHelper.notFound(res, 'Tesorero');
      return res.status(200).json({ success: true, data: tesorero });
    } catch (error) {
      Logger.error('Error al obtener tesorero', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const tesorero = await TesoreroService.findByUsuario(usuarioId);
      if (!tesorero) return ResponseHelper.notFound(res, 'Tesorero para este usuario');
      return res.status(200).json({ success: true, data: tesorero });
    } catch (error) {
      Logger.error('Error al obtener tesorero por usuario', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const tesorero = await TesoreroService.findByCurso(cursoId);
      if (!tesorero) return ResponseHelper.notFound(res, 'Tesorero para este curso');
      return res.status(200).json({ success: true, data: tesorero });
    } catch (error) {
      Logger.error('Error al obtener tesorero por curso', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  // ---- Consultas por RUT en persona_roles ----
  static async checkIsTesorero(req, res) {
    try {
      const rut = req.params.rut;
      const [rows] = await sequelize.query(
        `
        SELECT 1
          FROM persona_roles pr
         WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') =
               REPLACE(REPLACE(UPPER(:rut),          '.', ''), '-', '')
           AND pr.rol_id = :rolId
           AND pr.activo = 1
           AND pr.curso_id IS NOT NULL
         LIMIT 1
        `,
        { replacements: { rut, rolId: TESORERO_ROLE_ID } }
      );
      return res.status(200).json({ success: true, data: { rut_persona: rut, es_tesorero: !!rows?.[0] } });
    } catch (error) {
      Logger.error('checkIsTesorero error', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async checkCourseAccess(req, res) {
    try {
      const { usuarioId, cursoId } = req.params;
      const canAccess = await TesoreroService.canAccessCourse(usuarioId, cursoId);
      return res.status(200).json({ success: true, data: { usuario_id: usuarioId, curso_id: cursoId, puede_acceder: canAccess } });
    } catch (error) {
      Logger.error('Error al verificar acceso a curso', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  // GET /api/tesoreros/usuario/:rut/curso-asignado
  static async getCursoAsignado(req, res) {
    try {
      const rut = req.params.rut;
      const [rows] = await sequelize.query(
        `
        SELECT
          pr.curso_id,
          c.id           AS curso_id,
          c.nombre_curso AS curso_nombre_curso,
          c.nivel_id     AS curso_nivel_id,
          c.ano_escolar  AS curso_ano_escolar
        FROM persona_roles pr
        JOIN cursos c ON c.id = pr.curso_id
        WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') =
              REPLACE(REPLACE(UPPER(:rut),          '.', ''), '-', '')
          AND pr.rol_id = :rolId
          AND pr.activo = 1
          AND pr.curso_id IS NOT NULL
        LIMIT 1
        `,
        { replacements: { rut, rolId: TESORERO_ROLE_ID } }
      );

      const r = rows?.[0];
      if (!r) return ResponseHelper.notFound(res, 'Curso asignado para este usuario');

      return res.status(200).json({
        success: true,
        data: {
          rut_persona: rut,
          curso_id: r.curso_id,
          curso: {
            id: r.curso_id,
            nombre_curso: r.curso_nombre_curso,
            nivel_id: r.curso_nivel_id,
            ano_escolar: r.curso_ano_escolar,
          },
        }
      });
    } catch (error) {
      Logger.error('getCursoAsignado error', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  // GET /api/tesoreros/me  (alias /me/curso)
  static async getMyData(req, res) {
    try {
      const rut = req.rut_persona || req.user?.rut || req.user?.id;
      Logger.debug('[TESOREROS:ME] decoded user =>', req.user);
      Logger.debug('[TESOREROS:ME] rut usado    =>', rut);
      if (!rut) return ResponseHelper.unauthorized(res, 'Token inválido');

      const [rows] = await sequelize.query(
        `
        SELECT
          pr.rut_persona,
          pr.curso_id,
          pr.fecha_inicio                                      AS fecha_asignacion,
          p.rut                                                AS persona_rut,
          p.nombres                                            AS persona_nombres,
          p.apellido_paterno                                   AS persona_apellidos,
          c.id                                                 AS curso_id,
          c.nombre_curso                                       AS curso_nombre_curso,
          c.nivel_id                                           AS curso_nivel_id,
          c.ano_escolar                                        AS curso_ano_escolar
        FROM persona_roles pr
        JOIN cursos c         ON c.id = pr.curso_id
        LEFT JOIN personas p  ON p.rut = pr.rut_persona
        WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') =
              REPLACE(REPLACE(UPPER(:rut),          '.', ''), '-', '')
          AND pr.rol_id = :rolId
          AND pr.activo = 1
          AND pr.curso_id IS NOT NULL
        LIMIT 1
        `,
        { replacements: { rut, rolId: TESORERO_ROLE_ID } }
      );

      const r = rows?.[0];
      if (!r) return res.status(404).json({ success: false, message: 'No está asignado como tesorero de ningún curso' });

      return res.status(200).json({
        success: true,
        message: 'Tesorer@ actual',
        data: {
          rut_persona: r.rut_persona,
          fecha_asignacion: r.fecha_asignacion || null,
          curso: {
            id: r.curso_id,
            nombre_curso: r.curso_nombre_curso,
            nivel_id: r.curso_nivel_id,
            ano_escolar: r.curso_ano_escolar,
          },
          usuario: r.persona_rut ? {
            rut: r.persona_rut,
            nombres: r.persona_nombres,
            apellidos: r.persona_apellidos,
          } : null,
          persona: r.persona_rut ? {
            rut: r.persona_rut,
            nombres: r.persona_nombres,
            apellidos: r.persona_apellidos,
          } : null,
        }
      });
    } catch (error) {
      Logger.error('getMyData error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: 'Error al obtener datos', error: error?.message });
    }
  }

  // ---- Endpoints Dashboard Tesorero ----
  static async getKpisMe(req, res) {
    try {
      const cursoId = await TesoreroController._getCursoIdFromToken(req);
      if (!cursoId) return res.status(404).json({ success: false, message: 'No está asignado como tesorero de ningún curso' });
      const kpis = await TesoreroService.getIndicadoresCurso(cursoId);
      return res.status(200).json({ success: true, data: { curso_id: cursoId, ...kpis } });
    } catch (error) {
      Logger.error('getKpisMe error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error?.message });
    }
  }

  static async getCobrosPendientesMe(req, res) {
    try {
      const cursoId = await TesoreroController._getCursoIdFromToken(req);
      if (!cursoId) return res.status(404).json({ success: false, message: 'No está asignado como tesorero de ningún curso' });
      const items = await TesoreroService.getCobrosPendientesCurso(cursoId);
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      Logger.error('getCobrosPendientesMe error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error?.message });
    }
  }

  static async getKpisByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const kpis = await TesoreroService.getIndicadoresCurso(cursoId);
      return res.status(200).json({ success: true, data: { curso_id: Number(cursoId), ...kpis } });
    } catch (error) {
      Logger.error('getKpisByCurso error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error?.message });
    }
  }

  static async getCobrosPendientesByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const items = await TesoreroService.getCobrosPendientesCurso(cursoId);
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      Logger.error('getCobrosPendientesByCurso error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error?.message });
    }
  }

  // ---- Aliases ----
  static async getMiCurso(req, res) {
    return TesoreroController.getMyData(req, res);
  }

  static async getCursoAsignadoByRut(req, res) {
    return TesoreroController.getCursoAsignado(req, res);
  }

  // ---- mantenimiento ----
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(tesoreroValidator, req.body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      if (data.curso_id) {
        const cursoDisponible = await TesoreroService.isCursoDisponible(data.curso_id, parseInt(id, 10));
        if (!cursoDisponible) return ResponseHelper.conflict(res, 'El curso ya tiene un tesorero asignado');
      }
      if (data.usuario_id) {
        const usuarioDisponible = await TesoreroService.isUsuarioDisponible(data.usuario_id, parseInt(id, 10));
        if (!usuarioDisponible) return ResponseHelper.conflict(res, 'El usuario ya es tesorero de otro curso');
      }

      const userId = req.user?.id || 'system';
      const tesorero = await TesoreroService.update(id, data, userId);
      if (!tesorero) return ResponseHelper.notFound(res, 'Tesorero');

      Logger.info('Tesorero actualizado exitosamente', { tesoreroId: id, userId });
      return ResponseHelper.updated(res, tesorero, 'Tesorero actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar tesorero', { error: error.message, stack: error.stack });
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un tesorero para este curso o usuario');
      }
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async deactivate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const deactivated = await TesoreroService.deactivate(id, userId);
      if (!deactivated) return ResponseHelper.notFound(res, 'Tesorero');
      Logger.info('Tesorero desactivado exitosamente', { tesoreroId: id, userId });
      return res.status(200).json({ success: true, message: 'Tesorero desactivado exitosamente', data: null });
    } catch (error) {
      Logger.error('Error al desactivar tesorero', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async activate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const activated = await TesoreroService.activate(id, userId);
      if (!activated) return ResponseHelper.notFound(res, 'Tesorero');
      Logger.info('Tesorero activado exitosamente', { tesoreroId: id, userId });
      return res.status(200).json({ success: true, message: 'Tesorero activado exitosamente', data: null });
    } catch (error) {
      Logger.error('Error al activar tesorero', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      const deleted = await TesoreroService.delete(id, userId);
      if (!deleted) return ResponseHelper.notFound(res, 'Tesorero');
      Logger.info('Tesorero eliminado exitosamente', { tesoreroId: id, userId });
      return ResponseHelper.deleted(res, 'Tesorero eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar tesorero', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getEstadisticas(req, res) {
    try {
      const estadisticas = await TesoreroService.getEstadisticas();
      return res.status(200).json({ success: true, data: estadisticas });
    } catch (error) {
      Logger.error('Error al obtener estadísticas de tesoreros', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getActive(req, res) {
    try {
      const tesoreros = await TesoreroService.findActive();
      return res.status(200).json({ success: true, data: tesoreros });
    } catch (error) {
      Logger.error('Error al obtener tesoreros activos', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
  // debajo de los métodos de dashboard
  static async getAlumnoResumenMe(req, res) {
    try {
      const { alumnoId } = req.params;
      const cursoId = await TesoreroController._getCursoIdFromToken(req);
      if (!cursoId) return res.status(404).json({ success:false, message:'No está asignado a un curso' });
      const data = await TesoreroService.getResumenAlumno(alumnoId, cursoId);
      return res.status(200).json({ success:true, data: { curso_id: cursoId, alumno_id: Number(alumnoId), ...data } });
    } catch (error) {
      Logger.error('getAlumnoResumenMe error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success:false, message:'Error interno', error: error?.message });
    }
  }

  static async getAlumnoCobrosPendientesMe(req, res) {
    try {
      const { alumnoId } = req.params;
      const cursoId = await TesoreroController._getCursoIdFromToken(req);
      if (!cursoId) return res.status(404).json({ success:false, message:'No está asignado a un curso' });
      const items = await TesoreroService.getCobrosAlumnoPendientes(alumnoId, cursoId);
      return res.status(200).json({ success:true, data: items });
    } catch (error) {
      Logger.error('getAlumnoCobrosPendientesMe error', { error: error.message, stack: error.stack });
      return res.status(500).json({ success:false, message:'Error interno', error: error?.message });
    }
  }

}

module.exports = TesoreroController;
