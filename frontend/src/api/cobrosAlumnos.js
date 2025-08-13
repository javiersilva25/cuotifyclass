// src/api/cobrosAlumnos.js
import apiClient from './client';

const dd = (r) => r?.data?.data ?? r?.data ?? r;

const cobrosAlumnosAPI = {
  // Listado / filtros
  getAll: (params = {}) => apiClient.get('/api/cobros-alumnos', { params }).then(dd),

  // CRUD (individual)
  create: (payload) => apiClient.post('/api/cobros-alumnos', payload).then(dd),
  getById: (id) => apiClient.get(`/api/cobros-alumnos/${id}`).then(dd),
  update: (id, payload) => apiClient.put(`/api/cobros-alumnos/${id}`, payload).then(dd),
  delete: (id) => apiClient.delete(`/api/cobros-alumnos/${id}`).then(dd),
  restore: (id) => apiClient.patch(`/api/cobros-alumnos/${id}/restore`).then(dd),

  // Por curso / masivo
  getByCurso: (cursoId, params = {}) =>
    apiClient.get(`/api/cobros-alumnos/curso/${cursoId}`, { params }).then(dd),
  getTotalByCurso: (cursoId) =>
    apiClient.get(`/api/cobros-alumnos/curso/${cursoId}/total`).then(dd),
  createBulk: (cursoId, cobros = []) =>
    apiClient.post(`/api/cobros-alumnos/curso/${cursoId}/bulk`, { cobros }).then(dd),

  // Búsqueda y agregaciones
  searchByConcepto: (concepto) =>
    apiClient.get('/api/cobros-alumnos/search', { params: { concepto } }).then(dd),
  getGroupedByCurso: () =>
    apiClient.get('/api/cobros-alumnos/grouped-by-curso').then(dd),
  getEstadisticas: (params = {}) =>
    apiClient.get('/api/cobros-alumnos/stats', { params }).then(dd),
};

export default cobrosAlumnosAPI;
