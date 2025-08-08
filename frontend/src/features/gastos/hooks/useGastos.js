import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

// Estados de gasto
export const ESTADOS_GASTO = {
  REGISTRADO: 'Registrado',
  APROBADO: 'Aprobado',
  PAGADO: 'Pagado',
  RECHAZADO: 'Rechazado',
};

// Tipos de documento
export const TIPOS_DOCUMENTO = [
  'Boleta',
  'Factura',
  'Recibo',
  'Comprobante',
  'Orden de Compra',
  'Nota de Crédito',
  'Nota de Débito',
  'Otro',
];

// Métodos de pago
export const METODOS_PAGO = [
  'Efectivo',
  'Transferencia Bancaria',
  'Cheque',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
  'Depósito',
  'Otro',
];

// Datos mock de gastos
const GASTOS_MOCK = [
  {
    id: 1,
    concepto: 'Material de Oficina',
    descripcion: 'Compra de papel, lápices, carpetas y útiles administrativos para el mes',
    monto: 85000,
    fecha_gasto: '2024-01-15',
    fecha_vencimiento: '2024-02-15',
    fecha_pago: '2024-01-20',
    categoria_id: 1,
    categoria_nombre: 'Material Escolar',
    proveedor: 'Librería Escolar S.A.',
    rut_proveedor: '76.123.456-7',
    contacto_proveedor: 'contacto@libreriaescolar.cl',
    telefono_proveedor: '+56 2 2345 6789',
    tipo_documento: 'Factura',
    numero_documento: 'F-001234',
    estado: 'Pagado',
    metodo_pago: 'Transferencia Bancaria',
    observaciones: 'Material para el primer semestre académico',
    archivo_adjunto: '/uploads/facturas/F-001234.pdf',
    aprobado_por: 'María González',
    fecha_aprobacion: '2024-01-16',
    creado_por: 'Juan Pérez',
    fecha_creacion: '2024-01-15T10:30:00Z',
    fecha_actualizacion: '2024-01-20T14:45:00Z',
  },
  {
    id: 2,
    concepto: 'Mantención Equipos',
    descripcion: 'Servicio técnico para reparación de computadores del laboratorio',
    monto: 150000,
    fecha_gasto: '2024-01-18',
    fecha_vencimiento: '2024-02-18',
    fecha_pago: null,
    categoria_id: 2,
    categoria_nombre: 'Mantención',
    proveedor: 'TecnoService Ltda.',
    rut_proveedor: '78.987.654-3',
    contacto_proveedor: 'soporte@tecnoservice.cl',
    telefono_proveedor: '+56 9 8765 4321',
    tipo_documento: 'Boleta',
    numero_documento: 'B-005678',
    estado: 'Aprobado',
    metodo_pago: null,
    observaciones: 'Reparación urgente de 5 equipos del laboratorio de computación',
    archivo_adjunto: '/uploads/boletas/B-005678.pdf',
    aprobado_por: 'Carlos Morales',
    fecha_aprobacion: '2024-01-19',
    creado_por: 'Ana Silva',
    fecha_creacion: '2024-01-18T09:15:00Z',
    fecha_actualizacion: '2024-01-19T11:20:00Z',
  },
  {
    id: 3,
    concepto: 'Servicios Básicos',
    descripcion: 'Pago de cuenta de electricidad del mes de diciembre',
    monto: 320000,
    fecha_gasto: '2024-01-10',
    fecha_vencimiento: '2024-01-25',
    fecha_pago: '2024-01-12',
    categoria_id: 3,
    categoria_nombre: 'Servicios Básicos',
    proveedor: 'Compañía Eléctrica',
    rut_proveedor: '96.123.789-0',
    contacto_proveedor: 'clientes@electricidad.cl',
    telefono_proveedor: '+56 600 123 456',
    tipo_documento: 'Factura',
    numero_documento: 'FE-789012',
    estado: 'Pagado',
    metodo_pago: 'Transferencia Bancaria',
    observaciones: 'Consumo alto debido al uso de calefacción en invierno',
    archivo_adjunto: '/uploads/facturas/FE-789012.pdf',
    aprobado_por: 'María González',
    fecha_aprobacion: '2024-01-11',
    creado_por: 'Pedro Ramírez',
    fecha_creacion: '2024-01-10T08:00:00Z',
    fecha_actualizacion: '2024-01-12T16:30:00Z',
  },
  {
    id: 4,
    concepto: 'Alimentación Escolar',
    descripcion: 'Compra de ingredientes para el programa de alimentación escolar',
    monto: 450000,
    fecha_gasto: '2024-01-22',
    fecha_vencimiento: '2024-02-22',
    fecha_pago: null,
    categoria_id: 4,
    categoria_nombre: 'Alimentación',
    proveedor: 'Distribuidora de Alimentos S.A.',
    rut_proveedor: '77.456.123-8',
    contacto_proveedor: 'ventas@distalimentos.cl',
    telefono_proveedor: '+56 2 3456 7890',
    tipo_documento: 'Factura',
    numero_documento: 'FA-345678',
    estado: 'Registrado',
    metodo_pago: null,
    observaciones: 'Ingredientes frescos para menú semanal del comedor estudiantil',
    archivo_adjunto: '/uploads/facturas/FA-345678.pdf',
    aprobado_por: null,
    fecha_aprobacion: null,
    creado_por: 'Sofía López',
    fecha_creacion: '2024-01-22T14:20:00Z',
    fecha_actualizacion: '2024-01-22T14:20:00Z',
  },
  {
    id: 5,
    concepto: 'Material Deportivo',
    descripcion: 'Compra de balones, conos y material para educación física',
    monto: 95000,
    fecha_gasto: '2024-01-20',
    fecha_vencimiento: '2024-02-20',
    fecha_pago: null,
    categoria_id: 5,
    categoria_nombre: 'Deportes',
    proveedor: 'Deportes Escolares Ltda.',
    rut_proveedor: '79.654.321-2',
    contacto_proveedor: 'info@deportesescolares.cl',
    telefono_proveedor: '+56 9 7654 3210',
    tipo_documento: 'Boleta',
    numero_documento: 'B-987654',
    estado: 'Rechazado',
    metodo_pago: null,
    observaciones: 'Rechazado por falta de presupuesto en la categoría deportes',
    archivo_adjunto: '/uploads/boletas/B-987654.pdf',
    aprobado_por: null,
    fecha_aprobacion: null,
    creado_por: 'Diego Herrera',
    fecha_creacion: '2024-01-20T11:45:00Z',
    fecha_actualizacion: '2024-01-21T09:30:00Z',
  },
  {
    id: 6,
    concepto: 'Limpieza y Aseo',
    descripcion: 'Productos de limpieza y desinfección para las instalaciones',
    monto: 125000,
    fecha_gasto: '2024-01-25',
    fecha_vencimiento: '2024-02-25',
    fecha_pago: '2024-01-26',
    categoria_id: 6,
    categoria_nombre: 'Limpieza',
    proveedor: 'Productos de Limpieza Industrial',
    rut_proveedor: '75.321.654-9',
    contacto_proveedor: 'ventas@limpiezaindustrial.cl',
    telefono_proveedor: '+56 2 4567 8901',
    tipo_documento: 'Factura',
    numero_documento: 'FL-456789',
    estado: 'Pagado',
    metodo_pago: 'Cheque',
    observaciones: 'Productos especiales para desinfección post-pandemia',
    archivo_adjunto: '/uploads/facturas/FL-456789.pdf',
    aprobado_por: 'Carlos Morales',
    fecha_aprobacion: '2024-01-25',
    creado_por: 'Laura Martínez',
    fecha_creacion: '2024-01-25T13:10:00Z',
    fecha_actualizacion: '2024-01-26T10:15:00Z',
  },
];

