const { MovimientoCcpp, Curso, Alumno } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class MovimientoCcppService {
  /**
   * Crear un nuevo movimiento CCPP
   * @param {Object} movimientoData - Datos del movimiento
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Movimiento creado
   */
  static async create(movimientoData, userId) {
    const dataWithAudit = {
      ...movimientoData,
      ...addCreateAudit(userId)
    };
    
    return await MovimientoCcpp.create(dataWithAudit);
  }

  /**
   * Obtener todos los movimientos CCPP activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de movimientos
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      curso_id,
      alumno_id,
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

    if (alumno_id) {
      whereClause.alumno_id = alumno_id;
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

    const { count, rows } = await MovimientoCcpp.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        },
        {
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre_completo']
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
   * Obtener un movimiento CCPP por ID
   * @param {number} id - ID del movimiento
   * @returns {Promise<Object|null>} Movimiento encontrado
   */
  static async findById(id) {
    return await MovimientoCcpp.findByPk(id, {
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        },
        {
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre_completo']
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
    return await MovimientoCcpp.findByCurso(cursoId);
  }

  /**
   * Obtener movimientos por alumno
   * @param {number} alumnoId - ID del alumno
   * @returns {Promise<Array>} Lista de movimientos del alumno
   */
  static async findByAlumno(alumnoId) {
    return await MovimientoCcpp.findByAlumno(alumnoId);
  }

  /**
   * Obtener movimientos por curso y alumno
   * @param {number} cursoId - ID del curso
   * @param {number} alumnoId - ID del alumno
   * @returns {Promise<Array>} Lista de movimientos
   */
  static async findByCursoAndAlumno(cursoId, alumnoId) {
    return await MovimientoCcpp.findByCursoAndAlumno(cursoId, alumnoId);
  }

  /**
   * Obtener ingresos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de ingresos del curso
   */
  static async findIngresosByCurso(cursoId) {
    return await MovimientoCcpp.findIngresosByCurso(cursoId);
  }

  /**
   * Obtener gastos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de gastos del curso
   */
  static async findGastosByCurso(cursoId) {
    return await MovimientoCcpp.findGastosByCurso(cursoId);
  }

  /**
   * Obtener movimientos por rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @param {number} cursoId - ID del curso (opcional)
   * @param {number} alumnoId - ID del alumno (opcional)
   * @returns {Promise<Array>} Lista de movimientos en el rango
   */
  static async findByDateRange(fechaInicio, fechaFin, cursoId = null, alumnoId = null) {
    return await MovimientoCcpp.findByDateRange(fechaInicio, fechaFin, cursoId, alumnoId);
  }

  /**
   * Actualizar un movimiento CCPP
   * @param {number} id - ID del movimiento
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Movimiento actualizado
   */
  static async update(id, updateData, userId) {
    const movimiento = await MovimientoCcpp.findByPk(id);
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
   * Eliminar un movimiento CCPP (soft delete)
   * @param {number} id - ID del movimiento
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const movimiento = await MovimientoCcpp.findByPk(id);
    if (!movimiento) {
      return false;
    }

    await movimiento.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un movimiento CCPP eliminado
   * @param {number} id - ID del movimiento
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const movimiento = await MovimientoCcpp.scope('deleted').findByPk(id);
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
    const result = await MovimientoCcpp.getTotalIngresosByCurso(cursoId);
    return result || 0;
  }

  /**
   * Calcular total de gastos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Total de gastos
   */
  static async getTotalGastosByCurso(cursoId) {
    const result = await MovimientoCcpp.getTotalGastosByCurso(cursoId);
    return result || 0;
  }

  /**
   * Calcular total por alumno
   * @param {number} alumnoId - ID del alumno
   * @param {string} tipo - Tipo de movimiento (opcional)
   * @returns {Promise<number>} Total del alumno
   */
  static async getTotalByAlumno(alumnoId, tipo = null) {
    const result = await MovimientoCcpp.getTotalByAlumno(alumnoId, tipo);
    return result || 0;
  }

  /**
   * Calcular balance por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} Balance del curso
   */
  static async getBalanceByCurso(cursoId) {
    return await MovimientoCcpp.getBalanceByCurso(cursoId);
  }

  /**
   * Obtener estadísticas de movimientos CCPP
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de movimientos
   */
  static async getEstadisticas(filters = {}) {
    const whereClause = {};
    
    if (filters.curso_id) {
      whereClause.curso_id = filters.curso_id;
    }

    if (filters.alumno_id) {
      whereClause.alumno_id = filters.alumno_id;
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
      MovimientoCcpp.count({ where: whereClause }),
      MovimientoCcpp.count({ where: { ...whereClause, tipo: 'ingreso' } }),
      MovimientoCcpp.count({ where: { ...whereClause, tipo: 'gasto' } }),
      MovimientoCcpp.sum('monto', { where: { ...whereClause, tipo: 'ingreso' } }),
      MovimientoCcpp.sum('monto', { where: { ...whereClause, tipo: 'gasto' } })
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
   * Obtener movimientos agrupados por alumno
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Movimientos agrupados por alumno
   */
  static async getGroupedByAlumno(cursoId) {
    return await MovimientoCcpp.findAll({
      attributes: [
        'alumno_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('MovimientoCcpp.id')), 'total_movimientos'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN tipo = "ingreso" THEN monto ELSE 0 END')), 'total_ingresos'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN tipo = "gasto" THEN monto ELSE 0 END')), 'total_gastos']
      ],
      include: [
        {
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre_completo']
        }
      ],
      where: { curso_id: cursoId },
      group: ['alumno_id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('MovimientoCcpp.id')), 'DESC']]
    });
  }

  /**
   * Obtener movimientos agrupados por mes
   * @param {number} ano - Año para agrupar
   * @param {number} cursoId - ID del curso (opcional)
   * @param {number} alumnoId - ID del alumno (opcional)
   * @returns {Promise<Array>} Movimientos agrupados por mes
   */
  static async getGroupedByMonth(ano, cursoId = null, alumnoId = null) {
    const whereClause = {
      fecha_creacion: {
        [Op.between]: [`${ano}-01-01`, `${ano}-12-31`]
      }
    };

    if (cursoId) {
      whereClause.curso_id = cursoId;
    }

    if (alumnoId) {
      whereClause.alumno_id = alumnoId;
    }

    return await MovimientoCcpp.findAll({
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
    return await MovimientoCcpp.findAll({
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
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre_completo']
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

    return await MovimientoCcpp.bulkCreate(movimientosWithAudit);
  }
}

module.exports = MovimientoCcppService;

