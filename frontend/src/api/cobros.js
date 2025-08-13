// src/api/cobros.js
import apiClient from './client';

// Helpers de respuesta
const dd = (r) => r?.data?.data ?? r?.data ?? r; // data default

const cobrosAPI = {
  // Listado / filtros
  getAll: (params = {}) => apiClient.get('/api/cobros', { params }).then(dd),

  // CRUD
  create: (payload) => apiClient.post('/api/cobros', payload).then(dd),
  getById: (id) => apiClient.get(`/api/cobros/${id}`).then(dd),
  update: (id, payload) => apiClient.put(`/api/cobros/${id}`, payload).then(dd),
  delete: (id) => apiClient.delete(`/api/cobros/${id}`).then(dd),
  restore: (id) => apiClient.patch(`/api/cobros/${id}/restore`).then(dd),

  // Consultas específicas
  getByCurso: (cursoId, params = {}) =>
    apiClient.get(`/api/cobros/carro(?)`.replace('carro(?)', `curso/${cursoId}`), { params }).then(dd),
  getTotalByCurso: (cursoId) =>
    apiClient.get(`/api/cobros/curso/${cursoId}/total`).then(dd),

  // Análisis / métricas
  getVencidos: () => apiClient.get('/api/cobros/vencidos').then(dd),
  getProximosAVencer: (dias = 7) =>
    apiClient.get('/api/cobros/proximos-vencer', { params: { dias } }).then(dd),
  getByDateRange: (fecha_inicio, fecha_fin) =>
    apiClient.get('/api/cobros/date-range', { params: { fecha_inicio, fecha_fin } }).then(dd),
  getEstadisticas: (params = {}) =>
    apiClient.get('/api/cobros/stats', { params }).then(dd),
};

export default cobrosAPI;
