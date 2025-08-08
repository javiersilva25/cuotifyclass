const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo basado en la tabla 'usuarios' existente con rol 'apoderado'
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del usuario'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    comment: 'Email del usuario'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Contraseña del usuario (puede ser NULL para OAuth)'
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre del usuario'
  },
  apellido: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Apellido del usuario'
  },
  rol: {
    type: DataTypes.ENUM('apoderado', 'directivo'),
    allowNull: false,
    comment: 'Rol del usuario en el sistema'
  },
  creado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación del usuario'
  },
  // Campos adicionales para apoderados
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección del apoderado'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si el usuario está activo'
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora del último acceso'
  },
  preferencias_pago: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Preferencias de pago del apoderado'
  },
  stripe_customer_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID del cliente en Stripe'
  }
}, {
  tableName: 'usuarios',
  timestamps: false,
  scopes: {
    apoderados: {
      where: {
        rol: 'apoderado'
      }
    },
    directivos: {
      where: {
        rol: 'directivo'
      }
    },
    activos: {
      where: {
        activo: true
      }
    }
  }
});

// Modelo para la relación apoderado-alumno
const ApoderadoAlumno = sequelize.define('ApoderadoAlumno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  apoderado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del usuario que es apoderado'
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del alumno'
  },
  creado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'apoderado_alumno',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['apoderado_id', 'alumno_id']
    }
  ]
});

// Métodos de instancia para Usuario (Apoderado)
Usuario.prototype.toggleActive = function() {
  return this.update({
    activo: !this.activo
  });
};

Usuario.prototype.updateLastAccess = function() {
  return this.update({
    ultimo_acceso: new Date()
  });
};

Usuario.prototype.updatePaymentPreferences = function(preferences) {
  return this.update({
    preferencias_pago: preferences
  });
};

// Métodos estáticos para Usuario
Usuario.findByEmail = function(email) {
  return this.findOne({
    where: { email: email.toLowerCase() }
  });
};

Usuario.findApoderados = function() {
  return this.scope('apoderados').findAll({
    order: [['nombre', 'ASC']]
  });
};

Usuario.findApoderadoActivos = function() {
  return this.scope(['apoderados', 'activos']).findAll({
    order: [['nombre', 'ASC']]
  });
};

// Método para obtener hijos de un apoderado
Usuario.prototype.getHijos = async function() {
  const relaciones = await ApoderadoAlumno.findAll({
    where: { apoderado_id: this.id }
  });
  
  if (relaciones.length === 0) return [];
  
  const Alumno = require('./alumno');
  const alumnosIds = relaciones.map(rel => rel.alumno_id);
  
  return await Alumno.findAll({
    where: { id: alumnosIds }
  });
};

// Método para obtener deudas pendientes de todos los hijos
Usuario.prototype.getDeudasPendientes = async function() {
  const hijos = await this.getHijos();
  if (hijos.length === 0) return [];
  
  const hijosIds = hijos.map(hijo => hijo.id);
  const Pago = require('./pago');
  
  // Buscar pagos pendientes de todos los hijos
  return await Pago.findAll({
    where: {
      alumno_id: hijosIds,
      estado_id: 1 // Asumiendo que 1 = 'Pendiente'
    },
    include: [
      {
        model: require('./cuota'),
        as: 'cuota'
      },
      {
        model: require('./alumno'),
        as: 'alumno'
      }
    ]
  });
};

// Método estático para agregar hijo a apoderado
Usuario.addHijo = async function(apoderadoId, alumnoId) {
  return await ApoderadoAlumno.create({
    apoderado_id: apoderadoId,
    alumno_id: alumnoId
  });
};

// Método estático para remover hijo de apoderado
Usuario.removeHijo = async function(apoderadoId, alumnoId) {
  return await ApoderadoAlumno.destroy({
    where: {
      apoderado_id: apoderadoId,
      alumno_id: alumnoId
    }
  });
};

module.exports = { Usuario, ApoderadoAlumno };

