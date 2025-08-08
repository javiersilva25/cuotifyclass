const CobroService = require('../services/cobroService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, cobroValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class CobroController {
  /**
   * Crear un nuevo cobro
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(cobroValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const cobro = await CobroService.create(data, userId);
      
      Logger.info('Cobro creado exitosamente', { 
        cobroId: cobro.id, 
        userId 
      });
      
      return ResponseHelper.created(res, cobro, 'Cobro creado exitosamente');
    } catch (error) {
      Logger.error('Error al crear cobro', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los cobros
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        curso_id: req.query.curso_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        vencidos_only: req.query.vencidos_only === 'true'
      };

      const result = await CobroService.findAll(options);
      
      return ResponseHelper.paginated(res, result.cobros, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener cobros', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un cobro por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const cobro = await CobroService.findById(id);
      
      if (!cobro) {
        return ResponseHelper.notFound(res, 'Cobro');
      }
      
      return ResponseHelper.success(res, cobro);
    } catch (error) {
      Logger.error('Error al obtener cobro', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cobros por curso
   */
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const cobros = await CobroService.findByCurso(cursoId);
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cobros vencidos
   */
  static async getVencidos(req, res) {
    try {
      const cobros = await CobroService.findVencidos();
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros vencidos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cobros próximos a vencer
   */
  static async getProximosAVencer(req, res) {
    try {
      const dias = parseInt(req.query.dias) || 7;
      const cobros = await CobroService.findProximosAVencer(dias);
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros próximos a vencer', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cobros por rango de fechas
   */
  static async getByDateRange(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      
      if (!fecha_inicio || !fecha_fin) {
        return ResponseHelper.validationError(res, [
          { field: 'fecha_inicio', message: 'La fecha de inicio es requerida' },
          { field: 'fecha_fin', message: 'La fecha de fin es requerida' }
        ]);
      }
      
      const cobros = await CobroService.findByDateRange(fecha_inicio, fecha_fin);
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros por rango de fechas', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un cobro
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(cobroValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const cobro = await CobroService.update(id, data, userId);
      
      if (!cobro) {
        return ResponseHelper.notFound(res, 'Cobro');
      }
      
      Logger.info('Cobro actualizado exitosamente', { 
        cobroId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, cobro, 'Cobro actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar cobro', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un cobro (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await CobroService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Cobro');
      }
      
      Logger.info('Cobro eliminado exitosamente', { 
        cobroId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Cobro eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar cobro', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.message.includes('deudas asociadas')) {
        return ResponseHelper.conflict(res, error.message);
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar un cobro eliminado
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await CobroService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Cobro eliminado');
      }
      
      Logger.info('Cobro restaurado exitosamente', { 
        cobroId: id 
      });
      
      return ResponseHelper.success(res, null, 'Cobro restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar cobro', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total de cobros por curso
   */
  static async getTotalByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const total = await CobroService.getTotalByCurso(cursoId);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total de cobros por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de cobros
   */
  static async getEstadisticas(req, res) {
    try {
      const filters = {
        curso_id: req.query.curso_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const estadisticas = await CobroService.getEstadisticas(filters);
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de cobros', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = CobroController;

