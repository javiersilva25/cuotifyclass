const { Gasto, Curso, CategoriaGasto } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class GastoService {
  /**
   * Crear un nuevo gasto
   * @param {Object} gastoData - Datos del gasto
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Gasto creado
   */
  static async create(gastoData, userId) {
    const dataWithAudit = {
      ...gastoData,
      ...addCreateAudit(userId)
    };
    
    return await Gasto.create(dataWithAudit);
  }

  /**
   * Obtener todos los gastos activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de gastos
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      curso_id,
      categoria_id,
      fecha_desde,
      fecha_hasta,
      search,
      con_boleta
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (curso_id) {
      whereClause.curso_id = curso_id;
    }

    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }

    if (fecha_desde && fecha_hasta) {
      whereClause.fecha_gasto = {
        [Op.between]: [fecha_desde, fecha_hasta]
      };
    }

    if (search) {
      whereClause.concepto = {
        [Op.like]: `%${search}%`
      };
    }

    if (con_boleta !== undefined) {
      if (con_boleta) {
        whereClause.boleta_url = { [Op.ne]: null };
      } else {
        whereClause.boleta_url = null;
      }
    }

    const { count, rows } = await Gasto.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        },
        {
          model: CategoriaGasto,
          as: 'categoria',
          attributes: ['id', 'nombre_categoria']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_gasto', 'DESC']]
    });

    return {
      gastos: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un gasto por ID
   * @param {number} id - ID del gasto
   * @returns {Promise<Object|null>} Gasto encontrado
   */
  static async findById(id) {
    return await Gasto.findByPk(id, {
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        },
        {
          model: CategoriaGasto,
          as: 'categoria',
          attributes: ['id', 'nombre_categoria']
        }
      ]
    });
  }

  /**
   * Obtener gastos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de gastos del curso
   */
  static async findByCurso(cursoId) {
    return await Gasto.findByCurso(cursoId);
  }

  /**
   * Obtener gastos por categoría
   * @param {number} categoriaId - ID de la categoría
   * @returns {Promise<Array>} Lista de gastos de la categoría
   */
  static async findByCategoria(categoriaId) {
    return await Gasto.findByCategoria(categoriaId);
  }

  /**
   * Obtener gastos por rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @param {number} cursoId - ID del curso (opcional)
   * @returns {Promise<Array>} Lista de gastos en el rango
   */
  static async findByDateRange(fechaInicio, fechaFin, cursoId = null) {
    return await Gasto.findByDateRange(fechaInicio, fechaFin, cursoId);
  }

  /**
   * Obtener gastos con boleta
   * @returns {Promise<Array>} Lista de gastos con boleta
   */
  static async findWithBoleta() {
    return await Gasto.findWithBoleta();
  }

  /**
   * Obtener gastos sin boleta
   * @returns {Promise<Array>} Lista de gastos sin boleta
   */
  static async findWithoutBoleta() {
    return await Gasto.findWithoutBoleta();
  }

  /**
   * Actualizar un gasto
   * @param {number} id - ID del gasto
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Gasto actualizado
   */
  static async update(id, updateData, userId) {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await gasto.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Eliminar un gasto (soft delete)
   * @param {number} id - ID del gasto
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return false;
    }

    await gasto.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un gasto eliminado
   * @param {number} id - ID del gasto
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const gasto = await Gasto.scope('deleted').findByPk(id);
    if (!gasto) {
      return false;
    }

    await gasto.restore();
    return true;
  }

  /**
   * Calcular total de gastos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Total de gastos
   */
  static async getTotalByCurso(cursoId) {
    const result = await Gasto.getTotalByCurso(cursoId);
    return result || 0;
  }

  /**
   * Calcular total de gastos por categoría
   * @param {number} categoriaId - ID de la categoría
   * @returns {Promise<number>} Total de gastos
   */
  static async getTotalByCategoria(categoriaId) {
    const result = await Gasto.getTotalByCategoria(categoriaId);
    return result || 0;
  }

  /**
   * Obtener estadísticas de gastos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de gastos
   */
  static async getEstadisticas(filters = {}) {
    const whereClause = {};
    
    if (filters.curso_id) {
      whereClause.curso_id = filters.curso_id;
    }

    if (filters.categoria_id) {
      whereClause.categoria_id = filters.categoria_id;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereClause.fecha_gasto = {
        [Op.between]: [filters.fecha_desde, filters.fecha_hasta]
      };
    }

    const [
      totalGastos,
      gastosConBoleta,
      gastosSinBoleta,
      montoTotal
    ] = await Promise.all([
      Gasto.count({ where: whereClause }),
      Gasto.count({
        where: {
          ...whereClause,
          boleta_url: { [Op.ne]: null }
        }
      }),
      Gasto.count({
        where: {
          ...whereClause,
          boleta_url: null
        }
      }),
      Gasto.sum('monto', { where: whereClause })
    ]);

    return {
      total_gastos: totalGastos,
      gastos_con_boleta: gastosConBoleta,
      gastos_sin_boleta: gastosSinBoleta,
      monto_total: montoTotal || 0,
      porcentaje_con_boleta: totalGastos > 0 ? (gastosConBoleta / totalGastos * 100).toFixed(2) : 0
    };
  }

  /**
   * Obtener gastos agrupados por categoría
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Gastos agrupados por categoría
   */
  static async getGroupedByCategoria(filters = {}) {
    const whereClause = {};
    
    if (filters.curso_id) {
      whereClause.curso_id = filters.curso_id;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereClause.fecha_gasto = {
        [Op.between]: [filters.fecha_desde, filters.fecha_hasta]
      };
    }

    return await Gasto.findAll({
      attributes: [
        'categoria_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('Gasto.id')), 'total_gastos'],
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total_monto']
      ],
      include: [
        {
          model: CategoriaGasto,
          as: 'categoria',
          attributes: ['id', 'nombre_categoria']
        }
      ],
      where: whereClause,
      group: ['categoria_id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('monto')), 'DESC']]
    });
  }

  /**
   * Obtener gastos agrupados por mes
   * @param {number} ano - Año para agrupar
   * @param {number} cursoId - ID del curso (opcional)
   * @returns {Promise<Array>} Gastos agrupados por mes
   */
  static async getGroupedByMonth(ano, cursoId = null) {
    const whereClause = {
      fecha_gasto: {
        [Op.between]: [`${ano}-01-01`, `${ano}-12-31`]
      }
    };

    if (cursoId) {
      whereClause.curso_id = cursoId;
    }

    return await Gasto.findAll({
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('fecha_gasto')), 'mes'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_gastos'],
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total_monto']
      ],
      where: whereClause,
      group: [require('sequelize').fn('MONTH', require('sequelize').col('fecha_gasto'))],
      order: [[require('sequelize').fn('MONTH', require('sequelize').col('fecha_gasto')), 'ASC']]
    });
  }

  /**
   * Buscar gastos por concepto
   * @param {string} concepto - Concepto a buscar
   * @returns {Promise<Array>} Lista de gastos encontrados
   */
  static async searchByConcepto(concepto) {
    return await Gasto.findAll({
      where: {
        concepto: {
          [Op.like]: `%${concepto}%`
        }
      },
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso']
        },
        {
          model: CategoriaGasto,
          as: 'categoria',
          attributes: ['id', 'nombre_categoria']
        }
      ],
      order: [['fecha_gasto', 'DESC']]
    });
  }
}

module.exports = GastoService;

