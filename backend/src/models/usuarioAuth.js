const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Modelo UsuarioAuth - Gestión de autenticación por RUT
 * Compatible con sistema v6.0 existente
 */
const UsuarioAuth = sequelize.define('UsuarioAuth', {
  rut_persona: {
    type: DataTypes.STRING(12),
    primaryKey: true,
    allowNull: false,
    comment: 'RUT de la persona',
    references: {
      model: 'personas',
      key: 'rut'
    }
  },
  
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash de la contraseña'
  },
  
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Último acceso al sistema'
  },
  
  intentos_fallidos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Intentos de login fallidos consecutivos'
  },
  
  bloqueado_hasta: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Bloqueado hasta esta fecha'
  },
  
  debe_cambiar_password: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Debe cambiar contraseña en próximo login'
  },
  
  token_recuperacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Token para recuperación de contraseña'
  },
  
  token_expira: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Expiración del token de recuperación'
  },
  
  sesiones_activas: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Información de sesiones activas'
  },
  
  configuracion_usuario: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuraciones personales del usuario'
  },
  
  es_dato_prueba: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Marca si es un dato de prueba para testing'
  },
  
  // Campos de auditoría
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  created_by: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  
  updated_by: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  
  deleted_by: {
    type: DataTypes.STRING(12),
    allowNull: true
  }
}, {
  tableName: 'usuarios_auth',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  
  indexes: [
    {
      fields: ['ultimo_acceso']
    },
    {
      fields: ['token_recuperacion']
    },
    {
      fields: ['bloqueado_hasta']
    },
    {
      fields: ['debe_cambiar_password']
    },
    {
      fields: ['es_dato_prueba']
    }
  ],
  
  hooks: {
    beforeCreate: (usuario, options) => {
      if (options.user) {
        usuario.created_by = options.user.rut;
      }
    },
    
    beforeUpdate: (usuario, options) => {
      if (options.user) {
        usuario.updated_by = options.user.rut;
      }
    },
    
    beforeDestroy: (usuario, options) => {
      if (options.user) {
        usuario.deleted_by = options.user.rut;
      }
    }
  }
});

/**
 * Métodos estáticos para gestión de contraseñas
 */
UsuarioAuth.generarPasswordSegura = function(longitud = 8) {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  
  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return password;
};

