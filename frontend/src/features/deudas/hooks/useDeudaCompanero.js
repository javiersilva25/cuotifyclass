import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

// Estados disponibles para deudas entre compañeros
const ESTADOS_DEUDA_COMPANERO = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  CANCELADA: 'Cancelada',
  VENCIDA: 'Vencida',
};

// Tipos de deuda entre compañeros
const TIPOS_DEUDA_COMPANERO = [
  'Préstamo de Dinero',
  'Material Escolar',
  'Almuerzo/Colación',
  'Transporte',
  'Actividad Grupal',
  'Proyecto Escolar',
  'Uniforme/Ropa',
  'Libros/Apuntes',
  'Tecnología',
  'Otros',
];

// Datos mock para deudas entre compañeros
const DEUDAS_COMPANERO_MOCK = [
  {
    id: 1,
    deudor_id: 1,
    deudor_nombre: 'Juan Carlos Pérez',
    deudor_curso: '8° Básico A',
    acreedor_id: 2,
    acreedor_nombre: 'Ana María González',
    acreedor_curso: '7° Básico B',
    concepto: 'Préstamo para almuerzo',
    descripcion: 'Préstamo de dinero para comprar almuerzo en el casino',
    monto: 3500,
    fecha_prestamo: '2024-07-28',
    fecha_vencimiento: '2024-08-05',
    fecha_pago: null,
    estado: ESTADOS_DEUDA_COMPANERO.VENCIDA,
    tipo_deuda: 'Almuerzo/Colación',
    dias_vencido: 2,
    metodo_pago: null,
    observaciones: 'Acordado devolver al día siguiente',
    creado_por: 'ana_gonzalez',
    fecha_creacion: '2024-07-28',
    fecha_actualizacion: '2024-08-04',
  },
  {
    id: 2,
    deudor_id: 3,
    deudor_nombre: 'Carlos Eduardo Morales',
    deudor_curso: '1° Medio A',
    acreedor_id: 5,
    acreedor_nombre: 'Diego Andrés López',
    acreedor_curso: '2° Medio B',
    concepto: 'Calculadora científica',
    descripcion: 'Préstamo de calculadora científica para examen de matemáticas',
    monto: 25000,
    fecha_prestamo: '2024-07-15',
    fecha_vencimiento: '2024-07-22',
    fecha_pago: '2024-07-20',
    estado: ESTADOS_DEUDA_COMPANERO.PAGADA,
    tipo_deuda: 'Material Escolar',
    dias_vencido: 0,
    metodo_pago: 'Efectivo',
    observaciones: 'Devuelto en perfecto estado',
    creado_por: 'diego_lopez',
    fecha_creacion: '2024-07-15',
    fecha_actualizacion: '2024-07-20',
  },
  {
    id: 3,
    deudor_id: 4,
    deudor_nombre: 'Sofía Alejandra Ruiz',
    deudor_curso: '6° Básico A',
    acreedor_id: 1,
    acreedor_nombre: 'Juan Carlos Pérez',
    acreedor_curso: '8° Básico A',
    concepto: 'Materiales para proyecto',
    descripcion: 'Cartulinas, pegamento y marcadores para proyecto de ciencias',
    monto: 8500,
    fecha_prestamo: '2024-08-01',
    fecha_vencimiento: '2024-08-10',
    fecha_pago: null,
    estado: ESTADOS_DEUDA_COMPANERO.PENDIENTE,
    tipo_deuda: 'Proyecto Escolar',
    dias_vencido: 0,
    metodo_pago: null,
    observaciones: 'Para proyecto de ciencias naturales',
    creado_por: 'juan_perez',
    fecha_creacion: '2024-08-01',
    fecha_actualizacion: '2024-08-01',
  },
  {
    id: 4,
    deudor_id: 2,
    deudor_nombre: 'Ana María González',
    deudor_curso: '7° Básico B',
    acreedor_id: 4,
    acreedor_nombre: 'Sofía Alejandra Ruiz',
    acreedor_curso: '6° Básico A',
    concepto: 'Pasaje de micro',
    descripcion: 'Dinero prestado para pasaje de regreso a casa',
    monto: 1200,
    fecha_prestamo: '2024-07-30',
    fecha_vencimiento: '2024-08-02',
    fecha_pago: '2024-08-01',
    estado: ESTADOS_DEUDA_COMPANERO.PAGADA,
    tipo_deuda: 'Transporte',
    dias_vencido: 0,
    metodo_pago: 'Efectivo',
    observaciones: 'Pagado al día siguiente',
    creado_por: 'sofia_ruiz',
    fecha_creacion: '2024-07-30',
    fecha_actualizacion: '2024-08-01',
  },
  {
    id: 5,
    deudor_id: 5,
    deudor_nombre: 'Diego Andrés López',
    deudor_curso: '2° Medio B',
    acreedor_id: 3,
    acreedor_nombre: 'Carlos Eduardo Morales',
    acreedor_curso: '1° Medio A',
    concepto: 'Libro de historia',
    descripcion: 'Préstamo de libro de historia universal para estudiar',
    monto: 15000,
    fecha_prestamo: '2024-07-25',
    fecha_vencimiento: '2024-08-15',
    fecha_pago: null,
    estado: ESTADOS_DEUDA_COMPANERO.PENDIENTE,
    tipo_deuda: 'Libros/Apuntes',
    dias_vencido: 0,
    metodo_pago: null,
    observaciones: 'Libro en buen estado, cuidar',
    creado_por: 'carlos_morales',
    fecha_creacion: '2024-07-25',
    fecha_actualizacion: '2024-07-25',
  },
  {
    id: 6,
    deudor_id: 1,
    deudor_nombre: 'Juan Carlos Pérez',
    deudor_curso: '8° Básico A',
    acreedor_id: 3,
    acreedor_nombre: 'Carlos Eduardo Morales',
    acreedor_curso: '1° Medio A',
    concepto: 'Entrada al cine',
    descripcion: 'Dinero prestado para entrada al cine con el curso',
    monto: 4500,
    fecha_prestamo: '2024-06-15',
    fecha_vencimiento: '2024-06-20',
    fecha_pago: null,
    estado: ESTADOS_DEUDA_COMPANERO.CANCELADA,
    tipo_deuda: 'Actividad Grupal',
    dias_vencido: 0,
    metodo_pago: null,
    observaciones: 'Cancelada por acuerdo mutuo - actividad suspendida',
    creado_por: 'carlos_morales',
    fecha_creacion: '2024-06-15',
    fecha_actualizacion: '2024-06-22',
  },
];

