/**
 * Utilidad para estandarizar las respuestas HTTP
 */

class ResponseHelper {
  /**
   * Respuesta exitosa
   * @param {Object} res - Objeto response de Express
   * @param {*} data - Datos a retornar
   * @param {string} message - Mensaje opcional
   * @param {number} statusCode - Código de estado HTTP
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta de error
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP
   * @param {*} errors - Detalles del error
   */
  static error(res, message = 'Error interno del servidor', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta de validación fallida
   * @param {Object} res - Objeto response de Express
   * @param {Array} errors - Array de errores de validación
   */
  static validationError(res, errors) {
    return this.error(res, 'Errores de validación', 400, errors);
  }

  /**
   * Respuesta de recurso no encontrado
   * @param {Object} res - Objeto response de Express
   * @param {string} resource - Nombre del recurso
   */
  static notFound(res, resource = 'Recurso') {
    return this.error(res, `${resource} no encontrado`, 404);
  }

  /**
   * Respuesta de no autorizado
   * @param {Object} res - Objeto response de Express
   */
  static unauthorized(res) {
    return this.error(res, 'No autorizado', 401);
  }

  /**
   * Respuesta de prohibido
   * @param {Object} res - Objeto response de Express
   */
  static forbidden(res) {
    return this.error(res, 'Acceso prohibido', 403);
  }

  /**
   * Respuesta de conflicto
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje específico del conflicto
   */
  static conflict(res, message = 'Conflicto en la operación') {
    return this.error(res, message, 409);
  }

  /**
   * Respuesta de creación exitosa
   * @param {Object} res - Objeto response de Express
   * @param {*} data - Datos del recurso creado
   * @param {string} message - Mensaje opcional
   */
  static created(res, data, message = 'Recurso creado exitosamente') {
    return this.success(res, data, message, 201);
  }

  /**
   * Respuesta de actualización exitosa
   * @param {Object} res - Objeto response de Express
   * @param {*} data - Datos del recurso actualizado
   * @param {string} message - Mensaje opcional
   */
  static updated(res, data, message = 'Recurso actualizado exitosamente') {
    return this.success(res, data, message, 200);
  }

  /**
   * Respuesta de eliminación exitosa
   * @param {Object} res - Objeto response de Express
   * @param {string} message - Mensaje opcional
   */
  static deleted(res, message = 'Recurso eliminado exitosamente') {
    return this.success(res, null, message, 200);
  }

  /**
   * Respuesta paginada
   * @param {Object} res - Objeto response de Express
   * @param {Array} data - Datos paginados
   * @param {Object} pagination - Información de paginación
   */
  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      message: 'Datos obtenidos exitosamente',
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseHelper;

