// controllers/tesoreroController.js
const TesoreroService = require('../services/tesoreroService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, tesoreroValidator } = require('../utils/validators');
const Logger = require('../utils/logger');
const { sequelize } = require('../config/database');

class TesoreroController {
  // ---- CRUD admin (sin cambios estructurales) ----
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
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
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
      return ResponseHelper.success(res, tesorero);
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
      return ResponseHelper.success(res, tesorero);
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
      return ResponseHelper.success(res, tesorero);
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
        WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') = REPLACE(REPLACE(UPPER(:rut), '.', ''), '-', '')
          AND pr.rol_id = 2
          AND pr.activo = 1
          AND pr.curso_id IS NOT NULL
        LIMIT 1
        `,
        { replacements: { rut } }
      );
      return ResponseHelper.success(res, { rut_persona: rut, es_tesorero: !!rows?.[0] });
    } catch (error) {
      Logger.error('checkIsTesorero error', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async checkCourseAccess(req, res) {
    try {
      const { usuarioId, cursoId } = req.params;
      const canAccess = await TesoreroService.canAccessCourse(usuarioId, cursoId);
      return ResponseHelper.success(res, { usuario_id: usuarioId, curso_id: cursoId, puede_acceder: canAccess });
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
        WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') = REPLACE(REPLACE(UPPER(:rut), '.', ''), '-', '')
          AND pr.rol_id = 2
          AND pr.activo = 1
          AND pr.curso_id IS NOT NULL
        LIMIT 1
        `,
        { replacements: { rut } }
      );

      const r = rows?.[0];
      if (!r) return ResponseHelper.notFound(res, 'Curso asignado para este usuario');

      return ResponseHelper.success(res, {
        rut_persona: rut,
        curso_id: r.curso_id,
        curso: {
          id: r.curso_id,
          nombre_curso: r.curso_nombre_curso,
          nivel_id: r.curso_nivel_id,
          ano_escolar: r.curso_ano_escolar,
        },
      });
    } catch (error) {
      Logger.error('getCursoAsignado error', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }


// GET /api/tesoreros/me
  static async getMyData(req, res) {
    try {
      const rut = req.rut_persona || req.user?.rut || req.user?.id;
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
        WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') = REPLACE(REPLACE(UPPER(:rut), '.', ''), '-', '')
          AND pr.rol_id = 2
          AND pr.activo = 1
          AND pr.curso_id IS NOT NULL
        LIMIT 1
        `,
        { replacements: { rut } }
      );

      const r = rows?.[0];
      if (!r) return ResponseHelper.notFound(res, 'No está asignado como tesorero de ningún curso');

      return ResponseHelper.success(res, {
        rut_persona: r.rut_persona,
        fecha_asignacion: r.fecha_asignacion || null,
        // Objeto curso con las claves que usa tu UI
        curso: {
          id: r.curso_id,
          nombre_curso: r.curso_nombre_curso,
          nivel_id: r.curso_nivel_id,
          ano_escolar: r.curso_ano_escolar,
        },
        // Compatibilidad: algunos componentes usan "usuario"
        usuario: r.persona_rut ? {
          rut: r.persona_rut,
          nombres: r.persona_nombres,
          apellidos: r.persona_apellidos,
        } : null,
        // También dejamos "persona" por si ya lo estás usando
        persona: r.persona_rut ? {
          rut: r.persona_rut,
          nombres: r.persona_nombres,
          apellidos: r.persona_apellidos,
        } : null,
      });
    } catch (error) {
      Logger.error('getMyData error', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }


  // ---- mantenimiento ----
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(tesoreroValidator, req.body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      if (data.curso_id) {
        const cursoDisponible = await TesoreroService.isCursoDisponible(data.curso_id, parseInt(id));
        if (!cursoDisponible) return ResponseHelper.conflict(res, 'El curso ya tiene un tesorero asignado');
      }
      if (data.usuario_id) {
        const usuarioDisponible = await TesoreroService.isUsuarioDisponible(data.usuario_id, parseInt(id));
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
      return ResponseHelper.success(res, null, 'Tesorero desactivado exitosamente');
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
      return ResponseHelper.success(res, null, 'Tesorero activado exitosamente');
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
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de tesoreros', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getActive(req, res) {
    try {
      const tesoreros = await TesoreroService.findActive();
      return ResponseHelper.success(res, tesoreros);
    } catch (error) {
      Logger.error('Error al obtener tesoreros activos', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = TesoreroController;
