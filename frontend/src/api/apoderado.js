// src/api/apoderado.js
import apiClient from './client';

/* ----------------------------- helpers ----------------------------- */
const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

const withQuery = (path, params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
};

const pickData = (resp) => {
  const d = resp?.data ?? resp;
  return d?.data ?? d ?? null;
};

/* ------------------------------- API ------------------------------- */
const apoderadoAPI = {
  /* ---------- Listados / Admin ---------- */
  async getAll(params = {}) {
    const resp = await apiClient.get(withQuery('/api/apoderados', params));
    return pickData(resp) ?? [];
  },

  // Conservado por compatibilidad
  async list(params = {}) {
    return apoderadoAPI.getAll(params);
  },

  /* ------------------ Perfil / Auth (opcional) ------------------ */
  async login({ rut, password }) {
    const { data } = await apiClient.post('/api/auth/apoderado/login', { rut, password });
    return data;
  },

  // Legacy: algunos front usan esto
  async getById(id, token) {
    const resp = await apiClient.get(`/api/apoderados/${id}`, { headers: authHeaders(token) });
    return pickData(resp);
  },

  // Alias legacy
  async getProfile(apoderadoId, token) {
    return apoderadoAPI.getById(apoderadoId, token);
  },

  /* --------------------- Portal Apoderado: hijos --------------------- */
  // Uso preferente: si NO pasas id → /me/hijos; si pasas id → prueba /:id/hijos y hace fallback
  async getHijos(apoderadoId, token) {
    try {
      if (apoderadoId == null) {
        return pickData(await apiClient.get('/api/apoderados/me/hijos'));
      }
      const resp = await apiClient.get(`/api/apoderados/${apoderadoId}/hijos`, {
        headers: authHeaders(token),
      });
      const data = pickData(resp);
      if (data) return data;
      // fallback
      return pickData(await apiClient.get('/api/apoderados/me/hijos'));
    } catch {
      // fallback adicional legacy
      if (apoderadoId != null) {
        const { data } = await apiClient.get(`/api/alumnos/apoderado/${apoderadoId}`, {
          headers: authHeaders(token),
        });
        return data?.data ?? data ?? [];
      }
      return [];
    }
  },

  /* ------------------- Portal Apoderado: métricas ------------------- */
  async getMetricas(apoderadoId, token) {
    try {
      if (apoderadoId == null) {
        return pickData(await apiClient.get('/api/apoderados/me/metricas'));
      }
      // si existe ruta por id en tu backend
      const resp = await apiClient.get(`/api/apoderados/${apoderadoId}/metricas`, {
        headers: authHeaders(token),
      });
      return pickData(resp);
    } catch {
      // fallback a /me
      return pickData(await apiClient.get('/api/apoderados/me/metricas'));
    }
  },

  async getResumenGeneral(apoderadoId, token) {
    try {
      if (apoderadoId == null) {
        return pickData(await apiClient.get('/api/apoderados/me/resumen'));
      }
      const resp = await apiClient.get(`/api/apoderados/${apoderadoId}/resumen`, {
        headers: authHeaders(token),
      });
      return pickData(resp);
    } catch {
      return pickData(await apiClient.get('/api/apoderados/me/resumen'));
    }
  },

  /* ---------------- Deudas/Pagos (consolidados) ---------------- */
  async getDeudasPendientes(apoderadoId, token) {
    try {
      if (apoderadoId == null) {
        return pickData(await apiClient.get('/api/apoderados/me/deudas-pendientes'));
      }
      const resp = await apiClient.get(`/api/apoderados/${apoderadoId}/deudas`, {
        headers: authHeaders(token),
      });
      const data = pickData(resp);
      if (data) return data;
      return pickData(await apiClient.get('/api/apoderados/me/deudas-pendientes'));
    } catch {
      // fallback legacy
      const { data } = await apiClient.get('/api/deudas', {
        headers: authHeaders(token),
        params: { apoderado_id: apoderadoId, estado: 'pendiente' },
      });
      return data?.data ?? data ?? [];
    }
  },

  async getHistorialPagos(apoderadoId, token, limit = 50) {
    try {
      if (apoderadoId == null) {
        // si no hay endpoint específico, deriva del resumen por alumno cuando se use
        return [];
      }
      const resp = await apiClient.get(`/api/apoderados/${apoderadoId}/pagos`, {
        headers: authHeaders(token),
        params: { limit },
      });
      return pickData(resp) ?? [];
    } catch {
      // fallback legacy
      const { data } = await apiClient.get('/api/pagos', {
        headers: authHeaders(token),
        params: { apoderado_id: apoderadoId, limit },
      });
      return data?.data ?? data ?? [];
    }
  },

  /* ---------------------- Por Alumno específico ---------------------- */
  async getResumenAlumno(alumnoId) {
    return pickData(await apiClient.get(`/api/apoderados/me/hijos/${alumnoId}/resumen`));
  },

  async getDeudasAlumno(alumnoId) {
    return pickData(await apiClient.get(`/api/apoderados/me/hijos/${alumnoId}/deudas`));
  },

  async getHistorialPagosAlumno(alumnoId) {
    const r = await apoderadoAPI.getResumenAlumno(alumnoId);
    return r?.pagos ?? [];
  },
};

/* ----------------------- Pasarelas de pago (opcional) ----------------------- */
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
      `/api/payments/apoderados/${apoderadoId}/create`,
      payload,
      { headers: authHeaders(token) }
    );
    // Unwrap: backend responde { success, message, data: {...} }
    return data?.data ?? data;
  },
  async testGateways() {
    const { data } = await apiClient.get('/api/payments/test');
    return data;
  },
};

export default apoderadoAPI;
