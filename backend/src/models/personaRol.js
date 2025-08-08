const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo PersonaRol - Tabla de asignación de roles a personas
 * Permite múltiples roles por persona con restricciones lógicas
 */
const PersonaRol = sequelize.define('PersonaRol', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  rut_persona: {
    type: DataTypes.STRING(12),
    allowNull: false,
    comment: 'RUT de la persona',
    references: {
      model: 'personas',
      key: 'rut'
    }
  },
  
  rol_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID del rol asignado',
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID del curso (si el rol lo requiere)',
    references: {
      model: 'cursos',
      key: 'id'
    }
  },
  
  fecha_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de inicio del rol'
  },
  
  fecha_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Fecha de fin del rol (NULL = indefinido)'
  },
  
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si la asignación está activa'
  },
  
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones sobre la asignación'
  },
  
  es_dato_prueba: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Marca si es un dato de prueba para testing'
  },
  
  // Campos de auditoría
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  created_by: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  
  updated_by: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  
  deleted_by: {
    type: DataTypes.STRING(12),
    allowNull: true
  }
}, {
  tableName: 'persona_roles',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  
  indexes: [
    {
      fields: ['rut_persona']
    },
    {
      fields: ['rol_id']
    },
    {
      fields: ['curso_id']
    },
    {
      fields: ['activo']
    },
    {
      fields: ['fecha_inicio', 'fecha_fin']
    },
    {
      fields: ['es_dato_prueba']
    },
    // Índice compuesto para búsquedas frecuentes
    {
      fields: ['rut_persona', 'activo']
    },
    {
      fields: ['curso_id', 'rol_id', 'activo']
    }
  ],
  
  validate: {
    // Validación de fechas
    fechasValidas() {
      if (this.fecha_fin && this.fecha_inicio && this.fecha_fin <= this.fecha_inicio) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    },
    
    // Validación de curso requerido
    async cursoRequerido() {
      if (this.rol_id) {
        const Rol = require('./rol');
        const rol = await Rol.findByPk(this.rol_id);
        
        if (rol && rol.requiere_curso && !this.curso_id) {
          throw new Error(`El rol ${rol.nombre} requiere asignación a un curso`);
        }
        
        if (rol && !rol.requiere_curso && this.curso_id) {
          throw new Error(`El rol ${rol.nombre} no debe tener curso asignado`);
        }
      }
    }
  },
  
  hooks: {
    beforeCreate: async (personaRol, options) => {
      // Validar unicidad de tesoreros por curso
      await PersonaRol.validarTesoreroUnico(personaRol);
      
      // Validar compatibilidad de roles
      await PersonaRol.validarCompatibilidadRoles(personaRol);
      
      if (options.user) {
        personaRol.created_by = options.user.rut;
      }
    },
    
    beforeUpdate: async (personaRol, options) => {
      if (personaRol.changed('rol_id') || personaRol.changed('curso_id')) {
        await PersonaRol.validarTesoreroUnico(personaRol);
        await PersonaRol.validarCompatibilidadRoles(personaRol);
      }
      
      if (options.user) {
        personaRol.updated_by = options.user.rut;
      }
    },
    
    beforeDestroy: (personaRol, options) => {
      if (options.user) {
        personaRol.deleted_by = options.user.rut;
      }
    }
  }
});

/**
 * Métodos estáticos de validación
 */
PersonaRol.validarTesoreroUnico = async function(personaRol) {
  const Rol = require('./rol');
  
  if (!personaRol.rol_id || !personaRol.curso_id) return;
  
  const rol = await Rol.findByPk(personaRol.rol_id);
  
  if (rol && rol.es_unico_por_curso) {
    const existente = await PersonaRol.findOne({
      where: {
        rol_id: personaRol.rol_id,
        curso_id: personaRol.curso_id,
        activo: true,
        id: { [sequelize.Sequelize.Op.ne]: personaRol.id || 0 }
      }
    });
    
    if (existente) {
      throw new Error(`Ya existe un ${rol.nombre} asignado a este curso`);
    }
  }
};

