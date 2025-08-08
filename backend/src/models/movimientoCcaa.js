const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const MovimientoCcaa = sequelize.define('MovimientoCcaa', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del movimiento CCAA'
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'gasto'),
    allowNull: false,
    comment: 'Tipo de movimiento: ingreso o gasto'
  },
  concepto: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Concepto o descripción del movimiento'
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto del movimiento'
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del curso al que pertenece el movimiento'
  }
}), {
  tableName: 'movimientos_ccaa',
  timestamps: false,
  defaultScope: activeScope,
  scopes: {
    active: activeScope,
    deleted: deletedScope,
    all: {},
    ingresos: {
      where: {
        tipo: 'ingreso',
        fecha_eliminacion: null
      }
    },
    gastos: {
      where: {
        tipo: 'gasto',
        fecha_eliminacion: null
      }
    }
  },
  indexes: [
    {
      fields: ['curso_id']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['fecha_creacion']
    },
    {
      fields: ['fecha_eliminacion']
    }
  ]
});

// Método de instancia para soft delete
MovimientoCcaa.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
MovimientoCcaa.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por curso
MovimientoCcaa.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar ingresos por curso
MovimientoCcaa.findIngresosByCurso = function(cursoId) {
  return this.scope('ingresos').findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar gastos por curso
MovimientoCcaa.findGastosByCurso = function(cursoId) {
  return this.scope('gastos').findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para calcular total de ingresos por curso
MovimientoCcaa.getTotalIngresosByCurso = function(cursoId) {
  return this.sum('monto', {
    where: {
      curso_id: cursoId,
      tipo: 'ingreso'
    }
  });
};

// Método estático para calcular total de gastos por curso
MovimientoCcaa.getTotalGastosByCurso = function(cursoId) {
  return this.sum('monto', {
    where: {
      curso_id: cursoId,
      tipo: 'gasto'
    }
  });
};

// Método estático para calcular balance por curso
MovimientoCcaa.getBalanceByCurso = async function(cursoId) {
  const totalIngresos = await this.getTotalIngresosByCurso(cursoId) || 0;
  const totalGastos = await this.getTotalGastosByCurso(cursoId) || 0;
  
  return {
    ingresos: totalIngresos,
    gastos: totalGastos,
    balance: totalIngresos - totalGastos
  };
};

// Método estático para buscar por rango de fechas
MovimientoCcaa.findByDateRange = function(fechaInicio, fechaFin, cursoId = null) {
  const { Op } = require('sequelize');
  const whereClause = {
    fecha_creacion: {
      [Op.between]: [fechaInicio, fechaFin]
    }
  };
  
  if (cursoId) {
    whereClause.curso_id = cursoId;
  }
  
  return this.findAll({
    where: whereClause,
    order: [['fecha_creacion', 'DESC']]
  });
};

module.exports = MovimientoCcaa;

