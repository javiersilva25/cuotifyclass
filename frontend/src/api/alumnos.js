import apiClient from './client';

export async function obtenerHijosPorApoderado(idOrRut) {
  const res = await apiClient.get(`/api/alumnos/apoderado/${encodeURIComponent(idOrRut)}`);
  return res?.data?.data ?? [];
}

export async function obtenerMisHijos() {
  const res = await apiClient.get('/api/alumnos/apoderado/me/hijos');
  return res?.data?.data ?? [];
}
