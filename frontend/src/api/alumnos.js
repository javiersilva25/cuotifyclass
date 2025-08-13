// src/api/alumnos.js
import apiClient from './client';

const PATH = '/api/alumnos';

const unwrapArray = (r) => {
  if (Array.isArray(r)) return r;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.data?.data)) return r.data.data;
  if (Array.isArray(r?.items)) return r.items;
  if (Array.isArray(r?.results)) return r.results;
  if (Array.isArray(r?.rows)) return r.rows;
  return [];
};

const alumnosAPI = {
  // intenta ?curso_id=... y si no, /curso/:id
  async getByCurso(curso_id, params = {}) {
    try {
      const r = await apiClient.get(PATH, { ...params, curso_id });
      const list = unwrapArray(r);
      if (list.length) return list;
    } catch (_) { /* fallback */ }

    const r2 = await apiClient.get(`${PATH}/curso/${encodeURIComponent(curso_id)}`);
    return unwrapArray(r2);
  },

  async getAll(params = {}) {
    const r = await apiClient.get(PATH, params);
    return unwrapArray(r);
  },

  async getHijosPorApoderado(idOrRut) {
    const r = await apiClient.get(`${PATH}/apoderado/${encodeURIComponent(idOrRut)}`);
    return unwrapArray(r);
  },

  async getMisHijos() {
    const r = await apiClient.get(`${PATH}/apoderado/me/hijos`);
    return unwrapArray(r);
  },
};

export default alumnosAPI;
