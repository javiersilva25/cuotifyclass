const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Importar configuraciones
const { sequelize } = require('./models');
const config = require('./config/config');
const Logger = require('./utils/logger');

// Importar middleware
const {
  configureCors,
  errorHandler,
  notFoundHandler,
  validateContentType,
  requestTimeout,
  generalLimiter
} = require('./middleware');

// Importar rutas
const routes = require('./routes');

// Crear aplicación Express
const app = express();

// Configurar trust proxy para obtener IP real detrás de proxies
app.set('trust proxy', 1);

// Middleware de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Middleware de compresión
app.use(compression());

// Configurar CORS
app.use(configureCors());

// Middleware de timeout para requests
app.use(requestTimeout(30000)); // 30 segundos

// Rate limiting general
app.use(generalLimiter);

// Middleware de logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => Logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// Middleware para parsear JSON
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

// Middleware para parsear URL encoded
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Validar Content-Type para POST/PUT/PATCH
app.use(validateContentType);

// Middleware para servir archivos estáticos
app.use('/static', express.static(path.join(__dirname, '../public')));

// Ruta de salud básica
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Gestión Escolar API',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurar rutas de la API
app.use('/api', routes);

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Función para inicializar la aplicación
// ...código previo...

const initializeApp = async () => {
  try {
    await sequelize.authenticate();
    Logger.info('Conexión a la base de datos establecida correctamente');

    // ❌ Quita cualquier sync automático
    // await sequelize.sync({ alter: true });
    // await sequelize.sync({ force: true });
    // await sequelize.sync();

    Logger.info('Aplicación inicializada correctamente');
  } catch (error) {
    Logger.error('Error al inicializar la aplicación', { error: error.message, stack: error.stack });
    throw error;
  }
};


// Función para cerrar la aplicación gracefully
const closeApp = async () => {
  try {
    await sequelize.close();
    Logger.info('Conexión a la base de datos cerrada');
  } catch (error) {
    Logger.error('Error al cerrar la aplicación', {
      error: error.message,
      stack: error.stack
    });
  }
};

// Manejar señales de terminación
process.on('SIGTERM', async () => {
  Logger.info('Recibida señal SIGTERM, cerrando aplicación...');
  await closeApp();
  process.exit(0);
});

process.on('SIGINT', async () => {
  Logger.info('Recibida señal SIGINT, cerrando aplicación...');
  await closeApp();
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  Logger.error('Excepción no capturada', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Promesa rechazada no manejada', {
    reason: reason,
    promise: promise
  });
  process.exit(1);
});

module.exports = { app, initializeApp, closeApp };

