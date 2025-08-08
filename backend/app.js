const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Configurar variables de entorno
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: path.join(__dirname, '.env.production') });
} else {
  require('dotenv').config();
}

// Importar configuraciones
const { sequelize } = require('./src/models');
const Logger = require('./src/utils/logger');

// Importar rutas
const routes = require('./src/routes');

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
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "*"]
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: process.env.NODE_ENV === 'production'
  }
}));

// Middleware de compresión
app.use(compression());

// Configurar CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : true, // Permitir todos los orígenes en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

// Rate limiting específico para geografía
const geografiaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // más permisivo para consultas geográficas
  message: {
    success: false,
    message: 'Demasiadas consultas geográficas, intente más tarde'
  }
});

// Rate limiting para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // máximo 10 intentos de login por IP
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, intente más tarde'
  }
});

// Middleware de logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => Logger.info(message.trim())
    }
  }));
}

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de timeout para requests
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).json({
      success: false,
      message: 'Request timeout'
    });
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '8.0.0',
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected' // TODO: verificar conexión real
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      nombre: 'Sistema de Gestión Escolar',
      version: '8.0.0',
      descripcion: 'Sistema integral con geografía CUT 2018 completa',
      geografia: {
        fuente: 'CUT 2018 - Código Único Territorial Chile',
        regiones: 16,
        provincias: 56,
        comunas: 346
      },
      endpoints: {
        geografia: '/api/geografia/*',
        usuarios: '/api/usuarios/*',
        pagos: '/api/pagos/*',
        reportes: '/api/reportes/*'
      }
    }
  });
});

// Aplicar rate limiting específico
app.use('/api/geografia', geografiaLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/login', authLimiter);

// Rutas principales
app.use('/api', routes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /health',
      'GET /api/info',
      'GET /api/geografia/regiones',
      'GET /api/geografia/provincias',
      'GET /api/geografia/comunas'
    ]
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  Logger.error('Error en aplicación', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Error de validación Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    });
  }

  // Error de conexión a BD
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a base de datos',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  // Error de constraint único
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe',
      field: err.errors[0]?.path || 'unknown'
    });
  }

  // Error de foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Error de integridad referencial',
      code: 'FOREIGN_KEY_ERROR'
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud'
    });
  }

  // Error genérico
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    Logger.info('Iniciando aplicación Sistema de Gestión Escolar v8.0...');

    // Verificar conexión a base de datos
    await sequelize.authenticate();
    Logger.info('✅ Conexión a base de datos establecida correctamente');

    // Sincronizar modelos (sin alteraciones para evitar bloqueos)
    await sequelize.sync({ force: false, alter: false });
    Logger.info('✅ Modelos de base de datos sincronizados');

    // Verificar datos geográficos básicos
    const { Region } = require('./src/models');
    const regionCount = await Region.count();
    
    if (regionCount === 0) {
      Logger.warn('⚠️  No se encontraron datos geográficos. Ejecute el script de carga de datos CUT 2018');
    } else {
      Logger.info(`✅ Datos geográficos cargados: ${regionCount} regiones`);
    }

    Logger.info('✅ Aplicación inicializada correctamente');
    return true;

  } catch (error) {
    Logger.error('❌ Error al inicializar la aplicación', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Configuración del puerto
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Función principal para iniciar el servidor
const startServer = async () => {
  try {
    // Inicializar la aplicación
    await initializeApp();

    // Iniciar el servidor
    const server = app.listen(PORT, HOST, () => {
      Logger.info(`Servidor iniciado correctamente`, {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });

      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🎓 Sistema de Gestión Escolar v8.0 🎓              ║
║                                                              ║
║  Servidor ejecutándose en: http://${HOST}:${PORT}${' '.repeat(Math.max(0, 18 - HOST.length - PORT.toString().length))}║
║  Entorno: ${(process.env.NODE_ENV || 'development').toUpperCase()}${' '.repeat(Math.max(0, 52 - (process.env.NODE_ENV || 'development').length))}║
║  Documentación API: http://${HOST}:${PORT}/api/info${' '.repeat(Math.max(0, 13 - HOST.length - PORT.toString().length))}║
║                                                              ║
║  🗺️  Geografía CUT 2018: 16 regiones, 56 provincias, 346 comunas ║
║                                                              ║
║  Endpoints disponibles:                                      ║
║  • /health                - Estado del servidor             ║
║  • /api/info              - Información del sistema         ║
║  • /api/geografia/*       - APIs geográficas CUT 2018       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });

    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos

    // Manejar cierre graceful del servidor
    const gracefulShutdown = () => {
      Logger.info('Iniciando cierre graceful del servidor...');
      
      server.close((err) => {
        if (err) {
          Logger.error('Error al cerrar el servidor', {
            error: err.message,
            stack: err.stack
          });
          process.exit(1);
        }
        
        Logger.info('Servidor cerrado correctamente');
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        Logger.error('Forzando cierre del servidor después de timeout');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return server;
  } catch (error) {
    Logger.error('Error al iniciar el servidor', {
      error: error.message,
      stack: error.stack,
      port: PORT,
      host: HOST
    });
    
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    ❌ ERROR AL INICIAR ❌                    ║
║                                                              ║
║  No se pudo iniciar el servidor en el puerto ${PORT}${' '.repeat(Math.max(0, 18 - PORT.toString().length))}║
║                                                              ║
║  Error: ${error.message}${' '.repeat(Math.max(0, 56 - error.message.length))}║
║                                                              ║
║  Verifique:                                                  ║
║  • Que el puerto ${PORT} esté disponible${' '.repeat(Math.max(0, 29 - PORT.toString().length))}║
║  • La configuración de la base de datos                     ║
║  • Las variables de entorno                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
    
    process.exit(1);
  }
};

// Si se ejecuta directamente, iniciar servidor
if (require.main === module) {
  startServer();
}

// Exportar app e inicializador
module.exports = { app, initializeApp, startServer };

