// src/api/profesores.js
import apiClient from './client';

// Lista de profesores activos (para <select>)
export async function obtenerProfesoresActivos() {
  try {
    const res = await apiClient.get('/api/profesores');
    const payload = res?.data;
    // Acepta { success, data:[...] } o directamente [...]
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    console.warn('Formato inesperado en /api/profesores:', payload);
    return [];
  } catch (err) {
    console.error('Error GET /api/profesores:', err?.response?.data || err?.message);
    return [];
  }
}

// Detalle por RUT/ID (el backend normaliza el RUT)
export async function obtenerProfesorPorId(id) {
  try {
    const res = await apiClient.get(`/api/profesores/${encodeURIComponent(id)}`);
    const payload = res?.data;
    return payload?.data ?? payload ?? null;
  } catch (err) {
    console.error('Error GET /api/profesores/:id', err?.response?.data || err?.message);
    return null;
  }
}