// Hook principal para gestión de gastos
export function useGastos() {
  const [gastos, setGastos] = useState(GASTOS_MOCK);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simular carga inicial
  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGastos(GASTOS_MOCK);
    } catch (err) {
      setError('Error al cargar los gastos');
      console.error('Error loading gastos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createGasto = async (gastoData) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newGasto = {
        ...gastoData,
        id: Math.max(...gastos.map(g => g.id)) + 1,
        estado: 'Registrado',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        creado_por: 'Usuario Actual',
        aprobado_por: null,
        fecha_aprobacion: null,
        fecha_pago: null,
        metodo_pago: null,
      };
      
      setGastos(prev => [newGasto, ...prev]);
      toast.success('Gasto registrado exitosamente');
      
      return newGasto;
    } catch (err) {
      setError('Error al crear el gasto');
      toast.error('Error al registrar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGasto = async (id, gastoData) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGastos(prev => prev.map(gasto => 
        gasto.id === id 
          ? { 
              ...gasto, 
              ...gastoData, 
              fecha_actualizacion: new Date().toISOString() 
            }
          : gasto
      ));
      
      toast.success('Gasto actualizado exitosamente');
    } catch (err) {
      setError('Error al actualizar el gasto');
      toast.error('Error al actualizar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const aprobarGasto = async (id, aprobadoPor) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGastos(prev => prev.map(gasto => 
        gasto.id === id 
          ? { 
              ...gasto, 
              estado: 'Aprobado',
              aprobado_por: aprobadoPor,
              fecha_aprobacion: new Date().toISOString().split('T')[0],
              fecha_actualizacion: new Date().toISOString()
            }
          : gasto
      ));
      
      toast.success('Gasto aprobado exitosamente');
    } catch (err) {
      setError('Error al aprobar el gasto');
      toast.error('Error al aprobar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rechazarGasto = async (id, motivo) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGastos(prev => prev.map(gasto => 
        gasto.id === id 
          ? { 
              ...gasto, 
              estado: 'Rechazado',
              observaciones: `${gasto.observaciones}\n\nMotivo de rechazo: ${motivo}`,
              fecha_actualizacion: new Date().toISOString()
            }
          : gasto
      ));
      
      toast.success('Gasto rechazado');
    } catch (err) {
      setError('Error al rechazar el gasto');
      toast.error('Error al rechazar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const marcarComoPagado = async (id, metodoPago, fechaPago = null) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGastos(prev => prev.map(gasto => 
        gasto.id === id 
          ? { 
              ...gasto, 
              estado: 'Pagado',
              metodo_pago: metodoPago,
              fecha_pago: fechaPago || new Date().toISOString().split('T')[0],
              fecha_actualizacion: new Date().toISOString()
            }
          : gasto
      ));
      
      toast.success('Gasto marcado como pagado');
    } catch (err) {
      setError('Error al marcar como pagado');
      toast.error('Error al marcar como pagado');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGasto = async (id) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGastos(prev => prev.filter(gasto => gasto.id !== id));
      toast.success('Gasto eliminado exitosamente');
    } catch (err) {
      setError('Error al eliminar el gasto');
      toast.error('Error al eliminar el gasto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gastos,
    isLoading,
    error,
    loadGastos,
    createGasto,
    updateGasto,
    aprobarGasto,
    rechazarGasto,
    marcarComoPagado,
    deleteGasto,
    ESTADOS_GASTO,
    TIPOS_DOCUMENTO,
    METODOS_PAGO,
  };
}

