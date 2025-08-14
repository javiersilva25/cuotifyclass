// src/api/cobrosAlumnos.js
import apiClient from './client';

const dd = (r) => r?.data?.data ?? r?.data ?? r;

const cobrosAlumnosAPI = {
  // Listado con filtros: { page, limit, alumno_id, categoria_id, estado, search }
  getAll: (params = {}) => apiClient.get('/api/cobros-alumnos', { params }).then(dd),

  // CRUD
  create: (payload) => apiClient.post('/api/cobros-alumnos', payload).then(dd),
  getById: (id) => apiClient.get(`/api/cobros-alumnos/${id}`).then(dd),
  update: (id, payload) => apiClient.put(`/api/cobros-alumnos/${id}`, payload).then(dd),
  delete: (id) => apiClient.delete(`/api/cobros-alumnos/${id}`).then(dd),

  // Operación “pagar”
  pagar: (id, payload) => apiClient.patch(`/api/cobros-alumnos/${id}/pagar`, payload).then(dd),
};

export default cobrosAlumnosAPI;
