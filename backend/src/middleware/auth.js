const jwt = require('jsonwebtoken');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

/**
 * Middleware de autenticación JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ResponseHelper.unauthorized(res, 'Token de acceso requerido');
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      Logger.warn('Token inválido o expirado', { 
        token: token.substring(0, 20) + '...',
        error: err.message 
      });
      return ResponseHelper.forbidden(res, 'Token inválido o expirado');
    }

    req.user = user;
    next();
  });
};

/**
 * Middleware de autenticación opcional
 * No bloquea la request si no hay token, pero lo valida si existe
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      Logger.warn('Token opcional inválido', { 
        token: token.substring(0, 20) + '...',
        error: err.message 
      });
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

/**
 * Middleware para verificar roles específicos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      Logger.warn('Acceso denegado por rol insuficiente', {
        userId: req.user.id,
        userRoles,
        requiredRoles: roles
      });
      return ResponseHelper.forbidden(res, 'No tiene permisos para acceder a este recurso');
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario es administrador
 */
const requireAdmin = requireRole(['admin', 'administrador']);

/**
 * Middleware para verificar si el usuario es apoderado o administrador
 */
const requireApoderado = requireRole(['admin', 'administrador', 'apoderado']);

/**
 * Middleware para verificar si el usuario es profesor o administrador
 */
const requireProfesor = requireRole(['admin', 'administrador', 'profesor']);

/**
 * Middleware para verificar si el usuario es tesorero, profesor o administrador
 */
const requireTesorero = requireRole(['admin', 'administrador', 'profesor', 'tesorero']);

/**
 * Middleware para verificar si el usuario puede acceder a datos de un curso específico
 */
const requireCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Autenticación requerida');
    }

    const { cursoId } = req.params;
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];

    // Los administradores tienen acceso a todos los cursos
    if (userRoles.includes('admin') || userRoles.includes('administrador')) {
      return next();
    }

    // Verificar si el usuario tiene acceso al curso específico
    // Esto requeriría consultar la base de datos para verificar la relación
    // Por ahora, permitimos acceso a profesores y tesoreros
    if (userRoles.includes('profesor') || userRoles.includes('tesorero')) {
      return next();
    }

    Logger.warn('Acceso denegado a curso específico', {
      userId: req.user.id,
      cursoId,
      userRoles
    });

    return ResponseHelper.forbidden(res, 'No tiene acceso a este curso');
  } catch (error) {
    Logger.error('Error en verificación de acceso a curso', {
      error: error.message,
      userId: req.user?.id,
      cursoId: req.params.cursoId
    });
    return ResponseHelper.error(res, 'Error interno del servidor');
  }
};

/**
 * Generar token JWT
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    roles: user.roles || [user.role]
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Verificar token JWT
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
  } catch (error) {
    throw new Error('Token inválido');
  }
}

module.exports = {
  authenticateToken,
  requireAuth: authenticateToken, // Alias para compatibilidad
  requireAdmin,
  requireApoderado,
  requireTesorero,
  generateToken,
  verifyToken
};