// Hook para filtros de gastos
export function useGastosFilter(gastos = []) {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    categoria_id: '',
    proveedor: '',
    tipo_documento: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    solo_vencidos: false,
    solo_sin_aprobar: false,
    orderBy: 'fecha_gasto',
    orderDirection: 'desc',
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      estado: '',
      categoria_id: '',
      proveedor: '',
      tipo_documento: '',
      fecha_desde: '',
      fecha_hasta: '',
      monto_min: '',
      monto_max: '',
      solo_vencidos: false,
      solo_sin_aprobar: false,
      orderBy: 'fecha_gasto',
      orderDirection: 'desc',
    });
  };

  const filteredGastos = useMemo(() => {
    let filtered = [...gastos];

    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(gasto =>
        gasto.concepto.toLowerCase().includes(searchLower) ||
        gasto.descripcion.toLowerCase().includes(searchLower) ||
        gasto.proveedor.toLowerCase().includes(searchLower) ||
        gasto.numero_documento.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter(gasto => gasto.estado === filters.estado);
    }

    // Filtro por categoría
    if (filters.categoria_id) {
      filtered = filtered.filter(gasto => 
        gasto.categoria_id.toString() === filters.categoria_id
      );
    }

    // Filtro por proveedor
    if (filters.proveedor) {
      const proveedorLower = filters.proveedor.toLowerCase();
      filtered = filtered.filter(gasto =>
        gasto.proveedor.toLowerCase().includes(proveedorLower)
      );
    }

    // Filtro por tipo de documento
    if (filters.tipo_documento) {
      filtered = filtered.filter(gasto => gasto.tipo_documento === filters.tipo_documento);
    }

    // Filtro por fecha desde
    if (filters.fecha_desde) {
      filtered = filtered.filter(gasto => gasto.fecha_gasto >= filters.fecha_desde);
    }

    // Filtro por fecha hasta
    if (filters.fecha_hasta) {
      filtered = filtered.filter(gasto => gasto.fecha_gasto <= filters.fecha_hasta);
    }

    // Filtro por monto mínimo
    if (filters.monto_min) {
      filtered = filtered.filter(gasto => gasto.monto >= parseInt(filters.monto_min));
    }

    // Filtro por monto máximo
    if (filters.monto_max) {
      filtered = filtered.filter(gasto => gasto.monto <= parseInt(filters.monto_max));
    }

    // Filtro solo vencidos
    if (filters.solo_vencidos) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(gasto => 
        gasto.fecha_vencimiento < today && gasto.estado !== 'Pagado'
      );
    }

    // Filtro solo sin aprobar
    if (filters.solo_sin_aprobar) {
      filtered = filtered.filter(gasto => gasto.estado === 'Registrado');
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[filters.orderBy];
      let bValue = b[filters.orderBy];

      // Manejar valores numéricos
      if (filters.orderBy === 'monto') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Manejar fechas
      if (filters.orderBy.includes('fecha')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Manejar strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [gastos, filters]);

  return {
    filters,
    filteredGastos,
    updateFilter,
    resetFilters,
  };
}

// Hook para estadísticas de gastos
export function useGastosStats(gastos = []) {
  return useMemo(() => {
    const total = gastos.length;
    const montoTotal = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    
    // Estadísticas por estado
    const porEstado = gastos.reduce((acc, gasto) => {
      acc[gasto.estado] = (acc[gasto.estado] || 0) + 1;
      return acc;
    }, {});

    const montoPorEstado = gastos.reduce((acc, gasto) => {
      acc[gasto.estado] = (acc[gasto.estado] || 0) + gasto.monto;
      return acc;
    }, {});

    // Estadísticas por categoría
    const porCategoria = gastos.reduce((acc, gasto) => {
      const categoria = gasto.categoria_nombre;
      acc[categoria] = (acc[categoria] || 0) + gasto.monto;
      return acc;
    }, {});

    // Estadísticas por proveedor
    const porProveedor = gastos.reduce((acc, gasto) => {
      acc[gasto.proveedor] = (acc[gasto.proveedor] || 0) + gasto.monto;
      return acc;
    }, {});

    // Gastos vencidos
    const today = new Date().toISOString().split('T')[0];
    const gastosVencidos = gastos.filter(gasto => 
      gasto.fecha_vencimiento < today && gasto.estado !== 'Pagado'
    );
    const montoVencido = gastosVencidos.reduce((sum, gasto) => sum + gasto.monto, 0);

    // Gastos pendientes de aprobación
    const gastosPendientes = gastos.filter(gasto => gasto.estado === 'Registrado');
    const montoPendienteAprobacion = gastosPendientes.reduce((sum, gasto) => sum + gasto.monto, 0);

    // Gastos del mes actual
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const gastosEsteMes = gastos.filter(gasto => 
      gasto.fecha_gasto.startsWith(currentMonth)
    );
    const montoEsteMes = gastosEsteMes.reduce((sum, gasto) => sum + gasto.monto, 0);

    // Promedio de días para pago
    const gastosPagados = gastos.filter(gasto => gasto.estado === 'Pagado' && gasto.fecha_pago);
    const promedioDiasPago = gastosPagados.length > 0 
      ? gastosPagados.reduce((sum, gasto) => {
          const fechaGasto = new Date(gasto.fecha_gasto);
          const fechaPago = new Date(gasto.fecha_pago);
          const dias = Math.ceil((fechaPago - fechaGasto) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0) / gastosPagados.length
      : 0;

    // Efectividad de aprobación
    const gastosAprobados = gastos.filter(gasto => 
      gasto.estado === 'Aprobado' || gasto.estado === 'Pagado'
    );
    const efectividadAprobacion = total > 0 ? (gastosAprobados.length / total) * 100 : 0;

    return {
      total,
      montoTotal,
      porEstado,
      montoPorEstado,
      porCategoria,
      porProveedor,
      gastosVencidos: gastosVencidos.length,
      montoVencido,
      gastosPendientes: gastosPendientes.length,
      montoPendienteAprobacion,
      gastosEsteMes: gastosEsteMes.length,
      montoEsteMes,
      promedioDiasPago,
      efectividadAprobacion,
      montoPromedio: total > 0 ? montoTotal / total : 0,
    };
  }, [gastos]);
}

// Hook para validación de formularios de gastos
export function useGastosValidation() {
  const validateGastoForm = (formData) => {
    const errors = {};

    // Validar concepto
    if (!formData.concepto?.trim()) {
      errors.concepto = 'El concepto es obligatorio';
    } else if (formData.concepto.length < 3) {
      errors.concepto = 'El concepto debe tener al menos 3 caracteres';
    } else if (formData.concepto.length > 100) {
      errors.concepto = 'El concepto no puede exceder 100 caracteres';
    }

    // Validar descripción
    if (!formData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validar monto
    if (!formData.monto) {
      errors.monto = 'El monto es obligatorio';
    } else {
      const monto = parseFloat(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        errors.monto = 'El monto debe ser un número mayor a 0';
      } else if (monto > 10000000) {
        errors.monto = 'El monto no puede exceder $10.000.000';
      }
    }

    // Validar fecha de gasto
    if (!formData.fecha_gasto) {
      errors.fecha_gasto = 'La fecha de gasto es obligatoria';
    } else {
      const fechaGasto = new Date(formData.fecha_gasto);
      const hoy = new Date();
      const unAnoAtras = new Date();
      unAnoAtras.setFullYear(hoy.getFullYear() - 1);
      
      if (fechaGasto > hoy) {
        errors.fecha_gasto = 'La fecha de gasto no puede ser futura';
      } else if (fechaGasto < unAnoAtras) {
        errors.fecha_gasto = 'La fecha de gasto no puede ser mayor a un año';
      }
    }

    // Validar fecha de vencimiento
    if (!formData.fecha_vencimiento) {
      errors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
    } else if (formData.fecha_gasto) {
      const fechaGasto = new Date(formData.fecha_gasto);
      const fechaVencimiento = new Date(formData.fecha_vencimiento);
      
      if (fechaVencimiento < fechaGasto) {
        errors.fecha_vencimiento = 'La fecha de vencimiento debe ser posterior a la fecha de gasto';
      }
    }

    // Validar categoría
    if (!formData.categoria_id) {
      errors.categoria_id = 'La categoría es obligatoria';
    }

    // Validar proveedor
    if (!formData.proveedor?.trim()) {
      errors.proveedor = 'El proveedor es obligatorio';
    } else if (formData.proveedor.length < 3) {
      errors.proveedor = 'El proveedor debe tener al menos 3 caracteres';
    } else if (formData.proveedor.length > 100) {
      errors.proveedor = 'El proveedor no puede exceder 100 caracteres';
    }

    // Validar RUT del proveedor
    if (!formData.rut_proveedor?.trim()) {
      errors.rut_proveedor = 'El RUT del proveedor es obligatorio';
    } else {
      const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
      if (!rutPattern.test(formData.rut_proveedor)) {
        errors.rut_proveedor = 'El RUT debe tener el formato XX.XXX.XXX-X';
      }
    }

    // Validar tipo de documento
    if (!formData.tipo_documento) {
      errors.tipo_documento = 'El tipo de documento es obligatorio';
    }

    // Validar número de documento
    if (!formData.numero_documento?.trim()) {
      errors.numero_documento = 'El número de documento es obligatorio';
    } else if (formData.numero_documento.length < 3) {
      errors.numero_documento = 'El número de documento debe tener al menos 3 caracteres';
    } else if (formData.numero_documento.length > 50) {
      errors.numero_documento = 'El número de documento no puede exceder 50 caracteres';
    }

    // Validar contacto del proveedor (email)
    if (formData.contacto_proveedor?.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.contacto_proveedor)) {
        errors.contacto_proveedor = 'El email debe tener un formato válido';
      }
    }

    // Validar teléfono del proveedor
    if (formData.telefono_proveedor?.trim()) {
      const phonePattern = /^\+?[\d\s\-\(\)]{8,15}$/;
      if (!phonePattern.test(formData.telefono_proveedor)) {
        errors.telefono_proveedor = 'El teléfono debe tener un formato válido';
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
    };
  };

  return {
    validateGastoForm,
  };
}

export default useGastos;

