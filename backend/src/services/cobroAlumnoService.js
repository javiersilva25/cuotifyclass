const { CobroAlumno, Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class CobroAlumnoService {
  /**
   * Crear un nuevo cobro de alumno
   * @param {Object} cobroData - Datos del cobro
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Cobro creado
   */
  static async create(cobroData, userId) {
    const dataWithAudit = {
      ...cobroData,
      ...addCreateAudit(userId)
    };
    
    return await CobroAlumno.create(dataWithAudit);
  }

  /**
   * Obtener todos los cobros de alumnos activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de cobros
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      curso_id,
      search
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (curso_id) {
      whereClause.curso_id = curso_id;
    }

    if (search) {
      whereClause.concepto = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await CobroAlumno.findAndCountAll({
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
      cobrosAlumnos: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un cobro de alumno por ID
   * @param {number} id - ID del cobro
   * @returns {Promise<Object|null>} Cobro encontrado
   */
  static async findById(id) {
    return await CobroAlumno.findByPk(id, {
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
   * Obtener cobros de alumnos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de cobros del curso
   */
  static async findByCurso(cursoId) {
    return await CobroAlumno.findByCurso(cursoId);
  }

  /**
   * Buscar cobros por concepto
   * @param {string} concepto - Concepto a buscar
   * @returns {Promise<Array>} Lista de cobros encontrados
   */
  static async findByConcepto(concepto) {
    return await CobroAlumno.findByConcepto(concepto);
  }

  /**
   * Actualizar un cobro de alumno
   * @param {number} id - ID del cobro
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Cobro actualizado
   */
  static async update(id, updateData, userId) {
    const cobro = await CobroAlumno.findByPk(id);
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
   * Eliminar un cobro de alumno (soft delete)
   * @param {number} id - ID del cobro
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) {
      return false;
    }

    // Verificar si el cobro tiene deudas de compañeros asociadas
    const { DeudaCompanero } = require('../models');
    const deudasCount = await DeudaCompanero.count({
      where: { cobro_alumnos_id: id }
    });

    if (deudasCount > 0) {
      throw new Error('No se puede eliminar el cobro porque tiene deudas de compañeros asociadas');
    }

    await cobro.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un cobro de alumno eliminado
   * @param {number} id - ID del cobro
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const cobro = await CobroAlumno.scope('deleted').findByPk(id);
    if (!cobro) {
      return false;
    }

    await cobro.restore();
    return true;
  }

  /**
   * Calcular total de cobros por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Total de cobros
   */
  static async getTotalByCurso(cursoId) {
    const result = await CobroAlumno.getTotalByCurso(cursoId);
    return result || 0;
  }

  /**
   * Obtener estadísticas de cobros de alumnos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Estadísticas de cobros
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

    const [totalCobros, montoTotal] = await Promise.all([
      CobroAlumno.count({ where: whereClause }),
      CobroAlumno.sum('monto', { where: whereClause })
    ]);

    return {
      total_cobros: totalCobros,
      monto_total: montoTotal || 0
    };
  }

  /**
   * Obtener cobros agrupados por curso
   * @returns {Promise<Array>} Cobros agrupados por curso
   */
  static async getGroupedByCurso() {
    return await CobroAlumno.findAll({
      attributes: [
        'curso_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_cobros'],
        [require('sequelize').fn('SUM', require('sequelize').col('monto')), 'total_monto']
      ],
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        }
      ],
      group: ['curso_id'],
      order: [[require('sequelize').fn('SUM', require('sequelize').col('monto')), 'DESC']]
    });
  }

  /**
   * Crear cobros masivos para un curso
   * @param {number} cursoId - ID del curso
   * @param {Array} cobrosData - Array de datos de cobros
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Array>} Cobros creados
   */
  static async createBulk(cursoId, cobrosData, userId) {
    const cobrosWithAudit = cobrosData.map(cobro => ({
      ...cobro,
      curso_id: cursoId,
      ...addCreateAudit(userId)
    }));

    return await CobroAlumno.bulkCreate(cobrosWithAudit);
  }
}

module.exports = CobroAlumnoService;

