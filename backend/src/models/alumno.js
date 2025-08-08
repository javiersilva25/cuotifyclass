const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const Alumno = sequelize.define('Alumno', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del alumno'
  },
  nombre_completo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre completo del alumno'
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha de nacimiento del alumno'
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del curso al que pertenece el alumno'
  },
  apoderado_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'ID del apoderado del alumno'
  },
  usuario_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'ID del usuario asociado al alumno'
  }
}), {
  tableName: 'alumnos',
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
      fields: ['apoderado_id']
    },
    {
      fields: ['usuario_id']
    },
    {
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
Alumno.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
Alumno.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por curso
Alumno.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId }
  });
};

// Método estático para buscar por apoderado
Alumno.findByApoderado = function(apoderadoId) {
  return this.findAll({
    where: { apoderado_id: apoderadoId }
  });
};

module.exports = Alumno;

