const config = require('../config/config');

class Logger {
  static log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };
    
    if (config.server.env === 'development') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
  
  static info(message, meta = {}) {
    this.log('info', message, meta);
  }
  
  static error(message, meta = {}) {
    this.log('error', message, meta);
  }
  
  static warn(message, meta = {}) {
    this.log('warn', message, meta);
  }
  
  static debug(message, meta = {}) {
    if (config.logging.level === 'debug') {
      this.log('debug', message, meta);
    }
  }
}

module.exports = Logger;

