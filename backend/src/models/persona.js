const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Persona - Tabla principal con RUT como identificador único
 * Versión 8.0 - Sistema de Gestión Escolar con geografía CUT 2018
 */
const Persona = sequelize.define('Persona', {
  // RUT como clave primaria
  rut: {
    type: DataTypes.STRING(12),
    primaryKey: true,
    allowNull: false,
    comment: 'RUT chileno sin puntos ni guión (ej: 12345678K)',
    validate: {
      isValidRUT(value) {
        if (!this.validarRUT(value)) {
          throw new Error('RUT inválido');
        }
      }
    }
  },
  
  rut_formateado: {
    type: DataTypes.STRING(15),
    allowNull: false,
    comment: 'RUT formateado (ej: 12.345.678-K)'
  },
  
  nombres: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombres de la persona'
  },
  
  apellido_paterno: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Apellido paterno'
  },
  
  apellido_materno: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Apellido materno'
  },
  
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de nacimiento'
  },
  
  genero: {
    type: DataTypes.ENUM('M', 'F', 'O'),
    allowNull: false,
    comment: 'Género: Masculino, Femenino, Otro'
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: 'Email único para autenticación',
    validate: {
      isEmail: true
    }
  },
  
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección específica (calle, número, depto, etc.)'
  },
  
  // Geografía según CUT 2018
  codigo_comuna: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Código de comuna según CUT 2018',
    references: {
      model: 'comunas',
      key: 'codigo'
    }
  },
  
  codigo_provincia: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Código de provincia según CUT 2018',
    references: {
      model: 'provincias',
      key: 'codigo'
    }
  },
  
  codigo_region: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Código de región según CUT 2018',
    references: {
      model: 'regiones',
      key: 'codigo'
    }
  },
  
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si la persona está activa en el sistema'
  },
  
  es_dato_prueba: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Marca si es un dato de prueba para testing'
  },
  
  // Campos de auditoría
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación'
  },
  
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de última actualización'
  },
  
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de eliminación (soft delete)'
  },
  
  created_by: {
    type: DataTypes.STRING(12),
    allowNull: true,
    comment: 'RUT del usuario que creó el registro'
  },
  
  updated_by: {
    type: DataTypes.STRING(12),
    allowNull: true,
    comment: 'RUT del usuario que actualizó el registro'
  },
  
  deleted_by: {
    type: DataTypes.STRING(12),
    allowNull: true,
    comment: 'RUT del usuario que eliminó el registro'
  }
}, {
  tableName: 'personas',
  timestamps: true,
  paranoid: true, // Soft delete
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['nombres']
    },
    {
      fields: ['apellido_paterno', 'apellido_materno']
    },
    {
      fields: ['codigo_comuna']
    },
    {
      fields: ['codigo_provincia']
    },
    {
      fields: ['codigo_region']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['es_dato_prueba']
    },
    {
      fields: ['created_at']
    }
  ],
  
  hooks: {
    beforeCreate: (persona, options) => {
      // Formatear RUT automáticamente
      persona.rut_formateado = Persona.formatearRUT(persona.rut);
      
      // Establecer usuario que crea
      if (options.user) {
        persona.created_by = options.user.rut;
      }
    },
    
    beforeUpdate: (persona, options) => {
      // Actualizar RUT formateado si cambió
      if (persona.changed('rut')) {
        persona.rut_formateado = Persona.formatearRUT(persona.rut);
      }
      
      // Establecer usuario que actualiza
      if (options.user) {
        persona.updated_by = options.user.rut;
      }
    },
    
    beforeDestroy: (persona, options) => {
      // Establecer usuario que elimina
      if (options.user) {
        persona.deleted_by = options.user.rut;
      }
    }
  }
});

/**
 * Asociaciones
 */
Persona.associate = function(models) {
  // Una persona pertenece a una comuna
  Persona.belongsTo(models.Comuna, {
    foreignKey: 'codigo_comuna',
    as: 'comuna'
  });
  
  // Una persona pertenece a una provincia
  Persona.belongsTo(models.Provincia, {
    foreignKey: 'codigo_provincia',
    as: 'provincia'
  });
  
  // Una persona pertenece a una región
  Persona.belongsTo(models.Region, {
    foreignKey: 'codigo_region',
    as: 'region'
  });
  
  // Relaciones con otros modelos del sistema
  Persona.hasMany(models.PersonaRol, {
    foreignKey: 'rut_persona',
    as: 'roles'
  });
  
  Persona.hasOne(models.UsuarioAuth, {
    foreignKey: 'rut_persona',
    as: 'auth'
  });
};

/**
 * Métodos estáticos para validación de RUT
 */
Persona.validarRUT = function(rut) {
  if (!rut) return false;
  
  // Remover puntos y guión
  const rutLimpio = rut.toString().replace(/[.-]/g, '').toUpperCase();
  
  // Verificar formato
  if (!/^\d{7,8}[0-9K]$/.test(rutLimpio)) {
    return false;
  }
  
  // Calcular dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
  return dv === dvCalculado;
};

Persona.formatearRUT = function(rut) {
  if (!rut) return '';
  
  // Limpiar RUT
  const rutLimpio = rut.toString().replace(/[.-]/g, '').toUpperCase();
  
  if (rutLimpio.length < 8) return rut;
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Formatear con puntos
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${cuerpoFormateado}-${dv}`;
};

Persona.limpiarRUT = function(rut) {
  if (!rut) return '';
  return rut.toString().replace(/[.-]/g, '').toUpperCase();
};

/**
 * Métodos de instancia
 */
Persona.prototype.getNombreCompleto = function() {
  return `${this.nombres} ${this.apellido_paterno} ${this.apellido_materno || ''}`.trim();
};

Persona.prototype.getEdad = function() {
  const hoy = new Date();
  const nacimiento = new Date(this.fecha_nacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

Persona.prototype.esAdulto = function() {
  return this.getEdad() >= 18;
};

Persona.prototype.getDireccionCompleta = function() {
  const partes = [];
  
  if (this.direccion) partes.push(this.direccion);
  if (this.comuna && this.comuna.nombre) partes.push(this.comuna.nombre);
  if (this.provincia && this.provincia.nombre) partes.push(this.provincia.nombre);
  if (this.region && this.region.nombre) partes.push(this.region.nombre);
  
  return partes.join(', ');
};

Persona.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Agregar campos calculados
  values.nombre_completo = this.getNombreCompleto();
  values.edad = this.getEdad();
  values.es_adulto = this.esAdulto();
  values.direccion_completa = this.getDireccionCompleta();
  
  return values;
};

/**
 * Métodos estáticos adicionales
 */
Persona.findByRUT = function(rut) {
  const rutLimpio = this.limpiarRUT(rut);
  return this.findOne({
    where: { rut: rutLimpio },
    include: [
      {
        model: sequelize.models.Comuna,
        as: 'comuna',
        include: [
          {
            model: sequelize.models.Provincia,
            as: 'provincia',
            include: [
              {
                model: sequelize.models.Region,
                as: 'region'
              }
            ]
          }
        ]
      }
    ]
  });
};

Persona.findByComuna = function(codigoComuna) {
  return this.findAll({
    where: { 
      codigo_comuna: codigoComuna,
      activo: true 
    },
    include: [
      {
        model: sequelize.models.Comuna,
        as: 'comuna'
      }
    ]
  });
};

Persona.findByRegion = function(codigoRegion) {
  return this.findAll({
    where: { 
      codigo_region: codigoRegion,
      activo: true 
    },
    include: [
      {
        model: sequelize.models.Region,
        as: 'region'
      }
    ]
  });
};

module.exports = Persona;

