import apiClient from './client';

const withQuery = (path, params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
};

const pickData = (resp) => {
  const d = resp?.data ?? resp;
  return d?.data ?? d ?? null;
};

const tesoreroAPI = {
  // Admin
  getAll: (params = {}) => apiClient.get(withQuery('/api/tesoreros', params)),
  create: (data) => apiClient.post('/api/tesoreros', data),
  getById: (id) => apiClient.get(`/api/tesoreros/${id}`),
  update: (id, data) => apiClient.put(`/api/tesoreros/${id}`, data),
  delete: (id) => apiClient.delete(`/api/tesoreros/${id}`),
  activate: (id) => apiClient.patch(`/api/tesoreros/${id}/activate`),
  deactivate: (id) => apiClient.patch(`/api/tesoreros/${id}/deactivate`),
  getActive: () => apiClient.get('/api/tesoreros/active'),
  getEstadisticas: () => apiClient.get('/api/tesoreros/estadisticas'),
  
  getAlumnoResumenMe: async (alumnoId) =>
  pickData(await apiClient.get(`/api/tesoreros/me/alumnos/${alumnoId}/resumen`)),

  getAlumnoCobrosPendientesMe: async (alumnoId) =>
    pickData(await apiClient.get(`/api/tesoreros/me/alumnos/${alumnoId}/cobros-pendientes`)),


  // Tesorero base
  getMyData: async () => pickData(await apiClient.get('/api/tesoreros/me')),
  getByUsuario: (usuarioId) => apiClient.get(`/api/tesoreros/usuario/${usuarioId}`),
  getByCurso: (cursoId) => apiClient.get(`/api/tesoreros/curso/${cursoId}`),
  getCursoAsignado: (rut) => apiClient.get(`/api/tesoreros/usuario/${rut}/curso-asignado`),
  checkIsTesorero: (rut) => apiClient.get(`/api/tesoreros/check/is-tesorero/${rut}`),
  checkCourseAccess: (usuarioId, cursoId) =>
    apiClient.get(`/api/tesoreros/check/course-access/${usuarioId}/${cursoId}`),

  // Dashboard
  getKpisMe: async () =>
    pickData(await apiClient.get('/api/tesoreros/me/dashboard/kpis')),

  getCobrosPendientesMe: async () =>
    pickData(await apiClient.get('/api/tesoreros/me/dashboard/cobros-pendientes')),

  getKpisByCurso: async (cursoId) =>
    pickData(await apiClient.get(`/api/tesoreros/curso/${cursoId}/kpis`)),

  getCobrosPendientesByCurso: async (cursoId) =>
    pickData(await apiClient.get(`/api/tesoreros/curso/${cursoId}/cobros-pendientes`)),

  // Utilidades para la página
  getResumenCurso: async () => {
    const [me, kpis] = await Promise.all([tesoreroAPI.getMyData(), tesoreroAPI.getKpisMe()]);
    return {
      data: {
        curso: me?.curso ?? null,
        tesorero: me?.persona || me?.usuario || null,
        total_alumnos: Number(kpis?.total_alumnos ?? 0),
        total_pagos: Number(kpis?.total_pagos ?? 0),
        fecha_asignacion: me?.fecha_asignacion ?? null,
      }
    };
  },

  getAlumnosCurso: async (params = {}) => {
    const me = await tesoreroAPI.getMyData();
    if (!me?.curso?.id) throw new Error('No tiene curso asignado');
    return apiClient.get(withQuery('/api/alumnos', { ...params, curso_id: me.curso.id }));
  },

  getDeudasPendientesCurso: async () => {
    const items = await tesoreroAPI.getCobrosPendientesMe();
    return { data: items ?? [] };
  },

  getEstadisticasFinancierasCurso: async () => {
    const [me, kpis] = await Promise.all([tesoreroAPI.getMyData(), tesoreroAPI.getKpisMe()]);
    return {
      data: {
        total_recaudado: Number(kpis?.total_recaudado ?? 0),
        total_pendiente: Number(kpis?.deudas_pendientes ?? 0),
        total_pagos: Number(kpis?.total_pagos ?? 0),
        total_deudas: Number(kpis?.total_deudas ?? 0),
        eficiencia_cobro: Number(kpis?.eficiencia_cobro ?? 0),
        total_alumnos: Number(kpis?.total_alumnos ?? 0),
        curso: me?.curso ?? null
      }
    };
  },
};

export default tesoreroAPI;
