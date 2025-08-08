const Logger = require('../utils/logger');
const ResponseHelper = require('../utils/responseHelper');

/**
 * Middleware de manejo de errores global
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  Logger.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    return ResponseHelper.validationError(res, errors);
  }

  // Error de constraint único de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return ResponseHelper.conflict(res, `Ya existe un registro con este ${field}`);
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseHelper.conflict(res, 'No se puede realizar la operación debido a restricciones de integridad');
  }

  // Error de conexión a la base de datos
  if (err.name === 'SequelizeConnectionError') {
    return ResponseHelper.error(res, 'Error de conexión a la base de datos');
  }

  // Error de timeout de la base de datos
  if (err.name === 'SequelizeTimeoutError') {
    return ResponseHelper.error(res, 'Timeout en la consulta a la base de datos');
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return ResponseHelper.unauthorized(res, 'Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHelper.unauthorized(res, 'Token expirado');
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ResponseHelper.validationError(res, [
      { field: 'body', message: 'JSON inválido en el cuerpo de la petición' }
    ]);
  }

  // Error de CORS
  if (err.message && err.message.includes('CORS')) {
    return ResponseHelper.forbidden(res, 'Origen no permitido por CORS');
  }

  // Error de límite de tamaño de archivo
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ResponseHelper.validationError(res, [
      { field: 'file', message: 'El archivo es demasiado grande' }
    ]);
  }

  // Error de límite de campos
  if (err.code === 'LIMIT_FIELD_COUNT') {
    return ResponseHelper.validationError(res, [
      { field: 'fields', message: 'Demasiados campos en la petición' }
    ]);
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Error en la petición',
      timestamp: new Date().toISOString()
    });
  }

  // Error genérico del servidor
  return ResponseHelper.error(res, 'Error interno del servidor');
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res) => {
  Logger.warn('Ruta no encontrada', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  return ResponseHelper.notFound(res, 'Ruta', `${req.method} ${req.url}`);
};

/**
 * Middleware para capturar errores asíncronos
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware de validación de Content-Type para POST/PUT
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return ResponseHelper.validationError(res, [
        { field: 'Content-Type', message: 'Content-Type debe ser application/json' }
      ]);
    }
  }
  
  next();
};

/**
 * Middleware de timeout para requests
 */
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    res.setTimeout(timeout, () => {
      Logger.warn('Request timeout', {
        url: req.url,
        method: req.method,
        timeout
      });
      
      if (!res.headersSent) {
        return ResponseHelper.error(res, 'Request timeout');
      }
    });
    
    next();
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateContentType,
  requestTimeout
};

