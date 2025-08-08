const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EstadoPago = sequelize.define('EstadoPago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del estado de pago'
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Nombre del estado (ej: Pendiente, Pagado, Vencido)'
  }
}, {
  tableName: 'estado_pago',
  timestamps: false
});

// Constantes para los estados más comunes
EstadoPago.ESTADOS = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado'
};

// Método para obtener ID por nombre de estado
EstadoPago.getIdByEstado = async function(nombreEstado) {
  const estado = await this.findOne({
    where: { estado: nombreEstado }
  });
  return estado ? estado.id : null;
};

module.exports = EstadoPago;