UsuarioAuth.hashPassword = async function(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

UsuarioAuth.compararPassword = async function(password, hash) {
  return await bcrypt.compare(password, hash);
};

UsuarioAuth.generarTokenRecuperacion = function() {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Métodos estáticos para autenticación
 */
UsuarioAuth.autenticar = async function(email, password) {
  const Persona = require('./persona');
  
  // Buscar persona por email
  const persona = await Persona.findOne({
    where: { 
      email: email,
      activo: true 
    }
  });
  
  if (!persona) {
    return {
      exito: false,
      razon: 'USUARIO_NO_ENCONTRADO',
      mensaje: 'Email no encontrado'
    };
  }
  
  // Buscar datos de autenticación
  const usuario = await UsuarioAuth.findByPk(persona.rut);
  
  if (!usuario) {
    return {
      exito: false,
      razon: 'AUTH_NO_CONFIGURADA',
      mensaje: 'Usuario sin credenciales configuradas'
    };
  }
  
  // Verificar si está bloqueado
  if (usuario.estaBloqueado()) {
    return {
      exito: false,
      razon: 'USUARIO_BLOQUEADO',
      mensaje: 'Usuario bloqueado temporalmente',
      bloqueado_hasta: usuario.bloqueado_hasta
    };
  }
  
  // Verificar contraseña
  const passwordValida = await UsuarioAuth.compararPassword(password, usuario.password_hash);
  
  if (!passwordValida) {
    await usuario.registrarIntentoFallido();
    
    return {
      exito: false,
      razon: 'PASSWORD_INCORRECTA',
      mensaje: 'Contraseña incorrecta',
      intentos_restantes: Math.max(0, 5 - usuario.intentos_fallidos)
    };
  }
  
  // Autenticación exitosa
  await usuario.registrarAccesoExitoso();
  
  return {
    exito: true,
    persona: persona,
    usuario: usuario,
    debe_cambiar_password: usuario.debe_cambiar_password
  };
};

UsuarioAuth.crearUsuario = async function(rutPersona, passwordTemporal = null) {
  const password = passwordTemporal || UsuarioAuth.generarPasswordSegura();
  const passwordHash = await UsuarioAuth.hashPassword(password);
  
  const usuario = await UsuarioAuth.create({
    rut_persona: rutPersona,
    password_hash: passwordHash,
    debe_cambiar_password: true
  });
  
  return {
    usuario: usuario,
    password_temporal: password
  };
};

/**
 * Métodos de instancia
 */
UsuarioAuth.prototype.estaBloqueado = function() {
  if (!this.bloqueado_hasta) return false;
  return new Date() < this.bloqueado_hasta;
};

UsuarioAuth.prototype.registrarIntentoFallido = async function() {
  this.intentos_fallidos += 1;
  
  // Bloquear después de 5 intentos fallidos
  if (this.intentos_fallidos >= 5) {
    this.bloqueado_hasta = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
  }
  
  await this.save();
};

UsuarioAuth.prototype.registrarAccesoExitoso = async function() {
  this.ultimo_acceso = new Date();
  this.intentos_fallidos = 0;
  this.bloqueado_hasta = null;
  
  await this.save();
};

UsuarioAuth.prototype.cambiarPassword = async function(nuevaPassword) {
  this.password_hash = await UsuarioAuth.hashPassword(nuevaPassword);
  this.debe_cambiar_password = false;
  this.token_recuperacion = null;
  this.token_expira = null;
  
  await this.save();
};

UsuarioAuth.prototype.generarTokenRecuperacion = async function() {
  this.token_recuperacion = UsuarioAuth.generarTokenRecuperacion();
  this.token_expira = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  
  await this.save();
  
  return this.token_recuperacion;
};

UsuarioAuth.prototype.validarTokenRecuperacion = function(token) {
  if (!this.token_recuperacion || !this.token_expira) {
    return false;
  }
  
  if (new Date() > this.token_expira) {
    return false;
  }
  
  return this.token_recuperacion === token;
};

UsuarioAuth.prototype.resetearPassword = async function(token, nuevaPassword) {
  if (!this.validarTokenRecuperacion(token)) {
    throw new Error('Token de recuperación inválido o expirado');
  }
  
  await this.cambiarPassword(nuevaPassword);
};

UsuarioAuth.prototype.agregarSesion = async function(sessionInfo) {
  const sesiones = this.sesiones_activas || [];
  
  // Limitar a máximo 3 sesiones activas
  if (sesiones.length >= 3) {
    sesiones.shift(); // Remover la más antigua
  }
  
  sesiones.push({
    id: crypto.randomUUID(),
    inicio: new Date(),
    ip: sessionInfo.ip,
    userAgent: sessionInfo.userAgent,
    activa: true
  });
  
  this.sesiones_activas = sesiones;
  await this.save();
  
  return sesiones[sesiones.length - 1].id;
};

UsuarioAuth.prototype.cerrarSesion = async function(sessionId) {
  if (!this.sesiones_activas) return;
  
  const sesiones = this.sesiones_activas.map(sesion => {
    if (sesion.id === sessionId) {
      sesion.activa = false;
      sesion.fin = new Date();
    }
    return sesion;
  });
  
  this.sesiones_activas = sesiones;
  await this.save();
};

UsuarioAuth.prototype.cerrarTodasLasSesiones = async function() {
  if (!this.sesiones_activas) return;
  
  const sesiones = this.sesiones_activas.map(sesion => ({
    ...sesion,
    activa: false,
    fin: new Date()
  }));
  
  this.sesiones_activas = sesiones;
  await this.save();
};

UsuarioAuth.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // No incluir información sensible
  delete values.password_hash;
  delete values.token_recuperacion;
  
  // Agregar campos calculados
  values.bloqueado = this.estaBloqueado();
  values.sesiones_activas_count = this.sesiones_activas ? 
    this.sesiones_activas.filter(s => s.activa).length : 0;
  
  return values;
};

module.exports = UsuarioAuth;

