// src/api/apoderado.js
import apiClient from './client';

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

// Un solo cliente para todo
const apoderadoClient = {
  // --- Autenticación (si aplica) ---
  async login({ rut, password }) {
    const { data } = await apiClient.post('/api/auth/apoderado/login', { rut, password });
    return data; // { success, data: { apoderado, token } }
  },

  // --- Listas para combos / CRUD básico (lo que ya usabas) ---
  async getAll() {
    const { data } = await apiClient.get('/api/apoderados');
    // backend puede devolver { success, data } ó un array directo
    return data?.data ?? data ?? [];
  },

  async getById(id, token) {
    const { data } = await apiClient.get(`/api/apoderados/${id}`, {
      headers: authHeaders(token),
    });
    return data?.data ?? data ?? null;
  },

  // --- Datos para el dashboard ---
  async getProfile(apoderadoId, token) {
    // Puedes reutilizar getById si prefieres
    const { data } = await apiClient.get(`/api/apoderados/${apoderadoId}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  async getHijos(apoderadoId, token) {
    // Ruta “oficial”
    try {
      const { data } = await apiClient.get(`/api/apoderados/${apoderadoId}/hijos`, {
        headers: authHeaders(token),
      });
      return data;
    } catch (_) {
      // Fallback a la que ya tienes en backend
      const { data } = await apiClient.get(`/api/alumnos/apoderado/${apoderadoId}`, {
        headers: authHeaders(token),
      });
      return data;
    }
  },

  async getDeudasPendientes(apoderadoId, token) {
    try {
      const { data } = await apiClient.get(`/api/apoderados/${apoderadoId}/deudas`, {
        headers: authHeaders(token),
      });
      return data;
    } catch (_) {
      const { data } = await apiClient.get('/api/deudas', {
        headers: authHeaders(token),
        params: { apoderado_id: apoderadoId, estado: 'pendiente' },
      });
      return data;
    }
  },

  async getHistorialPagos(apoderadoId, token, limit = 50) {
    try {
      const { data } = await apiClient.get(`/api/apoderados/${apoderadoId}/pagos`, {
        headers: authHeaders(token),
        params: { limit },
      });
      return data;
    } catch (_) {
      const { data } = await apiClient.get('/api/pagos', {
        headers: authHeaders(token),
        params: { apoderado_id: apoderadoId, limit },
      });
      return data;
    }
  },
};

// ——— Pasarelas de pago (lo que ya usabas en el dashboard) ———
export const paymentsAPI = {
  async getGateways() {
    const { data } = await apiClient.get('/api/payments/gateways');
    return data;
  },
  async getRecommendation(params) {
    const { data } = await apiClient.get('/api/payments/recommend', { params });
    return data;
  },
  async compareGateways(amount) {
    const { data } = await apiClient.get('/api/payments/compare', { params: { amount } });
    return data;
  },
  async createPayment(apoderadoId, payload, token) {
    const { data } = await apiClient.post(
      '/api/payments/create',
      { apoderado_id: apoderadoId, ...payload },
      { headers: authHeaders(token) }
    );
    return data;
  },
  async testGateways() {
    const { data } = await apiClient.get('/api/payments/test');
    return data;
  },
};

export default apoderadoClient;
