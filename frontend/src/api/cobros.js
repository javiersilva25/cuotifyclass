// src/api/cobros.js
import apiClient from './client';

// Normaliza la respuesta (soporta {data:{...}} o {...})
const dd = (r) => r?.data?.data ?? r?.data ?? r;

const cobrosAPI = {
  // Listado con filtros: { page, limit, curso_id, categoria_id, search }
  getAll: (params = {}) => apiClient.get('/api/cobros', { params }).then(dd),

  // CRUD
  create: (payload) => apiClient.post('/api/cobros', payload).then(dd),
  getById: (id) => apiClient.get(`/api/cobros/${id}`).then(dd),
  update: (id, payload) => apiClient.put(`/api/cobros/${id}`, payload).then(dd),
  delete: (id) => apiClient.delete(`/api/cobros/${id}`).then(dd),
};

export default cobrosAPI;
