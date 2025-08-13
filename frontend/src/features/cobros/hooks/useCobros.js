// src/features/cobros/hooks/useCobros.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import cobrosAPI from '../../../api/cobros';
import cobrosAlumnosAPI from '../../../api/cobrosAlumnos';

/* ============================================================================
   Normalización y helpers
============================================================================ */

const pickArray = (resp) =>
  resp?.data?.data ?? resp?.data?.cobros ?? resp?.data?.cobrosAlumnos ?? resp?.data ?? [];

const safeDate = (d) => (d ? new Date(d) : null);

const deriveEstado = (item) => {
  if (item?.activo === false || item?.fecha_eliminacion) return 'Cancelado';
  if (item?.estado) return item.estado;
  if (item?.fecha_pago) return 'Pagado';
  const fv = safeDate(item?.fecha_vencimiento);
  if (!fv) return 'Pendiente';
  const diff = Math.ceil((fv - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Vencido';
  if (diff <= 3) return 'Por Vencer';
  return 'Pendiente';
};

const normalizeGeneral = (raw) => {
  const estado = deriveEstado(raw);
  const monto = raw.monto_total ?? raw.monto ?? 0;
  return {
    id: raw.id,
    curso_id: raw.curso_id ?? null,
    concepto: raw.concepto ?? '',
    descripcion: raw.descripcion ?? '',
    monto,
    fecha_emision: raw.fecha_emision ?? raw.fecha_creacion?.slice?.(0, 10) ?? null,
    fecha_vencimiento: raw.fecha_vencimiento ?? null,
    estado,
    metodo_pago: raw.metodo_pago ?? null,
    numero_comprobante: raw.numero_comprobante ?? null,
    observaciones: raw.observaciones ?? null,
    tipo_cobro: 'General',
    categoria: raw.categoria ?? 'Otros',
    alumno_id: null,
    alumno_nombre: null,
    apoderado_nombre: null,
    fecha_pago: raw.fecha_pago ?? null,
    monto_pagado: raw.monto_pagado ?? (estado === 'Pagado' ? monto : 0),
    descuento: raw.descuento ?? 0,
    recargo: raw.recargo ?? 0,
    activo: raw.fecha_eliminacion ? false : (raw.activo ?? true),
    creado_por: raw.creado_por ?? null,
    fecha_creacion: raw.fecha_creacion ?? null,
    actualizado_por: raw.actualizado_por ?? null,
    fecha_actualizacion: raw.fecha_actualizacion ?? null,
    eliminado_por: raw.eliminado_por ?? null,
    fecha_eliminacion: raw.fecha_eliminacion ?? null,
    _raw: raw,
  };
};

const normalizeAlumno = (raw) => {
  const estado = deriveEstado(raw);
  const monto = raw.monto ?? raw.monto_total ?? 0;
  return {
    id: raw.id,
    curso_id: raw.curso_id ?? raw.alumno?.curso_id ?? null,
    concepto: raw.concepto ?? '',
    descripcion: raw.descripcion ?? '',
    monto,
    fecha_emision: raw.fecha_emision ?? raw.fecha_creacion?.slice?.(0, 10) ?? null,
    fecha_vencimiento: raw.fecha_vencimiento ?? null,
    estado,
    metodo_pago: raw.metodo_pago ?? null,
    numero_comprobante: raw.numero_comprobante ?? null,
    observaciones: raw.observaciones ?? null,
    tipo_cobro: 'Alumno',
    categoria: raw.categoria ?? 'Otros',
    alumno_id: raw.alumno_id ?? raw.alumno?.id ?? null,
    alumno_nombre: raw.alumno_nombre ?? raw.alumno?.nombre_completo ?? null,
    apoderado_nombre:
      raw.apoderado_nombre ?? raw.alumno?.apoderado?.nombre_completo ?? null,
    fecha_pago: raw.fecha_pago ?? null,
    monto_pagado: raw.monto_pagado ?? (estado === 'Pagado' ? monto : 0),
    descuento: raw.descuento ?? 0,
    recargo: raw.recargo ?? 0,
    activo: raw.fecha_eliminacion ? false : (raw.activo ?? true),
    creado_por: raw.creado_por ?? null,
    fecha_creacion: raw.fecha_creacion ?? null,
    actualizado_por: raw.actualizado_por ?? null,
    fecha_actualizacion: raw.fecha_actualizacion ?? null,
    eliminado_por: raw.eliminado_por ?? null,
    fecha_eliminacion: raw.fecha_eliminacion ?? null,
    _raw: raw,
  };
};

const pickClient = (tipo) => (tipo === 'Alumno' ? cobrosAlumnosAPI : cobrosAPI);

const mapFormToBackend = (form) => {
  if (form.tipo_cobro === 'Alumno') {
    return {
      concepto: form.concepto,
      descripcion: form.descripcion,
      monto: Number(form.monto),
      alumno_id: Number(form.alumno_id),
      categoria: form.categoria,
      fecha_emision: form.fecha_emision,
      fecha_vencimiento: form.fecha_vencimiento,
      numero_comprobante: form.numero_comprobante || undefined,
      observaciones: form.observaciones || undefined,
      // curso_id opcional; el backend puede inferirlo desde el alumno
      ...(form.curso_id ? { curso_id: Number(form.curso_id) } : {}),
    };
  }
  // GENERAL: importante enviar curso_id
  return {
    concepto: form.concepto,
    descripcion: form.descripcion,
    monto_total: Number(form.monto),
    categoria: form.categoria,
    fecha_emision: form.fecha_emision,
    fecha_vencimiento: form.fecha_vencimiento,
    numero_comprobante: form.numero_comprobante || undefined,
    observaciones: form.observaciones || undefined,
    curso_id: form.curso_id ? Number(form.curso_id) : undefined,
  };
};

const toTime = (v) => (v ? new Date(v).getTime() : 0);

/* ============================================================================
   useCobros: CRUD + sync con backend (cobros generales y por alumno)
============================================================================ */

export const useCobros = () => {
  const [cobros, setCobros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Cargar ambos orígenes
  const loadCobros = useCallback(
    async (params = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const [genResp, aluResp] = await Promise.all([
          cobrosAPI.getAll({ limit: 500, ...params }),
          cobrosAlumnosAPI.getAll({ limit: 500, ...params }),
        ]);

        const generales = pickArray(genResp).map(normalizeGeneral);
        const porAlumno = pickArray(aluResp).map(normalizeAlumno);

        const merged = [...generales, ...porAlumno].sort((a, b) => toTime(b.fecha_emision) - toTime(a.fecha_emision));

        setCobros(merged);
        setLastUpdated(new Date());
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Error al cargar cobros';
        setError(msg);
        toast.error('Error al cargar cobros', { description: msg });
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createCobro = useCallback(async (formData) => {
    const client = pickClient(formData.tipo_cobro);
    const body = mapFormToBackend(formData);

    try {
      const resp = await client.create(body);
      const created = resp?.data?.data ?? resp?.data;
      const normalized =
        formData.tipo_cobro === 'Alumno' ? normalizeAlumno(created) : normalizeGeneral(created);

      setCobros((prev) => [normalized, ...prev]);
      toast.success('Cobro creado exitosamente', { description: normalized.concepto });
      return { success: true, data: normalized };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al crear cobro';
      toast.error('Error al crear cobro', { description: msg });
      return { success: false, error: msg };
    }
  }, []);

  const updateCobro = useCallback(async (id, formData) => {
    const client = pickClient(formData.tipo_cobro);
    const body = mapFormToBackend(formData);

    try {
      const resp = await client.update(id, body);
      const updated = resp?.data?.data ?? resp?.data;
      const normalized =
        formData.tipo_cobro === 'Alumno' ? normalizeAlumno(updated) : normalizeGeneral(updated);

      setCobros((prev) => prev.map((c) => (c.id === id ? { ...c, ...normalized } : c)));
      toast.success('Cobro actualizado exitosamente');
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al actualizar cobro';
      toast.error('Error al actualizar cobro', { description: msg });
      return { success: false, error: msg };
    }
  }, []);

  const marcarComoPagado = useCallback(
    async (id, datosPago = {}) => {
      const target = cobros.find((c) => c.id === id);
      if (!target) return { success: false, error: 'Cobro no encontrado' };

      const client = pickClient(target.tipo_cobro);
      const payload = {
        estado: 'Pagado',
        fecha_pago: new Date().toISOString(),
        monto_pagado: datosPago.monto_pagado ?? target.monto,
        metodo_pago: datosPago.metodo_pago,
        numero_comprobante: datosPago.numero_comprobante,
        observaciones: datosPago.observaciones,
      };

      try {
        await client.update(id, payload);
        setCobros((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  estado: 'Pagado',
                  fecha_pago: payload.fecha_pago,
                  monto_pagado: payload.monto_pagado,
                  metodo_pago: payload.metodo_pago ?? c.metodo_pago,
                  numero_comprobante: payload.numero_comprobante ?? c.numero_comprobante,
                  observaciones: payload.observaciones ?? c.observaciones,
                }
              : c
          )
        );
        toast.success('Pago registrado');
        return { success: true };
      } catch (err) {
        const msg = err?.response?.data?.message || 'Error al registrar pago';
        toast.error('Error al registrar pago', { description: msg });
        return { success: false, error: msg };
      }
    },
    [cobros]
  );

  const cancelarCobro = useCallback(
    async (id, motivo) => {
      const target = cobros.find((c) => c.id === id);
      if (!target) return { success: false, error: 'Cobro no encontrado' };

      const client = pickClient(target.tipo_cobro);

      try {
        await client.delete(id); // soft-delete
        setCobros((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  activo: false,
                  estado: 'Cancelado',
                  observaciones: motivo || c.observaciones,
                  fecha_eliminacion: new Date().toISOString(),
                }
              : c
          )
        );
        toast.success('Cobro cancelado');
        return { success: true };
      } catch (err) {
        const msg = err?.response?.data?.message || 'Error al cancelar cobro';
        toast.error('Error al cancelar cobro', { description: msg });
        return { success: false, error: msg };
      }
    },
    [cobros]
  );

  const reactivarCobro = useCallback(
    async (id) => {
      const target = cobros.find((c) => c.id === id);
      if (!target) return { success: false, error: 'Cobro no encontrado' };

      const client = pickClient(target.tipo_cobro);

      try {
        await client.restore(id); // PATCH :id/restore
        setCobros((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  activo: true,
                  estado: c.estado === 'Pagado' ? 'Pagado' : 'Pendiente',
                  fecha_eliminacion: null,
                }
              : c
          )
        );
        toast.success('Cobro reactivado');
        return { success: true };
      } catch (err) {
        const msg = err?.response?.data?.message || 'Error al reactivar cobro';
        toast.error('Error al reactivar cobro', { description: msg });
        return { success: false, error: msg };
      }
    },
    [cobros]
  );

  useEffect(() => {
    loadCobros();
  }, [loadCobros]);

  return {
    cobros,
    isLoading,
    error,
    lastUpdated,
    loadCobros,
    createCobro,
    updateCobro,
    marcarComoPagado,
    cancelarCobro,
    reactivarCobro,
  };
};

/* ============================================================================
   useCobrosFilter: búsqueda, filtros y ordenamiento
============================================================================ */

export const useCobrosFilter = (cobros) => {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo_cobro: '',
    categoria: '',
    metodo_pago: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    sortBy: 'fecha_emision',
    sortOrder: 'desc',
  });

  const filteredCobros = useMemo(() => {
    let data = [...cobros];

    // Buscar
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((c) =>
        [c.concepto, c.descripcion, c.numero_comprobante, c.alumno_nombre, c.apoderado_nombre]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q))
      );
    }

    // Filtros
    if (filters.estado) data = data.filter((c) => c.estado === filters.estado);
    if (filters.tipo_cobro) data = data.filter((c) => c.tipo_cobro === filters.tipo_cobro);
    if (filters.categoria) data = data.filter((c) => c.categoria === filters.categoria);
    if (filters.metodo_pago) data = data.filter((c) => c.metodo_pago === filters.metodo_pago);

    // Rango de fechas (fecha_emision)
    if (filters.fecha_desde) {
      const fd = new Date(filters.fecha_desde);
      data = data.filter((c) => new Date(c.fecha_emision) >= fd);
    }
    if (filters.fecha_hasta) {
      const fh = new Date(filters.fecha_hasta);
      fh.setHours(23, 59, 59, 999); // incluir día completo
      data = data.filter((c) => new Date(c.fecha_emision) <= fh);
    }

    // Rango de montos
    if (filters.monto_min) data = data.filter((c) => c.monto >= Number(filters.monto_min));
    if (filters.monto_max) data = data.filter((c) => c.monto <= Number(filters.monto_max));

    // Orden
    const { sortBy, sortOrder } = filters;
    data.sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];

      if (sortBy.startsWith('fecha')) {
        av = av ? new Date(av).getTime() : 0;
        bv = bv ? new Date(bv).getTime() : 0;
      } else if (typeof av === 'string') {
        av = av.toLowerCase();
        bv = (bv ?? '').toLowerCase();
      }

      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [cobros, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      estado: '',
      tipo_cobro: '',
      categoria: '',
      metodo_pago: '',
      fecha_desde: '',
      fecha_hasta: '',
      monto_min: '',
      monto_max: '',
      sortBy: 'fecha_emision',
      sortOrder: 'desc',
    });
  }, []);

  return { filters, filteredCobros, updateFilter, resetFilters };
};

