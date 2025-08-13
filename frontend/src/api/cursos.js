// src/api/cursos.js
import apiClient from './client';

export async function obtenerCursosActivos() {
  const res = await apiClient.get('/api/cursos'); // ajusta si usas ?activos=1
  return res?.data?.data ?? res?.data ?? [];
}
