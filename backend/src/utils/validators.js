const Joi = require('joi');

/**
 * Validadores comunes para el sistema
 */

// Validador para IDs
const idValidator = Joi.number().integer().positive().required();

// Validador para emails
const emailValidator = Joi.string().email().max(255).required();

// Validador para contraseñas
const passwordValidator = Joi.string().min(6).max(255).required();

// Validador para teléfonos
const phoneValidator = Joi.string().pattern(/^[+]?[0-9\s\-()]+$/).max(20).allow(null, '');

// Validador para RUT chileno
const rutValidator = Joi.string().pattern(/^[0-9]+-[0-9kK]$/).max(12).allow(null, '');

// Validador para nombres
const nameValidator = Joi.string().trim().min(1).max(100).required();

// Validador para descripciones
const descriptionValidator = Joi.string().trim().max(500).allow(null, '');

// Validador para montos
const amountValidator = Joi.number().precision(2).positive().required();

// Validador para campos de texto requeridos
const requiredStringValidator = (maxLength = 255) => 
  Joi.string().trim().min(1).max(maxLength).required();

// Validador para campos de texto opcionales
const optionalStringValidator = (maxLength = 255) => 
  Joi.string().trim().max(maxLength).allow(null, '');

// Validador para fechas
const dateValidator = Joi.date().iso().required();
const optionalDateValidator = Joi.date().iso().allow(null);

// Validador para montos decimales
const moneyValidator = Joi.number().precision(2).positive().required();
const optionalMoneyValidator = Joi.number().precision(2).positive().allow(null);

// Validador para enums
const enumValidator = (values) => Joi.string().valid(...values).required();

// Validador para URLs
const urlValidator = Joi.string().uri().max(512).allow(null, '');

// Validador para años
const yearValidator = Joi.number().integer().min(2000).max(2100).required();

// Validadores específicos para entidades

const alumnoValidator = Joi.object({
  nombre_completo: requiredStringValidator(255),
  fecha_nacimiento: dateValidator,
  curso_id: idValidator,
  apoderado_id: requiredStringValidator(255),
  usuario_id: requiredStringValidator(255)
});

const categoriaGastoValidator = Joi.object({
  nombre_categoria: requiredStringValidator(100)
});

const cobroValidator = Joi.object({
  curso_id: idValidator,
  concepto: requiredStringValidator(255),
  monto_total: moneyValidator,
  fecha_vencimiento: dateValidator
});

const cobroAlumnoValidator = Joi.object({
  curso_id: idValidator,
  concepto: requiredStringValidator(255),
  monto: moneyValidator
});

const cursoValidator = Joi.object({
  nombre_curso: requiredStringValidator(100),
  nivel_id: idValidator,
  ano_escolar: yearValidator,
  profesor_id: requiredStringValidator(255),
  tesorero_id: requiredStringValidator(255)
});

const deudaAlumnoValidator = Joi.object({
  alumno_id: idValidator,
  cobro_id: idValidator,
  monto_adeudado: moneyValidator,
  estado: enumValidator(['pendiente', 'pagado', 'parcialmente_pagado', 'anulado'])
});

const deudaCompaneroValidator = Joi.object({
  alumno_id: idValidator,
  cobro_alumnos_id: idValidator,
  estado: enumValidator(['pendiente', 'pagado'])
});

const gastoValidator = Joi.object({
  curso_id: idValidator,
  concepto: requiredStringValidator(255),
  monto: moneyValidator,
  fecha_gasto: dateValidator,
  categoria_id: idValidator,
  boleta_url: urlValidator
});

const movimientoCcaaValidator = Joi.object({
  tipo: enumValidator(['ingreso', 'gasto']),
  concepto: requiredStringValidator(255),
  monto: moneyValidator,
  curso_id: idValidator
});

const movimientoCcppValidator = Joi.object({
  tipo: enumValidator(['ingreso', 'gasto']),
  concepto: requiredStringValidator(255),
  monto: moneyValidator,
  curso_id: idValidator,
  alumno_id: idValidator
});

// Función helper para validar datos
const validateData = (schema, data) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return { isValid: false, errors, data: null };
  }
  
  return { isValid: true, errors: null, data: value };
};

// Validador para tesorero
const tesoreroValidator = Joi.object({
  usuario_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'El ID de usuario debe ser un número',
      'number.integer': 'El ID de usuario debe ser un número entero',
      'number.positive': 'El ID de usuario debe ser positivo',
      'any.required': 'El ID de usuario es requerido'
    }),
  curso_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'El ID de curso debe ser un número',
      'number.integer': 'El ID de curso debe ser un número entero',
      'number.positive': 'El ID de curso debe ser positivo',
      'any.required': 'El ID de curso es requerido'
    }),
  activo: Joi.boolean().default(true)
    .messages({
      'boolean.base': 'El estado activo debe ser verdadero o falso'
    }),
  fecha_asignacion: Joi.date().default(new Date())
    .messages({
      'date.base': 'La fecha de asignación debe ser una fecha válida'
    })
});

module.exports = {
  // Validadores básicos
  idValidator,
  emailValidator,
  passwordValidator,
  phoneValidator,
  rutValidator,
  nameValidator,
  descriptionValidator,
  amountValidator,
  dateValidator,
  urlValidator,
  yearValidator,
  
  // Validadores de entidades
  alumnoValidator,
  categoriaGastoValidator,
  cobroValidator,
  cobroAlumnoValidator,
  cursoValidator,
  deudaAlumnoValidator,
  deudaCompaneroValidator,
  gastoValidator,
  movimientoCcaaValidator,
  movimientoCcppValidator,
  tesoreroValidator,
  
  // Función helper
  validateData
};