PersonaRol.validarCompatibilidadRoles = async function(personaRol) {
  const Persona = require('./persona');
  const Rol = require('./rol');
  
  const persona = await Persona.findByPk(personaRol.rut_persona);
  const rol = await Rol.findByPk(personaRol.rol_id);
  
  if (!persona || !rol) return;
  
  const validacion = rol.puedeAsignarseA(persona);
  if (!validacion.valido) {
    throw new Error(validacion.razon);
  }
  
  // Validar conflictos entre roles de alumno y adulto
  const rolesExistentes = await PersonaRol.findAll({
    where: {
      rut_persona: personaRol.rut_persona,
      activo: true,
      id: { [sequelize.Sequelize.Op.ne]: personaRol.id || 0 }
    },
    include: [{
      model: Rol,
      as: 'rol'
    }]
  });
  
  const tieneRolAlumno = rolesExistentes.some(pr => pr.rol.es_alumno);
  const tieneRolAdulto = rolesExistentes.some(pr => !pr.rol.es_alumno && pr.rol.categoria !== 'ALUMNO');
  
  if (rol.es_alumno && tieneRolAdulto) {
    throw new Error('No se puede asignar rol de alumno a persona con roles de adulto');
  }
  
  if (!rol.es_alumno && rol.categoria !== 'ALUMNO' && tieneRolAlumno) {
    throw new Error('No se puede asignar rol de adulto a persona con roles de alumno');
  }
};

/**
 * Métodos estáticos de consulta
 */
PersonaRol.getRolesActivosPorPersona = function(rutPersona) {
  const Rol = require('./rol');
  const Curso = require('./curso');
  
  return this.findAll({
    where: {
      rut_persona: rutPersona,
      activo: true,
      [sequelize.Sequelize.Op.or]: [
        { fecha_fin: null },
        { fecha_fin: { [sequelize.Sequelize.Op.gte]: new Date() } }
      ]
    },
    include: [
      {
        model: Rol,
        as: 'rol'
      },
      {
        model: Curso,
        as: 'curso',
        required: false
      }
    ],
    order: [['fecha_inicio', 'DESC']]
  });
};

PersonaRol.getPersonasPorRol = function(rolId, cursoId = null) {
  const Persona = require('./persona');
  
  const where = {
    rol_id: rolId,
    activo: true
  };
  
  if (cursoId) {
    where.curso_id = cursoId;
  }
  
  return this.findAll({
    where,
    include: [{
      model: Persona,
      as: 'persona'
    }]
  });
};

PersonaRol.getTesorerosPorCurso = function(cursoId) {
  const Persona = require('./persona');
  const Rol = require('./rol');
  
  return this.findAll({
    where: {
      curso_id: cursoId,
      activo: true
    },
    include: [
      {
        model: Persona,
        as: 'persona'
      },
      {
        model: Rol,
        as: 'rol',
        where: {
          codigo: ['TESORERO_ALUMNOS', 'TESORERO_APODERADOS']
        }
      }
    ]
  });
};

/**
 * Métodos de instancia
 */
PersonaRol.prototype.estaVigente = function() {
  const hoy = new Date();
  const inicio = new Date(this.fecha_inicio);
  const fin = this.fecha_fin ? new Date(this.fecha_fin) : null;
  
  return this.activo && 
         hoy >= inicio && 
         (!fin || hoy <= fin);
};

PersonaRol.prototype.desactivar = function(fechaFin = null, observaciones = null) {
  this.activo = false;
  this.fecha_fin = fechaFin || new Date();
  if (observaciones) {
    this.observaciones = observaciones;
  }
  return this.save();
};

PersonaRol.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  values.vigente = this.estaVigente();
  return values;
};

module.exports = PersonaRol;

