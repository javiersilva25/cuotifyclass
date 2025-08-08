const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const Cobro = sequelize.define('Cobro', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del cobro'
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del curso al que pertenece el cobro'
  },
  concepto: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Concepto o descripción del cobro'
  },
  monto_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto total del cobro'
  },
  fecha_vencimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de vencimiento del cobro'
  }
}), {
  tableName: 'cobros',
  timestamps: false,
  defaultScope: activeScope,
  scopes: {
    active: activeScope,
    deleted: deletedScope,
    all: {}
  },
  indexes: [
    {
      fields: ['curso_id']
    },
    {
      fields: ['fecha_vencimiento']
    },
    {
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
Cobro.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
Cobro.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por curso
Cobro.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId },
    order: [['fecha_vencimiento', 'ASC']]
  });
};

// Método estático para buscar cobros vencidos
Cobro.findVencidos = function() {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      fecha_vencimiento: {
        [Op.lt]: new Date()
      }
    },
    order: [['fecha_vencimiento', 'ASC']]
  });
};

// Método estático para buscar cobros por rango de fechas
Cobro.findByDateRange = function(fechaInicio, fechaFin) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      fecha_vencimiento: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    },
    order: [['fecha_vencimiento', 'ASC']]
  });
};

module.exports = Cobro;

