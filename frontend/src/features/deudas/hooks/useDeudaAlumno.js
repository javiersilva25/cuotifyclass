import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

// Estados disponibles para deudas de alumnos
const ESTADOS_DEUDA = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  CONDONADA: 'Condonada',
  REFINANCIADA: 'Refinanciada',
};

// Tipos de deuda disponibles
const TIPOS_DEUDA = [
  'Mensualidad',
  'Matrícula',
  'Material Escolar',
  'Actividades Extracurriculares',
  'Transporte',
  'Alimentación',
  'Seguro Escolar',
  'Uniforme',
  'Libros',
  'Otros',
];

// Datos mock para deudas de alumnos
const DEUDAS_MOCK = [
  {
    id: 1,
    alumno_id: 1,
    alumno_nombre: 'Juan Carlos Pérez',
    alumno_curso: '8° Básico A',
    apoderado: 'María Pérez González',
    concepto: 'Mensualidad Marzo 2024',
    descripcion: 'Mensualidad correspondiente al mes de marzo 2024',
    monto_original: 85000,
    monto_pendiente: 85000,
    monto_pagado: 0,
    fecha_vencimiento: '2024-03-15',
    fecha_creacion: '2024-02-28',
    fecha_ultimo_pago: null,
    estado: ESTADOS_DEUDA.VENCIDA,
    tipo_deuda: 'Mensualidad',
    dias_vencido: 142,
    tiene_plan_pago: false,
    observaciones: 'Alumno con historial de pagos atrasados',
    creado_por: 'admin',
    fecha_actualizacion: '2024-08-04',
  },
  {
    id: 2,
    alumno_id: 2,
    alumno_nombre: 'Ana María González',
    alumno_curso: '7° Básico B',
    apoderado: 'Roberto González Silva',
    concepto: 'Material Escolar 2024',
    descripcion: 'Lista de útiles escolares para el año académico 2024',
    monto_original: 45000,
    monto_pendiente: 22500,
    monto_pagado: 22500,
    fecha_vencimiento: '2024-08-30',
    fecha_creacion: '2024-07-15',
    fecha_ultimo_pago: '2024-07-20',
    estado: ESTADOS_DEUDA.PENDIENTE,
    tipo_deuda: 'Material Escolar',
    dias_vencido: 0,
    tiene_plan_pago: true,
    observaciones: 'Plan de pago en 2 cuotas, primera cuota pagada',
    creado_por: 'secretaria',
    fecha_actualizacion: '2024-07-20',
  },
  {
    id: 3,
    alumno_id: 3,
    alumno_nombre: 'Carlos Eduardo Morales',
    alumno_curso: '1° Medio A',
    apoderado: 'Elena Morales Torres',
    concepto: 'Actividades Extracurriculares',
    descripcion: 'Taller de robótica y club de ciencias',
    monto_original: 35000,
    monto_pendiente: 0,
    monto_pagado: 35000,
    fecha_vencimiento: '2024-07-15',
    fecha_creacion: '2024-06-01',
    fecha_ultimo_pago: '2024-07-10',
    estado: ESTADOS_DEUDA.PAGADA,
    tipo_deuda: 'Actividades Extracurriculares',
    dias_vencido: 0,
    tiene_plan_pago: false,
    observaciones: 'Pago realizado antes del vencimiento',
    creado_por: 'coordinador',
    fecha_actualizacion: '2024-07-10',
  },
  {
    id: 4,
    alumno_id: 4,
    alumno_nombre: 'Sofía Alejandra Ruiz',
    alumno_curso: '6° Básico A',
    apoderado: 'Carmen Ruiz Herrera',
    concepto: 'Mensualidad Julio 2024',
    descripcion: 'Mensualidad correspondiente al mes de julio 2024',
    monto_original: 85000,
    monto_pendiente: 85000,
    monto_pagado: 0,
    fecha_vencimiento: '2024-07-15',
    fecha_creacion: '2024-06-30',
    fecha_ultimo_pago: null,
    estado: ESTADOS_DEUDA.VENCIDA,
    tipo_deuda: 'Mensualidad',
    dias_vencido: 20,
    tiene_plan_pago: false,
    observaciones: 'Contactar apoderado para gestionar pago',
    creado_por: 'admin',
    fecha_actualizacion: '2024-08-04',
  },
  {
    id: 5,
    alumno_id: 5,
    alumno_nombre: 'Diego Andrés López',
    alumno_curso: '2° Medio B',
    apoderado: 'Patricia López Mendoza',
    concepto: 'Seguro Escolar 2024',
    descripcion: 'Seguro escolar anual contra accidentes',
    monto_original: 25000,
    monto_pendiente: 0,
    monto_pagado: 0,
    fecha_vencimiento: '2024-05-30',
    fecha_creacion: '2024-04-15',
    fecha_ultimo_pago: null,
    estado: ESTADOS_DEUDA.CONDONADA,
    tipo_deuda: 'Seguro Escolar',
    dias_vencido: 0,
    tiene_plan_pago: false,
    observaciones: 'Deuda condonada por situación socioeconómica familiar',
    creado_por: 'director',
    fecha_actualizacion: '2024-06-15',
  },
  {
    id: 6,
    alumno_id: 1,
    alumno_nombre: 'Juan Carlos Pérez',
    alumno_curso: '8° Básico A',
    apoderado: 'María Pérez González',
    concepto: 'Mensualidad Abril 2024',
    descripcion: 'Mensualidad correspondiente al mes de abril 2024',
    monto_original: 85000,
    monto_pendiente: 42500,
    monto_pagado: 42500,
    fecha_vencimiento: '2024-04-15',
    fecha_creacion: '2024-03-31',
    fecha_ultimo_pago: '2024-05-20',
    estado: ESTADOS_DEUDA.REFINANCIADA,
    tipo_deuda: 'Mensualidad',
    dias_vencido: 0,
    tiene_plan_pago: true,
    observaciones: 'Refinanciada en plan de pago de 2 cuotas',
    creado_por: 'admin',
    fecha_actualizacion: '2024-05-20',
  },
  {
    id: 7,
    alumno_id: 2,
    alumno_nombre: 'Ana María González',
    alumno_curso: '7° Básico B',
    apoderado: 'Roberto González Silva',
    concepto: 'Mensualidad Agosto 2024',
    descripcion: 'Mensualidad correspondiente al mes de agosto 2024',
    monto_original: 85000,
    monto_pendiente: 85000,
    monto_pagado: 0,
    fecha_vencimiento: '2024-08-15',
    fecha_creacion: '2024-07-31',
    fecha_ultimo_pago: null,
    estado: ESTADOS_DEUDA.PENDIENTE,
    tipo_deuda: 'Mensualidad',
    dias_vencido: 0,
    tiene_plan_pago: false,
    observaciones: 'Deuda reciente, dentro del plazo de pago',
    creado_por: 'admin',
    fecha_actualizacion: '2024-07-31',
  },
];

