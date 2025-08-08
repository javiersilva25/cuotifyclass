const cors = require('cors');
const Logger = require('../utils/logger');

/**
 * Configuración de CORS
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // En producción, verificar orígenes permitidos
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      Logger.warn('Origen no permitido por CORS', { origin });
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Per-Page',
    'X-Total-Pages'
  ],
  maxAge: 86400 // 24 horas
};

/**
 * Middleware de CORS personalizado para desarrollo
 */
const developmentCors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * Configurar CORS según el entorno
 */
const configureCors = () => {
  if (process.env.NODE_ENV === 'development') {
    Logger.info('Configurando CORS para desarrollo (permitir todos los orígenes)');
    return developmentCors;
  } else {
    Logger.info('Configurando CORS para producción', { 
      allowedOrigins: process.env.ALLOWED_ORIGINS 
    });
    return cors(corsOptions);
  }
};

module.exports = {
  corsOptions,
  developmentCors,
  configureCors
};

