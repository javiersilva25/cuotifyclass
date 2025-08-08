const TesoreroService = require('../services/tesoreroService');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

/**
 * Middleware para verificar que un tesorero solo acceda a su curso asignado
 */
const requireTesoreroCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    
    // Los administradores tienen acceso a todos los cursos
    if (userRoles.includes('admin') || userRoles.includes('administrador')) {
      return next();
    }

    // Verificar si el usuario es tesorero
    if (!userRoles.includes('tesorero')) {
      Logger.warn('Usuario sin rol de tesorero intentando acceder a recursos de curso', {
        userId: req.user.id,
        userRoles,
        path: req.path
      });
      return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');
    }

    // Obtener el curso del parámetro de la URL
    const cursoId = req.params.cursoId || req.params.curso_id || req.body.curso_id;
    
    if (!cursoId) {
      Logger.warn('No se proporcionó ID de curso para verificación de acceso', {
        userId: req.user.id,
        path: req.path,
        params: req.params,
        body: req.body
      });
      return ResponseHelper.badRequest(res, 'ID de curso requerido');
    }

    // Verificar si el tesorero tiene acceso al curso
    const canAccess = await TesoreroService.canAccessCourse(req.user.id, cursoId);
    
    if (!canAccess) {
      Logger.warn('Tesorero intentando acceder a curso no asignado', {
        userId: req.user.id,
        cursoId,
        path: req.path
      });
      return ResponseHelper.forbidden(res, 'No tiene acceso a este curso');
    }

    // Agregar información del curso al request para uso posterior
    req.cursoAsignado = cursoId;
    
    Logger.info('Acceso a curso verificado exitosamente', {
      userId: req.user.id,
      cursoId,
      path: req.path
    });

    next();
  } catch (error) {
    Logger.error('Error en verificación de acceso a curso', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path
    });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Middleware para verificar acceso a datos de alumnos del curso del tesorero
 */
const requireAlumnoCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    
    // Los administradores tienen acceso a todos los alumnos
    if (userRoles.includes('admin') || userRoles.includes('administrador')) {
      return next();
    }

    // Verificar si el usuario es tesorero
    if (!userRoles.includes('tesorero')) {
      return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');
    }

    const alumnoId = req.params.alumnoId || req.params.alumno_id || req.body.alumno_id;
    
    if (!alumnoId) {
      return ResponseHelper.badRequest(res, 'ID de alumno requerido');
    }

    // Obtener el curso del alumno y verificar acceso
    const { Alumno } = require('../models');
    const alumno = await Alumno.findByPk(alumnoId);
    
    if (!alumno) {
      return ResponseHelper.notFound(res, 'Alumno');
    }

    const canAccess = await TesoreroService.canAccessCourse(req.user.id, alumno.curso_id);
    
    if (!canAccess) {
      Logger.warn('Tesorero intentando acceder a alumno de curso no asignado', {
        userId: req.user.id,
        alumnoId,
        cursoId: alumno.curso_id,
        path: req.path
      });
      return ResponseHelper.forbidden(res, 'No tiene acceso a este alumno');
    }

    req.cursoAsignado = alumno.curso_id;
    next();
  } catch (error) {
    Logger.error('Error en verificación de acceso a alumno', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path
    });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Middleware para verificar acceso a pagos del curso del tesorero
 */
const requirePagoCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    
    // Los administradores tienen acceso a todos los pagos
    if (userRoles.includes('admin') || userRoles.includes('administrador')) {
      return next();
    }

    // Verificar si el usuario es tesorero
    if (!userRoles.includes('tesorero')) {
      return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');
    }

    const pagoId = req.params.pagoId || req.params.pago_id || req.body.pago_id;
    
    if (!pagoId) {
      return ResponseHelper.badRequest(res, 'ID de pago requerido');
    }

    // Obtener el curso del pago a través del alumno y verificar acceso
    const { Pago, Alumno } = require('../models');
    const pago = await Pago.findByPk(pagoId, {
      include: [{
        model: Alumno,
        as: 'alumno',
        attributes: ['curso_id']
      }]
    });
    
    if (!pago) {
      return ResponseHelper.notFound(res, 'Pago');
    }

    const canAccess = await TesoreroService.canAccessCourse(req.user.id, pago.alumno.curso_id);
    
    if (!canAccess) {
      Logger.warn('Tesorero intentando acceder a pago de curso no asignado', {
        userId: req.user.id,
        pagoId,
        cursoId: pago.alumno.curso_id,
        path: req.path
      });
      return ResponseHelper.forbidden(res, 'No tiene acceso a este pago');
    }

    req.cursoAsignado = pago.alumno.curso_id;
    next();
  } catch (error) {
    Logger.error('Error en verificación de acceso a pago', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path
    });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Middleware para filtrar resultados por curso del tesorero
 */
const filterByCursoAsignado = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    
    // Los administradores ven todos los datos sin filtro
    if (userRoles.includes('admin') || userRoles.includes('administrador')) {
      return next();
    }

    // Para tesoreros, agregar filtro por curso asignado
    if (userRoles.includes('tesorero')) {
      const cursoAsignado = await TesoreroService.getCursoAsignado(req.user.id);
      
      if (!cursoAsignado) {
        return ResponseHelper.forbidden(res, 'No tiene curso asignado');
      }

      // Agregar filtro a los query parameters
      req.query.curso_id = cursoAsignado;
      req.cursoAsignado = cursoAsignado;
    }

    next();
  } catch (error) {
    Logger.error('Error en filtro por curso asignado', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path
    });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Middleware para verificar que el tesorero solo modifique datos de su curso
 */
const requireOwnCourseModification = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    
    // Los administradores pueden modificar cualquier curso
    if (userRoles.includes('admin') || userRoles.includes('administrador')) {
      return next();
    }

    // Verificar si el usuario es tesorero
    if (!userRoles.includes('tesorero')) {
      return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');
    }

    // Obtener curso asignado al tesorero
    const cursoAsignado = await TesoreroService.getCursoAsignado(req.user.id);
    
    if (!cursoAsignado) {
      return ResponseHelper.forbidden(res, 'No tiene curso asignado');
    }

    // Verificar que la modificación sea para su curso
    const cursoId = req.params.cursoId || req.params.curso_id || req.body.curso_id;
    
    if (cursoId && parseInt(cursoId) !== parseInt(cursoAsignado)) {
      Logger.warn('Tesorero intentando modificar datos de curso no asignado', {
        userId: req.user.id,
        cursoAsignado,
        cursoSolicitado: cursoId,
        path: req.path
      });
      return ResponseHelper.forbidden(res, 'Solo puede modificar datos de su curso asignado');
    }

    req.cursoAsignado = cursoAsignado;
    next();
  } catch (error) {
    Logger.error('Error en verificación de modificación de curso propio', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      path: req.path
    });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

module.exports = {
  requireTesoreroCourseAccess,
  requireAlumnoCourseAccess,
  requirePagoCourseAccess,
  filterByCursoAsignado,
  requireOwnCourseModification
};

