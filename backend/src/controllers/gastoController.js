const GastoService = require('../services/gastoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, gastoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class GastoController {
  /**
   * Crear un nuevo gasto
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(gastoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const gasto = await GastoService.create(data, userId);
      
      Logger.info('Gasto creado exitosamente', { 
        gastoId: gasto.id, 
        userId 
      });
      
      return ResponseHelper.created(res, gasto, 'Gasto creado exitosamente');
    } catch (error) {
      Logger.error('Error al crear gasto', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los gastos
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        curso_id: req.query.curso_id,
        categoria_id: req.query.categoria_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        search: req.query.search,
        con_boleta: req.query.con_boleta === 'true' ? true : 
                   req.query.con_boleta === 'false' ? false : undefined
      };

      const result = await GastoService.findAll(options);
      
      return ResponseHelper.paginated(res, result.gastos, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener gastos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un gasto por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const gasto = await GastoService.findById(id);
      
      if (!gasto) {
        return ResponseHelper.notFound(res, 'Gasto');
      }
      
      return ResponseHelper.success(res, gasto);
    } catch (error) {
      Logger.error('Error al obtener gasto', { 
        gastoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos por curso
   */
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const gastos = await GastoService.findByCurso(cursoId);
      
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
   * Obtener gastos por categoría
   */
  static async getByCategoria(req, res) {
    try {
      const { categoriaId } = req.params;
      const gastos = await GastoService.findByCategoria(categoriaId);
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos por categoría', { 
        categoriaId: req.params.categoriaId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos por rango de fechas
   */
  static async getByDateRange(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const { cursoId } = req.params;
      
      if (!fecha_inicio || !fecha_fin) {
        return ResponseHelper.validationError(res, [
          { field: 'fecha_inicio', message: 'La fecha de inicio es requerida' },
          { field: 'fecha_fin', message: 'La fecha de fin es requerida' }
        ]);
      }
      
      const gastos = await GastoService.findByDateRange(
        fecha_inicio, 
        fecha_fin, 
        cursoId || null
      );
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos por rango de fechas', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos con boleta
   */
  static async getWithBoleta(req, res) {
    try {
      const gastos = await GastoService.findWithBoleta();
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos con boleta', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos sin boleta
   */
  static async getWithoutBoleta(req, res) {
    try {
      const gastos = await GastoService.findWithoutBoleta();
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos sin boleta', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un gasto
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(gastoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const gasto = await GastoService.update(id, data, userId);
      
      if (!gasto) {
        return ResponseHelper.notFound(res, 'Gasto');
      }
      
      Logger.info('Gasto actualizado exitosamente', { 
        gastoId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, gasto, 'Gasto actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar gasto', { 
        gastoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un gasto (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await GastoService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Gasto');
      }
      
      Logger.info('Gasto eliminado exitosamente', { 
        gastoId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Gasto eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar gasto', { 
        gastoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar un gasto eliminado
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await GastoService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Gasto eliminado');
      }
      
      Logger.info('Gasto restaurado exitosamente', { 
        gastoId: id 
      });
      
      return ResponseHelper.success(res, null, 'Gasto restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar gasto', { 
        gastoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total de gastos por curso
   */
  static async getTotalByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const total = await GastoService.getTotalByCurso(cursoId);
      
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
   * Obtener total de gastos por categoría
   */
  static async getTotalByCategoria(req, res) {
    try {
      const { categoriaId } = req.params;
      const total = await GastoService.getTotalByCategoria(categoriaId);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total de gastos por categoría', { 
        categoriaId: req.params.categoriaId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de gastos
   */
  static async getEstadisticas(req, res) {
    try {
      const filters = {
        curso_id: req.query.curso_id,
        categoria_id: req.query.categoria_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const estadisticas = await GastoService.getEstadisticas(filters);
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de gastos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos agrupados por categoría
   */
  static async getGroupedByCategoria(req, res) {
    try {
      const filters = {
        curso_id: req.query.curso_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const gastos = await GastoService.getGroupedByCategoria(filters);
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos agrupados por categoría', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener gastos agrupados por mes
   */
  static async getGroupedByMonth(req, res) {
    try {
      const ano = parseInt(req.query.ano) || new Date().getFullYear();
      const cursoId = req.query.curso_id || null;

      const gastos = await GastoService.getGroupedByMonth(ano, cursoId);
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al obtener gastos agrupados por mes', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Buscar gastos por concepto
   */
  static async searchByConcepto(req, res) {
    try {
      const { concepto } = req.query;
      
      if (!concepto || concepto.trim().length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'concepto', message: 'El concepto debe tener al menos 2 caracteres' }
        ]);
      }
      
      const gastos = await GastoService.searchByConcepto(concepto.trim());
      
      return ResponseHelper.success(res, gastos);
    } catch (error) {
      Logger.error('Error al buscar gastos por concepto', { 
        concepto: req.query.concepto,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = GastoController;

