import apiClient from './client';

// API endpoints para tesoreros
const tesoreroAPI = {
  // Obtener todos los tesoreros (solo admin)
  getAll: (params = {}) => {
    return apiClient.get('/tesoreros', { params });
  },

  // Crear nuevo tesorero (solo admin)
  create: (data) => {
    return apiClient.post('/tesoreros', data);
  },

  // Obtener tesorero por ID
  getById: (id) => {
    return apiClient.get(`/tesoreros/${id}`);
  },

  // Actualizar tesorero (solo admin)
  update: (id, data) => {
    return apiClient.put(`/tesoreros/${id}`, data);
  },

  // Eliminar tesorero (solo admin)
  delete: (id) => {
    return apiClient.delete(`/tesoreros/${id}`);
  },

  // Activar tesorero (solo admin)
  activate: (id) => {
    return apiClient.patch(`/tesoreros/${id}/activate`);
  },

  // Desactivar tesorero (solo admin)
  deactivate: (id) => {
    return apiClient.patch(`/tesoreros/${id}/deactivate`);
  },

  // Obtener datos del tesorero actual
  getMyData: () => {
    return apiClient.get('/tesoreros/me');
  },

  // Obtener tesoreros activos (solo admin)
  getActive: () => {
    return apiClient.get('/tesoreros/active');
  },

  // Obtener estadísticas de tesoreros (solo admin)
  getEstadisticas: () => {
    return apiClient.get('/tesoreros/estadisticas');
  },

  // Obtener tesorero por usuario
  getByUsuario: (usuarioId) => {
    return apiClient.get(`/tesoreros/usuario/${usuarioId}`);
  },

  // Obtener tesorero por curso
  getByCurso: (cursoId) => {
    return apiClient.get(`/tesoreros/curso/${cursoId}`);
  },

  // Obtener curso asignado a un tesorero
  getCursoAsignado: (usuarioId) => {
    return apiClient.get(`/tesoreros/usuario/${usuarioId}/curso-asignado`);
  },

  // Verificar si un usuario es tesorero
  checkIsTesorero: (usuarioId) => {
    return apiClient.get(`/tesoreros/check/is-tesorero/${usuarioId}`);
  },

  // Verificar acceso de tesorero a curso
  checkCourseAccess: (usuarioId, cursoId) => {
    return apiClient.get(`/tesoreros/check/course-access/${usuarioId}/${cursoId}`);
  },

  // Métodos específicos para el dashboard del tesorero

  // Obtener resumen del curso asignado
  getResumenCurso: async () => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      // Obtener datos adicionales del curso
      const [alumnosResponse, pagosResponse] = await Promise.all([
        apiClient.get(`/alumnos?curso_id=${tesorero.curso.id}`),
        apiClient.get(`/pagos?curso_id=${tesorero.curso.id}`)
      ]);

      return {
        data: {
          curso: tesorero.curso,
          tesorero: tesorero.usuario,
          total_alumnos: alumnosResponse.data.length || 0,
          total_pagos: pagosResponse.data.length || 0,
          fecha_asignacion: tesorero.fecha_asignacion
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Obtener alumnos del curso asignado
  getAlumnosCurso: async (params = {}) => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      return apiClient.get(`/alumnos`, {
        params: {
          ...params,
          curso_id: tesorero.curso.id
        }
      });
    } catch (error) {
      throw error;
    }
  },

  // Obtener pagos del curso asignado
  getPagosCurso: async (params = {}) => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      return apiClient.get(`/pagos`, {
        params: {
          ...params,
          curso_id: tesorero.curso.id
        }
      });
    } catch (error) {
      throw error;
    }
  },

  // Obtener deudas pendientes del curso asignado
  getDeudasPendientesCurso: async (params = {}) => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      return apiClient.get(`/deudas-alumnos`, {
        params: {
          ...params,
          curso_id: tesorero.curso.id,
          estado: 'pendiente'
        }
      });
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas financieras del curso
  getEstadisticasFinancierasCurso: async () => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      const [pagosResponse, deudasResponse] = await Promise.all([
        apiClient.get(`/pagos?curso_id=${tesorero.curso.id}&estado=pagado`),
        apiClient.get(`/deudas-alumnos?curso_id=${tesorero.curso.id}&estado=pendiente`)
      ]);

      const pagos = pagosResponse.data || [];
      const deudas = deudasResponse.data || [];

      const totalRecaudado = pagos.reduce((sum, pago) => sum + (pago.monto_pagado || 0), 0);
      const totalPendiente = deudas.reduce((sum, deuda) => sum + (deuda.monto || 0), 0);

      return {
        data: {
          total_recaudado: totalRecaudado,
          total_pendiente: totalPendiente,
          total_pagos: pagos.length,
          total_deudas: deudas.length,
          curso: tesorero.curso
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Obtener movimientos financieros del curso
  getMovimientosCurso: async (params = {}) => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      return apiClient.get(`/movimientos-financieros`, {
        params: {
          ...params,
          curso_id: tesorero.curso.id
        }
      });
    } catch (error) {
      throw error;
    }
  },

  // Crear movimiento financiero en el curso
  createMovimientoCurso: async (data) => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      return apiClient.post(`/movimientos-financieros`, {
        ...data,
        curso_id: tesorero.curso.id
      });
    } catch (error) {
      throw error;
    }
  },

  // Generar reporte del curso
  generarReporteCurso: async (params = {}) => {
    try {
      const response = await tesoreroAPI.getMyData();
      const tesorero = response.data;
      
      if (!tesorero || !tesorero.curso) {
        throw new Error('No tiene curso asignado');
      }

      return apiClient.get(`/reportes/curso/${tesorero.curso.id}`, {
        params
      });
    } catch (error) {
      throw error;
    }
  }
};

export default tesoreroAPI;

