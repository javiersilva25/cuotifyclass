const MovimientoCcppService = require('../services/movimientoCcppService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, movimientoCcppValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class MovimientoCcppController {
  /**
   * Crear un nuevo movimiento CCPP
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(movimientoCcppValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const movimiento = await MovimientoCcppService.create(data, userId);
      
      Logger.info('Movimiento CCPP creado exitosamente', { 
        movimientoId: movimiento.id, 
        userId 
      });
      
      return ResponseHelper.created(res, movimiento, 'Movimiento CCPP creado exitosamente');
    } catch (error) {
      Logger.error('Error al crear movimiento CCPP', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los movimientos CCPP
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        curso_id: req.query.curso_id,
        alumno_id: req.query.alumno_id,
        tipo: req.query.tipo,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        search: req.query.search
      };

      const result = await MovimientoCcppService.findAll(options);
      
      return ResponseHelper.paginated(res, result.movimientos, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener movimientos CCPP', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un movimiento CCPP por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const movimiento = await MovimientoCcppService.findById(id);
      
      if (!movimiento) {
        return ResponseHelper.notFound(res, 'Movimiento CCPP');
      }
      
      return ResponseHelper.success(res, movimiento);
    } catch (error) {
      Logger.error('Error al obtener movimiento CCPP', { 
        movimientoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener movimientos por curso
   */
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const movimientos = await MovimientoCcppService.findByCurso(cursoId);
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al obtener movimientos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener movimientos por alumno
   */
  static async getByAlumno(req, res) {
    try {
      const { alumnoId } = req.params;
      const movimientos = await MovimientoCcppService.findByAlumno(alumnoId);
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al obtener movimientos por alumno', { 
        alumnoId: req.params.alumnoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener movimientos por curso y alumno
   */
  static async getByCursoAndAlumno(req, res) {
    try {
      const { cursoId, alumnoId } = req.params;
      const movimientos = await MovimientoCcppService.findByCursoAndAlumno(cursoId, alumnoId);
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al obtener movimientos por curso y alumno', { 
        cursoId: req.params.cursoId,
        alumnoId: req.params.alumnoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener ingresos por curso
   */
  static async getIngresosByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const ingresos = await MovimientoCcppService.findIngresosByCurso(cursoId);
      
      return ResponseHelper.success(res, ingresos);
    } catch (error) {
      Logger.error('Error al obtener ingresos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos por curso
   */
  static async getGastosByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const gastos = await MovimientoCcppService.findGastosByCurso(cursoId);
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener movimientos por rango de fechas
   */
  static async getByDateRange(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const { cursoId, alumnoId } = req.params;
      
      if (!fecha_inicio || !fecha_fin) {
        return ResponseHelper.validationError(res, [
          { field: 'fecha_inicio', message: 'La fecha de inicio es requerida' },
          { field: 'fecha_fin', message: 'La fecha de fin es requerida' }
        ]);
      }
      
      const movimientos = await MovimientoCcppService.findByDateRange(
        fecha_inicio, 
        fecha_fin, 
        cursoId || null,
        alumnoId || null
      );
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al obtener movimientos por rango de fechas', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un movimiento CCPP
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(movimientoCcppValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const movimiento = await MovimientoCcppService.update(id, data, userId);
      
      if (!movimiento) {
        return ResponseHelper.notFound(res, 'Movimiento CCPP');
      }
      
      Logger.info('Movimiento CCPP actualizado exitosamente', { 
        movimientoId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, movimiento, 'Movimiento CCPP actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar movimiento CCPP', { 
        movimientoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un movimiento CCPP (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await MovimientoCcppService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Movimiento CCPP');
      }
      
      Logger.info('Movimiento CCPP eliminado exitosamente', { 
        movimientoId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Movimiento CCPP eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar movimiento CCPP', { 
        movimientoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar un movimiento CCPP eliminado
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await MovimientoCcppService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Movimiento CCPP eliminado');
      }
      
      Logger.info('Movimiento CCPP restaurado exitosamente', { 
        movimientoId: id 
      });
      
      return ResponseHelper.success(res, null, 'Movimiento CCPP restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar movimiento CCPP', { 
        movimientoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total de ingresos por curso
   */
  static async getTotalIngresosByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const total = await MovimientoCcppService.getTotalIngresosByCurso(cursoId);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total de ingresos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total de gastos por curso
   */
  static async getTotalGastosByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const total = await MovimientoCcppService.getTotalGastosByCurso(cursoId);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total de gastos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total por alumno
   */
  static async getTotalByAlumno(req, res) {
    try {
      const { alumnoId } = req.params;
      const { tipo } = req.query;
      
      const total = await MovimientoCcppService.getTotalByAlumno(alumnoId, tipo);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total por alumno', { 
        alumnoId: req.params.alumnoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener balance por curso
   */
  static async getBalanceByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const balance = await MovimientoCcppService.getBalanceByCurso(cursoId);
      
      return ResponseHelper.success(res, balance);
    } catch (error) {
      Logger.error('Error al obtener balance por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de movimientos CCPP
   */
  static async getEstadisticas(req, res) {
    try {
      const filters = {
        curso_id: req.query.curso_id,
        alumno_id: req.query.alumno_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const estadisticas = await MovimientoCcppService.getEstadisticas(filters);
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de movimientos CCPP', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener movimientos agrupados por alumno
   */
  static async getGroupedByAlumno(req, res) {
    try {
      const { cursoId } = req.params;
      const movimientos = await MovimientoCcppService.getGroupedByAlumno(cursoId);
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al obtener movimientos agrupados por alumno', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener movimientos agrupados por mes
   */
  static async getGroupedByMonth(req, res) {
    try {
      const ano = parseInt(req.query.ano) || new Date().getFullYear();
      const cursoId = req.query.curso_id || null;
      const alumnoId = req.query.alumno_id || null;

      const movimientos = await MovimientoCcppService.getGroupedByMonth(ano, cursoId, alumnoId);
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al obtener movimientos agrupados por mes', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Buscar movimientos por concepto
   */
  static async searchByConcepto(req, res) {
    try {
      const { concepto } = req.query;
      
      if (!concepto || concepto.trim().length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'concepto', message: 'El concepto debe tener al menos 2 caracteres' }
        ]);
      }
      
      const movimientos = await MovimientoCcppService.searchByConcepto(concepto.trim());
      
      return ResponseHelper.success(res, movimientos);
    } catch (error) {
      Logger.error('Error al buscar movimientos por concepto', { 
        concepto: req.query.concepto,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Crear movimientos masivos
   */
  static async createBulk(req, res) {
    try {
      const { movimientos } = req.body;
      
      if (!Array.isArray(movimientos) || movimientos.length === 0) {
        return ResponseHelper.validationError(res, [
          { field: 'movimientos', message: 'Se debe proporcionar un array de movimientos' }
        ]);
      }

      // Validar cada movimiento
      for (let i = 0; i < movimientos.length; i++) {
        const { isValid, errors } = validateData(movimientoCcppValidator, movimientos[i]);
        
        if (!isValid) {
          return ResponseHelper.validationError(res, 
            errors.map(error => ({
              ...error,
              field: `movimientos[${i}].${error.field}`
            }))
          );
        }
      }

      const userId = req.user?.id || 'system';
      const movimientosCreados = await MovimientoCcppService.createBulk(movimientos, userId);
      
      Logger.info('Movimientos CCPP masivos creados exitosamente', { 
        cantidad: movimientosCreados.length,
        userId 
      });
      
      return ResponseHelper.created(res, movimientosCreados, 
        `${movimientosCreados.length} movimientos creados exitosamente`);
    } catch (error) {
      Logger.error('Error al crear movimientos masivos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = MovimientoCcppController;

