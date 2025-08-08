const { DeudaCompanero, Alumno, CobroAlumno, Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class DeudaCompaneroService {
  /**
   * Crear una nueva deuda de compañero
   * @param {Object} deudaData - Datos de la deuda
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Deuda creada
   */
  static async create(deudaData, userId) {
    const dataWithAudit = {
      ...deudaData,
      ...addCreateAudit(userId)
    };
    
    return await DeudaCompanero.create(dataWithAudit);
  }

  /**
   * Obtener todas las deudas de compañeros activas
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de deudas
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      alumno_id,
      cobro_alumnos_id,
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
        model: CobroAlumno,
        as: 'cobroAlumno',
        attributes: ['id', 'concepto', 'monto']
      }
    ];

    if (alumno_id) {
      whereClause.alumno_id = alumno_id;
    }

    if (cobro_alumnos_id) {
      whereClause.cobro_alumnos_id = cobro_alumnos_id;
    }

    if (estado) {
      whereClause.estado = estado;
    }

    // Filtrar por curso a través del alumno
    if (curso_id) {
      includeClause[0].where = { curso_id };
    }

    const { count, rows } = await DeudaCompanero.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_creacion', 'DESC']]
    });

    return {
      deudasCompaneros: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener una deuda de compañero por ID
   * @param {number} id - ID de la deuda
   * @returns {Promise<Object|null>} Deuda encontrada
   */
  static async findById(id) {
    return await DeudaCompanero.findByPk(id, {
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
          model: CobroAlumno,
          as: 'cobroAlumno',
          attributes: ['id', 'concepto', 'monto']
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
    return await DeudaCompanero.findByAlumno(alumnoId);
  }

  /**
   * Obtener deudas pendientes por alumno
   * @param {number} alumnoId - ID del alumno
   * @returns {Promise<Array>} Lista de deudas pendientes
   */
  static async findPendientesByAlumno(alumnoId) {
    return await DeudaCompanero.findPendientesByAlumno(alumnoId);
  }

  /**
   * Obtener deudas por cobro de alumnos
   * @param {number} cobroAlumnosId - ID del cobro de alumnos
   * @returns {Promise<Array>} Lista de deudas del cobro
   */
  static async findByCobroAlumnos(cobroAlumnosId) {
    return await DeudaCompanero.findByCobroAlumnos(cobroAlumnosId);
  }

  /**
   * Actualizar una deuda de compañero
   * @param {number} id - ID de la deuda
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Deuda actualizada
   */
  static async update(id, updateData, userId) {
    const deuda = await DeudaCompanero.findByPk(id);
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
    const deuda = await DeudaCompanero.findByPk(id);
    if (!deuda) {
      return null;
    }

    await deuda.marcarPagado(userId);
    return await this.findById(id);
  }

  /**
   * Eliminar una deuda de compañero (soft delete)
   * @param {number} id - ID de la deuda
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const deuda = await DeudaCompanero.findByPk(id);
    if (!deuda) {
      return false;
    }

    await deuda.softDelete(userId);
    return true;
  }

  /**
   * Restaurar una deuda de compañero eliminada
   * @param {number} id - ID de la deuda
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const deuda = await DeudaCompanero.scope('deleted').findByPk(id);
    if (!deuda) {
      return false;
    }

    await deuda.restore();
    return true;
  }

  /**
   * Contar deudas pendientes por cobro de alumnos
   * @param {number} cobroAlumnosId - ID del cobro de alumnos
   * @returns {Promise<number>} Cantidad de deudas pendientes
   */
  static async countPendientesByCobroAlumnos(cobroAlumnosId) {
    return await DeudaCompanero.countPendientesByCobroAlumnos(cobroAlumnosId);
  }

  /**
   * Contar deudas pagadas por cobro de alumnos
   * @param {number} cobroAlumnosId - ID del cobro de alumnos
   * @returns {Promise<number>} Cantidad de deudas pagadas
   */
  static async countPagadasByCobroAlumnos(cobroAlumnosId) {
    return await DeudaCompanero.countPagadasByCobroAlumnos(cobroAlumnosId);
  }

  /**
   * Obtener estadísticas de deudas de compañeros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de deudas
   */
  static async getEstadisticas(filters = {}) {
    const whereClause = {};
    
    if (filters.alumno_id) {
      whereClause.alumno_id = filters.alumno_id;
    }

    if (filters.cobro_alumnos_id) {
      whereClause.cobro_alumnos_id = filters.cobro_alumnos_id;
    }

    const [
      totalDeudas,
      deudasPendientes,
      deudasPagadas
    ] = await Promise.all([
      DeudaCompanero.count({ where: whereClause }),
      DeudaCompanero.count({ where: { ...whereClause, estado: 'pendiente' } }),
      DeudaCompanero.count({ where: { ...whereClause, estado: 'pagado' } })
    ]);

    return {
      total_deudas: totalDeudas,
      deudas_pendientes: deudasPendientes,
      deudas_pagadas: deudasPagadas,
      porcentaje_pagadas: totalDeudas > 0 ? (deudasPagadas / totalDeudas * 100).toFixed(2) : 0
    };
  }

  /**
   * Crear deudas masivas para un cobro de alumnos
   * @param {number} cobroAlumnosId - ID del cobro de alumnos
   * @param {Array} alumnosIds - Array de IDs de alumnos
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Array>} Deudas creadas
   */
  static async createBulkForCobroAlumnos(cobroAlumnosId, alumnosIds, userId) {
    const deudasData = alumnosIds.map(alumnoId => ({
      alumno_id: alumnoId,
      cobro_alumnos_id: cobroAlumnosId,
      estado: 'pendiente',
      ...addCreateAudit(userId)
    }));

    return await DeudaCompanero.bulkCreate(deudasData);
  }

  /**
   * Obtener resumen de deudas por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} Resumen de deudas del curso
   */
  static async getResumenByCurso(cursoId) {
    const deudas = await DeudaCompanero.findAll({
      include: [
        {
          model: Alumno,
          as: 'alumno',
          where: { curso_id: cursoId },
          attributes: ['id', 'nombre_completo']
        },
        {
          model: CobroAlumno,
          as: 'cobroAlumno',
          attributes: ['id', 'concepto', 'monto']
        }
      ]
    });

    const resumen = {
      total_deudas: deudas.length,
      pendientes: deudas.filter(d => d.estado === 'pendiente').length,
      pagadas: deudas.filter(d => d.estado === 'pagado').length,
      porcentaje_pagadas: deudas.length > 0 ? 
        (deudas.filter(d => d.estado === 'pagado').length / deudas.length * 100).toFixed(2) : 0
    };

    return resumen;
  }

  /**
   * Marcar múltiples deudas como pagadas
   * @param {Array} ids - Array de IDs de deudas
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<number>} Cantidad de deudas actualizadas
   */
  static async marcarMultiplesPagadas(ids, userId) {
    const [updatedCount] = await DeudaCompanero.update(
      {
        estado: 'pagado',
        ...addUpdateAudit(userId)
      },
      {
        where: {
          id: { [Op.in]: ids },
          estado: 'pendiente'
        }
      }
    );

    return updatedCount;
  }

  /**
   * Obtener deudas agrupadas por cobro de alumnos
   * @param {number} cursoId - ID del curso (opcional)
   * @returns {Promise<Array>} Deudas agrupadas
   */
  static async getGroupedByCobroAlumnos(cursoId = null) {
    const includeClause = [
      {
        model: CobroAlumno,
        as: 'cobroAlumno',
        attributes: ['id', 'concepto', 'monto', 'curso_id']
      }
    ];

    if (cursoId) {
      includeClause[0].where = { curso_id: cursoId };
    }

    return await DeudaCompanero.findAll({
      attributes: [
        'cobro_alumnos_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('DeudaCompanero.id')), 'total_deudas'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN estado = "pagado" THEN 1 ELSE 0 END')), 'deudas_pagadas'],
        [require('sequelize').fn('SUM', require('sequelize').literal('CASE WHEN estado = "pendiente" THEN 1 ELSE 0 END')), 'deudas_pendientes']
      ],
      include: includeClause,
      group: ['cobro_alumnos_id'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('DeudaCompanero.id')), 'DESC']]
    });
  }
}

module.exports = DeudaCompaneroService;

