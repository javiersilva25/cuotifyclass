const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const CobroAlumno = sequelize.define('CobroAlumno', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del cobro de alumno'
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
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto del cobro'
  }
}), {
  tableName: 'cobros_alumnos',
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
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
CobroAlumno.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
CobroAlumno.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por curso
CobroAlumno.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para calcular total por curso
CobroAlumno.getTotalByCurso = function(cursoId) {
  return this.sum('monto', {
    where: { curso_id: cursoId }
  });
};

// Método estático para buscar por concepto
CobroAlumno.findByConcepto = function(concepto) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      concepto: {
        [Op.like]: `%${concepto}%`
      }
    },
    order: [['fecha_creacion', 'DESC']]
  });
};

module.exports = CobroAlumno;

