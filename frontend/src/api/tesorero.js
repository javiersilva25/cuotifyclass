import apiClient from './client';

// API endpoints para tesoreros
const tesoreroAPI = {
  // ----- Admin -----
  getAll: (params = {}) => apiClient.get('/api/tesoreros', { params }),
  create: (data) => apiClient.post('/api/tesoreros', data),
  getById: (id) => apiClient.get(`/api/tesoreros/${id}`),
  update: (id, data) => apiClient.put(`/api/tesoreros/${id}`, data),
  delete: (id) => apiClient.delete(`/api/tesoreros/${id}`),
  activate: (id) => apiClient.patch(`/api/tesoreros/${id}/activate`),
  deactivate: (id) => apiClient.patch(`/api/tesoreros/${id}/deactivate`),
  getActive: () => apiClient.get('/api/tesoreros/active'),
  getEstadisticas: () => apiClient.get('/api/tesoreros/estadisticas'),

  // ----- Tesorero -----
  // Retorna directamente { rut_persona, curso: {...}, persona/usuario, ... }
  getMyData: () =>
    apiClient.get('/api/tesoreros/me').then(r => r.data?.data),

  getByUsuario: (usuarioId) => apiClient.get(`/api/tesoreros/usuario/${usuarioId}`),
  getByCurso: (cursoId) => apiClient.get(`/api/tesoreros/curso/${cursoId}`),
  getCursoAsignado: (rut) => apiClient.get(`/api/tesoreros/usuario/${rut}/curso-asignado`),
  checkIsTesorero: (rut) => apiClient.get(`/api/tesoreros/check/is-tesorero/${rut}`),
  checkCourseAccess: (usuarioId, cursoId) =>
    apiClient.get(`/api/tesoreros/check/course-access/${usuarioId}/${cursoId}`),

  // ---------------- Específicos dashboard tesorero ----------------

  // Resumen del curso asignado
  getResumenCurso: async () => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    const [alumnosResp, pagosResp] = await Promise.all([
      apiClient.get(`/api/alumnos`, { params: { curso_id: tes.curso.id } }),
      apiClient.get(`/api/pagos`,   { params: { curso_id: tes.curso.id } }),
    ]);

    const alumnos = alumnosResp.data?.data ?? alumnosResp.data ?? [];
    const pagos   = pagosResp.data?.data   ?? pagosResp.data   ?? [];

    return {
      data: {
        curso: tes.curso,
        tesorero: tes.persona || tes.usuario || null,
        total_alumnos: alumnos.length,
        total_pagos: pagos.length,
        fecha_asignacion: tes.fecha_asignacion || null,
      }
    };
  },

  // Alumnos del curso asignado
  getAlumnosCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(`/api/alumnos`, {
      params: { ...params, curso_id: tes.curso.id }
    });
  },

  // Pagos del curso asignado
  getPagosCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(`/api/pagos`, {
      params: { ...params, curso_id: tes.curso.id }
    });
  },

  // Deudas pendientes del curso asignado
  getDeudasPendientesCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(`/api/deudas-alumnos`, {
      params: { ...params, curso_id: tes.curso.id, estado: 'pendiente' }
    });
  },

  // Estadísticas financieras del curso
  getEstadisticasFinancierasCurso: async () => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    const [pagosResp, deudasResp] = await Promise.all([
      apiClient.get(`/api/pagos`,         { params: { curso_id: tes.curso.id, estado: 'pagado' } }),
      apiClient.get(`/api/deudas-alumnos`,{ params: { curso_id: tes.curso.id, estado: 'pendiente' } }),
    ]);

    const pagos  = pagosResp.data?.data  ?? pagosResp.data  ?? [];
    const deudas = deudasResp.data?.data ?? deudasResp.data ?? [];

    const totalRecaudado = pagos.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
    const totalPendiente = deudas.reduce((sum, d) => sum + (d.monto || 0), 0);

    return {
      data: {
        total_recaudado: totalRecaudado,
        total_pendiente: totalPendiente,
        total_pagos: pagos.length,
        total_deudas: deudas.length,
        curso: tes.curso
      }
    };
  },

  // Movimientos financieros del curso
  getMovimientosCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(`/api/movimientos-financieros`, {
      params: { ...params, curso_id: tes.curso.id }
    });
  },

  // Crear movimiento financiero
  createMovimientoCurso: async (data) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.post(`/api/movimientos-financieros`, {
      ...data,
      curso_id: tes.curso.id
    });
  },

  // Reporte del curso
  generarReporteCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(`/api/reportes/curso/${tes.curso.id}`, { params });
  }
};

export default tesoreroAPI;
