const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del pago'
  },
  cuota_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID de la cuota que se está pagando'
  },
  alumno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del alumno que realiza el pago'
  },
  apoderado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del apoderado que realiza el pago'
  },
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Monto pagado'
  },
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora del pago'
  },
  estado_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del estado del pago'
  },
  metodo_pago: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Método de pago utilizado'
  },
  transaccion_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'ID de la transacción de la pasarela de pago'
  },
  // Campos adicionales para integración con APIs de pago
  stripe_payment_intent_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID del Payment Intent de Stripe'
  },
  stripe_charge_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'ID del Charge de Stripe'
  },
  datos_pago: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales del pago (respuesta de la API, etc.)'
  }
}, {
  tableName: 'pagos',
  timestamps: false,
  indexes: [
    {
      fields: ['cuota_id']
    },
    {
      fields: ['alumno_id']
    },
    {
      fields: ['apoderado_id']
    },
    {
      fields: ['estado_id']
    },
    {
      fields: ['fecha_pago']
    },
    {
      unique: true,
      fields: ['transaccion_id']
    },
    {
      fields: ['stripe_payment_intent_id']
    }
  ]
});

// Métodos estáticos
Pago.findByApoderado = function(apoderadoId) {
  return this.findAll({
    where: { apoderado_id: apoderadoId },
    order: [['fecha_pago', 'DESC']],
    include: [
      {
        model: require('./cuota'),
        as: 'cuota'
      },
      {
        model: require('./alumno'),
        as: 'alumno'
      },
      {
        model: require('./estadoPago'),
        as: 'estado'
      }
    ]
  });
};

Pago.findByAlumno = function(alumnoId) {
  return this.findAll({
    where: { alumno_id: alumnoId },
    order: [['fecha_pago', 'DESC']],
    include: [
      {
        model: require('./cuota'),
        as: 'cuota'
      },
      {
        model: require('./estadoPago'),
        as: 'estado'
      }
    ]
  });
};

Pago.findPendientesByApoderado = function(apoderadoId) {
  return this.findAll({
    where: { 
      apoderado_id: apoderadoId,
      estado_id: 1 // Asumiendo que 1 = 'Pendiente'
    },
    order: [['fecha_pago', 'ASC']],
    include: [
      {
        model: require('./cuota'),
        as: 'cuota'
      },
      {
        model: require('./alumno'),
        as: 'alumno'
      }
    ]
  });
};

Pago.findByTransaccionId = function(transaccionId) {
  return this.findOne({
    where: { transaccion_id: transaccionId }
  });
};

Pago.findByStripePaymentIntent = function(paymentIntentId) {
  return this.findOne({
    where: { stripe_payment_intent_id: paymentIntentId }
  });
};

// Método de instancia para marcar como pagado
Pago.prototype.marcarPagado = function(transaccionId, datosPago = null) {
  return this.update({
    estado_id: 2, // Asumiendo que 2 = 'Pagado'
    transaccion_id: transaccionId,
    datos_pago: datosPago,
    fecha_pago: new Date()
  });
};

// Método de instancia para marcar como vencido
Pago.prototype.marcarVencido = function() {
  return this.update({
    estado_id: 3 // Asumiendo que 3 = 'Vencido'
  });
};

module.exports = Pago;

