const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const DeudaAlumno = sequelize.define('DeudaAlumno', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la deuda del alumno'
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del alumno que tiene la deuda'
  },
  cobro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del cobro asociado a la deuda'
  },
  monto_adeudado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto adeudado por el alumno'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'parcialmente_pagado', 'anulado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'Estado de la deuda'
  }
}), {
  tableName: 'deudas_alumnos',
  timestamps: false,
  defaultScope: activeScope,
  scopes: {
    active: activeScope,
    deleted: deletedScope,
    all: {},
    pendientes: {
      where: {
        estado: 'pendiente',
        fecha_eliminacion: null
      }
    },
    pagadas: {
      where: {
        estado: 'pagado',
        fecha_eliminacion: null
      }
    },
    parciales: {
      where: {
        estado: 'parcialmente_pagado',
        fecha_eliminacion: null
      }
    }
  },
  indexes: [
    {
      fields: ['alumno_id']
    },
    {
      fields: ['cobro_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_eliminacion']
    },
    {
      unique: true,
      fields: ['alumno_id', 'cobro_id']
    }
  ]
});

// Método de instancia para soft delete
DeudaAlumno.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
DeudaAlumno.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método de instancia para marcar como pagado
DeudaAlumno.prototype.marcarPagado = function(userId) {
  return this.update({
    estado: 'pagado',
    actualizado_por: userId,
    fecha_actualizacion: new Date()
  });
};

// Método de instancia para marcar como parcialmente pagado
DeudaAlumno.prototype.marcarParcial = function(userId) {
  return this.update({
    estado: 'parcialmente_pagado',
    actualizado_por: userId,
    fecha_actualizacion: new Date()
  });
};

// Método de instancia para anular
DeudaAlumno.prototype.anular = function(userId) {
  return this.update({
    estado: 'anulado',
    actualizado_por: userId,
    fecha_actualizacion: new Date()
  });
};

// Método estático para buscar por alumno
DeudaAlumno.findByAlumno = function(alumnoId) {
  return this.findAll({
    where: { alumno_id: alumnoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar deudas pendientes por alumno
DeudaAlumno.findPendientesByAlumno = function(alumnoId) {
  return this.scope('pendientes').findAll({
    where: { alumno_id: alumnoId },
    order: [['fecha_creacion', 'ASC']]
  });
};

// Método estático para calcular total adeudado por alumno
DeudaAlumno.getTotalAdeudadoByAlumno = function(alumnoId) {
  const { Op } = require('sequelize');
  return this.sum('monto_adeudado', {
    where: {
      alumno_id: alumnoId,
      estado: {
        [Op.in]: ['pendiente', 'parcialmente_pagado']
      }
    }
  });
};

// Método estático para buscar por cobro
DeudaAlumno.findByCobro = function(cobroId) {
  return this.findAll({
    where: { cobro_id: cobroId },
    order: [['fecha_creacion', 'DESC']]
  });
};

module.exports = DeudaAlumno;

