const AlumnoService = require('../services/alumnoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, alumnoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class AlumnoController {
  /**
   * Crear un nuevo alumno
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(alumnoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const alumno = await AlumnoService.create(data, userId);
      
      Logger.info('Alumno creado exitosamente', { 
        alumnoId: alumno.id, 
        userId 
      });
      
      return ResponseHelper.created(res, alumno, 'Alumno creado exitosamente');
    } catch (error) {
      Logger.error('Error al crear alumno', { 
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un alumno con estos datos');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los alumnos
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        curso_id: req.query.curso_id,
        apoderado_id: req.query.apoderado_id,
        search: req.query.search
      };

      const result = await AlumnoService.findAll(options);
      
      return ResponseHelper.paginated(res, result.alumnos, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener alumnos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un alumno por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const alumno = await AlumnoService.findById(id);
      
      if (!alumno) {
        return ResponseHelper.notFound(res, 'Alumno');
      }
      
      return ResponseHelper.success(res, alumno);
    } catch (error) {
      Logger.error('Error al obtener alumno', { 
        alumnoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener alumnos por curso
   */
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const alumnos = await AlumnoService.findByCurso(cursoId);
      
      return ResponseHelper.success(res, alumnos);
    } catch (error) {
      Logger.error('Error al obtener alumnos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener alumnos por apoderado
   */
  static async getByApoderado(req, res) {
    try {
      const { apoderadoId } = req.params;
      const alumnos = await AlumnoService.findByApoderado(apoderadoId);
      
      return ResponseHelper.success(res, alumnos);
    } catch (error) {
      Logger.error('Error al obtener alumnos por apoderado', { 
        apoderadoId: req.params.apoderadoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un alumno
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(alumnoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const alumno = await AlumnoService.update(id, data, userId);
      
      if (!alumno) {
        return ResponseHelper.notFound(res, 'Alumno');
      }
      
      Logger.info('Alumno actualizado exitosamente', { 
        alumnoId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, alumno, 'Alumno actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar alumno', { 
        alumnoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return ResponseHelper.conflict(res, 'Ya existe un alumno con estos datos');
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un alumno (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await AlumnoService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Alumno');
      }
      
      Logger.info('Alumno eliminado exitosamente', { 
        alumnoId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Alumno eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar alumno', { 
        alumnoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar un alumno eliminado
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await AlumnoService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Alumno eliminado');
      }
      
      Logger.info('Alumno restaurado exitosamente', { 
        alumnoId: id 
      });
      
      return ResponseHelper.success(res, null, 'Alumno restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar alumno', { 
        alumnoId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Buscar alumnos por nombre
   */
  static async searchByName(req, res) {
    try {
      const { nombre } = req.query;
      
      if (!nombre || nombre.trim().length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'nombre', message: 'El nombre debe tener al menos 2 caracteres' }
        ]);
      }
      
      const alumnos = await AlumnoService.searchByName(nombre.trim());
      
      return ResponseHelper.success(res, alumnos);
    } catch (error) {
      Logger.error('Error al buscar alumnos por nombre', { 
        nombre: req.query.nombre,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Contar alumnos por curso
   */
  static async countByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const count = await AlumnoService.countByCurso(cursoId);
      
      return ResponseHelper.success(res, { count });
    } catch (error) {
      Logger.error('Error al contar alumnos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Verificar si existe un alumno por usuario ID
   */
  static async existsByUsuarioId(req, res) {
    try {
      const { usuarioId } = req.params;
      const exists = await AlumnoService.existsByUsuarioId(usuarioId);
      
      return ResponseHelper.success(res, { exists });
    } catch (error) {
      Logger.error('Error al verificar existencia de alumno', { 
        usuarioId: req.params.usuarioId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = AlumnoController;

