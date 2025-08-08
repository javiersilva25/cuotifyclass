const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const DeudaCompanero = sequelize.define('DeudaCompanero', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la deuda entre compañeros'
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del alumno que tiene la deuda'
  },
  cobro_alumnos_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del cobro de alumnos asociado'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'Estado de la deuda entre compañeros'
  }
}), {
  tableName: 'deudas_companeros',
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
    }
  },
  indexes: [
    {
      fields: ['alumno_id']
    },
    {
      fields: ['cobro_alumnos_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['fecha_eliminacion']
    },
    {
      unique: true,
      fields: ['alumno_id', 'cobro_alumnos_id']
    }
  ]
});

// Método de instancia para soft delete
DeudaCompanero.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
DeudaCompanero.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método de instancia para marcar como pagado
DeudaCompanero.prototype.marcarPagado = function(userId) {
  return this.update({
    estado: 'pagado',
    actualizado_por: userId,
    fecha_actualizacion: new Date()
  });
};

// Método estático para buscar por alumno
DeudaCompanero.findByAlumno = function(alumnoId) {
  return this.findAll({
    where: { alumno_id: alumnoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar deudas pendientes por alumno
DeudaCompanero.findPendientesByAlumno = function(alumnoId) {
  return this.scope('pendientes').findAll({
    where: { alumno_id: alumnoId },
    order: [['fecha_creacion', 'ASC']]
  });
};

// Método estático para buscar por cobro de alumnos
DeudaCompanero.findByCobroAlumnos = function(cobroAlumnosId) {
  return this.findAll({
    where: { cobro_alumnos_id: cobroAlumnosId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para contar deudas pendientes por cobro
DeudaCompanero.countPendientesByCobroAlumnos = function(cobroAlumnosId) {
  return this.scope('pendientes').count({
    where: { cobro_alumnos_id: cobroAlumnosId }
  });
};

// Método estático para contar deudas pagadas por cobro
DeudaCompanero.countPagadasByCobroAlumnos = function(cobroAlumnosId) {
  return this.scope('pagadas').count({
    where: { cobro_alumnos_id: cobroAlumnosId }
  });
};

module.exports = DeudaCompanero;

