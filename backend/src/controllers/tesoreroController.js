const TesoreroService = require('../services/tesoreroService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, tesoreroValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class TesoreroController {
  /**
   * Crear un nuevo tesorero
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(tesoreroValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      // Verificar que el curso esté disponible
      const cursoDisponible = await TesoreroService.isCursoDisponible(data.curso_id);
      if (!cursoDisponible) {
        return ResponseHelper.conflict(res, 'El curso ya tiene un tesorero asignado');
      }

      // Verificar que el usuario esté disponible
      const usuarioDisponible = await TesoreroService.isUsuarioDisponible(data.usuario_id);
      if (!usuarioDisponible) {
        return ResponseHelper.conflict(res, 'El usuario ya es tesorero de otro curso');
      }

      const userId = req.user?.id || 'system';
      const tesorero = await TesoreroService.create(data, userId);
      
      Logger.info('Tesorero creado exitosamente', { 
        tesoreroId: tesorero.id, 
        usuarioId: data.usuario_id,
        cursoId: data.curso_id,
        createdBy: userId 
      });
      
      return ResponseHelper.created(res, tesorero, 'Tesorero asignado exitosamente');
    } catch (error) {
      Logger.error('Error al crear tesorero', { 
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un tesorero para este curso o usuario');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los tesoreros
   */
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
      Logger.error('Error al obtener tesoreros', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un tesorero por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const tesorero = await TesoreroService.findById(id);
      
      if (!tesorero) {
        return ResponseHelper.notFound(res, 'Tesorero');
      }
      
      return ResponseHelper.success(res, tesorero);
    } catch (error) {
      Logger.error('Error al obtener tesorero', { 
        tesoreroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener tesorero por usuario
   */
  static async getByUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const tesorero = await TesoreroService.findByUsuario(usuarioId);
      
      if (!tesorero) {
        return ResponseHelper.notFound(res, 'Tesorero para este usuario');
      }
      
      return ResponseHelper.success(res, tesorero);
    } catch (error) {
      Logger.error('Error al obtener tesorero por usuario', { 
        usuarioId: req.params.usuarioId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener tesorero por curso
   */
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const tesorero = await TesoreroService.findByCurso(cursoId);
      
      if (!tesorero) {
        return ResponseHelper.notFound(res, 'Tesorero para este curso');
      }
      
      return ResponseHelper.success(res, tesorero);
    } catch (error) {
      Logger.error('Error al obtener tesorero por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Verificar si un usuario es tesorero
   */
  static async checkIsTesorero(req, res) {
    try {
      const { usuarioId } = req.params;
      const isTesorero = await TesoreroService.isTesorero(usuarioId);
      
      return ResponseHelper.success(res, { 
        usuario_id: usuarioId,
        es_tesorero: isTesorero 
      });
    } catch (error) {
      Logger.error('Error al verificar si usuario es tesorero', { 
        usuarioId: req.params.usuarioId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Verificar acceso a curso
   */
  static async checkCourseAccess(req, res) {
    try {
      const { usuarioId, cursoId } = req.params;
      const canAccess = await TesoreroService.canAccessCourse(usuarioId, cursoId);
      
      return ResponseHelper.success(res, { 
        usuario_id: usuarioId,
        curso_id: cursoId,
        puede_acceder: canAccess 
      });
    } catch (error) {
      Logger.error('Error al verificar acceso a curso', { 
        usuarioId: req.params.usuarioId,
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener curso asignado a un tesorero
   */
  static async getCursoAsignado(req, res) {
    try {
      const { usuarioId } = req.params;
      const cursoId = await TesoreroService.getCursoAsignado(usuarioId);
      
      if (!cursoId) {
        return ResponseHelper.notFound(res, 'Curso asignado para este usuario');
      }
      
      return ResponseHelper.success(res, { 
        usuario_id: usuarioId,
        curso_id: cursoId 
      });
    } catch (error) {
      Logger.error('Error al obtener curso asignado', { 
        usuarioId: req.params.usuarioId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener datos del tesorero actual (basado en token)
   */
  static async getMyData(req, res) {
    try {
      const usuarioId = req.user.id;
      const tesorero = await TesoreroService.findByUsuarioWithDetails(usuarioId);
      
      if (!tesorero) {
        return ResponseHelper.notFound(res, 'No está asignado como tesorero de ningún curso');
      }
      
      return ResponseHelper.success(res, tesorero);
    } catch (error) {
      Logger.error('Error al obtener datos del tesorero actual', { 
        usuarioId: req.user?.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un tesorero
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(tesoreroValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      // Si se está cambiando el curso, verificar disponibilidad
      if (data.curso_id) {
        const cursoDisponible = await TesoreroService.isCursoDisponible(data.curso_id, parseInt(id));
        if (!cursoDisponible) {
          return ResponseHelper.conflict(res, 'El curso ya tiene un tesorero asignado');
        }
      }

      // Si se está cambiando el usuario, verificar disponibilidad
      if (data.usuario_id) {
        const usuarioDisponible = await TesoreroService.isUsuarioDisponible(data.usuario_id, parseInt(id));
        if (!usuarioDisponible) {
          return ResponseHelper.conflict(res, 'El usuario ya es tesorero de otro curso');
        }
      }

      const userId = req.user?.id || 'system';
      const tesorero = await TesoreroService.update(id, data, userId);
      
      if (!tesorero) {
        return ResponseHelper.notFound(res, 'Tesorero');
      }
      
      Logger.info('Tesorero actualizado exitosamente', { 
        tesoreroId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, tesorero, 'Tesorero actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar tesorero', { 
        tesoreroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un tesorero para este curso o usuario');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Desactivar un tesorero
   */
  static async deactivate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deactivated = await TesoreroService.deactivate(id, userId);
      
      if (!deactivated) {
        return ResponseHelper.notFound(res, 'Tesorero');
      }
      
      Logger.info('Tesorero desactivado exitosamente', { 
        tesoreroId: id, 
        userId 
      });
      
      return ResponseHelper.success(res, null, 'Tesorero desactivado exitosamente');
    } catch (error) {
      Logger.error('Error al desactivar tesorero', { 
        tesoreroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Activar un tesorero
   */
  static async activate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const activated = await TesoreroService.activate(id, userId);
      
      if (!activated) {
        return ResponseHelper.notFound(res, 'Tesorero');
      }
      
      Logger.info('Tesorero activado exitosamente', { 
        tesoreroId: id, 
        userId 
      });
      
      return ResponseHelper.success(res, null, 'Tesorero activado exitosamente');
    } catch (error) {
      Logger.error('Error al activar tesorero', { 
        tesoreroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un tesorero (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await TesoreroService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Tesorero');
      }
      
      Logger.info('Tesorero eliminado exitosamente', { 
        tesoreroId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Tesorero eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar tesorero', { 
        tesoreroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de tesoreros
   */
  static async getEstadisticas(req, res) {
    try {
      const estadisticas = await TesoreroService.getEstadisticas();
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de tesoreros', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener tesoreros activos
   */
  static async getActive(req, res) {
    try {
      const tesoreros = await TesoreroService.findActive();
      
      return ResponseHelper.success(res, tesoreros);
    } catch (error) {
      Logger.error('Error al obtener tesoreros activos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = TesoreroController;

