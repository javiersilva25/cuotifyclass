const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { addAuditFields, activeScope, deletedScope } = require('../utils/auditFields');

const MovimientoCcpp = sequelize.define('MovimientoCcpp', addAuditFields({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del movimiento CCPP'
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
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del alumno relacionado con el movimiento'
  }
}), {
  tableName: 'movimientos_ccpp',
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
      fields: ['alumno_id']
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
MovimientoCcpp.prototype.softDelete = function(userId) {
  return this.update({
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  });
};

// Método de instancia para restaurar
MovimientoCcpp.prototype.restore = function() {
  return this.update({
    eliminado_por: null,
    fecha_eliminacion: null
  });
};

// Método estático para buscar por curso
MovimientoCcpp.findByCurso = function(cursoId) {
  return this.findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar por alumno
MovimientoCcpp.findByAlumno = function(alumnoId) {
  return this.findAll({
    where: { alumno_id: alumnoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar por curso y alumno
MovimientoCcpp.findByCursoAndAlumno = function(cursoId, alumnoId) {
  return this.findAll({
    where: {
      curso_id: cursoId,
      alumno_id: alumnoId
    },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar ingresos por curso
MovimientoCcpp.findIngresosByCurso = function(cursoId) {
  return this.scope('ingresos').findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para buscar gastos por curso
MovimientoCcpp.findGastosByCurso = function(cursoId) {
  return this.scope('gastos').findAll({
    where: { curso_id: cursoId },
    order: [['fecha_creacion', 'DESC']]
  });
};

// Método estático para calcular total de ingresos por curso
MovimientoCcpp.getTotalIngresosByCurso = function(cursoId) {
  return this.sum('monto', {
    where: {
      curso_id: cursoId,
      tipo: 'ingreso'
    }
  });
};

// Método estático para calcular total de gastos por curso
MovimientoCcpp.getTotalGastosByCurso = function(cursoId) {
  return this.sum('monto', {
    where: {
      curso_id: cursoId,
      tipo: 'gasto'
    }
  });
};

// Método estático para calcular total por alumno
MovimientoCcpp.getTotalByAlumno = function(alumnoId, tipo = null) {
  const whereClause = { alumno_id: alumnoId };
  if (tipo) {
    whereClause.tipo = tipo;
  }
  
  return this.sum('monto', { where: whereClause });
};

// Método estático para calcular balance por curso
MovimientoCcpp.getBalanceByCurso = async function(cursoId) {
  const totalIngresos = await this.getTotalIngresosByCurso(cursoId) || 0;
  const totalGastos = await this.getTotalGastosByCurso(cursoId) || 0;
  
  return {
    ingresos: totalIngresos,
    gastos: totalGastos,
    balance: totalIngresos - totalGastos
  };
};

// Método estático para buscar por rango de fechas
MovimientoCcpp.findByDateRange = function(fechaInicio, fechaFin, cursoId = null, alumnoId = null) {
  const { Op } = require('sequelize');
  const whereClause = {
    fecha_creacion: {
      [Op.between]: [fechaInicio, fechaFin]
    }
  };
  
  if (cursoId) {
    whereClause.curso_id = cursoId;
  }
  
  if (alumnoId) {
    whereClause.alumno_id = alumnoId;
  }
  
  return this.findAll({
    where: whereClause,
    order: [['fecha_creacion', 'DESC']]
  });
};

module.exports = MovimientoCcpp;