// Hook principal para gestión de deudas de alumnos
export function useDeudaAlumno() {
  const [deudas, setDeudas] = useState(DEUDAS_MOCK);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simular carga inicial
  useEffect(() => {
    loadDeudas();
  }, []);

  const loadDeudas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar días vencidos en tiempo real
      const deudasActualizadas = DEUDAS_MOCK.map(deuda => {
        if (deuda.estado === ESTADOS_DEUDA.PENDIENTE || deuda.estado === ESTADOS_DEUDA.VENCIDA) {
          const fechaVencimiento = new Date(deuda.fecha_vencimiento);
          const hoy = new Date();
          const diasDiferencia = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24));
          
          return {
            ...deuda,
            dias_vencido: Math.max(0, diasDiferencia),
            estado: diasDiferencia > 0 ? ESTADOS_DEUDA.VENCIDA : ESTADOS_DEUDA.PENDIENTE,
          };
        }
        return deuda;
      });
      
      setDeudas(deudasActualizadas);
      toast.success('Deudas de alumnos cargadas correctamente');
    } catch (err) {
      setError('Error al cargar las deudas de alumnos');
      toast.error('Error al cargar las deudas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDeuda = useCallback(async (deudaData) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nuevaDeuda = {
        id: Math.max(...deudas.map(d => d.id)) + 1,
        ...deudaData,
        monto_pendiente: deudaData.monto_original,
        monto_pagado: 0,
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_ultimo_pago: null,
        estado: ESTADOS_DEUDA.PENDIENTE,
        dias_vencido: 0,
        tiene_plan_pago: false,
        creado_por: 'usuario_actual',
        fecha_actualizacion: new Date().toISOString().split('T')[0],
      };
      
      setDeudas(prev => [nuevaDeuda, ...prev]);
      toast.success('Deuda creada correctamente');
      
      return nuevaDeuda;
    } catch (err) {
      toast.error('Error al crear la deuda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [deudas]);

  const updateDeuda = useCallback(async (id, deudaData) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeudas(prev => prev.map(deuda => 
        deuda.id === id 
          ? { 
              ...deuda, 
              ...deudaData,
              fecha_actualizacion: new Date().toISOString().split('T')[0],
            }
          : deuda
      ));
      
      toast.success('Deuda actualizada correctamente');
    } catch (err) {
      toast.error('Error al actualizar la deuda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registrarPago = useCallback(async (id, montoPago, metodoPago = 'Efectivo') => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeudas(prev => prev.map(deuda => {
        if (deuda.id === id) {
          const nuevoMontoPagado = deuda.monto_pagado + montoPago;
          const nuevoMontoPendiente = Math.max(0, deuda.monto_original - nuevoMontoPagado);
          const nuevoEstado = nuevoMontoPendiente === 0 ? ESTADOS_DEUDA.PAGADA : deuda.estado;
          
          return {
            ...deuda,
            monto_pagado: nuevoMontoPagado,
            monto_pendiente: nuevoMontoPendiente,
            estado: nuevoEstado,
            fecha_ultimo_pago: new Date().toISOString().split('T')[0],
            fecha_actualizacion: new Date().toISOString().split('T')[0],
            observaciones: `${deuda.observaciones || ''} | Pago registrado: $${montoPago.toLocaleString()} (${metodoPago})`.trim(),
          };
        }
        return deuda;
      }));
      
      toast.success(`Pago de $${montoPago.toLocaleString()} registrado correctamente`);
    } catch (err) {
      toast.error('Error al registrar el pago');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const condonarDeuda = useCallback(async (id, motivo) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeudas(prev => prev.map(deuda => 
        deuda.id === id 
          ? { 
              ...deuda, 
              estado: ESTADOS_DEUDA.CONDONADA,
              monto_pendiente: 0,
              fecha_actualizacion: new Date().toISOString().split('T')[0],
              observaciones: `${deuda.observaciones || ''} | Deuda condonada: ${motivo}`.trim(),
            }
          : deuda
      ));
      
      toast.success('Deuda condonada correctamente');
    } catch (err) {
      toast.error('Error al condonar la deuda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refinanciarDeuda = useCallback(async (id, nuevoPlan) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeudas(prev => prev.map(deuda => 
        deuda.id === id 
          ? { 
              ...deuda, 
              estado: ESTADOS_DEUDA.REFINANCIADA,
              tiene_plan_pago: true,
              fecha_vencimiento: nuevoPlan.nueva_fecha_vencimiento,
              fecha_actualizacion: new Date().toISOString().split('T')[0],
              observaciones: `${deuda.observaciones || ''} | Refinanciada: ${nuevoPlan.descripcion}`.trim(),
            }
          : deuda
      ));
      
      toast.success('Deuda refinanciada correctamente');
    } catch (err) {
      toast.error('Error al refinanciar la deuda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDeuda = useCallback(async (id) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDeudas(prev => prev.filter(deuda => deuda.id !== id));
      toast.success('Deuda eliminada correctamente');
    } catch (err) {
      toast.error('Error al eliminar la deuda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deudas,
    isLoading,
    error,
    loadDeudas,
    createDeuda,
    updateDeuda,
    registrarPago,
    condonarDeuda,
    refinanciarDeuda,
    deleteDeuda,
    ESTADOS_DEUDA,
    TIPOS_DEUDA,
  };
}

// Hook para filtros de deudas de alumnos
export function useDeudaAlumnoFilter(deudas) {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo_deuda: '',
    alumno_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    solo_vencidas: false,
    con_plan_pago: '',
    orderBy: 'fecha_vencimiento',
    orderDirection: 'desc',
  });

  const filteredDeudas = useMemo(() => {
    let result = [...deudas];

    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(deuda =>
        deuda.concepto.toLowerCase().includes(searchLower) ||
        deuda.alumno_nombre.toLowerCase().includes(searchLower) ||
        deuda.apoderado.toLowerCase().includes(searchLower) ||
        deuda.descripcion.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado) {
      result = result.filter(deuda => deuda.estado === filters.estado);
    }

    // Filtro por tipo de deuda
    if (filters.tipo_deuda) {
      result = result.filter(deuda => deuda.tipo_deuda === filters.tipo_deuda);
    }

    // Filtro por alumno
    if (filters.alumno_id) {
      result = result.filter(deuda => deuda.alumno_id.toString() === filters.alumno_id);
    }

    // Filtro por rango de fechas
    if (filters.fecha_desde) {
      result = result.filter(deuda => deuda.fecha_vencimiento >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      result = result.filter(deuda => deuda.fecha_vencimiento <= filters.fecha_hasta);
    }

    // Filtro por rango de montos
    if (filters.monto_min) {
      result = result.filter(deuda => deuda.monto_pendiente >= parseInt(filters.monto_min));
    }
    if (filters.monto_max) {
      result = result.filter(deuda => deuda.monto_pendiente <= parseInt(filters.monto_max));
    }

    // Filtro solo vencidas
    if (filters.solo_vencidas) {
      result = result.filter(deuda => deuda.estado === ESTADOS_DEUDA.VENCIDA);
    }

    // Filtro por plan de pago
    if (filters.con_plan_pago !== '') {
      const conPlan = filters.con_plan_pago === 'true';
      result = result.filter(deuda => deuda.tiene_plan_pago === conPlan);
    }

    // Ordenamiento
    result.sort((a, b) => {
      let aValue = a[filters.orderBy];
      let bValue = b[filters.orderBy];

      // Manejar fechas
      if (filters.orderBy.includes('fecha')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Manejar números
      if (filters.orderBy.includes('monto') || filters.orderBy.includes('dias')) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (filters.orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return result;
  }, [deudas, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      estado: '',
      tipo_deuda: '',
      alumno_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      monto_min: '',
      monto_max: '',
      solo_vencidas: false,
      con_plan_pago: '',
      orderBy: 'fecha_vencimiento',
      orderDirection: 'desc',
    });
  }, []);

  return {
    filters,
    filteredDeudas,
    updateFilter,
    resetFilters,
  };
}

// Hook para estadísticas de deudas de alumnos
export function useDeudaAlumnoStats(deudas) {
  return useMemo(() => {
    const total = deudas.length;
    const activas = deudas.filter(d => d.estado !== ESTADOS_DEUDA.PAGADA && d.estado !== ESTADOS_DEUDA.CONDONADA).length;
    
    // Montos
    const montoTotal = deudas.reduce((sum, d) => sum + d.monto_original, 0);
    const montoPendiente = deudas.reduce((sum, d) => sum + d.monto_pendiente, 0);
    const montoPagado = deudas.reduce((sum, d) => sum + d.monto_pagado, 0);
    const montoCondonado = deudas
      .filter(d => d.estado === ESTADOS_DEUDA.CONDONADA)
      .reduce((sum, d) => sum + d.monto_original, 0);

    // Estados
    const porEstado = deudas.reduce((acc, deuda) => {
      acc[deuda.estado] = (acc[deuda.estado] || 0) + 1;
      return acc;
    }, {});

    // Tipos de deuda
    const porTipo = deudas.reduce((acc, deuda) => {
      acc[deuda.tipo_deuda] = (acc[deuda.tipo_deuda] || 0) + 1;
      return acc;
    }, {});

    // Deudas vencidas
    const deudasVencidas = deudas.filter(d => d.estado === ESTADOS_DEUDA.VENCIDA).length;
    const montoVencido = deudas
      .filter(d => d.estado === ESTADOS_DEUDA.VENCIDA)
      .reduce((sum, d) => sum + d.monto_pendiente, 0);

    // Efectividad de cobranza
    const efectividadCobranza = montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0;

    // Alumnos con deudas
    const alumnosConDeudas = new Set(
      deudas
        .filter(d => d.monto_pendiente > 0)
        .map(d => d.alumno_id)
    ).size;

    // Deudas con plan de pago
    const conPlanPago = deudas.filter(d => d.tiene_plan_pago).length;

    // Promedio de días vencidos
    const deudasConVencimiento = deudas.filter(d => d.dias_vencido > 0);
    const promedioDiasVencidos = deudasConVencimiento.length > 0
      ? deudasConVencimiento.reduce((sum, d) => sum + d.dias_vencido, 0) / deudasConVencimiento.length
      : 0;

    // Deudas del mes actual
    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const deudasEsteMes = deudas.filter(d => d.fecha_creacion.startsWith(mesActual)).length;
    const montoEsteMes = deudas
      .filter(d => d.fecha_creacion.startsWith(mesActual))
      .reduce((sum, d) => sum + d.monto_original, 0);

    return {
      total,
      activas,
      montoTotal,
      montoPendiente,
      montoPagado,
      montoCondonado,
      porEstado,
      porTipo,
      deudasVencidas,
      montoVencido,
      efectividadCobranza,
      alumnosConDeudas,
      conPlanPago,
      promedioDiasVencidos,
      deudasEsteMes,
      montoEsteMes,
    };
  }, [deudas]);
}

// Hook para validación de formularios de deudas
export function useDeudaAlumnoValidation() {
  const validateDeudaForm = useCallback((formData) => {
    const errors = {};

    // Validar concepto
    if (!formData.concepto?.trim()) {
      errors.concepto = 'El concepto es obligatorio';
    } else if (formData.concepto.length < 5) {
      errors.concepto = 'El concepto debe tener al menos 5 caracteres';
    }

    // Validar descripción
    if (!formData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    // Validar monto
    if (!formData.monto_original) {
      errors.monto_original = 'El monto es obligatorio';
    } else if (formData.monto_original <= 0) {
      errors.monto_original = 'El monto debe ser mayor a 0';
    } else if (formData.monto_original > 10000000) {
      errors.monto_original = 'El monto no puede exceder $10.000.000';
    }

    // Validar fecha de vencimiento
    if (!formData.fecha_vencimiento) {
      errors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
    } else {
      const fechaVencimiento = new Date(formData.fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVencimiento < hoy) {
        errors.fecha_vencimiento = 'La fecha de vencimiento no puede ser anterior a hoy';
      }
    }

    // Validar alumno
    if (!formData.alumno_id) {
      errors.alumno_id = 'Debe seleccionar un alumno';
    }

    // Validar tipo de deuda
    if (!formData.tipo_deuda) {
      errors.tipo_deuda = 'Debe seleccionar un tipo de deuda';
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
    };
  }, []);

  const validatePagoForm = useCallback((formData, deuda) => {
    const errors = {};

    // Validar monto del pago
    if (!formData.monto_pago) {
      errors.monto_pago = 'El monto del pago es obligatorio';
    } else if (formData.monto_pago <= 0) {
      errors.monto_pago = 'El monto debe ser mayor a 0';
    } else if (formData.monto_pago > deuda.monto_pendiente) {
      errors.monto_pago = `El monto no puede exceder la deuda pendiente ($${deuda.monto_pendiente.toLocaleString()})`;
    }

    // Validar método de pago
    if (!formData.metodo_pago) {
      errors.metodo_pago = 'Debe seleccionar un método de pago';
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
    };
  }, []);

  return {
    validateDeudaForm,
    validatePagoForm,
  };
}

export default useDeudaAlumno;

