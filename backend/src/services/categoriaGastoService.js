const { CategoriaGasto } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class CategoriaGastoService {
  /**
   * Crear una nueva categoría de gasto
   * @param {Object} categoriaData - Datos de la categoría
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Categoría creada
   */
  static async create(categoriaData, userId) {
    const dataWithAudit = {
      ...categoriaData,
      ...addCreateAudit(userId)
    };
    
    return await CategoriaGasto.create(dataWithAudit);
  }

  /**
   * Obtener todas las categorías activas
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de categorías
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (search) {
      whereClause.nombre_categoria = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await CategoriaGasto.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre_categoria', 'ASC']]
    });

    return {
      categorias: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener todas las categorías activas sin paginación
   * @returns {Promise<Array>} Lista de categorías
   */
  static async findAllActive() {
    return await CategoriaGasto.findAllActive();
  }

  /**
   * Obtener una categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object|null>} Categoría encontrada
   */
  static async findById(id) {
    return await CategoriaGasto.findByPk(id);
  }

  /**
   * Obtener una categoría por nombre
   * @param {string} nombre - Nombre de la categoría
   * @returns {Promise<Object|null>} Categoría encontrada
   */
  static async findByNombre(nombre) {
    return await CategoriaGasto.findByNombre(nombre);
  }

  /**
   * Actualizar una categoría
   * @param {number} id - ID de la categoría
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Categoría actualizada
   */
  static async update(id, updateData, userId) {
    const categoria = await CategoriaGasto.findByPk(id);
    if (!categoria) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await categoria.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Eliminar una categoría (soft delete)
   * @param {number} id - ID de la categoría
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const categoria = await CategoriaGasto.findByPk(id);
    if (!categoria) {
      return false;
    }

    // Verificar si la categoría está siendo usada en gastos
    const { Gasto } = require('../models');
    const gastosCount = await Gasto.count({
      where: { categoria_id: id }
    });

    if (gastosCount > 0) {
      throw new Error('No se puede eliminar la categoría porque está siendo utilizada en gastos');
    }

    await categoria.softDelete(userId);
    return true;
  }

  /**
   * Restaurar una categoría eliminada
   * @param {number} id - ID de la categoría
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const categoria = await CategoriaGasto.scope('deleted').findByPk(id);
    if (!categoria) {
      return false;
    }

    await categoria.restore();
    return true;
  }

  /**
   * Buscar categorías por nombre
   * @param {string} nombre - Nombre a buscar
   * @returns {Promise<Array>} Lista de categorías encontradas
   */
  static async searchByName(nombre) {
    return await CategoriaGasto.findAll({
      where: {
        nombre_categoria: {
          [Op.like]: `%${nombre}%`
        }
      },
      order: [['nombre_categoria', 'ASC']]
    });
  }

  /**
   * Verificar si existe una categoría con el nombre
   * @param {string} nombre - Nombre de la categoría
   * @param {number} excludeId - ID a excluir de la búsqueda
   * @returns {Promise<boolean>} Existe o no
   */
  static async existsByNombre(nombre, excludeId = null) {
    const whereClause = { nombre_categoria: nombre };
    
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await CategoriaGasto.count({
      where: whereClause
    });
    return count > 0;
  }

  /**
   * Obtener estadísticas de uso de categorías
   * @returns {Promise<Array>} Estadísticas por categoría
   */
  static async getUsageStats() {
    const { Gasto } = require('../models');
    
    return await CategoriaGasto.findAll({
      attributes: [
        'id',
        'nombre_categoria',
        [require('sequelize').fn('COUNT', require('sequelize').col('gastos.id')), 'total_gastos'],
        [require('sequelize').fn('SUM', require('sequelize').col('gastos.monto')), 'total_monto']
      ],
      include: [
        {
          model: Gasto,
          as: 'gastos',
          attributes: []
        }
      ],
      group: ['CategoriaGasto.id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('gastos.id')), 'DESC']]
    });
  }
}

module.exports = CategoriaGastoService;