/* ============================================================================
   useCobrosStats: KPIs y agregaciones
============================================================================ */

export const useCobrosStats = (cobros) => {
  const stats = useMemo(() => {
    const total = cobros.length;
    const activos = cobros.filter((c) => c.activo).length;

    const activosOnly = cobros.filter((c) => c.activo);
    const porEstado = activosOnly.reduce((acc, c) => {
      acc[c.estado] = (acc[c.estado] || 0) + 1;
      return acc;
    }, {});

    const montoTotal = activosOnly.reduce((s, c) => s + (c.monto || 0), 0);
    const montoPagado = activosOnly
      .filter((c) => c.estado === 'Pagado')
      .reduce((s, c) => s + (c.monto_pagado || 0), 0);
    const montoPendiente = activosOnly
      .filter((c) => ['Pendiente', 'Por Vencer', 'Vencido'].includes(c.estado))
      .reduce((s, c) => s + (c.monto || 0), 0);

    const cobrosVencidos = activosOnly.filter((c) => c.estado === 'Vencido').length;
    const montoVencido = activosOnly
      .filter((c) => c.estado === 'Vencido')
      .reduce((s, c) => s + (c.monto || 0), 0);

    const porTipo = activosOnly.reduce((acc, c) => {
      acc[c.tipo_cobro] = (acc[c.tipo_cobro] || 0) + 1;
      return acc;
    }, {});

    const porCategoria = activosOnly.reduce((acc, c) => {
      acc[c.categoria] = (acc[c.categoria] || 0) + 1;
      return acc;
    }, {});

    const porMetodoPago = activosOnly
      .filter((c) => c.metodo_pago)
      .reduce((acc, c) => {
        acc[c.metodo_pago] = (acc[c.metodo_pago] || 0) + 1;
        return acc;
      }, {});

    // Mes actual
    const now = new Date();
    const mes = now.getMonth();
    const year = now.getFullYear();

    const delMes = activosOnly.filter((c) => {
      const d = new Date(c.fecha_emision);
      return d.getMonth() === mes && d.getFullYear() === year;
    });

    const cobrosEsteMes = delMes.length;
    const montoEsteMes = delMes.reduce((s, c) => s + (c.monto || 0), 0);

    return {
      total,
      activos,
      porEstado,
      montoTotal,
      montoPagado,
      montoPendiente,
      montoVencido,
      efectividadCobranza: montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0,
      cobrosVencidos,
      porTipo,
      porCategoria,
      porMetodoPago,
      cobrosEsteMes,
      montoEsteMes,
      porcentajeActivos: total > 0 ? (activos / total) * 100 : 0,
    };
  }, [cobros]);

  return stats;
};

