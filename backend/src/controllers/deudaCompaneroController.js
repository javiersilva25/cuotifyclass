const DeudaCompaneroService = require('../services/deudaCompaneroService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, deudaCompaneroValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class DeudaCompaneroController {
  /**
   * Crear una nueva deuda de compañero
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(deudaCompaneroValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const deuda = await DeudaCompaneroService.create(data, userId);
      
      Logger.info('Deuda de compañero creada exitosamente', { 
        deudaId: deuda.id, 
        userId 
      });
      
      return ResponseHelper.created(res, deuda, 'Deuda de compañero creada exitosamente');
    } catch (error) {
      Logger.error('Error al crear deuda de compañero', { 
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe una deuda para este alumno y cobro de alumnos');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todas las deudas de compañeros
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        alumno_id: req.query.alumno_id,
        cobro_alumnos_id: req.query.cobro_alumnos_id,
        estado: req.query.estado,
        curso_id: req.query.curso_id
      };

      const result = await DeudaCompaneroService.findAll(options);
      
      return ResponseHelper.paginated(res, result.deudasCompaneros, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener deudas de compañeros', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener una deuda de compañero por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const deuda = await DeudaCompaneroService.findById(id);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de compañero');
      }
      
      return ResponseHelper.success(res, deuda);
    } catch (error) {
      Logger.error('Error al obtener deuda de compañero', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener deudas por alumno
   */
  static async getByAlumno(req, res) {
    try {
      const { alumnoId } = req.params;
      const deudas = await DeudaCompaneroService.findByAlumno(alumnoId);
      
      return ResponseHelper.success(res, deudas);
    } catch (error) {
      Logger.error('Error al obtener deudas por alumno', { 
        alumnoId: req.params.alumnoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener deudas pendientes por alumno
   */
  static async getPendientesByAlumno(req, res) {
    try {
      const { alumnoId } = req.params;
      const deudas = await DeudaCompaneroService.findPendientesByAlumno(alumnoId);
      
      return ResponseHelper.success(res, deudas);
    } catch (error) {
      Logger.error('Error al obtener deudas pendientes por alumno', { 
        alumnoId: req.params.alumnoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener deudas por cobro de alumnos
   */
  static async getByCobroAlumnos(req, res) {
    try {
      const { cobroAlumnosId } = req.params;
      const deudas = await DeudaCompaneroService.findByCobroAlumnos(cobroAlumnosId);
      
      return ResponseHelper.success(res, deudas);
    } catch (error) {
      Logger.error('Error al obtener deudas por cobro de alumnos', { 
        cobroAlumnosId: req.params.cobroAlumnosId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar una deuda de compañero
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(deudaCompaneroValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const deuda = await DeudaCompaneroService.update(id, data, userId);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de compañero');
      }
      
      Logger.info('Deuda de compañero actualizada exitosamente', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, deuda, 'Deuda de compañero actualizada exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar deuda de compañero', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Marcar deuda como pagada
   */
  static async marcarPagado(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deuda = await DeudaCompaneroService.marcarPagado(id, userId);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de compañero');
      }
      
      Logger.info('Deuda de compañero marcada como pagada', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, deuda, 'Deuda marcada como pagada exitosamente');
    } catch (error) {
      Logger.error('Error al marcar deuda como pagada', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar una deuda de compañero (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await DeudaCompaneroService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Deuda de compañero');
      }
      
      Logger.info('Deuda de compañero eliminada exitosamente', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Deuda de compañero eliminada exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar deuda de compañero', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar una deuda de compañero eliminada
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await DeudaCompaneroService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Deuda de compañero eliminada');
      }
      
      Logger.info('Deuda de compañero restaurada exitosamente', { 
        deudaId: id 
      });
      
      return ResponseHelper.success(res, null, 'Deuda de compañero restaurada exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar deuda de compañero', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Contar deudas pendientes por cobro de alumnos
   */
  static async countPendientesByCobroAlumnos(req, res) {
    try {
      const { cobroAlumnosId } = req.params;
      const count = await DeudaCompaneroService.countPendientesByCobroAlumnos(cobroAlumnosId);
      
      return ResponseHelper.success(res, { count });
    } catch (error) {
      Logger.error('Error al contar deudas pendientes', { 
        cobroAlumnosId: req.params.cobroAlumnosId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Contar deudas pagadas por cobro de alumnos
   */
  static async countPagadasByCobroAlumnos(req, res) {
    try {
      const { cobroAlumnosId } = req.params;
      const count = await DeudaCompaneroService.countPagadasByCobroAlumnos(cobroAlumnosId);
      
      return ResponseHelper.success(res, { count });
    } catch (error) {
      Logger.error('Error al contar deudas pagadas', { 
        cobroAlumnosId: req.params.cobroAlumnosId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de deudas de compañeros
   */
  static async getEstadisticas(req, res) {
    try {
      const filters = {
        alumno_id: req.query.alumno_id,
        cobro_alumnos_id: req.query.cobro_alumnos_id
      };

      const estadisticas = await DeudaCompaneroService.getEstadisticas(filters);
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de deudas de compañeros', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Crear deudas masivas para un cobro de alumnos
   */
  static async createBulkForCobroAlumnos(req, res) {
    try {
      const { cobroAlumnosId } = req.params;
      const { alumnos_ids } = req.body;
      
      if (!Array.isArray(alumnos_ids) || alumnos_ids.length === 0) {
        return ResponseHelper.validationError(res, [
          { field: 'alumnos_ids', message: 'Se debe proporcionar un array de IDs de alumnos' }
        ]);
      }

      const userId = req.user?.id || 'system';
      const deudas = await DeudaCompaneroService.createBulkForCobroAlumnos(
        cobroAlumnosId, 
        alumnos_ids, 
        userId
      );
      
      Logger.info('Deudas de compañeros masivas creadas exitosamente', { 
        cobroAlumnosId,
        cantidad: deudas.length,
        userId 
      });
      
      return ResponseHelper.created(res, deudas, 
        `${deudas.length} deudas de compañeros creadas exitosamente`);
    } catch (error) {
      Logger.error('Error al crear deudas masivas de compañeros', { 
        cobroAlumnosId: req.params.cobroAlumnosId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener resumen de deudas por curso
   */
  static async getResumenByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const resumen = await DeudaCompaneroService.getResumenByCurso(cursoId);
      
      return ResponseHelper.success(res, resumen);
    } catch (error) {
      Logger.error('Error al obtener resumen de deudas por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Marcar múltiples deudas como pagadas
   */
  static async marcarMultiplesPagadas(req, res) {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return ResponseHelper.validationError(res, [
          { field: 'ids', message: 'Se debe proporcionar un array de IDs de deudas' }
        ]);
      }

      const userId = req.user?.id || 'system';
      const updatedCount = await DeudaCompaneroService.marcarMultiplesPagadas(ids, userId);
      
      Logger.info('Múltiples deudas marcadas como pagadas', { 
        cantidad: updatedCount,
        userId 
      });
      
      return ResponseHelper.success(res, 
        { updated_count: updatedCount }, 
        `${updatedCount} deudas marcadas como pagadas exitosamente`
      );
    } catch (error) {
      Logger.error('Error al marcar múltiples deudas como pagadas', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener deudas agrupadas por cobro de alumnos
   */
  static async getGroupedByCobroAlumnos(req, res) {
    try {
      const { cursoId } = req.query;
      const deudas = await DeudaCompaneroService.getGroupedByCobroAlumnos(cursoId);
      
      return ResponseHelper.success(res, deudas);
    } catch (error) {
      Logger.error('Error al obtener deudas agrupadas por cobro de alumnos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = DeudaCompaneroController;

