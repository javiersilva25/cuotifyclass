const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const CobroAlumno = sequelize.define('CobroAlumno', addAuditFields({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  alumno_id: { type: DataTypes.INTEGER, allowNull: false },
  concepto: { type: DataTypes.STRING(255), allowNull: false },
  numero_comprobante: { type: DataTypes.STRING(50), allowNull: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  categoria_id: { type: DataTypes.INTEGER, allowNull: true },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  fecha_emision: { type: DataTypes.DATEONLY, allowNull: true },
  fecha_vencimiento: { type: DataTypes.DATEONLY, allowNull: false },
  observaciones: { type: DataTypes.TEXT, allowNull: true },
  metodo_pago: { type: DataTypes.STRING(60), allowNull: true },
  estado: { type: DataTypes.ENUM('pendiente','pagado','vencido','anulado'), allowNull: false, defaultValue: 'pendiente' },
  transaccion_id: { type: DataTypes.STRING(100), allowNull: true }
}), {
  tableName: 'cobros_alumnos',
  timestamps: false,
  defaultScope: activeScope,
  scopes: { active: activeScope, deleted: deletedScope, all: {} },
  indexes: [
    { fields: ['alumno_id'] },
    { fields: ['categoria_id'] },
    { fields: ['fecha_vencimiento'] },
    { fields: ['fecha_eliminacion'] }
  ]
});

CobroAlumno.prototype.softDelete = function(userId) {
  return this.update({ eliminado_por: userId, fecha_eliminacion: new Date() });
};

CobroAlumno.prototype.restore = function() {
  return this.update({ eliminado_por: null, fecha_eliminacion: null });
};

module.exports = CobroAlumno;
