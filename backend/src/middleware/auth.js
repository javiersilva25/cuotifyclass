const jwt = require('jsonwebtoken');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

// Mapa de IDs → nombres
const ROLE_MAP = {
  1: 'apoderado',
  2: 'directiva',
  3: 'directiva_alumnos',
  4: 'profesor',
  5: 'direccion',
  6: 'ccpp',
  7: 'ccaa',
  8: 'administrador',
  9: 'tesorero',
};

const normalizeRoles = (raw) => {
  const arr = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  return arr
    .map((r) => {
      if (typeof r === 'string') return r.toLowerCase();
      if (typeof r === 'number') return (ROLE_MAP[r] || String(r)).toLowerCase();
      const id = r?.rol_id ?? r?.id;
      const byId = id ? ROLE_MAP[id] : null;
      const byName = (r?.nombre_rol || r?.nombre || r?.codigo || r?.role || '').toLowerCase();
      return (byId || byName || '').toLowerCase();
    })
    .filter(Boolean);
};

/** Auth obligatorio */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return ResponseHelper.unauthorized(res, 'Token de acceso requerido');

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, payload) => {
    if (err) {
      Logger.warn('Token inválido o expirado', { token: token.substring(0, 20) + '...', error: err.message });
      return ResponseHelper.forbidden(res, 'Token inválido o expirado');
    }
    // Normalizar roles del payload
    req.user = { ...payload, roles: normalizeRoles(payload.roles || payload.role) };
    next();
  });
};

/** Auth opcional */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) { req.user = null; return next(); }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, payload) => {
    if (err) {
      Logger.warn('Token opcional inválido', { token: token.substring(0, 20) + '...', error: err.message });
      req.user = null;
    } else {
      req.user = { ...payload, roles: normalizeRoles(payload.roles || payload.role) };
    }
    next();
  });
};

/** Requiere rol(es) */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');

  const userRoles = normalizeRoles(req.user.roles || req.user.role);
  const need = roles.map((r) => String(r).toLowerCase());
  const ok = need.some((r) => userRoles.includes(r));

  if (!ok) {
    Logger.warn('Acceso denegado por rol insuficiente', {
      userId: req.user.id, userRoles, requiredRoles: need,
    });
    return ResponseHelper.forbidden(res, 'No tiene permisos para acceder a este recurso');
  }
  next();
};

const requireAdmin = requireRole(['admin', 'administrador']);
const requireApoderado = requireRole(['admin', 'administrador', 'apoderado']);
const requireProfesor = requireRole(['admin', 'administrador', 'profesor']);
const requireTesorero = requireRole(['admin', 'administrador', 'profesor', 'tesorero']);

/** Acceso por curso */
const requireCourseAccess = async (req, res, next) => {
  if (!req.user) return ResponseHelper.unauthorized(res, 'Autenticación requerida');
  const userRoles = normalizeRoles(req.user.roles || req.user.role);
  if (userRoles.includes('admin') || userRoles.includes('administrador')) return next();
  if (userRoles.includes('profesor') || userRoles.includes('tesorero')) return next();
  Logger.warn('Acceso denegado a curso específico', { userId: req.user.id, cursoId: req.params.cursoId, userRoles });
  return ResponseHelper.forbidden(res, 'No tiene acceso a este curso');
};

/** Generar token (incluye roles normalizados) */
const generateToken = (user) => {
  const roles = normalizeRoles(user.roles || user.role);
  const payload = {
    id: user.id,
    email: user.email,
    role: roles[0] || null,
    roles,
    rut: user.rut, // útil para el frontend
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

/** Verificar token sencillo */
const verifyToken = (token) => {
  try { return jwt.verify(token, process.env.JWT_SECRET || 'default_secret'); }
  catch (error) { throw new Error('Token inválido'); }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAuth: authenticateToken,
  requireAdmin,
  requireApoderado,
  requireProfesor,
  requireTesorero,
  requireCourseAccess,
  generateToken,
  verifyToken,
};
