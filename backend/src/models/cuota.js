const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cuota = sequelize.define('Cuota', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la cuota'
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del curso al que pertenece la cuota'
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre de la cuota (ej: "Cuota de marzo")'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto de la cuota'
  },
  fecha_limite_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha límite para el pago de la cuota'
  },
  creado_en: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de creación de la cuota'
  }
}, {
  tableName: 'cuotas',
  timestamps: false,
  indexes: [
    {
      fields: ['curso_id']
    },
    {
      fields: ['fecha_limite_pago']
    }
  ]
});

// Métodos estáticos
Cuota.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId },
    order: [['fecha_limite_pago', 'ASC']]
  });
};

Cuota.findVencidas = function() {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      fecha_limite_pago: {
        [Op.lt]: new Date()
      }
    },
    order: [['fecha_limite_pago', 'ASC']]
  });
};

Cuota.findProximasVencer = function(dias = 7) {
  const { Op } = require('sequelize');
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + dias);
  
  return this.findAll({
    where: {
      fecha_limite_pago: {
        [Op.between]: [new Date(), fechaLimite]
      }
    },
    order: [['fecha_limite_pago', 'ASC']]
  });
};

module.exports = Cuota;

