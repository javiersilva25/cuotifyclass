// src/api/tesorero.js
import apiClient from './client';

// helper para QS
const withQuery = (path, params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
};

// helper seguro para leer data (soporta fetch o axios)
const pickData = (resp) => {
  const d = resp?.data ?? resp;
  return d?.data ?? d ?? null;
};

const tesoreroAPI = {
  // ----- Admin -----
  getAll: (params = {}) => apiClient.get(withQuery('/api/tesoreros', params)),
  create: (data) => apiClient.post('/api/tesoreros', data),
  getById: (id) => apiClient.get(`/api/tesoreros/${id}`),
  update: (id, data) => apiClient.put(`/api/tesoreros/${id}`, data),
  delete: (id) => apiClient.delete(`/api/tesoreros/${id}`),
  activate: (id) => apiClient.patch(`/api/tesoreros/${id}/activate`),
  deactivate: (id) => apiClient.patch(`/api/tesoreros/${id}/deactivate`),
  getActive: () => apiClient.get('/api/tesoreros/active'),
  getEstadisticas: () => apiClient.get('/api/tesoreros/estadisticas'),

  // ----- Tesorero -----
  // ✔ ahora siempre retorna el objeto directo
  getMyData: async () => {
    const resp = await apiClient.get('/api/tesoreros/me');
    return pickData(resp); // { rut_persona, curso: { id, ... }, ... }
  },

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

    const alumnosResp = await apiClient.get(
      withQuery('/api/alumnos', { curso_id: tes.curso.id })
    );

    const alumnos = pickData(alumnosResp);
    const lista = Array.isArray(alumnos?.items) ? alumnos.items : (Array.isArray(alumnos) ? alumnos : []);
    return {
      data: {
        curso: tes.curso,
        tesorero: tes.persona || tes.usuario || null,
        total_alumnos: lista.length,
        total_pagos: 0, // lo llenamos en estadísticas
        fecha_asignacion: tes.fecha_asignacion || null,
      }
    };
  },

  // Alumnos del curso asignado
  getAlumnosCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(withQuery('/api/alumnos', { ...params, curso_id: tes.curso.id }));
  },

  // Pagos del curso asignado (si aún no tienes /api/pagos, esto caerá en catch y devuelve vacío)
  getPagosCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    try {
      const resp = await apiClient.get(withQuery('/api/pagos', { ...params, curso_id: tes.curso.id }));
      return resp;
    } catch {
      return { data: [] };
    }
  },

  // Deudas pendientes del curso asignado (si aún no existe endpoint, vuelve vacío)
  getDeudasPendientesCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    try {
      const resp = await apiClient.get(
        withQuery('/api/deudas-alumnos', { ...params, curso_id: tes.curso.id, estado: 'pendiente' })
      );
      return resp;
    } catch {
      return { data: [] };
    }
  },

  // Estadísticas financieras del curso (tolerante si faltan endpoints)
  getEstadisticasFinancierasCurso: async () => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    let pagos = [], deudas = [];
    try {
      const pagosResp = await tesoreroAPI.getPagosCurso({ estado: 'pagado' });
      pagos = pickData(pagosResp) ?? [];
    } catch {}
    try {
      const deudasResp = await tesoreroAPI.getDeudasPendientesCurso({ estado: 'pendiente' });
      deudas = pickData(deudasResp) ?? [];
    } catch {}

    const totalRecaudado = (Array.isArray(pagos) ? pagos : []).reduce((s, p) => s + (p.monto_pagado || p.monto || 0), 0);
    const totalPendiente = (Array.isArray(deudas) ? deudas : []).reduce((s, d) => s + (d.monto || 0), 0);

    return {
      data: {
        total_recaudado: totalRecaudado,
        total_pendiente: totalPendiente,
        total_pagos: Array.isArray(pagos) ? pagos.length : 0,
        total_deudas: Array.isArray(deudas) ? deudas.length : 0,
        curso: tes.curso
      }
    };
  },

  // Movimientos financieros del curso
  getMovimientosCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(withQuery('/api/movimientos-financieros', { ...params, curso_id: tes.curso.id }));
  },

  // Crear movimiento financiero
  createMovimientoCurso: async (data) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.post('/api/movimientos-financieros', { ...data, curso_id: tes.curso.id });
  },

  // Reporte del curso
  generarReporteCurso: async (params = {}) => {
    const tes = await tesoreroAPI.getMyData();
    if (!tes?.curso?.id) throw new Error('No tiene curso asignado');

    return apiClient.get(withQuery(`/api/reportes/curso/${tes.curso.id}`, params));
  }
};

export default tesoreroAPI;
