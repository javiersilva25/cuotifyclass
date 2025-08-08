import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Hook principal para gestión de cobros
export const useCobros = () => {
  const [cobros, setCobros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos mock para cobros
  const mockCobros = useMemo(() => [
    {
      id: 1,
      concepto: 'Matrícula 2024',
      descripcion: 'Pago de matrícula anual para el año académico 2024',
      monto: 150000,
      fecha_emision: '2024-01-15',
      fecha_vencimiento: '2024-02-15',
      estado: 'Pagado',
      metodo_pago: 'Transferencia',
      numero_comprobante: 'MAT-2024-001',
      observaciones: 'Pago realizado en fecha',
      tipo_cobro: 'General',
      categoria: 'Matrícula',
      alumno_id: null,
      alumno_nombre: null,
      apoderado_nombre: null,
      fecha_pago: '2024-02-10T14:30:00Z',
      monto_pagado: 150000,
      descuento: 0,
      recargo: 0,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-01-15T10:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-02-10T14:30:00Z',
    },
    {
      id: 2,
      concepto: 'Mensualidad Marzo 2024',
      descripcion: 'Pago mensual correspondiente al mes de marzo',
      monto: 85000,
      fecha_emision: '2024-03-01',
      fecha_vencimiento: '2024-03-15',
      estado: 'Pendiente',
      metodo_pago: null,
      numero_comprobante: 'MENS-2024-003',
      observaciones: null,
      tipo_cobro: 'Alumno',
      categoria: 'Mensualidad',
      alumno_id: 1,
      alumno_nombre: 'Juan Carlos Pérez',
      apoderado_nombre: 'María Pérez González',
      fecha_pago: null,
      monto_pagado: 0,
      descuento: 0,
      recargo: 0,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-03-01T08:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T08:00:00Z',
    },
    {
      id: 3,
      concepto: 'Material Didáctico',
      descripcion: 'Cobro por material didáctico del primer semestre',
      monto: 45000,
      fecha_emision: '2024-02-20',
      fecha_vencimiento: '2024-03-20',
      estado: 'Vencido',
      metodo_pago: null,
      numero_comprobante: 'MAT-2024-020',
      observaciones: 'Cobro vencido, aplicar recargo',
      tipo_cobro: 'Alumno',
      categoria: 'Material',
      alumno_id: 2,
      alumno_nombre: 'Ana María González',
      apoderado_nombre: 'Roberto González Silva',
      fecha_pago: null,
      monto_pagado: 0,
      descuento: 0,
      recargo: 4500,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-02-20T09:15:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-21T10:00:00Z',
    },
    {
      id: 4,
      concepto: 'Mensualidad Febrero 2024',
      descripcion: 'Pago mensual correspondiente al mes de febrero',
      monto: 85000,
      fecha_emision: '2024-02-01',
      fecha_vencimiento: '2024-02-15',
      estado: 'Pagado',
      metodo_pago: 'Efectivo',
      numero_comprobante: 'MENS-2024-002',
      observaciones: 'Pago con descuento por pronto pago',
      tipo_cobro: 'Alumno',
      categoria: 'Mensualidad',
      alumno_id: 3,
      alumno_nombre: 'Carlos Eduardo Morales',
      apoderado_nombre: 'Elena Morales Torres',
      fecha_pago: '2024-02-12T16:45:00Z',
      monto_pagado: 80750,
      descuento: 4250,
      recargo: 0,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-02-01T08:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-02-12T16:45:00Z',
    },
    {
      id: 5,
      concepto: 'Actividad Extracurricular',
      descripcion: 'Cobro por taller de música y arte',
      monto: 35000,
      fecha_emision: '2024-03-10',
      fecha_vencimiento: '2024-03-25',
      estado: 'Pendiente',
      metodo_pago: null,
      numero_comprobante: 'ACT-2024-010',
      observaciones: null,
      tipo_cobro: 'Alumno',
      categoria: 'Actividades',
      alumno_id: 1,
      alumno_nombre: 'Juan Carlos Pérez',
      apoderado_nombre: 'María Pérez González',
      fecha_pago: null,
      monto_pagado: 0,
      descuento: 0,
      recargo: 0,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-03-10T11:20:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-10T11:20:00Z',
    },
    {
      id: 6,
      concepto: 'Seguro Escolar',
      descripcion: 'Pago anual del seguro escolar obligatorio',
      monto: 25000,
      fecha_emision: '2024-01-20',
      fecha_vencimiento: '2024-02-20',
      estado: 'Pagado',
      metodo_pago: 'Tarjeta de Débito',
      numero_comprobante: 'SEG-2024-001',
      observaciones: 'Pago procesado automáticamente',
      tipo_cobro: 'General',
      categoria: 'Seguro',
      alumno_id: null,
      alumno_nombre: null,
      apoderado_nombre: null,
      fecha_pago: '2024-02-18T10:15:00Z',
      monto_pagado: 25000,
      descuento: 0,
      recargo: 0,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-01-20T14:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-02-18T10:15:00Z',
    },
    {
      id: 7,
      concepto: 'Mensualidad Abril 2024',
      descripcion: 'Pago mensual correspondiente al mes de abril',
      monto: 85000,
      fecha_emision: '2024-04-01',
      fecha_vencimiento: '2024-04-15',
      estado: 'Por Vencer',
      metodo_pago: null,
      numero_comprobante: 'MENS-2024-004',
      observaciones: null,
      tipo_cobro: 'Alumno',
      categoria: 'Mensualidad',
      alumno_id: 2,
      alumno_nombre: 'Ana María González',
      apoderado_nombre: 'Roberto González Silva',
      fecha_pago: null,
      monto_pagado: 0,
      descuento: 0,
      recargo: 0,
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-04-01T08:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-04-01T08:00:00Z',
    },
    {
      id: 8,
      concepto: 'Uniforme Escolar',
      descripcion: 'Cobro por uniforme escolar completo',
      monto: 120000,
      fecha_emision: '2024-02-15',
      fecha_vencimiento: '2024-03-15',
      estado: 'Cancelado',
      metodo_pago: null,
      numero_comprobante: 'UNI-2024-015',
      observaciones: 'Cobro cancelado por cambio de proveedor',
      tipo_cobro: 'Alumno',
      categoria: 'Uniforme',
      alumno_id: 4,
      alumno_nombre: 'Sofía Alejandra Ruiz',
      apoderado_nombre: 'Carmen Ruiz Herrera',
      fecha_pago: null,
      monto_pagado: 0,
      descuento: 0,
      recargo: 0,
      activo: false,
      creado_por: 1,
      fecha_creacion: '2024-02-15T13:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-10T09:45:00Z',
      eliminado_por: 1,
      fecha_eliminacion: '2024-03-10T09:45:00Z',
    },
  ], []);

  // Cargar cobros
  const loadCobros = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCobros(mockCobros);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar cobros';
      setError(errorMessage);
      toast.error('Error al cargar cobros', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [mockCobros]);

  // Crear cobro
  const createCobro = useCallback(async (cobroData) => {
    try {
      // Simular creación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCobro = {
        ...cobroData,
        id: Date.now(),
        estado: 'Pendiente',
        fecha_pago: null,
        monto_pagado: 0,
        activo: true,
        creado_por: 1,
        fecha_creacion: new Date().toISOString(),
        actualizado_por: 1,
        fecha_actualizacion: new Date().toISOString(),
      };
      
      setCobros(prev => [...prev, newCobro]);
      
      toast.success('Cobro creado exitosamente', {
        description: `${newCobro.concepto} ha sido registrado`,
      });
      
      return { success: true, data: newCobro };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear cobro';
      toast.error('Error al crear cobro', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Actualizar cobro
  const updateCobro = useCallback(async (id, cobroData) => {
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCobros(prev => prev.map(cobro => 
        cobro.id === id 
          ? { 
              ...cobro, 
              ...cobroData,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : cobro
      ));
      
      toast.success('Cobro actualizado exitosamente', {
        description: 'Los datos han sido guardados correctamente',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar cobro';
      toast.error('Error al actualizar cobro', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Marcar como pagado
  const marcarComoPagado = useCallback(async (id, datosPago) => {
    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCobros(prev => prev.map(cobro => 
        cobro.id === id 
          ? { 
              ...cobro, 
              estado: 'Pagado',
              fecha_pago: new Date().toISOString(),
              monto_pagado: datosPago.monto_pagado || cobro.monto,
              metodo_pago: datosPago.metodo_pago,
              numero_comprobante: datosPago.numero_comprobante || cobro.numero_comprobante,
              observaciones: datosPago.observaciones || cobro.observaciones,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : cobro
      ));
      
      toast.success('Pago registrado exitosamente', {
        description: 'El cobro ha sido marcado como pagado',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar pago';
      toast.error('Error al registrar pago', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Cancelar cobro
  const cancelarCobro = useCallback(async (id, motivo) => {
    try {
      // Simular cancelación
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCobros(prev => prev.map(cobro => 
        cobro.id === id 
          ? { 
              ...cobro, 
              estado: 'Cancelado',
              observaciones: motivo,
              activo: false,
              eliminado_por: 1,
              fecha_eliminacion: new Date().toISOString(),
            }
          : cobro
      ));
      
      toast.success('Cobro cancelado exitosamente', {
        description: 'El cobro ha sido marcado como cancelado',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al cancelar cobro';
      toast.error('Error al cancelar cobro', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reactivar cobro
  const reactivarCobro = useCallback(async (id) => {
    try {
      // Simular reactivación
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCobros(prev => prev.map(cobro => 
        cobro.id === id 
          ? { 
              ...cobro, 
              estado: 'Pendiente',
              activo: true,
              eliminado_por: null,
              fecha_eliminacion: null,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : cobro
      ));
      
      toast.success('Cobro reactivado exitosamente', {
        description: 'El cobro ha sido reactivado',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al reactivar cobro';
      toast.error('Error al reactivar cobro', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Cargar datos al montar el componente
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

// Hook para filtros y búsqueda de cobros
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
    let filtered = [...cobros];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(cobro => 
        cobro.concepto.toLowerCase().includes(searchLower) ||
        cobro.descripcion.toLowerCase().includes(searchLower) ||
        cobro.numero_comprobante.toLowerCase().includes(searchLower) ||
        (cobro.alumno_nombre && cobro.alumno_nombre.toLowerCase().includes(searchLower)) ||
        (cobro.apoderado_nombre && cobro.apoderado_nombre.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter(cobro => cobro.estado === filters.estado);
    }

    // Filtro por tipo de cobro
    if (filters.tipo_cobro) {
      filtered = filtered.filter(cobro => cobro.tipo_cobro === filters.tipo_cobro);
    }

    // Filtro por categoría
    if (filters.categoria) {
      filtered = filtered.filter(cobro => cobro.categoria === filters.categoria);
    }

    // Filtro por método de pago
    if (filters.metodo_pago) {
      filtered = filtered.filter(cobro => cobro.metodo_pago === filters.metodo_pago);
    }

    // Filtro por rango de fechas
    if (filters.fecha_desde) {
      filtered = filtered.filter(cobro => cobro.fecha_emision >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      filtered = filtered.filter(cobro => cobro.fecha_emision <= filters.fecha_hasta);
    }

    // Filtro por rango de montos
    if (filters.monto_min) {
      filtered = filtered.filter(cobro => cobro.monto >= parseInt(filters.monto_min));
    }
    if (filters.monto_max) {
      filtered = filtered.filter(cobro => cobro.monto <= parseInt(filters.monto_max));
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [cobros, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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

  return {
    filters,
    filteredCobros,
    updateFilter,
    resetFilters,
  };
};

// Hook para estadísticas de cobros
export const useCobrosStats = (cobros) => {
  const stats = useMemo(() => {
    const total = cobros.length;
    const activos = cobros.filter(c => c.activo).length;
    
    // Estadísticas por estado
    const porEstado = cobros.reduce((acc, cobro) => {
      if (cobro.activo) {
        acc[cobro.estado] = (acc[cobro.estado] || 0) + 1;
      }
      return acc;
    }, {});

    // Montos totales
    const cobrosActivos = cobros.filter(c => c.activo);
    const montoTotal = cobrosActivos.reduce((sum, c) => sum + c.monto, 0);
    const montoPagado = cobrosActivos
      .filter(c => c.estado === 'Pagado')
      .reduce((sum, c) => sum + c.monto_pagado, 0);
    const montoPendiente = cobrosActivos
      .filter(c => ['Pendiente', 'Por Vencer', 'Vencido'].includes(c.estado))
      .reduce((sum, c) => sum + c.monto, 0);

    // Efectividad de cobranza
    const efectividadCobranza = montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0;

    // Cobros vencidos
    const cobrosVencidos = cobrosActivos.filter(c => c.estado === 'Vencido').length;
    const montoVencido = cobrosActivos
      .filter(c => c.estado === 'Vencido')
      .reduce((sum, c) => sum + c.monto, 0);

    // Distribución por tipo
    const porTipo = cobrosActivos.reduce((acc, cobro) => {
      acc[cobro.tipo_cobro] = (acc[cobro.tipo_cobro] || 0) + 1;
      return acc;
    }, {});

    // Distribución por categoría
    const porCategoria = cobrosActivos.reduce((acc, cobro) => {
      acc[cobro.categoria] = (acc[cobro.categoria] || 0) + 1;
      return acc;
    }, {});

    // Métodos de pago más usados
    const porMetodoPago = cobrosActivos
      .filter(c => c.metodo_pago)
      .reduce((acc, cobro) => {
        acc[cobro.metodo_pago] = (acc[cobro.metodo_pago] || 0) + 1;
        return acc;
      }, {});

    // Cobros del mes actual
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    const cobrosEsteMes = cobrosActivos.filter(cobro => {
      const fechaCobro = new Date(cobro.fecha_emision);
      return fechaCobro.getMonth() === mesActual && fechaCobro.getFullYear() === añoActual;
    }).length;

    const montoEsteMes = cobrosActivos
      .filter(cobro => {
        const fechaCobro = new Date(cobro.fecha_emision);
        return fechaCobro.getMonth() === mesActual && fechaCobro.getFullYear() === añoActual;
      })
      .reduce((sum, c) => sum + c.monto, 0);

    return {
      total,
      activos,
      porEstado,
      montoTotal,
      montoPagado,
      montoPendiente,
      montoVencido,
      efectividadCobranza,
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

// Hook para validación de formularios de cobros
export const useCobroValidation = () => {
  const validateConcepto = useCallback((concepto) => {
    if (!concepto?.trim()) return 'El concepto del cobro es requerido';
    if (concepto.length < 3) return 'El concepto debe tener al menos 3 caracteres';
    if (concepto.length > 100) return 'El concepto no puede exceder 100 caracteres';
    return null;
  }, []);

  const validateMonto = useCallback((monto) => {
    if (!monto) return 'El monto es requerido';
    const num = parseInt(monto);
    if (isNaN(num) || num <= 0) return 'El monto debe ser un número mayor a 0';
    return null;
  }, []);

  const validateFecha = useCallback((fecha) => {
    if (!fecha) return 'La fecha es requerida';
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'La fecha no es válida';
    return null;
  }, []);

  const validateCobroForm = useCallback((formData) => {
    const errors = {};
    
    const conceptoError = validateConcepto(formData.concepto);
    if (conceptoError) errors.concepto = conceptoError;
    
    const montoError = validateMonto(formData.monto);
    if (montoError) errors.monto = montoError;
    
    if (!formData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    
    const fechaEmisionError = validateFecha(formData.fecha_emision);
    if (fechaEmisionError) errors.fecha_emision = fechaEmisionError;
    
    const fechaVencimientoError = validateFecha(formData.fecha_vencimiento);
    if (fechaVencimientoError) errors.fecha_vencimiento = fechaVencimientoError;
    
    if (formData.fecha_emision && formData.fecha_vencimiento && 
        formData.fecha_emision > formData.fecha_vencimiento) {
      errors.fecha_vencimiento = 'La fecha de vencimiento debe ser posterior a la fecha de emisión';
    }
    
    if (!formData.tipo_cobro?.trim()) {
      errors.tipo_cobro = 'El tipo de cobro es requerido';
    }
    
    if (!formData.categoria?.trim()) {
      errors.categoria = 'La categoría es requerida';
    }
    
    if (formData.tipo_cobro === 'Alumno' && !formData.alumno_id) {
      errors.alumno_id = 'Debe seleccionar un alumno para cobros individuales';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [validateConcepto, validateMonto, validateFecha]);

  return {
    validateConcepto,
    validateMonto,
    validateFecha,
    validateCobroForm,
  };
};

export default {
  useCobros,
  useCobrosFilter,
  useCobrosStats,
  useCobroValidation,
};

