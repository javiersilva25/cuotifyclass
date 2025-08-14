const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const Cobro = sequelize.define('Cobro', addAuditFields({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  curso_id: { type: DataTypes.INTEGER, allowNull: false },
  concepto: { type: DataTypes.STRING(255), allowNull: false },
  numero_comprobante: { type: DataTypes.STRING(50), allowNull: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  categoria_id: { type: DataTypes.INTEGER, allowNull: true },
  monto_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fecha_emision: { type: DataTypes.DATEONLY, allowNull: true },
  fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: false },
  observaciones: { type: DataTypes.TEXT, allowNull: true }
}), {
  tableName: 'cobros',
  timestamps: false,
  defaultScope: activeScope,
  scopes: { active: activeScope, deleted: deletedScope, all: {} },
  indexes: [
    { fields: ['curso_id'] },
    { fields: ['categoria_id'] },
    { fields: ['fecha_vencimiento'] },
    { fields: ['fecha_eliminacion'] }
  ]
});

Cobro.prototype.softDelete = function(userId) {
  return this.update({ eliminado_por: userId, fecha_eliminacion: new Date() });
};

Cobro.prototype.restore = function() {
  return this.update({ eliminado_por: null, fecha_eliminacion: null });
};

module.exports = Cobro;
