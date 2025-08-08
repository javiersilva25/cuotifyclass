const { Curso } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class CursoService {
  /**
   * Crear un nuevo curso
   * @param {Object} cursoData - Datos del curso
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Curso creado
   */
  static async create(cursoData, userId) {
    const dataWithAudit = {
      ...cursoData,
      ...addCreateAudit(userId)
    };
    
    return await Curso.create(dataWithAudit);
  }

  /**
   * Obtener todos los cursos activos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Array>} Lista de cursos
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      nivel_id,
      ano_escolar,
      profesor_id,
      tesorero_id,
      search
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (nivel_id) {
      whereClause.nivel_id = nivel_id;
    }

    if (ano_escolar) {
      whereClause.ano_escolar = ano_escolar;
    }

    if (profesor_id) {
      whereClause.profesor_id = profesor_id;
    }

    if (tesorero_id) {
      whereClause.tesorero_id = tesorero_id;
    }

    if (search) {
      whereClause.nombre_curso = {
        [Op.like]: `%${search}%`
      };
    }

    const { count, rows } = await Curso.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre_curso', 'ASC']]
    });

    return {
      cursos: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un curso por ID
   * @param {number} id - ID del curso
   * @returns {Promise<Object|null>} Curso encontrado
   */
  static async findById(id) {
    return await Curso.findByPk(id);
  }

  /**
   * Obtener cursos por nivel
   * @param {number} nivelId - ID del nivel
   * @returns {Promise<Array>} Lista de cursos del nivel
   */
  static async findByNivel(nivelId) {
    return await Curso.findByNivel(nivelId);
  }

  /**
   * Obtener cursos por año escolar
   * @param {number} anoEscolar - Año escolar
   * @returns {Promise<Array>} Lista de cursos del año
   */
  static async findByAnoEscolar(anoEscolar) {
    return await Curso.findByAnoEscolar(anoEscolar);
  }

  /**
   * Obtener cursos por profesor
   * @param {string} profesorId - ID del profesor
   * @returns {Promise<Array>} Lista de cursos del profesor
   */
  static async findByProfesor(profesorId) {
    return await Curso.findByProfesor(profesorId);
  }

  /**
   * Obtener cursos por tesorero
   * @param {string} tesoreroId - ID del tesorero
   * @returns {Promise<Array>} Lista de cursos del tesorero
   */
  static async findByTesorero(tesoreroId) {
    return await Curso.findByTesorero(tesoreroId);
  }

  /**
   * Obtener cursos del año actual
   * @returns {Promise<Array>} Lista de cursos del año actual
   */
  static async findCurrentYear() {
    return await Curso.findCurrentYear();
  }

  /**
   * Actualizar un curso
   * @param {number} id - ID del curso
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Curso actualizado
   */
  static async update(id, updateData, userId) {
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await curso.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Eliminar un curso (soft delete)
   * @param {number} id - ID del curso
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return false;
    }

    // Verificar si el curso tiene alumnos asociados
    const { Alumno } = require('../models');
    const alumnosCount = await Alumno.count({
      where: { curso_id: id }
    });

    if (alumnosCount > 0) {
      throw new Error('No se puede eliminar el curso porque tiene alumnos asociados');
    }

    await curso.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un curso eliminado
   * @param {number} id - ID del curso
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const curso = await Curso.scope('deleted').findByPk(id);
    if (!curso) {
      return false;
    }

    await curso.restore();
    return true;
  }

  /**
   * Buscar cursos por nombre
   * @param {string} nombre - Nombre a buscar
   * @returns {Promise<Array>} Lista de cursos encontrados
   */
  static async searchByName(nombre) {
    return await Curso.findAll({
      where: {
        nombre_curso: {
          [Op.like]: `%${nombre}%`
        }
      },
      order: [['nombre_curso', 'ASC']]
    });
  }

  /**
   * Verificar si existe un curso con el mismo nombre y año
   * @param {string} nombreCurso - Nombre del curso
   * @param {number} anoEscolar - Año escolar
   * @param {number} excludeId - ID a excluir de la búsqueda
   * @returns {Promise<boolean>} Existe o no
   */
  static async existsByNombreAndAno(nombreCurso, anoEscolar, excludeId = null) {
    const whereClause = {
      nombre_curso: nombreCurso,
      ano_escolar: anoEscolar
    };
    
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const count = await Curso.count({
      where: whereClause
    });
    return count > 0;
  }

  /**
   * Obtener estadísticas de cursos
   * @returns {Promise<Object>} Estadísticas de cursos
   */
  static async getEstadisticas() {
    const currentYear = new Date().getFullYear();
    
    const [totalCursos, cursosActuales, nivelesUnicos, anosUnicos] = await Promise.all([
      Curso.count(),
      Curso.count({ where: { ano_escolar: currentYear } }),
      Curso.count({
        distinct: true,
        col: 'nivel_id'
      }),
      Curso.count({
        distinct: true,
        col: 'ano_escolar'
      })
    ]);

    return {
      total_cursos: totalCursos,
      cursos_ano_actual: cursosActuales,
      niveles_unicos: nivelesUnicos,
      anos_unicos: anosUnicos
    };
  }

  /**
   * Obtener cursos con conteo de alumnos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Cursos con conteo de alumnos
   */
  static async findWithAlumnosCount(filters = {}) {
    const { Alumno } = require('../models');
    const whereClause = {};

    if (filters.ano_escolar) {
      whereClause.ano_escolar = filters.ano_escolar;
    }

    if (filters.nivel_id) {
      whereClause.nivel_id = filters.nivel_id;
    }

    return await Curso.findAll({
      where: whereClause,
      attributes: [
        'id',
        'nombre_curso',
        'nivel_id',
        'ano_escolar',
        'profesor_id',
        'tesorero_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('alumnos.id')), 'total_alumnos']
      ],
      include: [
        {
          model: Alumno,
          as: 'alumnos',
          attributes: []
        }
      ],
      group: ['Curso.id'],
      order: [['nombre_curso', 'ASC']]
    });
  }

  /**
   * Obtener años escolares disponibles
   * @returns {Promise<Array>} Lista de años escolares
   */
  static async getAnosEscolares() {
    const result = await Curso.findAll({
      attributes: [
        [require('sequelize').fn('DISTINCT', require('sequelize').col('ano_escolar')), 'ano_escolar']
      ],
      order: [['ano_escolar', 'DESC']]
    });

    return result.map(item => item.ano_escolar);
  }
}

module.exports = CursoService;

