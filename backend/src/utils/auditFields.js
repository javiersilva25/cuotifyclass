const { DataTypes } = require('sequelize');

/**
 * Campos de auditoría estándar para todas las tablas
 * Incluye soft delete functionality
 */
const auditFields = {
  creado_por: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Usuario que creó el registro'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de creación del registro'
  },
  actualizado_por: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Usuario que actualizó el registro por última vez'
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de la última actualización'
  },
  eliminado_por: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Usuario que eliminó el registro (soft delete)'
  },
  fecha_eliminacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de eliminación (soft delete)'
  }
};

/**
 * Función para agregar campos de auditoría a un modelo
 * @param {Object} modelAttributes - Atributos del modelo
 * @returns {Object} Atributos del modelo con campos de auditoría
 */
const addAuditFields = (modelAttributes) => {
  return {
    ...modelAttributes,
    ...auditFields
  };
};

/**
 * Función para agregar datos de auditoría en creación
 * @param {string} userId - ID del usuario que realiza la acción
 * @returns {Object} Datos de auditoría para creación
 */
const addCreateAudit = (userId) => {
  return {
    creado_por: userId,
    fecha_creacion: new Date()
  };
};

/**
 * Función para agregar datos de auditoría en actualización
 * @param {string} userId - ID del usuario que realiza la acción
 * @returns {Object} Datos de auditoría para actualización
 */
const addUpdateAudit = (userId) => {
  return {
    actualizado_por: userId,
    fecha_actualizacion: new Date()
  };
};

/**
 * Función para agregar datos de auditoría en eliminación (soft delete)
 * @param {string} userId - ID del usuario que realiza la acción
 * @returns {Object} Datos de auditoría para eliminación
 */
const addDeleteAudit = (userId) => {
  return {
    eliminado_por: userId,
    fecha_eliminacion: new Date()
  };
};

/**
 * Scope para excluir registros eliminados (soft delete)
 */
const activeScope = {
  where: {
    fecha_eliminacion: null
  }
};

/**
 * Scope para incluir solo registros eliminados
 */
const deletedScope = {
  where: {
    fecha_eliminacion: {
      [require('sequelize').Op.ne]: null
    }
  }
};

module.exports = {
  auditFields,
  addAuditFields,
  addCreateAudit,
  addUpdateAudit,
  addDeleteAudit,
  activeScope,
  deletedScope
};

