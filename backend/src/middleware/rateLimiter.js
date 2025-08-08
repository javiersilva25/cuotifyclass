const rateLimit = require('express-rate-limit');
const Logger = require('../utils/logger');

/**
 * Rate limiter general para todas las rutas
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Máximo 1000 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, intente nuevamente más tarde',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  handler: (req, res) => {
    Logger.warn('Rate limit excedido', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones desde esta IP, intente nuevamente más tarde',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter estricto para operaciones de autenticación
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intente nuevamente más tarde',
    retryAfter: '15 minutos'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req, res) => {
    Logger.warn('Rate limit de autenticación excedido', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de autenticación desde esta IP',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para operaciones de creación
 */
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 creaciones por minuto
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación, intente nuevamente más tarde',
    retryAfter: '1 minuto'
  },
  handler: (req, res) => {
    Logger.warn('Rate limit de creación excedido', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones de creación desde esta IP',
      retryAfter: '1 minuto',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para operaciones masivas
 */
const bulkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // Máximo 3 operaciones masivas por 5 minutos
  message: {
    success: false,
    message: 'Demasiadas operaciones masivas, intente nuevamente más tarde',
    retryAfter: '5 minutos'
  },
  handler: (req, res) => {
    Logger.warn('Rate limit de operaciones masivas excedido', {
      ip: req.ip,
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones masivas desde esta IP',
      retryAfter: '5 minutos',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rate limiter para búsquedas
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 búsquedas por minuto
  message: {
    success: false,
    message: 'Demasiadas búsquedas, intente nuevamente más tarde',
    retryAfter: '1 minuto'
  },
  handler: (req, res) => {
    Logger.warn('Rate limit de búsquedas excedido', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      query: req.query
    });
    
    res.status(429).json({
      success: false,
      message: 'Demasiadas búsquedas desde esta IP',
      retryAfter: '1 minuto',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Crear rate limiter personalizado
 */
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: {
      success: false,
      message: 'Demasiadas peticiones, intente nuevamente más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false
  };

  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  bulkLimiter,
  searchLimiter,
  createCustomLimiter
};

