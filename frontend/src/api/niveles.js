// src/api/niveles.js (frontend)
import apiClient from './client';

// Para <select>: activos ordenados
export async function obtenerNiveles() {
  const res = await apiClient.get('/api/niveles');
  return res?.data?.data ?? [];
}

// (Opcional) detalle
export async function obtenerNivelPorId(id) {
  const res = await apiClient.get(`/api/niveles/${id}`);
  return res?.data?.data ?? null;
}