// Hook principal para gestión de deudas entre compañeros
export function useDeudaCompanero() {
  const [deudas, setDeudas] = useState(DEUDAS_COMPANERO_MOCK);
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
      const deudasActualizadas = DEUDAS_COMPANERO_MOCK.map(deuda => {
        if (deuda.estado === ESTADOS_DEUDA_COMPANERO.PENDIENTE) {
          const fechaVencimiento = new Date(deuda.fecha_vencimiento);
          const hoy = new Date();
          const diasDiferencia = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24));
          
          return {
            ...deuda,
            dias_vencido: Math.max(0, diasDiferencia),
            estado: diasDiferencia > 0 ? ESTADOS_DEUDA_COMPANERO.VENCIDA : ESTADOS_DEUDA_COMPANERO.PENDIENTE,
          };
        }
        return deuda;
      });
      
      setDeudas(deudasActualizadas);
      toast.success('Deudas entre compañeros cargadas correctamente');
    } catch (err) {
      setError('Error al cargar las deudas entre compañeros');
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
        fecha_prestamo: new Date().toISOString().split('T')[0],
        fecha_pago: null,
        estado: ESTADOS_DEUDA_COMPANERO.PENDIENTE,
        dias_vencido: 0,
        metodo_pago: null,
        creado_por: 'usuario_actual',
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_actualizacion: new Date().toISOString().split('T')[0],
      };
      
      setDeudas(prev => [nuevaDeuda, ...prev]);
      toast.success('Deuda entre compañeros creada correctamente');
      
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

  const marcarComoPagada = useCallback(async (id, metodoPago = 'Efectivo') => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeudas(prev => prev.map(deuda => {
        if (deuda.id === id) {
          return {
            ...deuda,
            estado: ESTADOS_DEUDA_COMPANERO.PAGADA,
            fecha_pago: new Date().toISOString().split('T')[0],
            metodo_pago: metodoPago,
            fecha_actualizacion: new Date().toISOString().split('T')[0],
            observaciones: `${deuda.observaciones || ''} | Pagado el ${new Date().toLocaleDateString('es-CL')} (${metodoPago})`.trim(),
          };
        }
        return deuda;
      }));
      
      toast.success('Deuda marcada como pagada correctamente');
    } catch (err) {
      toast.error('Error al marcar la deuda como pagada');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelarDeuda = useCallback(async (id, motivo) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeudas(prev => prev.map(deuda => 
        deuda.id === id 
          ? { 
              ...deuda, 
              estado: ESTADOS_DEUDA_COMPANERO.CANCELADA,
              fecha_actualizacion: new Date().toISOString().split('T')[0],
              observaciones: `${deuda.observaciones || ''} | Deuda cancelada: ${motivo}`.trim(),
            }
          : deuda
      ));
      
      toast.success('Deuda cancelada correctamente');
    } catch (err) {
      toast.error('Error al cancelar la deuda');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reactivarDeuda = useCallback(async (id) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDeudas(prev => prev.map(deuda => {
        if (deuda.id === id) {
          const fechaVencimiento = new Date(deuda.fecha_vencimiento);
          const hoy = new Date();
          const diasDiferencia = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24));
          const nuevoEstado = diasDiferencia > 0 ? ESTADOS_DEUDA_COMPANERO.VENCIDA : ESTADOS_DEUDA_COMPANERO.PENDIENTE;
          
          return {
            ...deuda,
            estado: nuevoEstado,
            dias_vencido: Math.max(0, diasDiferencia),
            fecha_actualizacion: new Date().toISOString().split('T')[0],
            observaciones: `${deuda.observaciones || ''} | Deuda reactivada el ${new Date().toLocaleDateString('es-CL')}`.trim(),
          };
        }
        return deuda;
      }));
      
      toast.success('Deuda reactivada correctamente');
    } catch (err) {
      toast.error('Error al reactivar la deuda');
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
    marcarComoPagada,
    cancelarDeuda,
    reactivarDeuda,
    deleteDeuda,
    ESTADOS_DEUDA_COMPANERO,
    TIPOS_DEUDA_COMPANERO,
  };
}