/* ============================================================================
   useCobroValidation: validación de formularios
============================================================================ */

export const useCobroValidation = () => {
  const validateConcepto = useCallback((concepto) => {
    if (!concepto?.trim()) return 'El concepto del cobro es requerido';
    if (concepto.length < 3) return 'El concepto debe tener al menos 3 caracteres';
    if (concepto.length > 100) return 'El concepto no puede exceder 100 caracteres';
    return null;
  }, []);

  const validateMonto = useCallback((monto) => {
    if (!monto) return 'El monto es requerido';
    const num = parseInt(monto, 10);
    if (isNaN(num) || num <= 0) return 'El monto debe ser un número mayor a 0';
    return null;
  }, []);

  const validateFecha = useCallback((fecha) => {
    if (!fecha) return 'La fecha es requerida';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return 'La fecha no es válida';
    return null;
  }, []);

  const validateCobroForm = useCallback(
    (formData) => {
      const errors = {};

      const e1 = validateConcepto(formData.concepto);
      if (e1) errors.concepto = e1;

      const e2 = validateMonto(formData.monto);
      if (e2) errors.monto = e2;

      if (!formData.descripcion?.trim()) errors.descripcion = 'La descripción es requerida';

      const e3 = validateFecha(formData.fecha_emision);
      if (e3) errors.fecha_emision = e3;

      const e4 = validateFecha(formData.fecha_vencimiento);
      if (e4) errors.fecha_vencimiento = e4;

      if (
        formData.fecha_emision &&
        formData.fecha_vencimiento &&
        new Date(formData.fecha_emision) > new Date(formData.fecha_vencimiento)
      ) {
        errors.fecha_vencimiento = 'La fecha de vencimiento debe ser posterior a la de emisión';
      }

      if (!formData.tipo_cobro?.trim()) errors.tipo_cobro = 'El tipo de cobro es requerido';
      if (!formData.categoria?.trim()) errors.categoria = 'La categoría es requerida';

      if (formData.tipo_cobro === 'Alumno' && !formData.alumno_id) {
        errors.alumno_id = 'Debe seleccionar un alumno para cobros individuales';
      }

      return { isValid: Object.keys(errors).length === 0, errors };
    },
    [validateConcepto, validateMonto, validateFecha]
  );

  return { validateConcepto, validateMonto, validateFecha, validateCobroForm };
};

export default {
  useCobros,
  useCobrosFilter,
  useCobrosStats,
  useCobroValidation,
};
