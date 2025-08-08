const CategoriaGastoService = require('../services/categoriaGastoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, categoriaGastoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class CategoriaGastoController {
  /**
   * Crear una nueva categoría de gasto
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(categoriaGastoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      // Verificar si ya existe una categoría con el mismo nombre
      const existingCategoria = await CategoriaGastoService.existsByNombre(data.nombre_categoria);
      if (existingCategoria) {
        return ResponseHelper.conflict(res, 'Ya existe una categoría con este nombre');
      }

      const userId = req.user?.id || 'system';
      const categoria = await CategoriaGastoService.create(data, userId);
      
      Logger.info('Categoría de gasto creada exitosamente', { 
        categoriaId: categoria.id, 
        userId 
      });
      
      return ResponseHelper.created(res, categoria, 'Categoría de gasto creada exitosamente');
    } catch (error) {
      Logger.error('Error al crear categoría de gasto', { 
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe una categoría con este nombre');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todas las categorías de gasto
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search
      };

      const result = await CategoriaGastoService.findAll(options);
      
      return ResponseHelper.paginated(res, result.categorias, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener categorías de gasto', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todas las categorías activas sin paginación
   */
  static async getAllActive(req, res) {
    try {
      const categorias = await CategoriaGastoService.findAllActive();
      
      return ResponseHelper.success(res, categorias);
    } catch (error) {
      Logger.error('Error al obtener categorías activas', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener una categoría por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const categoria = await CategoriaGastoService.findById(id);
      
      if (!categoria) {
        return ResponseHelper.notFound(res, 'Categoría de gasto');
      }
      
      return ResponseHelper.success(res, categoria);
    } catch (error) {
      Logger.error('Error al obtener categoría de gasto', { 
        categoriaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar una categoría de gasto
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(categoriaGastoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      // Verificar si ya existe otra categoría con el mismo nombre
      const existingCategoria = await CategoriaGastoService.existsByNombre(data.nombre_categoria, parseInt(id));
      if (existingCategoria) {
        return ResponseHelper.conflict(res, 'Ya existe otra categoría con este nombre');
      }

      const userId = req.user?.id || 'system';
      const categoria = await CategoriaGastoService.update(id, data, userId);
      
      if (!categoria) {
        return ResponseHelper.notFound(res, 'Categoría de gasto');
      }
      
      Logger.info('Categoría de gasto actualizada exitosamente', { 
        categoriaId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, categoria, 'Categoría de gasto actualizada exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar categoría de gasto', { 
        categoriaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe otra categoría con este nombre');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar una categoría de gasto (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await CategoriaGastoService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Categoría de gasto');
      }
      
      Logger.info('Categoría de gasto eliminada exitosamente', { 
        categoriaId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Categoría de gasto eliminada exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar categoría de gasto', { 
        categoriaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.message.includes('está siendo utilizada')) {
        return ResponseHelper.conflict(res, error.message);
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar una categoría eliminada
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await CategoriaGastoService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Categoría de gasto eliminada');
      }
      
      Logger.info('Categoría de gasto restaurada exitosamente', { 
        categoriaId: id 
      });
      
      return ResponseHelper.success(res, null, 'Categoría de gasto restaurada exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar categoría de gasto', { 
        categoriaId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Buscar categorías por nombre
   */
  static async searchByName(req, res) {
    try {
      const { nombre } = req.query;
      
      if (!nombre || nombre.trim().length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'nombre', message: 'El nombre debe tener al menos 2 caracteres' }
        ]);
      }
      
      const categorias = await CategoriaGastoService.searchByName(nombre.trim());
      
      return ResponseHelper.success(res, categorias);
    } catch (error) {
      Logger.error('Error al buscar categorías por nombre', { 
        nombre: req.query.nombre,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de uso de categorías
   */
  static async getUsageStats(req, res) {
    try {
      const stats = await CategoriaGastoService.getUsageStats();
      
      return ResponseHelper.success(res, stats);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de categorías', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = CategoriaGastoController;

