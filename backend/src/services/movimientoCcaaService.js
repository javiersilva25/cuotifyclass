const { MovimientoCcaa, Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class MovimientoCcaaService {
  /**
   * Crear un nuevo movimiento CCAA
   * @param {Object} movimientoData - Datos del movimiento
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Movimiento creado
   */
  static async create(movimientoData, userId) {
    const dataWithAudit = {
      ...movimientoData,
      ...addCreateAudit(userId)
    };
    
    return await MovimientoCcaa.create(dataWithAudit);
  }

  /**
   * Obtener todos los movimientos CCAA activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de movimientos
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      curso_id,
      tipo,
      fecha_desde,
      fecha_hasta,
      search
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (curso_id) {
      whereClause.curso_id = curso_id;
    }

    if (tipo) {
      whereClause.tipo = tipo;
    }

    if (fecha_desde && fecha_hasta) {
      whereClause.fecha_creacion = {
        [Op.between]: [fecha_desde, fecha_hasta]
      };
    }

    if (search) {
      whereClause.concepto = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await MovimientoCcaa.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_creacion', 'DESC']]
    });

    return {
      movimientos: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un movimiento CCAA por ID
   * @param {number} id - ID del movimiento
   * @returns {Promise<Object|null>} Movimiento encontrado
   */
  static async findById(id) {
    return await MovimientoCcaa.findByPk(id, {
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        }
      ]
    });
  }

  /**
   * Obtener movimientos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de movimientos del curso
   */
  static async findByCurso(cursoId) {
    return await MovimientoCcaa.findByCurso(cursoId);
  }

  /**
   * Obtener ingresos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de ingresos del curso
   */
  static async findIngresosByCurso(cursoId) {
    return await MovimientoCcaa.findIngresosByCurso(cursoId);
  }

  /**
   * Obtener gastos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de gastos del curso
   */
  static async findGastosByCurso(cursoId) {
    return await MovimientoCcaa.findGastosByCurso(cursoId);
  }

  /**
   * Obtener movimientos por rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @param {number} cursoId - ID del curso (opcional)
   * @returns {Promise<Array>} Lista de movimientos en el rango
   */
  static async findByDateRange(fechaInicio, fechaFin, cursoId = null) {
    return await MovimientoCcaa.findByDateRange(fechaInicio, fechaFin, cursoId);
  }

  /**
   * Actualizar un movimiento CCAA
   * @param {number} id - ID del movimiento
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Movimiento actualizado
   */
  static async update(id, updateData, userId) {
    const movimiento = await MovimientoCcaa.findByPk(id);
    if (!movimiento) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await movimiento.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Eliminar un movimiento CCAA (soft delete)
   * @param {number} id - ID del movimiento
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const movimiento = await MovimientoCcaa.findByPk(id);
    if (!movimiento) {
      return false;
    }

    await movimiento.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un movimiento CCAA eliminado
   * @param {number} id - ID del movimiento
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const movimiento = await MovimientoCcaa.scope('deleted').findByPk(id);
    if (!movimiento) {
      return false;
    }

    await movimiento.restore();
    return true;
  }

  /**
   * Calcular total de ingresos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Total de ingresos
   */
  static async getTotalIngresosByCurso(cursoId) {
    const result = await MovimientoCcaa.getTotalIngresosByCurso(cursoId);
    return result || 0;
  }

  /**
   * Calcular total de gastos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Total de gastos
   */
  static async getTotalGastosByCurso(cursoId) {
    const result = await MovimientoCcaa.getTotalGastosByCurso(cursoId);
    return result || 0;
  }

  /**
   * Calcular balance por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} Balance del curso
   */
  static async getBalanceByCurso(cursoId) {
    return await MovimientoCcaa.getBalanceByCurso(cursoId);
  }

  /**
   * Obtener estadísticas de movimientos CCAA
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de movimientos
   */
  static async getEstadisticas(filters = {}) {
    const whereClause = {};
    
    if (filters.curso_id) {
      whereClause.curso_id = filters.curso_id;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereClause.fecha_creacion = {
        [Op.between]: [filters.fecha_desde, filters.fecha_hasta]
      };
    }

    const [
      totalMovimientos,
      totalIngresos,
      totalGastos,
      montoTotalIngresos,
      montoTotalGastos
    ] = await Promise.all([
      MovimientoCcaa.count({ where: whereClause }),
      MovimientoCcaa.count({ where: { ...whereClause, tipo: 'ingreso' } }),
      MovimientoCcaa.count({ where: { ...whereClause, tipo: 'gasto' } }),
      MovimientoCcaa.sum('monto', { where: { ...whereClause, tipo: 'ingreso' } }),
      MovimientoCcaa.sum('monto', { where: { ...whereClause, tipo: 'gasto' } })
    ]);

    const montoIngresos = montoTotalIngresos || 0;
    const montoGastos = montoTotalGastos || 0;

    return {
      total_movimientos: totalMovimientos,
      total_ingresos: totalIngresos,
      total_gastos: totalGastos,
      monto_total_ingresos: montoIngresos,
      monto_total_gastos: montoGastos,
      balance: montoIngresos - montoGastos
    };
  }

  /**
   * Obtener movimientos agrupados por tipo
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Movimientos agrupados por tipo
   */
  static async getGroupedByTipo(filters = {}) {
    const whereClause = {};
    
    if (filters.curso_id) {
      whereClause.curso_id = filters.curso_id;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereClause.fecha_creacion = {
        [Op.between]: [filters.fecha_desde, filters.fecha_hasta]
      };
    }

    return await MovimientoCcaa.findAll({
      attributes: [
        'tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_movimientos'],
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total_monto']
      ],
      where: whereClause,
      group: ['tipo'],
      order: [['tipo', 'ASC']]
    });
  }

  /**
   * Obtener movimientos agrupados por mes
   * @param {number} ano - Año para agrupar
   * @param {number} cursoId - ID del curso (opcional)
   * @returns {Promise<Array>} Movimientos agrupados por mes
   */
  static async getGroupedByMonth(ano, cursoId = null) {
    const whereClause = {
      fecha_creacion: {
        [Op.between]: [`${ano}-01-01`, `${ano}-12-31`]
      }
    };

    if (cursoId) {
      whereClause.curso_id = cursoId;
    }

    return await MovimientoCcaa.findAll({
      attributes: [
        [require('sequelize').fn('MONTH', require('sequelize').col('fecha_creacion')), 'mes'],
        'tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_movimientos'],
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total_monto']
      ],
      where: whereClause,
      group: [
        require('sequelize').fn('MONTH', require('sequelize').col('fecha_creacion')),
        'tipo'
      ],
      order: [
        [require('sequelize').fn('MONTH', require('sequelize').col('fecha_creacion')), 'ASC'],
        ['tipo', 'ASC']
      ]
    });
  }

  /**
   * Buscar movimientos por concepto
   * @param {string} concepto - Concepto a buscar
   * @returns {Promise<Array>} Lista de movimientos encontrados
   */
  static async searchByConcepto(concepto) {
    return await MovimientoCcaa.findAll({
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
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
  }

  /**
   * Crear movimientos masivos
   * @param {Array} movimientosData - Array de datos de movimientos
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Array>} Movimientos creados
   */
  static async createBulk(movimientosData, userId) {
    const movimientosWithAudit = movimientosData.map(movimiento => ({
      ...movimiento,
      ...addCreateAudit(userId)
    }));

    return await MovimientoCcaa.bulkCreate(movimientosWithAudit);
  }
}

module.exports = MovimientoCcaaService;

