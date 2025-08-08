const CobroAlumnoService = require('../services/cobroAlumnoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, cobroAlumnoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

class CobroAlumnoController {
  /**
   * Crear un nuevo cobro de alumno
   */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(cobroAlumnoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const cobro = await CobroAlumnoService.create(data, userId);
      
      Logger.info('Cobro de alumno creado exitosamente', { 
        cobroId: cobro.id, 
        userId 
      });
      
      return ResponseHelper.created(res, cobro, 'Cobro de alumno creado exitosamente');
    } catch (error) {
      Logger.error('Error al crear cobro de alumno', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener todos los cobros de alumnos
   */
  static async getAll(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        curso_id: req.query.curso_id,
        search: req.query.search
      };

      const result = await CobroAlumnoService.findAll(options);
      
      return ResponseHelper.paginated(res, result.cobrosAlumnos, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener cobros de alumnos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener un cobro de alumno por ID
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const cobro = await CobroAlumnoService.findById(id);
      
      if (!cobro) {
        return ResponseHelper.notFound(res, 'Cobro de alumno');
      }
      
      return ResponseHelper.success(res, cobro);
    } catch (error) {
      Logger.error('Error al obtener cobro de alumno', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cobros de alumnos por curso
   */
  static async getByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const cobros = await CobroAlumnoService.findByCurso(cursoId);
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros de alumnos por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Buscar cobros por concepto
   */
  static async searchByConcepto(req, res) {
    try {
      const { concepto } = req.query;
      
      if (!concepto || concepto.trim().length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'concepto', message: 'El concepto debe tener al menos 2 caracteres' }
        ]);
      }
      
      const cobros = await CobroAlumnoService.findByConcepto(concepto.trim());
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al buscar cobros por concepto', { 
        concepto: req.query.concepto,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Actualizar un cobro de alumno
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(cobroAlumnoValidator, req.body);
      
      if (!isValid) {
        return ResponseHelper.validationError(res, errors);
      }

      const userId = req.user?.id || 'system';
      const cobro = await CobroAlumnoService.update(id, data, userId);
      
      if (!cobro) {
        return ResponseHelper.notFound(res, 'Cobro de alumno');
      }
      
      Logger.info('Cobro de alumno actualizado exitosamente', { 
        cobroId: id, 
        userId 
      });
      
      return ResponseHelper.updated(res, cobro, 'Cobro de alumno actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar cobro de alumno', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Eliminar un cobro de alumno (soft delete)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';
      
      const deleted = await CobroAlumnoService.delete(id, userId);
      
      if (!deleted) {
        return ResponseHelper.notFound(res, 'Cobro de alumno');
      }
      
      Logger.info('Cobro de alumno eliminado exitosamente', { 
        cobroId: id, 
        userId 
      });
      
      return ResponseHelper.deleted(res, 'Cobro de alumno eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar cobro de alumno', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      if (error.message.includes('deudas de compañeros asociadas')) {
        return ResponseHelper.conflict(res, error.message);
      }
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Restaurar un cobro de alumno eliminado
   */
  static async restore(req, res) {
    try {
      const { id } = req.params;
      
      const restored = await CobroAlumnoService.restore(id);
      
      if (!restored) {
        return ResponseHelper.notFound(res, 'Cobro de alumno eliminado');
      }
      
      Logger.info('Cobro de alumno restaurado exitosamente', { 
        cobroId: id 
      });
      
      return ResponseHelper.success(res, null, 'Cobro de alumno restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar cobro de alumno', { 
        cobroId: req.params.id,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener total de cobros por curso
   */
  static async getTotalByCurso(req, res) {
    try {
      const { cursoId } = req.params;
      const total = await CobroAlumnoService.getTotalByCurso(cursoId);
      
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total de cobros por curso', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener estadísticas de cobros de alumnos
   */
  static async getEstadisticas(req, res) {
    try {
      const filters = {
        curso_id: req.query.curso_id,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta
      };

      const estadisticas = await CobroAlumnoService.getEstadisticas(filters);
      
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de cobros de alumnos', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Obtener cobros agrupados por curso
   */
  static async getGroupedByCurso(req, res) {
    try {
      const cobros = await CobroAlumnoService.getGroupedByCurso();
      
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros agrupados por curso', { 
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /**
   * Crear cobros masivos para un curso
   */
  static async createBulk(req, res) {
    try {
      const { cursoId } = req.params;
      const { cobros } = req.body;
      
      if (!Array.isArray(cobros) || cobros.length === 0) {
        return ResponseHelper.validationError(res, [
          { field: 'cobros', message: 'Se debe proporcionar un array de cobros' }
        ]);
      }

      // Validar cada cobro
      for (let i = 0; i < cobros.length; i++) {
        const { isValid, errors } = validateData(cobroAlumnoValidator, {
          ...cobros[i],
          curso_id: parseInt(cursoId)
        });
        
        if (!isValid) {
          return ResponseHelper.validationError(res, 
            errors.map(error => ({
              ...error,
              field: `cobros[${i}].${error.field}`
            }))
          );
        }
      }

      const userId = req.user?.id || 'system';
      const cobrosCreados = await CobroAlumnoService.createBulk(cursoId, cobros, userId);
      
      Logger.info('Cobros masivos creados exitosamente', { 
        cursoId,
        cantidad: cobrosCreados.length,
        userId 
      });
      
      return ResponseHelper.created(res, cobrosCreados, 
        `${cobrosCreados.length} cobros creados exitosamente`);
    } catch (error) {
      Logger.error('Error al crear cobros masivos', { 
        cursoId: req.params.cursoId,
        error: error.message, 
        stack: error.stack 
      });
      
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = CobroAlumnoController;

