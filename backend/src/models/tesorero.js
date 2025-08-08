const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const Tesorero = sequelize.define('Tesorero', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del tesorero'
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'ID del usuario que es tesorero'
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'ID del curso asignado al tesorero'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Estado activo del tesorero'
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de asignación del tesorero al curso'
  }
}), {
  tableName: 'tesoreros',
  timestamps: false,
  defaultScope: activeScope,
  scopes: {
    active: activeScope,
    deleted: deletedScope,
    all: {}
  },
  indexes: [
    {
      unique: true,
      fields: ['usuario_id']
    },
    {
      unique: true,
      fields: ['curso_id']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
Tesorero.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date(),
    activo: false
  });
};

// Método de instancia para restaurar
Tesorero.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null,
    activo: true
  });
};

// Método de instancia para desactivar
Tesorero.prototype.deactivate = function(userId) {
  return this.update({
    activo: false,
    modificado_por: userId,
    fecha_modificacion: new Date()
  });
};

// Método de instancia para activar
Tesorero.prototype.activate = function(userId) {
  return this.update({
    activo: true,
    modificado_por: userId,
    fecha_modificacion: new Date()
  });
};

// Método estático para buscar por usuario
Tesorero.findByUsuario = function(usuarioId) {
  return this.findOne({
    where: { 
      usuario_id: usuarioId,
      activo: true
    }
  });
};

// Método estático para buscar por curso
Tesorero.findByCurso = function(cursoId) {
  return this.findOne({
    where: { 
      curso_id: cursoId,
      activo: true
    }
  });
};

// Método estático para verificar si un usuario es tesorero
Tesorero.isTesorero = async function(usuarioId) {
  const tesorero = await this.findByUsuario(usuarioId);
  return !!tesorero;
};

// Método estático para verificar si un usuario puede acceder a un curso
Tesorero.canAccessCourse = async function(usuarioId, cursoId) {
  const tesorero = await this.findOne({
    where: { 
      usuario_id: usuarioId,
      curso_id: cursoId,
      activo: true
    }
  });
  return !!tesorero;
};

// Método estático para obtener el curso asignado a un tesorero
Tesorero.getCursoAsignado = async function(usuarioId) {
  const tesorero = await this.findByUsuario(usuarioId);
  return tesorero ? tesorero.curso_id : null;
};

// Método estático para obtener tesoreros activos
Tesorero.findActive = function() {
  return this.findAll({
    where: { activo: true },
    order: [['fecha_asignacion', 'DESC']]
  });
};

// Método estático para verificar disponibilidad de curso
Tesorero.isCursoDisponible = async function(cursoId, excludeTesoreroId = null) {
  const whereClause = {
    curso_id: cursoId,
    activo: true
  };
  
  if (excludeTesoreroId) {
    whereClause.id = { [require('sequelize').Op.ne]: excludeTesoreroId };
  }

  const count = await this.count({ where: whereClause });
  return count === 0;
};

// Método estático para verificar disponibilidad de usuario
Tesorero.isUsuarioDisponible = async function(usuarioId, excludeTesoreroId = null) {
  const whereClause = {
    usuario_id: usuarioId,
    activo: true
  };
  
  if (excludeTesoreroId) {
    whereClause.id = { [require('sequelize').Op.ne]: excludeTesoreroId };
  }

  const count = await this.count({ where: whereClause });
  return count === 0;
};

// Método estático para obtener estadísticas
Tesorero.getEstadisticas = async function() {
  const [totalTesoreros, tesorerosActivos, cursosConTesorero] = await Promise.all([
    this.count(),
    this.count({ where: { activo: true } }),
    this.count({ 
      where: { activo: true },
      distinct: true,
      col: 'curso_id'
    })
  ]);

  return {
    total_tesoreros: totalTesoreros,
    tesoreros_activos: tesorerosActivos,
    cursos_con_tesorero: cursosConTesorero
  };
};

module.exports = Tesorero;