// Hook para filtros de deudas entre compañeros
export function useDeudaCompaneroFilter(deudas) {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo_deuda: '',
    deudor_id: '',
    acreedor_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    solo_vencidas: false,
    orderBy: 'fecha_prestamo',
    orderDirection: 'desc',
  });

  const filteredDeudas = useMemo(() => {
    let result = [...deudas];

    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(deuda =>
        deuda.concepto.toLowerCase().includes(searchLower) ||
        deuda.deudor_nombre.toLowerCase().includes(searchLower) ||
        deuda.acreedor_nombre.toLowerCase().includes(searchLower) ||
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

    // Filtro por deudor
    if (filters.deudor_id) {
      result = result.filter(deuda => deuda.deudor_id.toString() === filters.deudor_id);
    }

    // Filtro por acreedor
    if (filters.acreedor_id) {
      result = result.filter(deuda => deuda.acreedor_id.toString() === filters.acreedor_id);
    }

    // Filtro por rango de fechas
    if (filters.fecha_desde) {
      result = result.filter(deuda => deuda.fecha_prestamo >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      result = result.filter(deuda => deuda.fecha_prestamo <= filters.fecha_hasta);
    }

    // Filtro por rango de montos
    if (filters.monto_min) {
      result = result.filter(deuda => deuda.monto >= parseInt(filters.monto_min));
    }
    if (filters.monto_max) {
      result = result.filter(deuda => deuda.monto <= parseInt(filters.monto_max));
    }

    // Filtro solo vencidas
    if (filters.solo_vencidas) {
      result = result.filter(deuda => deuda.estado === ESTADOS_DEUDA_COMPANERO.VENCIDA);
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
      deudor_id: '',
      acreedor_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      monto_min: '',
      monto_max: '',
      solo_vencidas: false,
      orderBy: 'fecha_prestamo',
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

// Hook para estadísticas de deudas entre compañeros
export function useDeudaCompaneroStats(deudas) {
  return useMemo(() => {
    const total = deudas.length;
    const activas = deudas.filter(d => d.estado !== ESTADOS_DEUDA_COMPANERO.PAGADA && d.estado !== ESTADOS_DEUDA_COMPANERO.CANCELADA).length;
    
    // Montos
    const montoTotal = deudas.reduce((sum, d) => sum + d.monto, 0);
    const montoPendiente = deudas
      .filter(d => d.estado === ESTADOS_DEUDA_COMPANERO.PENDIENTE || d.estado === ESTADOS_DEUDA_COMPANERO.VENCIDA)
      .reduce((sum, d) => sum + d.monto, 0);
    const montoPagado = deudas
      .filter(d => d.estado === ESTADOS_DEUDA_COMPANERO.PAGADA)
      .reduce((sum, d) => sum + d.monto, 0);
    const montoCancelado = deudas
      .filter(d => d.estado === ESTADOS_DEUDA_COMPANERO.CANCELADA)
      .reduce((sum, d) => sum + d.monto, 0);

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
    const deudasVencidas = deudas.filter(d => d.estado === ESTADOS_DEUDA_COMPANERO.VENCIDA).length;
    const montoVencido = deudas
      .filter(d => d.estado === ESTADOS_DEUDA_COMPANERO.VENCIDA)
      .reduce((sum, d) => sum + d.monto, 0);

    // Efectividad de pago
    const efectividadPago = montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0;

    // Alumnos involucrados
    const deudores = new Set(deudas.map(d => d.deudor_id));
    const acreedores = new Set(deudas.map(d => d.acreedor_id));
    const alumnosInvolucrados = new Set([...deudores, ...acreedores]);

    // Relaciones más frecuentes
    const relacionesDeudor = deudas.reduce((acc, deuda) => {
      const key = `${deuda.deudor_nombre}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const relacionesAcreedor = deudas.reduce((acc, deuda) => {
      const key = `${deuda.acreedor_nombre}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // Promedio de días vencidos
    const deudasConVencimiento = deudas.filter(d => d.dias_vencido > 0);
    const promedioDiasVencidos = deudasConVencimiento.length > 0
      ? deudasConVencimiento.reduce((sum, d) => sum + d.dias_vencido, 0) / deudasConVencimiento.length
      : 0;

    // Deudas del mes actual
    const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
    const deudasEsteMes = deudas.filter(d => d.fecha_prestamo.startsWith(mesActual)).length;
    const montoEsteMes = deudas
      .filter(d => d.fecha_prestamo.startsWith(mesActual))
      .reduce((sum, d) => sum + d.monto, 0);

    // Monto promedio por deuda
    const montoPromedio = total > 0 ? montoTotal / total : 0;

    return {
      total,
      activas,
      montoTotal,
      montoPendiente,
      montoPagado,
      montoCancelado,
      porEstado,
      porTipo,
      deudasVencidas,
      montoVencido,
      efectividadPago,
      alumnosInvolucrados: alumnosInvolucrados.size,
      deudores: deudores.size,
      acreedores: acreedores.size,
      relacionesDeudor,
      relacionesAcreedor,
      promedioDiasVencidos,
      deudasEsteMes,
      montoEsteMes,
      montoPromedio,
    };
  }, [deudas]);
}

// Hook para validación de formularios de deudas entre compañeros
export function useDeudaCompaneroValidation() {
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
    if (!formData.monto) {
      errors.monto = 'El monto es obligatorio';
    } else if (formData.monto <= 0) {
      errors.monto = 'El monto debe ser mayor a 0';
    } else if (formData.monto > 1000000) {
      errors.monto = 'El monto no puede exceder $1.000.000';
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

    // Validar deudor
    if (!formData.deudor_id) {
      errors.deudor_id = 'Debe seleccionar un deudor';
    }

    // Validar acreedor
    if (!formData.acreedor_id) {
      errors.acreedor_id = 'Debe seleccionar un acreedor';
    }

    // Validar que deudor y acreedor sean diferentes
    if (formData.deudor_id && formData.acreedor_id && formData.deudor_id === formData.acreedor_id) {
      errors.acreedor_id = 'El deudor y el acreedor deben ser personas diferentes';
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

  return {
    validateDeudaForm,
  };
}

export default useDeudaCompanero;

