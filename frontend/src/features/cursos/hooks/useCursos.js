// src/features/cursos/hooks/useCursos.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import apiClient from '../../../api/client';

// Normaliza cualquier forma que devuelva el backend
const adapt = (r = {}) => ({
  id: r.id,
  nombre_curso: r.nombre_curso ?? r.nombre ?? r.nombreCurso ?? '',
  nivel_id: r.nivel_id ?? r.nivelId ?? null,
  nivel_nombre: r.nivel_nombre ?? r.nivel ?? null,
  ano_escolar: r.ano_escolar ?? r.anio_escolar ?? r.anio ?? null,
  profesor_id: r.profesor_id ?? r.profesorId ?? null,
  profesor_nombre: r.profesor_nombre ?? r.profesor ?? null,
  activo: r.activo ?? (r.deleted_at ? 0 : 1),

  // opcionales para métricas
  alumnos_matriculados: r.alumnos_matriculados ?? r.matriculados ?? 0,
  capacidad_maxima: r.capacidad_maxima ?? r.capacidad ?? 0,
});

// -------------------- HOOK PRINCIPAL --------------------
export const useCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCursos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/cursos');
      const items = Array.isArray(res?.data?.data) ? res.data.data : (res?.data ?? []);
      setCursos(items.map(adapt));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Error cargando cursos';
      setError(msg);
      toast.error('Error al cargar cursos', { description: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCurso = useCallback(async (payload) => {
    try {
      // Normalización: soporta profesor_id numérico o RUT
      const body = {
        nombre_curso: payload.nombre_curso?.trim(),
        nivel_id: Number(payload.nivel_id),
        ano_escolar: Number(payload.ano_escolar),
        ...(payload.profesor_id
          ? (isNaN(Number(payload.profesor_id))
              ? { profesor_rut: String(payload.profesor_id) }   // viene como RUT
              : { profesor_id: Number(payload.profesor_id) })   // viene como ID numérico
          : {}),
      };

      const res = await apiClient.post('/api/cursos', body);
      if (!res?.data?.success) throw new Error(res?.data?.message || 'La API no confirmó éxito');

      toast.success('Curso creado');
      await loadCursos();
      return { success: true, data: res.data.data };
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Error al crear curso';
      toast.error('Error al crear curso', { description: msg });
      console.error('[createCurso] payload:', payload, 'body:', e?.config?.data, 'error:', msg);
      return { success: false, error: msg };
    }
  }, [loadCursos]);

  const updateCurso = useCallback(async (id, payload) => {
    try {
      await apiClient.put(`/api/cursos/${id}`, payload);
      toast.success('Curso actualizado');
      await loadCursos();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'No se pudo actualizar';
      toast.error('Error al actualizar curso', { description: msg });
      return { success: false, error: msg };
    }
  }, [loadCursos]);

  const deleteCurso = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/cursos/${id}`);
      toast.success('Curso desactivado');
      await loadCursos();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'No se pudo desactivar';
      toast.error('Error al desactivar curso', { description: msg });
      return { success: false, error: msg };
    }
  }, [loadCursos]);

  const restoreCurso = useCallback(async (id) => {
    try {
      await apiClient.patch(`/api/cursos/${id}/restore`);
      toast.success('Curso restaurado');
      await loadCursos();
      return { success: true };
    } catch (e) {
      const msg = e?.response?.data?.message || 'No se pudo restaurar';
      toast.error('Error al restaurar curso', { description: msg });
      return { success: false, error: msg };
    }
  }, [loadCursos]);

  useEffect(() => { loadCursos(); }, [loadCursos]);

  return {
    cursos, isLoading, error,
    loadCursos, createCurso, updateCurso, deleteCurso, restoreCurso,
  };
};

// -------------------- FILTRO EN MEMORIA --------------------
export const useCursosFilter = (cursos) => {
  const [filters, setFilters] = useState({
    search: '',
    nivel_id: '',
    estado: 'activos', // 'activos' | 'inactivos' | 'todos'
  });

  const filteredCursos = useMemo(() => {
    let list = Array.isArray(cursos) ? cursos : [];
    const q = filters.search.trim().toLowerCase();

    if (q) {
      list = list.filter(c =>
        (c.nombre_curso || '').toLowerCase().includes(q) ||
        String(c.ano_escolar ?? '').includes(q) ||
        (c.nivel_nombre || '').toLowerCase().includes(q)
      );
    }
    if (filters.nivel_id) list = list.filter(c => String(c.nivel_id || '') === String(filters.nivel_id));
    if (filters.estado === 'activos')   list = list.filter(c => !!c.activo);
    if (filters.estado === 'inactivos') list = list.filter(c => !c.activo);

    return list.sort((a, b) => String(a.nombre_curso).localeCompare(String(b.nombre_curso)));
  }, [cursos, filters]);

  const updateFilter = useCallback((k, v) => setFilters(s => ({ ...s, [k]: v })), []);
  const resetFilters  = useCallback(() => setFilters({ search: '', nivel_id: '', estado: 'activos' }), []);

  return { filters, filteredCursos, updateFilter, resetFilters };
};

// -------------------- ESTADÍSTICAS --------------------
export const useCursosStats = (cursos) => useMemo(() => {
  const list = Array.isArray(cursos) ? cursos : [];
  const total   = list.length;
  const activos = list.filter(c => c.activo).length;

  const porNivel = list.reduce((acc, c) => {
    const key = c.nivel_nombre || (c.nivel_id != null ? `Nivel ${c.nivel_id}` : 'Sin nivel');
    if (c.activo) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sumaCap = list.reduce((s, c) => s + (Number(c.capacidad_maxima) || 0), 0);
  const sumaMat = list.reduce((s, c) => s + (Number(c.alumnos_matriculados) || 0), 0);

  const cursosMayorDemanda = list
    .filter(c => c.capacidad_maxima > 0)
    .map(c => ({
      id: c.id,
      nombre: c.nombre_curso,
      nivel: c.nivel_nombre || `Nivel ${c.nivel_id ?? ''}`,
      profesor_principal: c.profesor_nombre || (c.profesor_id ? `#${c.profesor_id}` : '—'),
      alumnos_matriculados: c.alumnos_matriculados || 0,
      capacidad_maxima: c.capacidad_maxima || 0,
      ocupacion: c.capacidad_maxima ? (c.alumnos_matriculados / c.capacidad_maxima) : 0,
    }))
    .sort((a, b) => b.ocupacion - a.ocupacion)
    .slice(0, 5);

  return {
    total,
    activos,
    inactivos: total - activos,
    porcentajeActivos: total ? (activos / total) * 100 : 0,
    porNivel,
    alumnosMatriculados: sumaMat,
    capacidadTotal: sumaCap,
    ocupacionPromedio: sumaCap ? (sumaMat / sumaCap) * 100 : 0,
    cursosMayorDemanda,
    ingresosMensuales: 0, // si tu backend lo aporta, cámbialo aquí
  };
}, [cursos]);

// -------------------- VALIDACIÓN --------------------
export const useCursoValidation = () => {
  const validateCursoForm = useCallback((data = {}) => {
    const errors = {};
    if (!data.nombre_curso?.trim()) errors.nombre_curso = 'Requerido';
    if (data.nivel_id == null || Number.isNaN(parseInt(data.nivel_id, 10))) errors.nivel_id = 'Requerido';
    if (!/^\d{4}$/.test(String(data.ano_escolar))) errors.ano_escolar = 'Año inválido';
    // profesor_id opcional
    return errors;
  }, []);
  return { validateCursoForm };
};

export default { useCursos, useCursosFilter, useCursosStats, useCursoValidation };
