const cors = require('cors');
const Logger = require('../utils/logger');

const ALLOWED_HEADERS =
  'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-User-Id, x-user-id';

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'development') return callback(null, true);

    const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002')
      .split(',');

    if (allowed.includes(origin)) callback(null, true);
    else {
      Logger.warn('Origen no permitido por CORS', { origin });
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ALLOWED_HEADERS.split(',').map(s => s.trim()),
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page', 'X-Total-Pages'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

// DEV: reflejar origen y **permitir x-user-id**
const developmentCors = (req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin); // no usar * con credenciales
  res.header('Vary', 'Origin');                      // para caches/proxies
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
};

const configureCors = () => {
  if (process.env.NODE_ENV === 'development') {
    Logger.info('CORS dev: permitir todos los orígenes y x-user-id');
    return developmentCors;
  }
  Logger.info('CORS prod', { allowedOrigins: process.env.ALLOWED_ORIGINS });
  return cors(corsOptions);
};

module.exports = { corsOptions, developmentCors, configureCors };
