const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoriaCobro = sequelize.define('CategoriaCobro', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  descripcion: { type: DataTypes.STRING(255), allowNull: true },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  creado_por: { type: DataTypes.INTEGER, allowNull: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  actualizado_por: { type: DataTypes.INTEGER, allowNull: true },
  fecha_actualizacion: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'categorias_cobro',
  timestamps: false
});

module.exports = CategoriaCobro;
