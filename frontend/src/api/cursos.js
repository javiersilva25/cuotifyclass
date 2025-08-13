import apiClient from './client';

const PATH = '/api/cursos';

const unwrap = (r) => {
  if (Array.isArray(r)) return r;
  return r?.data?.data ?? r?.data ?? r?.items ?? r?.results ?? r?.rows ?? [];
};

const cursosAPI = {
  getActivos(limit = 200) {
    // params planos (nada de { params: {...} })
    return apiClient.get(PATH, { activos: 1, limit });
  },
  getAll(params = {}) {
    return apiClient.get(PATH, params);
  },
};

export default cursosAPI;

export async function obtenerCursosActivos() {
  const res = await cursosAPI.getActivos();
  return unwrap(res);
}
