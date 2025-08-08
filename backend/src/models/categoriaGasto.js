const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const CategoriaGasto = sequelize.define('CategoriaGasto', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la categoría de gasto'
  },
  nombre_categoria: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'Nombre de la categoría de gasto'
  }
}), {
  tableName: 'categorias_gastos',
  timestamps: false,
  defaultScope: activeScope,
  scopes: {
    active: activeScope,
    deleted: deletedScope,
    all: {}
  },
  indexes: [
    {
      unique: true,
      fields: ['nombre_categoria']
    },
    {
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
CategoriaGasto.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
CategoriaGasto.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por nombre
CategoriaGasto.findByNombre = function(nombre) {
  return this.findOne({
    where: { nombre_categoria: nombre }
  });
};

// Método estático para obtener categorías activas ordenadas
CategoriaGasto.findAllActive = function() {
  return this.findAll({
    order: [['nombre_categoria', 'ASC']]
  });
};

module.exports = CategoriaGasto;

