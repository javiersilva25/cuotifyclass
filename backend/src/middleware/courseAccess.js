// middleware/courseAccess.js
const TesoreroService = require('../services/tesoreroService');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

const getRutFromReq = (req) =>
  req.rut_persona || req.user?.rut || req.user?.id; // fallback si mantuviste el RUT en id

/**
 * Verificar que un tesorero solo acceda a su curso asignado
 */
const requireTesoreroCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');

    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];

    if (roles.includes('admin') || roles.includes('administrador')) return next();
    if (!roles.includes('tesorero')) return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');

    const cursoId = req.params.cursoId || req.params.curso_id || req.body.curso_id;
    if (!cursoId) return ResponseHelper.badRequest(res, 'ID de curso requerido');

    const rut = getRutFromReq(req);
    const canAccess = await TesoreroService.canAccessCourseByRut(rut, cursoId); // <-- por RUT

    if (!canAccess) {
      Logger.warn('Tesorero intentando acceder a curso no asignado', { rut, cursoId, path: req.path });
      return ResponseHelper.forbidden(res, 'No tiene acceso a este curso');
    }

    req.cursoAsignado = Number(cursoId);
    next();
  } catch (e) {
    Logger.error('Error en verificación de acceso a curso', { error: e.message, stack: e.stack, path: req.path });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Verificar acceso a datos de un alumno: curso del alumno debe ser el del tesorero
 */
const requireAlumnoCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');

    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    if (roles.includes('admin') || roles.includes('administrador')) return next();
    if (!roles.includes('tesorero')) return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');

    const alumnoId = req.params.alumnoId || req.params.alumno_id || req.body.alumno_id;
    if (!alumnoId) return ResponseHelper.badRequest(res, 'ID de alumno requerido');

    const { Alumno } = require('../models');
    const alumno = await Alumno.findByPk(alumnoId, { attributes: ['id', 'curso_id'] });
    if (!alumno) return ResponseHelper.notFound(res, 'Alumno');

    const rut = getRutFromReq(req);
    const canAccess = await TesoreroService.canAccessCourseByRut(rut, alumno.curso_id);

    if (!canAccess) {
      Logger.warn('Tesorero intentando acceder a alumno de curso no asignado', {
        rut, alumnoId, cursoId: alumno.curso_id, path: req.path,
      });
      return ResponseHelper.forbidden(res, 'No tiene acceso a este alumno');
    }

    req.cursoAsignado = alumno.curso_id;
    next();
  } catch (e) {
    Logger.error('Error en verificación de acceso a alumno', { error: e.message, stack: e.stack, path: req.path });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Verificar acceso a un pago (curso del alumno del pago)
 */
const requirePagoCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');

    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    if (roles.includes('admin') || roles.includes('administrador')) return next();
    if (!roles.includes('tesorero')) return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');

    const pagoId = req.params.pagoId || req.params.pago_id || req.body.pago_id;
    if (!pagoId) return ResponseHelper.badRequest(res, 'ID de pago requerido');

    const { Pago, Alumno } = require('../models');
    const pago = await Pago.findByPk(pagoId, { include: [{ model: Alumno, as: 'alumno', attributes: ['curso_id'] }] });
    if (!pago) return ResponseHelper.notFound(res, 'Pago');

    const rut = getRutFromReq(req);
    const canAccess = await TesoreroService.canAccessCourseByRut(rut, pago.alumno.curso_id);

    if (!canAccess) {
      Logger.warn('Tesorero intentando acceder a pago de curso no asignado', {
        rut, pagoId, cursoId: pago.alumno.curso_id, path: req.path,
      });
      return ResponseHelper.forbidden(res, 'No tiene acceso a este pago');
    }

    req.cursoAsignado = pago.alumno.curso_id;
    next();
  } catch (e) {
    Logger.error('Error en verificación de acceso a pago', { error: e.message, stack: e.stack, path: req.path });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Filtro por curso asignado para listados de tesorero
 */
const filterByCursoAsignado = async (req, res, next) => {
  try {
    if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');

    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    if (roles.includes('admin') || roles.includes('administrador')) return next();

    if (roles.includes('tesorero')) {
      const rut = getRutFromReq(req);
      const cursoAsignado = await TesoreroService.getCursoAsignadoByRut(rut); // <-- por RUT
      if (!cursoAsignado) return ResponseHelper.forbidden(res, 'No tiene curso asignado');

      req.query.curso_id = cursoAsignado;
      req.cursoAsignado = Number(cursoAsignado);
    }
    next();
  } catch (e) {
    Logger.error('Error en filtro por curso asignado', { error: e.message, stack: e.stack, path: req.path });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Verificar que el tesorero solo MODIFIQUE datos de su curso
 */
const requireOwnCourseModification = async (req, res, next) => {
  try {
    if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');

    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    if (roles.includes('admin') || roles.includes('administrador')) return next();
    if (!roles.includes('tesorero')) return ResponseHelper.forbidden(res, 'No tiene permisos de tesorero');

    const rut = getRutFromReq(req);
    const cursoAsignado = await TesoreroService.getCursoAsignadoByRut(rut);
    if (!cursoAsignado) return ResponseHelper.forbidden(res, 'No tiene curso asignado');

    const cursoId = req.params.cursoId || req.params.curso_id || req.body.curso_id;
    if (cursoId && Number(cursoId) !== Number(cursoAsignado)) {
      Logger.warn('Tesorero intenta modificar curso no asignado', {
        rut, cursoAsignado, cursoSolicitado: cursoId, path: req.path,
      });
      return ResponseHelper.forbidden(res, 'Solo puede modificar datos de su curso asignado');
    }

    req.cursoAsignado = Number(cursoAsignado);
    next();
  } catch (e) {
    Logger.error('Error en verificación de modificación de curso propio', { error: e.message, stack: e.stack, path: req.path });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

module.exports = {
  requireTesoreroCourseAccess,
  requireAlumnoCourseAccess,
  requirePagoCourseAccess,
  filterByCursoAsignado,
  requireOwnCourseModification,
};
