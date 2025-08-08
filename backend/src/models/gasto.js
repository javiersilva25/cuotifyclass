const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const Gasto = sequelize.define('Gasto', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del gasto'
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del curso al que pertenece el gasto'
  },
  concepto: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Concepto o descripción del gasto'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto del gasto'
  },
  fecha_gasto: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Fecha en que se realizó el gasto'
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID de la categoría del gasto'
  },
  boleta_url: {
    type: DataTypes.STRING(512),
    allowNull: true,
    comment: 'URL de la boleta o comprobante del gasto'
  }
}), {
  tableName: 'gastos',
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
      fields: ['categoria_id']
    },
    {
      fields: ['fecha_gasto']
    },
    {
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
Gasto.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
Gasto.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por curso
Gasto.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId },
    order: [['fecha_gasto', 'DESC']]
  });
};

// Método estático para buscar por categoría
Gasto.findByCategoria = function(categoriaId) {
  return this.findAll({
    where: { categoria_id: categoriaId },
    order: [['fecha_gasto', 'DESC']]
  });
};

// Método estático para buscar por rango de fechas
Gasto.findByDateRange = function(fechaInicio, fechaFin, cursoId = null) {
  const { Op } = require('sequelize');
  const whereClause = {
    fecha_gasto: {
      [Op.between]: [fechaInicio, fechaFin]
    }
  };
  
  if (cursoId) {
    whereClause.curso_id = cursoId;
  }
  
  return this.findAll({
    where: whereClause,
    order: [['fecha_gasto', 'DESC']]
  });
};

// Método estático para calcular total de gastos por curso
Gasto.getTotalByCurso = function(cursoId) {
  return this.sum('monto', {
    where: { curso_id: cursoId }
  });
};

// Método estático para calcular total de gastos por categoría
Gasto.getTotalByCategoria = function(categoriaId) {
  return this.sum('monto', {
    where: { categoria_id: categoriaId }
  });
};

// Método estático para obtener gastos con boleta
Gasto.findWithBoleta = function() {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      boleta_url: {
        [Op.ne]: null
      }
    },
    order: [['fecha_gasto', 'DESC']]
  });
};

// Método estático para obtener gastos sin boleta
Gasto.findWithoutBoleta = function() {
  return this.findAll({
    where: {
      boleta_url: null
    },
    order: [['fecha_gasto', 'DESC']]
  });
};

module.exports = Gasto;

