// src/features/apoderado/hooks/useApoderado.js
import { useState, useEffect, useCallback } from 'react';
import apoderadoClient, { paymentsAPI } from '@/api/apoderado';
import apiClient from '@/api/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

/* ======================= helpers / adapters ======================= */
const getArray = (resp) => {
  const d = resp?.data ?? resp;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

const adaptHijo = (r = {}) => {
  const nombre =
    r.nombre_completo ||
    [r.nombre, r.apellido, r.apellido_paterno, r.apellido_materno]
      .map(s => (s || '').trim())
      .filter(Boolean)
      .join(' ') ||
    r.persona_nombre ||
    'Estudiante';

  const cursoNombre =
    r.curso?.nombre ||
    r.curso_nombre ||
    r.nombre_curso ||
    (r.curso_id ? `Curso ${r.curso_id}` : 'Sin curso');

  return {
    id: r.id ?? r.alumno_id ?? r.usuario_id ?? null,
    rut: r.rut ?? r.usuario_rut ?? null,
    nombre_completo: nombre,
    curso_id: r.curso_id ?? r.curso?.id ?? null,
    curso_nombre: cursoNombre,
    usuario_id: r.usuario_id ?? null,
    curso: { id: r.curso?.id ?? r.curso_id ?? null, nombre: cursoNombre },
  };
};

const adaptDeuda = (r = {}) => ({
  id: r.id,
  alumno_id: r.alumno_id ?? r.estudiante_id ?? r.hijo_id ?? null,
  nombre: r.nombre ?? r.concepto ?? r.descripcion ?? 'Cuota',
  monto: Number(r.monto ?? r.monto_total ?? r.total ?? 0),
  fecha_limite: r.fecha_limite ?? r.vencimiento ?? r.fecha_vencimiento ?? null,
  estado: r.estado ?? 'pendiente',
});

const adaptPago = (r = {}) => ({
  id: r.id,
  cuota: { nombre: r.cuota?.nombre ?? r.concepto ?? r.descripcion ?? 'Cuota' },
  fecha_pago: r.fecha_pago ?? r.fecha ?? r.created_at ?? null,
  monto_pagado: Number(r.monto_pagado ?? r.monto ?? r.total ?? 0),
  metodo_pago: r.metodo_pago ?? r.gateway ?? r.pasarela ?? '—',
  transaccion_id: r.transaccion_id ?? r.reference ?? r.order_id ?? r.id ?? '',
});

/* ======================= auth (login apoderado) ======================= */
export const useApoderadoAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apoderadoClient.login(credentials);
      if (!response?.success) throw new Error(response?.message || 'Error en el login');

      const ap = response.data?.apoderado || {};
      const userData = {
        id: ap.id ?? ap.apoderado_id ?? ap.rut ?? ap.usuario_id ?? null,
        rut: ap.rut ?? ap.id ?? null,
        nombre:
          ap.nombre ||
          ap.nombre_completo ||
          [ap.nombres, ap.apellido_paterno, ap.apellido_materno].filter(Boolean).join(' ') ||
          'Apoderado',
        ...ap,
        token: response.data?.token ?? null,
        userType: 'apoderado',
      };

      login(userData);
      return { success: true, data: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return { handleLogin, isLoading, error };
};

/* ======================= datos del apoderado ======================= */
export const useApoderadoData = () => {
  const [profile, setProfile] = useState(null);
  const [hijos, setHijos] = useState([]);
  const [deudasPendientes, setDeudasPendientes] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const getAuth = () => {
    const id = user?.id ?? user?.rut ?? null;
    const token = user?.token ?? null;
    return { id, token };
  };

  const loadProfile = useCallback(async () => {
    const { id, token } = getAuth();
    if (!id) return;
    setIsLoading(true); setError(null);
    try {
      const resp = await apoderadoClient.getProfile(id, token);
      if (resp?.success) setProfile(resp.data ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadHijos = useCallback(async () => {
    const { id, token } = getAuth();
    if (!id) return;
    setIsLoading(true); setError(null);
    try {
      const resp = await apoderadoClient.getHijos(id, token);
      setHijos(getArray(resp).map(adaptHijo));
    } catch (err) {
      setError(err.message);
      setHijos([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Consolidación de deudas:
   * 1) Trae hijos del apoderado
   * 2) Para cada hijo consulta /api/cobros-alumnos?alumno_id=...&estado=pendiente
   * 3) Une y adapta resultados
   */
  const loadDeudasPendientes = useCallback(async () => {
    const { id } = getAuth();
    if (!id) return;
    setIsLoading(true); setError(null);

    try {
      // 1) hijos
      const respHijos = await apoderadoClient.getHijos(id);
      const hijosList = getArray(respHijos).map(adaptHijo);
      setHijos(hijosList); // de paso actualiza hijos si no estaban

      const ids = hijosList.map(h => h.id).filter(Boolean);
      if (ids.length === 0) {
        setDeudasPendientes([]);
        return;
      }

      // 2) cobros por alumno (paralelo)
      const calls = ids.map(alumnoId =>
        apiClient.get('/api/cobros-alumnos', {
          params: { alumno_id: alumnoId, estado: 'pendiente', limit: 1000 },
        })
      );

      const results = await Promise.all(calls);

      // 3) unificación
      const all = results.flatMap(r => getArray(r).map(adaptDeuda));
      setDeudasPendientes(all);
    } catch (err) {
      setError(err.message);
      setDeudasPendientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadHistorialPagos = useCallback(async (limit = 50) => {
    const { id, token } = getAuth();
    if (!id) return;
    setIsLoading(true); setError(null);
    try {
      const resp = await apoderadoClient.getHistorialPagos(id, token, limit);
      setHistorialPagos(getArray(resp).map(adaptPago));
    } catch (err) {
      setError(err.message);
      setHistorialPagos([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    const { id } = getAuth();
    if (!id) return;
    await Promise.all([
      loadProfile(),
      loadHijos(),
      loadDeudasPendientes(),
      loadHistorialPagos(),
    ]);
  }, [loadProfile, loadHijos, loadDeudasPendientes, loadHistorialPagos]);

  return {
    profile,
    hijos,
    deudasPendientes,
    historialPagos,
    isLoading,
    error,
    loadProfile,
    loadHijos,
    loadDeudasPendientes,
    loadHistorialPagos,
    refreshData,
  };
};

/* ======================= pagos unificados ======================= */
export const usePayments = () => {
  const [gateways, setGateways] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadGateways = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await paymentsAPI.getGateways();
      setGateways(getArray(resp) || resp?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecommendation = useCallback(async (params = {}) => {
    setIsLoading(true); setError(null);
    try {
      const resp = await paymentsAPI.getRecommendation({ country: 'CL', priority: 'cost', ...params });
      if (resp?.success) { setRecommendation(resp.data); return resp.data; }
      return null;
    } catch (err) { setError(err.message); return null; }
    finally { setIsLoading(false); }
  }, []);

  const compareGateways = useCallback(async (amount) => {
    setIsLoading(true); setError(null);
    try {
      const resp = await paymentsAPI.compareGateways(amount);
      if (resp?.success) { setComparison(resp.data); return resp.data; }
      return null;
    } catch (err) { setError(err.message); return null; }
    finally { setIsLoading(false); }
  }, []);

  const createPayment = useCallback(async (paymentData) => {
    const id = user?.id ?? user?.rut ?? null;
    const token = user?.token ?? null;
    if (!id) throw new Error('Usuario no autenticado');
    setIsLoading(true); setError(null);
    try {
      const resp = await paymentsAPI.createPayment(id, paymentData, token);
      // Ya viene desanidado (objeto con init_point/preference_id)
      return resp;
    } catch (err) { setError(err.message); throw err; }
    finally { setIsLoading(false); }
  }, [user]);


  const testGateways = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const resp = await paymentsAPI.testGateways();
      return resp?.success ? resp.data : null;
    } catch (err) { setError(err.message); return null; }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadGateways(); }, [loadGateways]);

  return {
    gateways,
    recommendation,
    comparison,
    isLoading,
    error,
    loadGateways,
    getRecommendation,
    compareGateways,
    createPayment,
    testGateways,
  };
};
