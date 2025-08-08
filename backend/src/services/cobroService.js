const { Cobro, Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class CobroService {
  /**
   * Crear un nuevo cobro
   * @param {Object} cobroData - Datos del cobro
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Cobro creado
   */
  static async create(cobroData, userId) {
    const dataWithAudit = {
      ...cobroData,
      ...addCreateAudit(userId)
    };
    
    return await Cobro.create(dataWithAudit);
  }

  /**
   * Obtener todos los cobros activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de cobros
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      curso_id,
      fecha_desde,
      fecha_hasta,
      vencidos_only = false
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (curso_id) {
      whereClause.curso_id = curso_id;
    }

    if (fecha_desde && fecha_hasta) {
      whereClause.fecha_vencimiento = {
        [Op.between]: [fecha_desde, fecha_hasta]
      };
    }

    if (vencidos_only) {
      whereClause.fecha_vencimiento = {
        [Op.lt]: new Date()
      };
    }

    const { count, rows } = await Cobro.findAndCountAll({
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
      order: [['fecha_vencimiento', 'ASC']]
    });

    return {
      cobros: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un cobro por ID
   * @param {number} id - ID del cobro
   * @returns {Promise<Object|null>} Cobro encontrado
   */
  static async findById(id) {
    return await Cobro.findByPk(id, {
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
   * Obtener cobros por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de cobros del curso
   */
  static async findByCurso(cursoId) {
    return await Cobro.findByCurso(cursoId);
  }

  /**
   * Obtener cobros vencidos
   * @returns {Promise<Array>} Lista de cobros vencidos
   */
  static async findVencidos() {
    return await Cobro.findVencidos();
  }

  /**
   * Obtener cobros por rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @returns {Promise<Array>} Lista de cobros en el rango
   */
  static async findByDateRange(fechaInicio, fechaFin) {
    return await Cobro.findByDateRange(fechaInicio, fechaFin);
  }

  /**
   * Actualizar un cobro
   * @param {number} id - ID del cobro
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Cobro actualizado
   */
  static async update(id, updateData, userId) {
    const cobro = await Cobro.findByPk(id);
    if (!cobro) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await cobro.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Eliminar un cobro (soft delete)
   * @param {number} id - ID del cobro
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const cobro = await Cobro.findByPk(id);
    if (!cobro) {
      return false;
    }

    // Verificar si el cobro tiene deudas asociadas
    const { DeudaAlumno } = require('../models');
    const deudasCount = await DeudaAlumno.count({
      where: { cobro_id: id }
    });

    if (deudasCount > 0) {
      throw new Error('No se puede eliminar el cobro porque tiene deudas asociadas');
    }

    await cobro.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un cobro eliminado
   * @param {number} id - ID del cobro
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const cobro = await Cobro.scope('deleted').findByPk(id);
    if (!cobro) {
      return false;
    }

    await cobro.restore();
    return true;
  }

  /**
   * Obtener cobros próximos a vencer
   * @param {number} dias - Días de anticipación
   * @returns {Promise<Array>} Lista de cobros próximos a vencer
   */
  static async findProximosAVencer(dias = 7) {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    return await Cobro.findAll({
      where: {
        fecha_vencimiento: {
          [Op.between]: [new Date(), fechaLimite]
        }
      },
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        }
      ],
      order: [['fecha_vencimiento', 'ASC']]
    });
  }

  /**
   * Calcular total de cobros por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Total de cobros
   */
  static async getTotalByCurso(cursoId) {
    const result = await Cobro.sum('monto_total', {
      where: { curso_id: cursoId }
    });
    return result || 0;
  }

  /**
   * Obtener estadísticas de cobros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de cobros
   */
  static async getEstadisticas(filters = {}) {
    const whereClause = {};
    
    if (filters.curso_id) {
      whereClause.curso_id = filters.curso_id;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereClause.fecha_vencimiento = {
        [Op.between]: [filters.fecha_desde, filters.fecha_hasta]
      };
    }

    const [total, vencidos, proximosAVencer] = await Promise.all([
      Cobro.count({ where: whereClause }),
      Cobro.count({
        where: {
          ...whereClause,
          fecha_vencimiento: { [Op.lt]: new Date() }
        }
      }),
      Cobro.count({
        where: {
          ...whereClause,
          fecha_vencimiento: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          }
        }
      })
    ]);

    const montoTotal = await Cobro.sum('monto_total', { where: whereClause }) || 0;

    return {
      total_cobros: total,
      cobros_vencidos: vencidos,
      cobros_proximos_vencer: proximosAVencer,
      monto_total: montoTotal
    };
  }
}

module.exports = CobroService;

