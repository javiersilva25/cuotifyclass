// Exportar todos los middlewares desde un solo archivo
const auth = require('./auth');
const cors = require('./cors');
const errorHandler = require('./errorHandler');
const rateLimiter = require('./rateLimiter');

module.exports = {
  // Middleware de autenticación
  ...auth,
  
  // Middleware de CORS
  ...cors,
  
  // Middleware de manejo de errores
  ...errorHandler,
  
  // Middleware de rate limiting
  ...rateLimiter
};

