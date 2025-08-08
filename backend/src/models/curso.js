const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const Curso = sequelize.define('Curso', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del curso'
  },
  nombre_curso: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del curso'
  },
  nivel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del nivel educativo'
  },
  ano_escolar: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Año escolar del curso'
  },
  profesor_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID del profesor a cargo del curso'
  },
  tesorero_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID del tesorero del curso'
  }
}), {
  tableName: 'cursos',
  timestamps: false,
  defaultScope: activeScope,
  scopes: {
    active: activeScope,
    deleted: deletedScope,
    all: {}
  },
  indexes: [
    {
      fields: ['nivel_id']
    },
    {
      fields: ['ano_escolar']
    },
    {
      fields: ['profesor_id']
    },
    {
      fields: ['tesorero_id']
    },
    {
      fields: ['fecha_eliminacion']
    },
    {
      unique: true,
      fields: ['nombre_curso', 'ano_escolar']
    }
  ]
});

// Método de instancia para soft delete
Curso.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
Curso.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por nivel
Curso.findByNivel = function(nivelId) {
  return this.findAll({
    where: { nivel_id: nivelId },
    order: [['nombre_curso', 'ASC']]
  });
};

// Método estático para buscar por año escolar
Curso.findByAnoEscolar = function(anoEscolar) {
  return this.findAll({
    where: { ano_escolar: anoEscolar },
    order: [['nombre_curso', 'ASC']]
  });
};

// Método estático para buscar por profesor
Curso.findByProfesor = function(profesorId) {
  return this.findAll({
    where: { profesor_id: profesorId },
    order: [['nombre_curso', 'ASC']]
  });
};

// Método estático para buscar por tesorero
Curso.findByTesorero = function(tesoreroId) {
  return this.findAll({
    where: { tesorero_id: tesoreroId },
    order: [['nombre_curso', 'ASC']]
  });
};

// Método estático para obtener cursos activos del año actual
Curso.findCurrentYear = function() {
  const currentYear = new Date().getFullYear();
  return this.findAll({
    where: { ano_escolar: currentYear },
    order: [['nombre_curso', 'ASC']]
  });
};

module.exports = Curso;

