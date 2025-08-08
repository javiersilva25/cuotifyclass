const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Región de Chile
 * Basado en CUT_2018_v04.xls - Código Único Territorial
 */
const Region = sequelize.define('Region', {
  codigo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: 'Código único de la región según CUT 2018'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre oficial de la región'
  },
  abreviatura: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Abreviatura oficial de la región'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si la región está activa'
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
  tableName: 'regiones',
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
      fields: ['abreviatura']
    },
    {
      fields: ['activo']
    }
  ],
  hooks: {
    beforeCreate: (region, options) => {
      if (options.user) {
        region.createdBy = options.user.rut || options.user.id;
      }
    },
    beforeUpdate: (region, options) => {
      if (options.user) {
        region.updatedBy = options.user.rut || options.user.id;
      }
    },
    beforeDestroy: (region, options) => {
      if (options.user) {
        region.deletedBy = options.user.rut || options.user.id;
      }
    }
  }
});

/**
 * Asociaciones del modelo
 */
Region.associate = (models) => {
  // Una región tiene muchas provincias
  Region.hasMany(models.Provincia, {
    foreignKey: 'codigoRegion',
    as: 'provincias'
  });
  
  // Una región tiene muchas comunas (a través de provincias)
  Region.hasMany(models.Comuna, {
    foreignKey: 'codigoRegion',
    as: 'comunas'
  });
  
  // Una región puede tener muchas personas
  Region.hasMany(models.Persona, {
    foreignKey: 'codigoRegion',
    as: 'personas'
  });
};

/**
 * Métodos del modelo
 */
Region.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Formatear datos para respuesta
  return {
    codigo: values.codigo,
    nombre: values.nombre,
    abreviatura: values.abreviatura,
    activo: values.activo,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

/**
 * Métodos estáticos
 */
Region.findByCodigo = function(codigo) {
  return this.findOne({
    where: { codigo, activo: true }
  });
};

Region.findByNombre = function(nombre) {
  return this.findOne({
    where: { 
      nombre: {
        [sequelize.Op.like]: `%${nombre}%`
      },
      activo: true 
    }
  });
};

Region.getAll = function() {
  return this.findAll({
    where: { activo: true },
    order: [['codigo', 'ASC']],
    include: [
      {
        model: sequelize.models.Provincia,
        as: 'provincias',
        where: { activo: true },
        required: false
      }
    ]
  });
};

module.exports = Region;

