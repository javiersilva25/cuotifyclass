require('dotenv').config();

const { app, initializeApp } = require('./app');
const Logger = require('./utils/logger');

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
║           🎓 Sistema de Gestión Escolar API 🎓               ║
║                                                              ║
║  Servidor ejecutándose en: http://${HOST}:${PORT}${' '.repeat(Math.max(0, 18 - HOST.length - PORT.toString().length))}║
║  Entorno: ${(process.env.NODE_ENV || 'development').toUpperCase()}${' '.repeat(Math.max(0, 52 - (process.env.NODE_ENV || 'development').length))}║
║  Documentación API: http://${HOST}:${PORT}/api/info${' '.repeat(Math.max(0, 13 - HOST.length - PORT.toString().length))}║
║                                                              ║
║  Endpoints disponibles:                                      ║
║  • /api/alumnos           - Gestión de alumnos              ║
║  • /api/cursos            - Gestión de cursos               ║
║  • /api/cobros            - Gestión de cobros               ║
║  • /api/gastos            - Gestión de gastos               ║
║  • /api/movimientos-ccaa  - Movimientos CCAA                ║
║  • /api/movimientos-ccpp  - Movimientos CCPP                ║
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

// Verificar variables de entorno críticas
const checkEnvironment = () => {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT', 
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    Logger.error('Variables de entorno faltantes', { missingVars });
    
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              ⚠️  VARIABLES DE ENTORNO FALTANTES ⚠️           ║
║                                                              ║
║  Las siguientes variables son requeridas:                   ║
${missingVars.map(v => `║  • ${v}${' '.repeat(Math.max(0, 58 - v.length))}║`).join('\n')}
║                                                              ║
║  Cree un archivo .env con estas variables o configúrelas    ║
║  en su entorno de ejecución.                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
    
    process.exit(1);
  }
};

// Verificar entorno y iniciar servidor
checkEnvironment();
startServer();

// Exportar para testing
module.exports = { startServer };

