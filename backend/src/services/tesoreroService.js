const { Tesorero, Curso, Usuario } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class TesoreroService {
  /**
   * Crear un nuevo tesorero
   * @param {Object} tesoreroData - Datos del tesorero
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>} Tesorero creado
   */
  static async create(tesoreroData, userId) {
    const dataWithAudit = {
      ...tesoreroData,
      ...addCreateAudit(userId)
    };
    
    return await Tesorero.create(dataWithAudit);
  }

  /**
   * Obtener todos los tesoreros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Lista paginada de tesoreros
   */
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      activo,
      curso_id,
      usuario_id
    } = options;

    const offset = (page - 1) * limit;
    const whereClause = {};

    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    if (curso_id) {
      whereClause.curso_id = curso_id;
    }

    if (usuario_id) {
      whereClause.usuario_id = usuario_id;
    }

    const { count, rows } = await Tesorero.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'nivel_id', 'ano_escolar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_asignacion', 'DESC']]
    });

    return {
      tesoreros: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Obtener un tesorero por ID
   * @param {number} id - ID del tesorero
   * @returns {Promise<Object|null>} Tesorero encontrado
   */
  static async findById(id) {
    return await Tesorero.findByPk(id, {
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'nivel_id', 'ano_escolar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });
  }

  /**
   * Obtener tesorero por usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object|null>} Tesorero encontrado
   */
  static async findByUsuario(usuarioId) {
    return await Tesorero.findByUsuario(usuarioId);
  }

  /**
   * Obtener tesorero por usuario con detalles
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object|null>} Tesorero con detalles
   */
  static async findByUsuarioWithDetails(usuarioId) {
    return await Tesorero.findOne({
      where: { 
        usuario_id: usuarioId,
        activo: true
      },
      include: [
        {
          model: Curso,
          as: 'curso',
          attributes: ['id', 'nombre_curso', 'nivel_id', 'ano_escolar']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });
  }

  /**
   * Obtener tesorero por curso
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object|null>} Tesorero encontrado
   */
  static async findByCurso(cursoId) {
    return await Tesorero.findByCurso(cursoId);
  }

  /**
   * Verificar si un usuario es tesorero
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<boolean>} Es tesorero o no
   */
  static async isTesorero(usuarioId) {
    return await Tesorero.isTesorero(usuarioId);
  }

  /**
   * Verificar si un usuario puede acceder a un curso
   * @param {number} usuarioId - ID del usuario
   * @param {number} cursoId - ID del curso
   * @returns {Promise<boolean>} Puede acceder o no
   */
  static async canAccessCourse(usuarioId, cursoId) {
    return await Tesorero.canAccessCourse(usuarioId, cursoId);
  }

  /**
   * Obtener el curso asignado a un tesorero
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<number|null>} ID del curso asignado
   */
  static async getCursoAsignado(usuarioId) {
    return await Tesorero.getCursoAsignado(usuarioId);
  }

  /**
   * Verificar si un curso está disponible para asignar tesorero
   * @param {number} cursoId - ID del curso
   * @param {number} excludeTesoreroId - ID del tesorero a excluir
   * @returns {Promise<boolean>} Está disponible o no
   */
  static async isCursoDisponible(cursoId, excludeTesoreroId = null) {
    return await Tesorero.isCursoDisponible(cursoId, excludeTesoreroId);
  }

  /**
   * Verificar si un usuario está disponible para ser tesorero
   * @param {number} usuarioId - ID del usuario
   * @param {number} excludeTesoreroId - ID del tesorero a excluir
   * @returns {Promise<boolean>} Está disponible o no
   */
  static async isUsuarioDisponible(usuarioId, excludeTesoreroId = null) {
    return await Tesorero.isUsuarioDisponible(usuarioId, excludeTesoreroId);
  }

  /**
   * Actualizar un tesorero
   * @param {number} id - ID del tesorero
   * @param {Object} updateData - Datos a actualizar
   * @param {string} userId - ID del usuario que actualiza
   * @returns {Promise<Object|null>} Tesorero actualizado
   */
  static async update(id, updateData, userId) {
    const tesorero = await Tesorero.findByPk(id);
    if (!tesorero) {
      return null;
    }

    const dataWithAudit = {
      ...updateData,
      ...addUpdateAudit(userId)
    };

    await tesorero.update(dataWithAudit);
    return await this.findById(id);
  }

  /**
   * Desactivar un tesorero
   * @param {number} id - ID del tesorero
   * @param {string} userId - ID del usuario que desactiva
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async deactivate(id, userId) {
    const tesorero = await Tesorero.findByPk(id);
    if (!tesorero) {
      return false;
    }

    await tesorero.deactivate(userId);
    return true;
  }

  /**
   * Activar un tesorero
   * @param {number} id - ID del tesorero
   * @param {string} userId - ID del usuario que activa
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async activate(id, userId) {
    const tesorero = await Tesorero.findByPk(id);
    if (!tesorero) {
      return false;
    }

    await tesorero.activate(userId);
    return true;
  }

  /**
   * Eliminar un tesorero (soft delete)
   * @param {number} id - ID del tesorero
   * @param {string} userId - ID del usuario que elimina
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async delete(id, userId) {
    const tesorero = await Tesorero.findByPk(id);
    if (!tesorero) {
      return false;
    }

    await tesorero.softDelete(userId);
    return true;
  }

  /**
   * Restaurar un tesorero eliminado
   * @param {number} id - ID del tesorero
   * @returns {Promise<boolean>} Resultado de la operación
   */
  static async restore(id) {
    const tesorero = await Tesorero.scope('deleted').findByPk(id);
    if (!tesorero) {
      return false;
    }

    await tesorero.restore();
    return true;
  }

  /**
   * Obtener tesoreros activos
   * @returns {Promise<Array>} Lista de tesoreros activos
   */
  static async findActive() {
    return await Tesorero.findActive();
  }

  /**
   * Obtener estadísticas de tesoreros
   * @returns {Promise<Object>} Estadísticas de tesoreros
   */
  static async getEstadisticas() {
    return await Tesorero.getEstadisticas();
  }

  /**
   * Asignar tesorero a curso automáticamente
   * @param {number} usuarioId - ID del usuario
   * @param {number} cursoId - ID del curso
   * @param {string} createdBy - ID del usuario que crea
   * @returns {Promise<Object>} Tesorero creado
   */
  static async asignarTesoreroCurso(usuarioId, cursoId, createdBy) {
    // Verificar disponibilidad
    const [cursoDisponible, usuarioDisponible] = await Promise.all([
      this.isCursoDisponible(cursoId),
      this.isUsuarioDisponible(usuarioId)
    ]);

    if (!cursoDisponible) {
      throw new Error('El curso ya tiene un tesorero asignado');
    }

    if (!usuarioDisponible) {
      throw new Error('El usuario ya es tesorero de otro curso');
    }

    // Crear asignación
    return await this.create({
      usuario_id: usuarioId,
      curso_id: cursoId,
      activo: true
    }, createdBy);
  }

  /**
   * Reasignar tesorero de un curso
   * @param {number} cursoId - ID del curso
   * @param {number} nuevoUsuarioId - ID del nuevo usuario
   * @param {string} userId - ID del usuario que reasigna
   * @returns {Promise<Object>} Nuevo tesorero
   */
  static async reasignarTesoreroCurso(cursoId, nuevoUsuarioId, userId) {
    // Desactivar tesorero actual
    const tesoreroActual = await this.findByCurso(cursoId);
    if (tesoreroActual) {
      await this.deactivate(tesoreroActual.id, userId);
    }

    // Asignar nuevo tesorero
    return await this.asignarTesoreroCurso(nuevoUsuarioId, cursoId, userId);
  }

  /**
   * Obtener cursos sin tesorero asignado
   * @returns {Promise<Array>} Lista de cursos sin tesorero
   */
  static async getCursosSinTesorero() {
    const cursosConTesorero = await Tesorero.findAll({
      where: { activo: true },
      attributes: ['curso_id']
    });

    const cursoIdsConTesorero = cursosConTesorero.map(t => t.curso_id);

    return await Curso.findAll({
      where: {
        id: {
          [Op.notIn]: cursoIdsConTesorero
        }
      },
      attributes: ['id', 'nombre_curso', 'nivel_id', 'ano_escolar'],
      order: [['nombre_curso', 'ASC']]
    });
  }

  /**
   * Obtener usuarios disponibles para ser tesoreros
   * @returns {Promise<Array>} Lista de usuarios disponibles
   */
  static async getUsuariosDisponibles() {
    const usuariosTesoreros = await Tesorero.findAll({
      where: { activo: true },
      attributes: ['usuario_id']
    });

    const usuarioIdsTesoreros = usuariosTesoreros.map(t => t.usuario_id);

    return await Usuario.findAll({
      where: {
        id: {
          [Op.notIn]: usuarioIdsTesoreros
        },
        activo: true
      },
      attributes: ['id', 'nombre', 'apellido', 'email'],
      order: [['nombre', 'ASC'], ['apellido', 'ASC']]
    });
  }
}

module.exports = TesoreroService;

