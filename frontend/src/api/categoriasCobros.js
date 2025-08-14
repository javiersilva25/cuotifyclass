// src/api/categoriasCobro.js
import apiClient from './client';

const dd = (r) => r?.data?.data ?? r?.data ?? r;

// Fallback por si aún no tienes endpoint en backend
const FALLBACK = [
  { id: 1, nombre: 'Mensualidad' },
  { id: 2, nombre: 'Matrícula' },
  { id: 3, nombre: 'Materiales' },
  { id: 4, nombre: 'Actividades' },
  { id: 5, nombre: 'Seguro' },
  { id: 6, nombre: 'Uniforme' },
  { id: 7, nombre: 'Transporte' },
  { id: 8, nombre: 'Alimentación' },
  { id: 9, nombre: 'Otros' },
];

export default {
  async listar() {
    try {
      const res = await apiClient.get('/api/categorias-cobro'); // ajusta si tu baseURL ya incluye /api
      const data = dd(res);
      // Soporta respuestas tipo array o {items:[]}
      return Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    } catch {
      return FALLBACK;
    }
  },
};
