const { Alumno, Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class AlumnoService {
  /**
   * Crear un nuevo alumno
   * @param {Object} alumnoData - Datos del alumno
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Alumno creado
   */
  static async create(alumnoData, userId) {
    const dataWithAudit = {
      ...alumnoData,
      ...addCreateAudit(userId)
    };
    
    return await Alumno.create(dataWithAudit);
  }

  /**
   * Obtener todos los alumnos activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de alumnos
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      curso_id,
      apoderado_id,
      search
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (curso_id) {
      whereClause.curso_id = curso_id;
    }

    if (apoderado_id) {
      whereClause.apoderado_id = apoderado_id;
    }

    if (search) {
      whereClause.nombre_completo = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await Alumno.findAndCountAll({
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
      order: [['nombre_completo', 'ASC']]
    });

    return {
      alumnos: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un alumno por ID
   * @param {number} id - ID del alumno
   * @returns {Promise<Object|null>} Alumno encontrado
   */
  static async findById(id) {
    return await Alumno.findByPk(id, {
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
   * Obtener alumnos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Array>} Lista de alumnos del curso
   */
  static async findByCurso(cursoId) {
    return await Alumno.findByCurso(cursoId);
  }

  /**
   * Obtener alumnos por apoderado
   * @param {string} apoderadoId - ID del apoderado
   * @returns {Promise<Array>} Lista de alumnos del apoderado
   */
  static async findByApoderado(apoderadoId) {
    return await Alumno.findByApoderado(apoderadoId);
  }

  /**
   * Actualizar un alumno
   * @param {number} id - ID del alumno
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Alumno actualizado
   */
  static async update(id, updateData, userId) {
    const alumno = await Alumno.findByPk(id);
    if (!alumno) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await alumno.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Eliminar un alumno (soft delete)
   * @param {number} id - ID del alumno
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const alumno = await Alumno.findByPk(id);
    if (!alumno) {
      return false;
    }

    await alumno.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un alumno eliminado
   * @param {number} id - ID del alumno
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const alumno = await Alumno.scope('deleted').findByPk(id);
    if (!alumno) {
      return false;
    }

    await alumno.restore();
    return true;
  }

  /**
   * Buscar alumnos por nombre
   * @param {string} nombre - Nombre a buscar
   * @returns {Promise<Array>} Lista de alumnos encontrados
   */
  static async searchByName(nombre) {
    return await Alumno.findAll({
      where: {
        nombre_completo: {
          [Op.like]: `%${nombre}%`
        }
      },
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'ano_escolar']
        }
      ],
      order: [['nombre_completo', 'ASC']]
    });
  }

  /**
   * Contar alumnos por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<number>} Cantidad de alumnos
   */
  static async countByCurso(cursoId) {
    return await Alumno.count({
      where: { curso_id: cursoId }
    });
  }

  /**
   * Verificar si existe un alumno con el usuario_id
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<boolean>} Existe o no
   */
  static async existsByUsuarioId(usuarioId) {
    const count = await Alumno.count({
      where: { usuario_id: usuarioId }
    });
    return count > 0;
  }
}

module.exports = AlumnoService;

