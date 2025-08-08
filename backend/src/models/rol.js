const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Rol - Define los roles disponibles en el sistema
 * Adaptado a estructura existente de la BD
 */
const Rol = sequelize.define('Rol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  nombre_rol: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Nombre único del rol'
  },
  
  // Campos de auditoría existentes
  creado_por: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  actualizado_por: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  eliminado_por: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'roles',
  timestamps: false, // Usar campos personalizados
  
  indexes: [
    {
      fields: ['nombre_rol'],
      unique: true
    }
  ]
});

/**
 * Métodos estáticos simplificados
 */
Rol.getRolesPorNombre = function(nombre) {
  return this.findOne({
    where: {
      nombre_rol: nombre
    }
  });
};

Rol.getTodosLosRoles = function() {
  return this.findAll({
    where: {
      fecha_eliminacion: null // Solo roles activos
    }
  });
};

/**
 * Métodos de instancia
 */
Rol.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  return values;
};

module.exports = Rol;

