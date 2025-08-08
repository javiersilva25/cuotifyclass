const DeudaAlumnoService = require('../services/deudaAlumnoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, deudaAlumnoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class DeudaAlumnoController {
  /**
   * Crear una nueva deuda de alumno
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(deudaAlumnoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const deuda = await DeudaAlumnoService.create(data, userId);
      
      Logger.info('Deuda de alumno creada exitosamente', { 
        deudaId: deuda.id, 
        userId 
      });
      
      return ResponseHelper.created(res, deuda, 'Deuda de alumno creada exitosamente');
    } catch (error) {
      Logger.error('Error al crear deuda de alumno', { 
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe una deuda para este alumno y cobro');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todas las deudas de alumnos
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        alumno_id: req.query.alumno_id,
        cobro_id: req.query.cobro_id,
        estado: req.query.estado,
        curso_id: req.query.curso_id
      };

      const result = await DeudaAlumnoService.findAll(options);
      
      return ResponseHelper.paginated(res, result.deudas, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener deudas de alumnos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener una deuda por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const deuda = await DeudaAlumnoService.findById(id);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de alumno');
      }
      
      return ResponseHelper.success(res, deuda);
    } catch (error) {
      Logger.error('Error al obtener deuda de alumno', { 
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
      const deudas = await DeudaAlumnoService.findByAlumno(alumnoId);
      
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
      const deudas = await DeudaAlumnoService.findPendientesByAlumno(alumnoId);
      
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
   * Obtener deudas por cobro
   */
  static async getByCobro(req, res) {
    try {
      const { cobroId } = req.params;
      const deudas = await DeudaAlumnoService.findByCobro(cobroId);
      
      return ResponseHelper.success(res, deudas);
    } catch (error) {
      Logger.error('Error al obtener deudas por cobro', { 
        cobroId: req.params.cobroId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar una deuda
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(deudaAlumnoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const deuda = await DeudaAlumnoService.update(id, data, userId);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de alumno');
      }
      
      Logger.info('Deuda de alumno actualizada exitosamente', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, deuda, 'Deuda de alumno actualizada exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar deuda de alumno', { 
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
      
      const deuda = await DeudaAlumnoService.marcarPagado(id, userId);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de alumno');
      }
      
      Logger.info('Deuda marcada como pagada', { 
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
   * Marcar deuda como parcialmente pagada
   */
  static async marcarParcial(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deuda = await DeudaAlumnoService.marcarParcial(id, userId);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de alumno');
      }
      
      Logger.info('Deuda marcada como parcialmente pagada', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, deuda, 'Deuda marcada como parcialmente pagada exitosamente');
    } catch (error) {
      Logger.error('Error al marcar deuda como parcial', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Anular una deuda
   */
  static async anular(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deuda = await DeudaAlumnoService.anular(id, userId);
      
      if (!deuda) {
        return ResponseHelper.notFound(res, 'Deuda de alumno');
      }
      
      Logger.info('Deuda anulada exitosamente', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, deuda, 'Deuda anulada exitosamente');
    } catch (error) {
      Logger.error('Error al anular deuda', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar una deuda (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await DeudaAlumnoService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Deuda de alumno');
      }
      
      Logger.info('Deuda de alumno eliminada exitosamente', { 
        deudaId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Deuda de alumno eliminada exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar deuda de alumno', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar una deuda eliminada
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await DeudaAlumnoService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Deuda de alumno eliminada');
      }
      
      Logger.info('Deuda de alumno restaurada exitosamente', { 
        deudaId: id 
      });
      
      return ResponseHelper.success(res, null, 'Deuda de alumno restaurada exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar deuda de alumno', { 
        deudaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total adeudado por alumno
   */
  static async getTotalAdeudadoByAlumno(req, res) {
    try {
      const { alumnoId } = req.params;
      const total = await DeudaAlumnoService.getTotalAdeudadoByAlumno(alumnoId);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total adeudado por alumno', { 
        alumnoId: req.params.alumnoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de deudas
   */
  static async getEstadisticas(req, res) {
    try {
      const filters = {
        alumno_id: req.query.alumno_id,
        cobro_id: req.query.cobro_id
      };

      const estadisticas = await DeudaAlumnoService.getEstadisticas(filters);
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de deudas', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Crear deudas masivas para un cobro
   */
  static async createBulkForCobro(req, res) {
    try {
      const { cobroId } = req.params;
      const { alumnos_ids, monto_adeudado } = req.body;
      
      if (!Array.isArray(alumnos_ids) || alumnos_ids.length === 0) {
        return ResponseHelper.validationError(res, [
          { field: 'alumnos_ids', message: 'Se debe proporcionar un array de IDs de alumnos' }
        ]);
      }

      if (!monto_adeudado || monto_adeudado <= 0) {
        return ResponseHelper.validationError(res, [
          { field: 'monto_adeudado', message: 'El monto adeudado debe ser mayor a 0' }
        ]);
      }

      const userId = req.user?.id || 'system';
      const deudas = await DeudaAlumnoService.createBulkForCobro(
        cobroId, 
        alumnos_ids, 
        monto_adeudado, 
        userId
      );
      
      Logger.info('Deudas masivas creadas exitosamente', { 
        cobroId,
        cantidad: deudas.length,
        userId 
      });
      
      return ResponseHelper.created(res, deudas, 
        `${deudas.length} deudas creadas exitosamente`);
    } catch (error) {
      Logger.error('Error al crear deudas masivas', { 
        cobroId: req.params.cobroId,
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
      const resumen = await DeudaAlumnoService.getResumenByCurso(cursoId);
      
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
}

module.exports = DeudaAlumnoController;

