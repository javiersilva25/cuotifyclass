const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Comuna de Chile
 * Basado en CUT_2018_v04.xls - Código Único Territorial
 */
const Comuna = sequelize.define('Comuna', {
  codigo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: 'Código único de la comuna según CUT 2018'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre oficial de la comuna'
  },
  codigoProvincia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'codigo_provincia',
    comment: 'Código de la provincia a la que pertenece'
  },
  codigoRegion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'codigo_region',
    comment: 'Código de la región a la que pertenece'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si la comuna está activa'
  },
  // Campos de auditoría
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  },
  createdBy: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'created_by',
    comment: 'Usuario que creó el registro'
  },
  updatedBy: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'updated_by',
    comment: 'Usuario que actualizó el registro'
  },
  deletedBy: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'deleted_by',
    comment: 'Usuario que eliminó el registro'
  }
}, {
  tableName: 'comunas',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['codigo']
    },
    {
      fields: ['nombre']
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
      fields: ['codigo_region', 'codigo_provincia', 'nombre']
    }
  ],
  hooks: {
    beforeCreate: (comuna, options) => {
      if (options.user) {
        comuna.createdBy = options.user.rut || options.user.id;
      }
    },
    beforeUpdate: (comuna, options) => {
      if (options.user) {
        comuna.updatedBy = options.user.rut || options.user.id;
      }
    },
    beforeDestroy: (comuna, options) => {
      if (options.user) {
        comuna.deletedBy = options.user.rut || options.user.id;
      }
    }
  }
});

/**
 * Asociaciones del modelo
 */
Comuna.associate = (models) => {
  // Una comuna pertenece a una provincia
  Comuna.belongsTo(models.Provincia, {
    foreignKey: 'codigoProvincia',
    as: 'provincia'
  });
  
  // Una comuna pertenece a una región
  Comuna.belongsTo(models.Region, {
    foreignKey: 'codigoRegion',
    as: 'region'
  });
  
  // Una comuna puede tener muchas personas
  Comuna.hasMany(models.Persona, {
    foreignKey: 'codigoComuna',
    as: 'personas'
  });
};

/**
 * Métodos del modelo
 */
Comuna.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Formatear datos para respuesta
  return {
    codigo: values.codigo,
    nombre: values.nombre,
    codigoProvincia: values.codigoProvincia,
    codigoRegion: values.codigoRegion,
    activo: values.activo,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

/**
 * Métodos estáticos
 */
Comuna.findByCodigo = function(codigo) {
  return this.findOne({
    where: { codigo, activo: true },
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
  });
};

Comuna.findByProvincia = function(codigoProvincia) {
  return this.findAll({
    where: { 
      codigoProvincia,
      activo: true 
    },
    order: [['nombre', 'ASC']],
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
  });
};

Comuna.findByRegion = function(codigoRegion) {
  return this.findAll({
    where: { 
      codigoRegion,
      activo: true 
    },
    order: [['nombre', 'ASC']],
    include: [
      {
        model: sequelize.models.Provincia,
        as: 'provincia'
      },
      {
        model: sequelize.models.Region,
        as: 'region'
      }
    ]
  });
};

Comuna.findByNombre = function(nombre, codigoProvincia = null, codigoRegion = null) {
  const whereClause = {
    nombre: {
      [sequelize.Op.like]: `%${nombre}%`
    },
    activo: true
  };
  
  if (codigoProvincia) {
    whereClause.codigoProvincia = codigoProvincia;
  }
  
  if (codigoRegion) {
    whereClause.codigoRegion = codigoRegion;
  }
  
  return this.findAll({
    where: whereClause,
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
  });
};

Comuna.getAll = function() {
  return this.findAll({
    where: { activo: true },
    order: [['codigoRegion', 'ASC'], ['codigoProvincia', 'ASC'], ['nombre', 'ASC']],
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
  });
};

/**
 * Método para obtener dirección completa
 */
Comuna.prototype.getDireccionCompleta = function() {
  return `${this.nombre}, ${this.provincia?.nombre}, ${this.provincia?.region?.nombre}`;
};

module.exports = Comuna;

