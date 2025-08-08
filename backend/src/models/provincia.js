const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo de Provincia de Chile
 * Basado en CUT_2018_v04.xls - Código Único Territorial
 */
const Provincia = sequelize.define('Provincia', {
  codigo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    comment: 'Código único de la provincia según CUT 2018'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre oficial de la provincia'
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
    comment: 'Indica si la provincia está activa'
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
  tableName: 'provincias',
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
      fields: ['codigo_region']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['codigo_region', 'nombre']
    }
  ],
  hooks: {
    beforeCreate: (provincia, options) => {
      if (options.user) {
        provincia.createdBy = options.user.rut || options.user.id;
      }
    },
    beforeUpdate: (provincia, options) => {
      if (options.user) {
        provincia.updatedBy = options.user.rut || options.user.id;
      }
    },
    beforeDestroy: (provincia, options) => {
      if (options.user) {
        provincia.deletedBy = options.user.rut || options.user.id;
      }
    }
  }
});

/**
 * Asociaciones del modelo
 */
Provincia.associate = (models) => {
  // Una provincia pertenece a una región
  Provincia.belongsTo(models.Region, {
    foreignKey: 'codigoRegion',
    as: 'region'
  });
  
  // Una provincia tiene muchas comunas
  Provincia.hasMany(models.Comuna, {
    foreignKey: 'codigoProvincia',
    as: 'comunas'
  });
  
  // Una provincia puede tener muchas personas
  Provincia.hasMany(models.Persona, {
    foreignKey: 'codigoProvincia',
    as: 'personas'
  });
};

/**
 * Métodos del modelo
 */
Provincia.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Formatear datos para respuesta
  return {
    codigo: values.codigo,
    nombre: values.nombre,
    codigoRegion: values.codigoRegion,
    activo: values.activo,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt
  };
};

/**
 * Métodos estáticos
 */
Provincia.findByCodigo = function(codigo) {
  return this.findOne({
    where: { codigo, activo: true },
    include: [
      {
        model: sequelize.models.Region,
        as: 'region'
      }
    ]
  });
};

Provincia.findByRegion = function(codigoRegion) {
  return this.findAll({
    where: { 
      codigoRegion,
      activo: true 
    },
    order: [['nombre', 'ASC']],
    include: [
      {
        model: sequelize.models.Region,
        as: 'region'
      }
    ]
  });
};

Provincia.findByNombre = function(nombre, codigoRegion = null) {
  const whereClause = {
    nombre: {
      [sequelize.Op.like]: `%${nombre}%`
    },
    activo: true
  };
  
  if (codigoRegion) {
    whereClause.codigoRegion = codigoRegion;
  }
  
  return this.findAll({
    where: whereClause,
    include: [
      {
        model: sequelize.models.Region,
        as: 'region'
      }
    ]
  });
};

Provincia.getAll = function() {
  return this.findAll({
    where: { activo: true },
    order: [['codigoRegion', 'ASC'], ['nombre', 'ASC']],
    include: [
      {
        model: sequelize.models.Region,
        as: 'region'
      },
      {
        model: sequelize.models.Comuna,
        as: 'comunas',
        where: { activo: true },
        required: false
      }
    ]
  });
};

module.exports = Provincia;

