const Joi = require('joi');

// Validador para crear apoderado
const validateApoderado = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(255).required().messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),
    apellido: Joi.string().min(2).max(255).required().messages({
      'string.empty': 'El apellido es requerido',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 255 caracteres'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'El email es requerido',
      'string.email': 'Debe ser un email válido'
    }),
    password: Joi.string().min(6).optional().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres'
    }),
    telefono: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres'
    }),
    direccion: Joi.string().optional().allow('').messages({
      'string.base': 'La dirección debe ser texto'
    }),
    activo: Joi.boolean().optional().default(true),
    preferencias_pago: Joi.object().optional(),
    hijos: Joi.array().items(Joi.number().integer().positive()).optional().messages({
      'array.base': 'Los hijos debe ser un array de IDs',
      'number.base': 'Cada ID de hijo debe ser un número',
      'number.integer': 'Cada ID de hijo debe ser un número entero',
      'number.positive': 'Cada ID de hijo debe ser positivo'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validador para actualizar apoderado
const validateApoderadoUpdate = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string().min(2).max(255).optional().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 255 caracteres'
    }),
    apellido: Joi.string().min(2).max(255).optional().messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 255 caracteres'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Debe ser un email válido'
    }),
    password: Joi.string().min(6).optional().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres'
    }),
    telefono: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'El teléfono no puede exceder 20 caracteres'
    }),
    direccion: Joi.string().optional().allow('').messages({
      'string.base': 'La dirección debe ser texto'
    }),
    activo: Joi.boolean().optional(),
    preferencias_pago: Joi.object().optional(),
    hijos: Joi.array().items(Joi.number().integer().positive()).optional().messages({
      'array.base': 'Los hijos debe ser un array de IDs',
      'number.base': 'Cada ID de hijo debe ser un número',
      'number.integer': 'Cada ID de hijo debe ser un número entero',
      'number.positive': 'Cada ID de hijo debe ser positivo'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validador para login
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'El email es requerido',
      'string.email': 'Debe ser un email válido'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'La contraseña es requerida'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

// Validador para preferencias de pago
const validatePaymentPreferences = (req, res, next) => {
  const schema = Joi.object({
    preferencias_pago: Joi.object({
      metodo_preferido: Joi.string().valid('tarjeta', 'transferencia', 'efectivo').optional(),
      notificaciones_email: Joi.boolean().optional(),
      notificaciones_sms: Joi.boolean().optional(),
      recordatorios_dias: Joi.number().integer().min(1).max(30).optional(),
      auto_pago: Joi.boolean().optional()
    }).required().messages({
      'object.base': 'Las preferencias de pago deben ser un objeto válido'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  next();
};

module.exports = {
  validateApoderado,
  validateApoderadoUpdate,
  validateLogin,
  validatePaymentPreferences
};

