// src/features/alumnos/hooks/useAlumnos.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { API_ENDPOINTS, buildUrl, getAuthHeaders } from '../../../config/api';

// Normalizador seguro
const adapt = (row = {}) => ({
  id: row.id,
  nombre_completo: row.nombre_completo ?? '',
  fecha_nacimiento: row.fecha_nacimiento ?? null,
  curso_id: row.curso_id ?? null,
  apoderado_id: row.apoderado_id ?? null,
  usuario_id: row.usuario_id ?? null,
  activo: !row.fecha_eliminacion,             // soft delete
  fecha_creacion: row.fecha_creacion ?? null,
  fecha_actualizacion: row.fecha_actualizacion ?? null,
});

const numOrNull = (v) => (v === '' || v == null ? null : Number(v));

/* ========================== HOOK PRINCIPAL ========================== */
export const useAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // list/paginación/estado
  const [page, setPage]   = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('activos'); // 'activos' | 'inactivos' | 'todos'

  const loadAlumnos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = buildUrl(API_ENDPOINTS.ALUMNOS.BASE, {
        page,
        limit,
        search: search || undefined,
        estado, // el backend acepta 'activos' | 'inactivos' | 'todos'
      });
      const res = await fetch(url, { headers: getAuthHeaders() });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'No se pudo cargar alumnos');

      setAlumnos((json?.data?.items ?? []).map(adapt));
      setPages(json?.data?.pages ?? 1);
    } catch (e) {
      setError(e.message);
      toast.error('Error al cargar alumnos', { description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, estado]);

  const createAlumno = useCallback(async (payload) => {
    try {
      console.log('[alumnos] POST payload:', payload);
      const res = await fetch(buildUrl(API_ENDPOINTS.ALUMNOS.BASE), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let json = null;
      try { json = await res.json(); } catch {}

      if (!res.ok) {
        const msg = json?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      toast.success('Alumno creado');
      await loadAlumnos();
      return { success: true, data: json?.data };
    } catch (e) {
      toast.error('Error al crear alumno', { description: e.message });
      console.error('[alumnos] create error:', e);
      return { success: false, error: e.message };
    }
  }, [loadAlumnos]);

  const updateAlumno = useCallback(async (id, payload) => {
    try {
      const body = {
        nombre_completo: payload.nombre_completo?.trim() || undefined,
        fecha_nacimiento: payload.fecha_nacimiento || undefined,
        curso_id: numOrNull(payload.curso_id),
        apoderado_id: numOrNull(payload.apoderado_id),
        usuario_id: numOrNull(payload.usuario_id),
      };

      const res = await fetch(buildUrl(API_ENDPOINTS.ALUMNOS.BY_ID(id)), {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'No se pudo actualizar');

      toast.success('Alumno actualizado');
      await loadAlumnos();
      return { success: true };
    } catch (e) {
      toast.error('Error al actualizar alumno', { description: e.message });
      return { success: false, error: e.message };
    }
  }, [loadAlumnos]);

  const deleteAlumno = useCallback(async (id) => {
    try {
      const res = await fetch(buildUrl(API_ENDPOINTS.ALUMNOS.BY_ID(id)), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'No se pudo eliminar');

      toast.success('Alumno eliminado');
      await loadAlumnos();
      return { success: true };
    } catch (e) {
      toast.error('Error al eliminar alumno', { description: e.message });
      return { success: false, error: e.message };
    }
  }, [loadAlumnos]);

  const restoreAlumno = useCallback(async (id) => {
    try {
      const res = await fetch(buildUrl(API_ENDPOINTS.ALUMNOS.RESTORE(id)), {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || 'No se pudo restaurar');

      toast.success('Alumno restaurado');
      await loadAlumnos();
      return { success: true };
    } catch (e) {
      toast.error('Error al restaurar alumno', { description: e.message });
      return { success: false, error: e.message };
    }
  }, [loadAlumnos]);

  useEffect(() => { loadAlumnos(); }, [loadAlumnos]);

  return {
    alumnos, isLoading, error,
    page, setPage, pages, limit, setLimit,
    search, setSearch, estado, setEstado,
    loadAlumnos, createAlumno, updateAlumno, deleteAlumno, restoreAlumno,
  };
};

/* ========================== FILTROS EN MEMORIA ========================== */
export const useAlumnosFilter = (alumnos) => {
  const [filters, setFilters] = useState({ search: '', curso_id: '', estado: 'todos' });

  const filteredAlumnos = useMemo(() => {
    let list = Array.isArray(alumnos) ? alumnos : [];
    const q = filters.search.trim().toLowerCase();

    if (q) {
      list = list.filter(a =>
        (a.nombre_completo || '').toLowerCase().includes(q) ||
        String(a.usuario_id || '').includes(q)
      );
    }
    if (filters.curso_id) list = list.filter(a => String(a.curso_id || '') === String(filters.curso_id));
    if (filters.estado === 'activo')   list = list.filter(a => a.activo);
    if (filters.estado === 'inactivo') list = list.filter(a => !a.activo);

    return list;
  }, [alumnos, filters]);

  const updateFilter = useCallback((k, v) => setFilters(s => ({ ...s, [k]: v })), []);
  const resetFilters  = useCallback(() => setFilters({ search: '', curso_id: '', estado: 'todos' }), []);

  return { filters, filteredAlumnos, updateFilter, resetFilters };
};

/* ========================== ESTADÍSTICAS ========================== */
export const useAlumnosStats = (alumnos) => useMemo(() => {
  const total = alumnos.length;
  const activos = alumnos.filter(a => a.activo).length;
  const porCurso = alumnos.reduce((acc, a) => {
    const k = a.curso_id || 'sin_curso';
    if (a.activo) acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  return {
    total,
    activos,
    inactivos: total - activos,
    porCurso,
    porcentajeActivos: total ? (activos / total) * 100 : 0,
  };
}, [alumnos]);

/* ========================== VALIDACIÓN SIMPLE ========================== */
export const useAlumnoValidation = () => {
  const validateRut = useCallback((rut) => {
    if (!rut) return 'El RUT es requerido';
    const cleaned = String(rut).replace(/[.\-\s]/g, '');
    if (!/^\d{7,9}[0-9kK]?$/.test(cleaned)) return 'RUT inválido';
    return null;
  }, []);

  const validateEmail = useCallback((email) => {
    if (!email) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) ? null : 'Email inválido';
  }, []);

  const validatePhone = useCallback((phone) => {
    if (!phone) return null;
    return /^\+56[0-9]{9}$/.test(phone) ? null : 'Teléfono inválido (+569XXXXXXXX)';
  }, []);

  // mode: 'create' exige RUT; 'edit' no
  const validateAlumnoForm = useCallback((form, { mode = 'create' } = {}) => {
    const errors = {};
    if (mode === 'create') {
      const eRut = validateRut(form.rut);
      if (eRut) errors.rut = eRut;
    }
    const eEmail = validateEmail(form.email);
    if (eEmail) errors.email = eEmail;

    const ePhone = validatePhone(form.telefono);
    if (ePhone) errors.telefono = ePhone;

    return { isValid: Object.keys(errors).length === 0, errors };
  }, [validateRut, validateEmail, validatePhone]);

  return { validateRut, validateEmail, validatePhone, validateAlumnoForm };
};

export default { useAlumnos, useAlumnosFilter, useAlumnosStats, useAlumnoValidation };
