const { DeudaAlumno, Alumno, Cobro, Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class DeudaAlumnoService {
  /**
   * Crear una nueva deuda de alumno
   * @param {Object} deudaData - Datos de la deuda
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Deuda creada
   */
  static async create(deudaData, userId) {
    const dataWithAudit = {
      ...deudaData,
      ...addCreateAudit(userId)
    };
    
    return await DeudaAlumno.create(dataWithAudit);
  }

  /**
   * Obtener todas las deudas activas
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de deudas
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      alumno_id,
      cobro_id,
      estado,
      curso_id
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const includeClause = [
      {
        model: Alumno,
        as: 'alumno',
        attributes: ['id', 'nombre_completo'],
        include: [
          {
            model: Curso,
            as: 'curso',
            attributes: ['id', 'nombre_curso']
          }
        ]
      },
      {
        model: Cobro,
        as: 'cobro',
        attributes: ['id', 'concepto', 'monto_total', 'fecha_vencimiento']
      }
    ];

    if (alumno_id) {
      whereClause.alumno_id = alumno_id;
    }

    if (cobro_id) {
      whereClause.cobro_id = cobro_id;
    }

    if (estado) {
      whereClause.estado = estado;
    }

    // Filtrar por curso a través del alumno
    if (curso_id) {
      includeClause[0].where = { curso_id };
    }

    const { count, rows } = await DeudaAlumno.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_creacion', 'DESC']]
    });

    return {
      deudas: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener una deuda por ID
   * @param {number} id - ID de la deuda
   * @returns {Promise<Object|null>} Deuda encontrada
   */
  static async findById(id) {
    return await DeudaAlumno.findByPk(id, {
      include: [
        {
          model: Alumno,
          as: 'alumno',
          attributes: ['id', 'nombre_completo'],
          include: [
            {
              model: Curso,
              as: 'curso',
              attributes: ['id', 'nombre_curso']
            }
          ]
        },
        {
          model: Cobro,
          as: 'cobro',
          attributes: ['id', 'concepto', 'monto_total', 'fecha_vencimiento']
        }
      ]
    });
  }

  /**
   * Obtener deudas por alumno
   * @param {number} alumnoId - ID del alumno
   * @returns {Promise<Array>} Lista de deudas del alumno
   */
  static async findByAlumno(alumnoId) {
    return await DeudaAlumno.findByAlumno(alumnoId);
  }

  /**
   * Obtener deudas pendientes por alumno
   * @param {number} alumnoId - ID del alumno
   * @returns {Promise<Array>} Lista de deudas pendientes
   */
  static async findPendientesByAlumno(alumnoId) {
    return await DeudaAlumno.findPendientesByAlumno(alumnoId);
  }

  /**
   * Obtener deudas por cobro
   * @param {number} cobroId - ID del cobro
   * @returns {Promise<Array>} Lista de deudas del cobro
   */
  static async findByCobro(cobroId) {
    return await DeudaAlumno.findByCobro(cobroId);
  }

  /**
   * Actualizar una deuda
   * @param {number} id - ID de la deuda
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Deuda actualizada
   */
  static async update(id, updateData, userId) {
    const deuda = await DeudaAlumno.findByPk(id);
    if (!deuda) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await deuda.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Marcar deuda como pagada
   * @param {number} id - ID de la deuda
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Deuda actualizada
   */
  static async marcarPagado(id, userId) {
    const deuda = await DeudaAlumno.findByPk(id);
    if (!deuda) {
      return null;
    }

    await deuda.marcarPagado(userId);
    return await this.findById(id);
  }

  /**
   * Marcar deuda como parcialmente pagada
   * @param {number} id - ID de la deuda
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Deuda actualizada
   */
  static async marcarParcial(id, userId) {
    const deuda = await DeudaAlumno.findByPk(id);
    if (!deuda) {
      return null;
    }

    await deuda.marcarParcial(userId);
    return await this.findById(id);
  }

  /**
   * Anular una deuda
   * @param {number} id - ID de la deuda
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Deuda actualizada
   */
  static async anular(id, userId) {
    const deuda = await DeudaAlumno.findByPk(id);
    if (!deuda) {
      return null;
    }

    await deuda.anular(userId);
    return await this.findById(id);
  }

  /**
   * Eliminar una deuda (soft delete)
   * @param {number} id - ID de la deuda
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const deuda = await DeudaAlumno.findByPk(id);
    if (!deuda) {
      return false;
    }

    await deuda.softDelete(userId);
    return true;
  }

  /**
   * Restaurar una deuda eliminada
   * @param {number} id - ID de la deuda
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const deuda = await DeudaAlumno.scope('deleted').findByPk(id);
    if (!deuda) {
      return false;
    }

    await deuda.restore();
    return true;
  }

  /**
   * Calcular total adeudado por alumno
   * @param {number} alumnoId - ID del alumno
   * @returns {Promise<number>} Total adeudado
   */
  static async getTotalAdeudadoByAlumno(alumnoId) {
    const result = await DeudaAlumno.getTotalAdeudadoByAlumno(alumnoId);
    return result || 0;
  }

  /**
   * Obtener estadísticas de deudas
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de deudas
   */
  static async getEstadisticas(filters = {}) {
    const whereClause = {};
    
    if (filters.alumno_id) {
      whereClause.alumno_id = filters.alumno_id;
    }

    if (filters.cobro_id) {
      whereClause.cobro_id = filters.cobro_id;
    }

    const [
      totalDeudas,
      deudasPendientes,
      deudasPagadas,
      deudasParciales,
      deudasAnuladas,
      montoTotalAdeudado
    ] = await Promise.all([
      DeudaAlumno.count({ where: whereClause }),
      DeudaAlumno.count({ where: { ...whereClause, estado: 'pendiente' } }),
      DeudaAlumno.count({ where: { ...whereClause, estado: 'pagado' } }),
      DeudaAlumno.count({ where: { ...whereClause, estado: 'parcialmente_pagado' } }),
      DeudaAlumno.count({ where: { ...whereClause, estado: 'anulado' } }),
      DeudaAlumno.sum('monto_adeudado', {
        where: {
          ...whereClause,
          estado: { [Op.in]: ['pendiente', 'parcialmente_pagado'] }
        }
      })
    ]);

    return {
      total_deudas: totalDeudas,
      deudas_pendientes: deudasPendientes,
      deudas_pagadas: deudasPagadas,
      deudas_parciales: deudasParciales,
      deudas_anuladas: deudasAnuladas,
      monto_total_adeudado: montoTotalAdeudado || 0
    };
  }

  /**
   * Crear deudas masivas para un cobro
   * @param {number} cobroId - ID del cobro
   * @param {Array} alumnosIds - Array de IDs de alumnos
   * @param {number} montoAdeudado - Monto adeudado por cada alumno
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Array>} Deudas creadas
   */
  static async createBulkForCobro(cobroId, alumnosIds, montoAdeudado, userId) {
    const deudasData = alumnosIds.map(alumnoId => ({
      alumno_id: alumnoId,
      cobro_id: cobroId,
      monto_adeudado: montoAdeudado,
      estado: 'pendiente',
      ...addCreateAudit(userId)
    }));

    return await DeudaAlumno.bulkCreate(deudasData);
  }

  /**
   * Obtener resumen de deudas por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} Resumen de deudas del curso
   */
  static async getResumenByCurso(cursoId) {
    const deudas = await DeudaAlumno.findAll({
      include: [
        {
          model: Alumno,
          as: 'alumno',
          where: { curso_id: cursoId },
          attributes: ['id', 'nombre_completo']
        },
        {
          model: Cobro,
          as: 'cobro',
          attributes: ['id', 'concepto']
        }
      ]
    });

    const resumen = {
      total_deudas: deudas.length,
      pendientes: deudas.filter(d => d.estado === 'pendiente').length,
      pagadas: deudas.filter(d => d.estado === 'pagado').length,
      parciales: deudas.filter(d => d.estado === 'parcialmente_pagado').length,
      anuladas: deudas.filter(d => d.estado === 'anulado').length,
      monto_total: deudas
        .filter(d => ['pendiente', 'parcialmente_pagado'].includes(d.estado))
        .reduce((sum, d) => sum + parseFloat(d.monto_adeudado), 0)
    };

    return resumen;
  }
}

module.exports = DeudaAlumnoService;

