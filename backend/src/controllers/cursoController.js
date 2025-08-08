const CursoService = require('../services/cursoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, cursoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class CursoController {
  /**
   * Crear un nuevo curso
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(cursoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      // Verificar si ya existe un curso con el mismo nombre y año
      const existingCurso = await CursoService.existsByNombreAndAno(
        data.nombre_curso, 
        data.ano_escolar
      );
      if (existingCurso) {
        return ResponseHelper.conflict(res, 'Ya existe un curso con este nombre en el año escolar especificado');
      }

      const userId = req.user?.id || 'system';
      const curso = await CursoService.create(data, userId);
      
      Logger.info('Curso creado exitosamente', { 
        cursoId: curso.id, 
        userId 
      });
      
      return ResponseHelper.created(res, curso, 'Curso creado exitosamente');
    } catch (error) {
      Logger.error('Error al crear curso', { 
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un curso con este nombre en el año escolar especificado');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los cursos
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        nivel_id: req.query.nivel_id,
        ano_escolar: req.query.ano_escolar,
        profesor_id: req.query.profesor_id,
        tesorero_id: req.query.tesorero_id,
        search: req.query.search
      };

      const result = await CursoService.findAll(options);
      
      return ResponseHelper.paginated(res, result.cursos, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener cursos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un curso por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const curso = await CursoService.findById(id);
      
      if (!curso) {
        return ResponseHelper.notFound(res, 'Curso');
      }
      
      return ResponseHelper.success(res, curso);
    } catch (error) {
      Logger.error('Error al obtener curso', { 
        cursoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cursos por nivel
   */
  static async getByNivel(req, res) {
    try {
      const { nivelId } = req.params;
      const cursos = await CursoService.findByNivel(nivelId);
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al obtener cursos por nivel', { 
        nivelId: req.params.nivelId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cursos por año escolar
   */
  static async getByAnoEscolar(req, res) {
    try {
      const { anoEscolar } = req.params;
      const cursos = await CursoService.findByAnoEscolar(anoEscolar);
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al obtener cursos por año escolar', { 
        anoEscolar: req.params.anoEscolar,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cursos por profesor
   */
  static async getByProfesor(req, res) {
    try {
      const { profesorId } = req.params;
      const cursos = await CursoService.findByProfesor(profesorId);
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al obtener cursos por profesor', { 
        profesorId: req.params.profesorId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cursos por tesorero
   */
  static async getByTesorero(req, res) {
    try {
      const { tesoreroId } = req.params;
      const cursos = await CursoService.findByTesorero(tesoreroId);
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al obtener cursos por tesorero', { 
        tesoreroId: req.params.tesoreroId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cursos del año actual
   */
  static async getCurrentYear(req, res) {
    try {
      const cursos = await CursoService.findCurrentYear();
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al obtener cursos del año actual', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un curso
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(cursoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      // Verificar si ya existe otro curso con el mismo nombre y año
      const existingCurso = await CursoService.existsByNombreAndAno(
        data.nombre_curso, 
        data.ano_escolar, 
        parseInt(id)
      );
      if (existingCurso) {
        return ResponseHelper.conflict(res, 'Ya existe otro curso con este nombre en el año escolar especificado');
      }

      const userId = req.user?.id || 'system';
      const curso = await CursoService.update(id, data, userId);
      
      if (!curso) {
        return ResponseHelper.notFound(res, 'Curso');
      }
      
      Logger.info('Curso actualizado exitosamente', { 
        cursoId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, curso, 'Curso actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar curso', { 
        cursoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe otro curso con este nombre en el año escolar especificado');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un curso (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await CursoService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Curso');
      }
      
      Logger.info('Curso eliminado exitosamente', { 
        cursoId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Curso eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar curso', { 
        cursoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.message.includes('alumnos asociados')) {
        return ResponseHelper.conflict(res, error.message);
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar un curso eliminado
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await CursoService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Curso eliminado');
      }
      
      Logger.info('Curso restaurado exitosamente', { 
        cursoId: id 
      });
      
      return ResponseHelper.success(res, null, 'Curso restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar curso', { 
        cursoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Buscar cursos por nombre
   */
  static async searchByName(req, res) {
    try {
      const { nombre } = req.query;
      
      if (!nombre || nombre.trim().length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'nombre', message: 'El nombre debe tener al menos 2 caracteres' }
        ]);
      }
      
      const cursos = await CursoService.searchByName(nombre.trim());
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al buscar cursos por nombre', { 
        nombre: req.query.nombre,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de cursos
   */
  static async getEstadisticas(req, res) {
    try {
      const estadisticas = await CursoService.getEstadisticas();
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de cursos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cursos con conteo de alumnos
   */
  static async getWithAlumnosCount(req, res) {
    try {
      const filters = {
        ano_escolar: req.query.ano_escolar,
        nivel_id: req.query.nivel_id
      };

      const cursos = await CursoService.findWithAlumnosCount(filters);
      
      return ResponseHelper.success(res, cursos);
    } catch (error) {
      Logger.error('Error al obtener cursos con conteo de alumnos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener años escolares disponibles
   */
  static async getAnosEscolares(req, res) {
    try {
      const anos = await CursoService.getAnosEscolares();
      
      return ResponseHelper.success(res, anos);
    } catch (error) {
      Logger.error('Error al obtener años escolares', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = CursoController;

