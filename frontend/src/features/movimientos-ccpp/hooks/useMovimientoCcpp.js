import { useState, useEffect, useMemo } from 'react';

// Datos mock para movimientos CCPP
const MOVIMIENTOS_CCPP_MOCK = [
  {
    id: 1,
    concepto: 'Aporte Mensual Centro de Padres',
    descripcion: 'Aporte mensual obligatorio para actividades del centro de padres',
    monto: 15000,
    tipo_movimiento: 'Ingreso',
    categoria: 'Aporte Padres',
    fecha_movimiento: '2024-01-15',
    fecha_procesamiento: '2024-01-15',
    estado: 'Procesado',
    usuario_tipo: 'Padre',
    usuario_nombre: 'María González',
    usuario_rut: '12.345.678-9',
    usuario_email: 'maria.gonzalez@email.com',
    usuario_telefono: '+56 9 8765 4321',
    metodo_pago: 'Transferencia Bancaria',
    numero_comprobante: 'TRF-001234',
    saldo_anterior: 45000,
    saldo_actual: 60000,
    aprobado_por: 'Admin Sistema',
    fecha_aprobacion: '2024-01-15',
    observaciones: 'Aporte mensual enero 2024',
    creado_por: 'Sistema Automático',
    fecha_creacion: '2024-01-15',
    fecha_actualizacion: '2024-01-15',
  },
  {
    id: 2,
    concepto: 'Retiro para Actividad Deportiva',
    descripcion: 'Retiro de fondos para compra de implementos deportivos',
    monto: 25000,
    tipo_movimiento: 'Egreso',
    categoria: 'Actividades Deportivas',
    fecha_movimiento: '2024-01-20',
    fecha_procesamiento: '2024-01-21',
    estado: 'Aprobado',
    usuario_tipo: 'Profesor',
    usuario_nombre: 'Carlos Rodríguez',
    usuario_rut: '98.765.432-1',
    usuario_email: 'carlos.rodriguez@colegio.cl',
    usuario_telefono: '+56 9 1234 5678',
    metodo_pago: 'Efectivo',
    numero_comprobante: 'RET-005678',
    saldo_anterior: 80000,
    saldo_actual: 55000,
    aprobado_por: 'Director Académico',
    fecha_aprobacion: '2024-01-21',
    observaciones: 'Compra de balones y redes para educación física',
    creado_por: 'Carlos Rodríguez',
    fecha_creacion: '2024-01-20',
    fecha_actualizacion: '2024-01-21',
  },
  {
    id: 3,
    concepto: 'Transferencia entre Cuentas',
    descripcion: 'Transferencia de fondos de cuenta de padres a profesores',
    monto: 30000,
    tipo_movimiento: 'Transferencia',
    categoria: 'Transferencia Interna',
    fecha_movimiento: '2024-01-25',
    fecha_procesamiento: null,
    estado: 'Pendiente',
    usuario_tipo: 'Padre',
    usuario_nombre: 'Ana Martínez',
    usuario_rut: '11.222.333-4',
    usuario_email: 'ana.martinez@email.com',
    usuario_telefono: '+56 9 9876 5432',
    metodo_pago: 'Transferencia Interna',
    numero_comprobante: 'TRI-009876',
    saldo_anterior: 75000,
    saldo_actual: 75000, // No cambia hasta procesar
    aprobado_por: null,
    fecha_aprobacion: null,
    observaciones: 'Transferencia para proyecto de ciencias',
    creado_por: 'Ana Martínez',
    fecha_creacion: '2024-01-25',
    fecha_actualizacion: '2024-01-25',
  },
  {
    id: 4,
    concepto: 'Aporte Extraordinario',
    descripcion: 'Aporte extraordinario para mejoras de infraestructura',
    monto: 50000,
    tipo_movimiento: 'Ingreso',
    categoria: 'Aporte Extraordinario',
    fecha_movimiento: '2024-01-28',
    fecha_procesamiento: '2024-01-29',
    estado: 'Procesado',
    usuario_tipo: 'Padre',
    usuario_nombre: 'Roberto Silva',
    usuario_rut: '22.333.444-5',
    usuario_email: 'roberto.silva@email.com',
    usuario_telefono: '+56 9 5555 6666',
    metodo_pago: 'Cheque',
    numero_comprobante: 'CHQ-112233',
    saldo_anterior: 120000,
    saldo_actual: 170000,
    aprobado_por: 'Tesorero Centro Padres',
    fecha_aprobacion: '2024-01-29',
    observaciones: 'Aporte para renovación de salas de clases',
    creado_por: 'Roberto Silva',
    fecha_creacion: '2024-01-28',
    fecha_actualizacion: '2024-01-29',
  },
  {
    id: 5,
    concepto: 'Pago Actividad Cultural',
    descripcion: 'Pago para organización de obra de teatro escolar',
    monto: 35000,
    tipo_movimiento: 'Egreso',
    categoria: 'Actividades Culturales',
    fecha_movimiento: '2024-02-01',
    fecha_procesamiento: null,
    estado: 'Rechazado',
    usuario_tipo: 'Profesor',
    usuario_nombre: 'Patricia López',
    usuario_rut: '33.444.555-6',
    usuario_email: 'patricia.lopez@colegio.cl',
    usuario_telefono: '+56 9 7777 8888',
    metodo_pago: 'Transferencia Bancaria',
    numero_comprobante: 'TRF-445566',
    saldo_anterior: 90000,
    saldo_actual: 90000, // No cambia por rechazo
    aprobado_por: null,
    fecha_aprobacion: null,
    observaciones: 'Rechazado por falta de documentación completa',
    creado_por: 'Patricia López',
    fecha_creacion: '2024-02-01',
    fecha_actualizacion: '2024-02-02',
  },
  {
    id: 6,
    concepto: 'Reembolso Gastos Educativos',
    descripcion: 'Reembolso por compra de material educativo',
    monto: 18000,
    tipo_movimiento: 'Egreso',
    categoria: 'Reembolsos',
    fecha_movimiento: '2024-02-05',
    fecha_procesamiento: '2024-02-06',
    estado: 'Procesado',
    usuario_tipo: 'Profesor',
    usuario_nombre: 'Miguel Torres',
    usuario_rut: '44.555.666-7',
    usuario_email: 'miguel.torres@colegio.cl',
    usuario_telefono: '+56 9 3333 4444',
    metodo_pago: 'Transferencia Bancaria',
    numero_comprobante: 'REM-778899',
    saldo_anterior: 65000,
    saldo_actual: 47000,
    aprobado_por: 'Coordinador Académico',
    fecha_aprobacion: '2024-02-06',
    observaciones: 'Reembolso por material didáctico matemáticas',
    creado_por: 'Miguel Torres',
    fecha_creacion: '2024-02-05',
    fecha_actualizacion: '2024-02-06',
  },
];

// Estados de movimiento
export const ESTADOS_MOVIMIENTO_CCPP = {
  PENDIENTE: 'Pendiente',
  PROCESADO: 'Procesado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

// Tipos de movimiento
export const TIPOS_MOVIMIENTO_CCPP = {
  INGRESO: 'Ingreso',
  EGRESO: 'Egreso',
  TRANSFERENCIA: 'Transferencia',
};

// Categorías de movimiento
export const CATEGORIAS_MOVIMIENTO_CCPP = [
  'Aporte Padres',
  'Aporte Extraordinario',
  'Actividades Deportivas',
  'Actividades Culturales',
  'Actividades Académicas',
  'Transferencia Interna',
  'Reembolsos',
  'Gastos Administrativos',
  'Mantenimiento',
  'Otros',
];

// Tipos de usuario
export const TIPOS_USUARIO_CCPP = {
  PADRE: 'Padre',
  PROFESOR: 'Profesor',
};

// Métodos de pago
export const METODOS_PAGO_CCPP = [
  'Efectivo',
  'Transferencia Bancaria',
  'Transferencia Interna',
  'Cheque',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
];

// Hook principal para gestión de movimientos CCPP
export function useMovimientoCcpp() {
  const [movimientos, setMovimientos] = useState(MOVIMIENTOS_CCPP_MOCK);
  const [isLoading, setIsLoading] = useState(false);

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Crear nuevo movimiento
  const createMovimiento = async (movimientoData) => {
    setIsLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const nuevoMovimiento = {
      id: Math.max(...movimientos.map(m => m.id)) + 1,
      ...movimientoData,
      estado: 'Pendiente',
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_actualizacion: new Date().toISOString().split('T')[0],
      saldo_actual: movimientoData.saldo_anterior, // No cambia hasta procesar
      fecha_procesamiento: null,
      aprobado_por: null,
      fecha_aprobacion: null,
    };
    
    setMovimientos(prev => [nuevoMovimiento, ...prev]);
    setIsLoading(false);
    
    return nuevoMovimiento;
  };

  // Actualizar movimiento
  const updateMovimiento = async (id, movimientoData) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMovimientos(prev => prev.map(movimiento => 
      movimiento.id === id 
        ? { 
            ...movimiento, 
            ...movimientoData,
            fecha_actualizacion: new Date().toISOString().split('T')[0],
          }
        : movimiento
    ));
    
    setIsLoading(false);
  };

  // Eliminar movimiento (soft delete)
  const deleteMovimiento = async (id) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setMovimientos(prev => prev.filter(movimiento => movimiento.id !== id));
    setIsLoading(false);
  };

  // Procesar movimiento
  const procesarMovimiento = async (id, procesadoPor) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setMovimientos(prev => prev.map(movimiento => {
      if (movimiento.id === id) {
        const nuevoSaldo = movimiento.tipo_movimiento === 'Ingreso' 
          ? movimiento.saldo_anterior + movimiento.monto
          : movimiento.tipo_movimiento === 'Egreso'
          ? movimiento.saldo_anterior - movimiento.monto
          : movimiento.saldo_anterior; // Transferencias requieren lógica especial
        
        return {
          ...movimiento,
          estado: 'Procesado',
          fecha_procesamiento: new Date().toISOString().split('T')[0],
          saldo_actual: nuevoSaldo,
          aprobado_por: procesadoPor,
          fecha_aprobacion: new Date().toISOString().split('T')[0],
          fecha_actualizacion: new Date().toISOString().split('T')[0],
        };
      }
      return movimiento;
    }));
    
    setIsLoading(false);
  };

  // Aprobar movimiento
  const aprobarMovimiento = async (id, aprobadoPor) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMovimientos(prev => prev.map(movimiento => 
      movimiento.id === id 
        ? { 
            ...movimiento, 
            estado: 'Aprobado',
            aprobado_por: aprobadoPor,
            fecha_aprobacion: new Date().toISOString().split('T')[0],
            fecha_actualizacion: new Date().toISOString().split('T')[0],
          }
        : movimiento
    ));
    
    setIsLoading(false);
  };

  // Rechazar movimiento
  const rechazarMovimiento = async (id, motivo) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMovimientos(prev => prev.map(movimiento => 
      movimiento.id === id 
        ? { 
            ...movimiento, 
            estado: 'Rechazado',
            observaciones: `${movimiento.observaciones}\n\nRechazado: ${motivo}`,
            fecha_actualizacion: new Date().toISOString().split('T')[0],
          }
        : movimiento
    ));
    
    setIsLoading(false);
  };

  // Refrescar datos
  const refreshMovimientos = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    // En una app real, aquí se haría fetch de la API
    setIsLoading(false);
  };

  return {
    movimientos,
    isLoading,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,
    procesarMovimiento,
    aprobarMovimiento,
    rechazarMovimiento,
    refreshMovimientos,
  };
}

// Hook para filtros de movimientos CCPP
export function useMovimientoCcppFilter(movimientos = []) {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo_movimiento: '',
    categoria: '',
    usuario_tipo: '',
    usuario_nombre: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    metodo_pago: '',
    solo_pendientes: false,
    solo_procesados: false,
    orderBy: 'fecha_movimiento',
    orderDirection: 'desc',
  });

  // Actualizar filtro
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Resetear filtros
  const resetFilters = () => {
    setFilters({
      search: '',
      estado: '',
      tipo_movimiento: '',
      categoria: '',
      usuario_tipo: '',
      usuario_nombre: '',
      fecha_desde: '',
      fecha_hasta: '',
      monto_min: '',
      monto_max: '',
      metodo_pago: '',
      solo_pendientes: false,
      solo_procesados: false,
      orderBy: 'fecha_movimiento',
      orderDirection: 'desc',
    });
  };

  // Aplicar filtros
  const filteredMovimientos = useMemo(() => {
    let filtered = [...movimientos];

    // Búsqueda por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(movimiento =>
        movimiento.concepto.toLowerCase().includes(searchLower) ||
        movimiento.descripcion.toLowerCase().includes(searchLower) ||
        movimiento.usuario_nombre.toLowerCase().includes(searchLower) ||
        movimiento.numero_comprobante.toLowerCase().includes(searchLower) ||
        movimiento.observaciones?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.estado) {
      filtered = filtered.filter(movimiento => movimiento.estado === filters.estado);
    }

    // Filtro por tipo de movimiento
    if (filters.tipo_movimiento) {
      filtered = filtered.filter(movimiento => movimiento.tipo_movimiento === filters.tipo_movimiento);
    }

    // Filtro por categoría
    if (filters.categoria) {
      filtered = filtered.filter(movimiento => movimiento.categoria === filters.categoria);
    }

    // Filtro por tipo de usuario
    if (filters.usuario_tipo) {
      filtered = filtered.filter(movimiento => movimiento.usuario_tipo === filters.usuario_tipo);
    }

    // Filtro por nombre de usuario
    if (filters.usuario_nombre) {
      const nombreLower = filters.usuario_nombre.toLowerCase();
      filtered = filtered.filter(movimiento => 
        movimiento.usuario_nombre.toLowerCase().includes(nombreLower)
      );
    }

    // Filtro por método de pago
    if (filters.metodo_pago) {
      filtered = filtered.filter(movimiento => movimiento.metodo_pago === filters.metodo_pago);
    }

    // Filtro por fecha desde
    if (filters.fecha_desde) {
      filtered = filtered.filter(movimiento => movimiento.fecha_movimiento >= filters.fecha_desde);
    }

    // Filtro por fecha hasta
    if (filters.fecha_hasta) {
      filtered = filtered.filter(movimiento => movimiento.fecha_movimiento <= filters.fecha_hasta);
    }

    // Filtro por monto mínimo
    if (filters.monto_min) {
      filtered = filtered.filter(movimiento => movimiento.monto >= parseInt(filters.monto_min));
    }

    // Filtro por monto máximo
    if (filters.monto_max) {
      filtered = filtered.filter(movimiento => movimiento.monto <= parseInt(filters.monto_max));
    }

    // Filtro solo pendientes
    if (filters.solo_pendientes) {
      filtered = filtered.filter(movimiento => movimiento.estado === 'Pendiente');
    }

    // Filtro solo procesados
    if (filters.solo_procesados) {
      filtered = filtered.filter(movimiento => 
        movimiento.estado === 'Procesado' || movimiento.estado === 'Aprobado'
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[filters.orderBy];
      let bValue = b[filters.orderBy];

      // Manejar diferentes tipos de datos
      if (filters.orderBy === 'monto') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (filters.orderBy.includes('fecha')) {
        aValue = new Date(aValue || '1900-01-01');
        bValue = new Date(bValue || '1900-01-01');
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (filters.orderDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [movimientos, filters]);

  return {
    filters,
    filteredMovimientos,
    updateFilter,
    resetFilters,
  };
}

// Hook para estadísticas de movimientos CCPP
export function useMovimientoCcppStats(movimientos = []) {
  const stats = useMemo(() => {
    const total = movimientos.length;
    const ingresos = movimientos.filter(m => m.tipo_movimiento === 'Ingreso');
    const egresos = movimientos.filter(m => m.tipo_movimiento === 'Egreso');
    const transferencias = movimientos.filter(m => m.tipo_movimiento === 'Transferencia');
    
    const montoTotalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0);
    const montoTotalEgresos = egresos.reduce((sum, m) => sum + m.monto, 0);
    const montoTotalTransferencias = transferencias.reduce((sum, m) => sum + m.monto, 0);
    
    const saldoActual = montoTotalIngresos - montoTotalEgresos;
    
    // Movimientos por estado
    const distribucionEstados = movimientos.reduce((acc, movimiento) => {
      acc[movimiento.estado.toLowerCase()] = (acc[movimiento.estado.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    // Movimientos por tipo de usuario
    const distribucionUsuarios = movimientos.reduce((acc, movimiento) => {
      acc[movimiento.usuario_tipo.toLowerCase()] = (acc[movimiento.usuario_tipo.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    // Movimientos por categoría
    const distribucionCategorias = movimientos.reduce((acc, movimiento) => {
      const categoria = movimiento.categoria;
      const existing = acc.find(item => item.categoria === categoria);
      if (existing) {
        existing.cantidad += 1;
        existing.monto += movimiento.monto;
      } else {
        acc.push({
          categoria,
          cantidad: 1,
          monto: movimiento.monto,
        });
      }
      return acc;
    }, []);

    // Tendencia mensual (últimos 6 meses)
    const tendenciaMensual = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mes = fecha.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' });
      const mesKey = fecha.toISOString().slice(0, 7); // YYYY-MM
      
      const movimientosMes = movimientos.filter(m => 
        m.fecha_movimiento.startsWith(mesKey)
      );
      
      const ingresosMes = movimientosMes
        .filter(m => m.tipo_movimiento === 'Ingreso')
        .reduce((sum, m) => sum + m.monto, 0);
      
      const egresosMes = movimientosMes
        .filter(m => m.tipo_movimiento === 'Egreso')
        .reduce((sum, m) => sum + m.monto, 0);
      
      tendenciaMensual.push({
        mes,
        ingresos: ingresosMes,
        egresos: egresosMes,
        neto: ingresosMes - egresosMes,
      });
    }

    // Top usuarios por movimientos
    const topUsuarios = movimientos.reduce((acc, movimiento) => {
      const usuario = movimiento.usuario_nombre;
      const existing = acc.find(item => item.nombre === usuario);
      if (existing) {
        existing.movimientos += 1;
        existing.monto_total += movimiento.monto;
      } else {
        acc.push({
          nombre: usuario,
          tipo: movimiento.usuario_tipo,
          rut: movimiento.usuario_rut,
          movimientos: 1,
          monto_total: movimiento.monto,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.monto_total - a.monto_total)
    .slice(0, 5);

    // Alertas
    const alertas = [];
    
    const pendientes = movimientos.filter(m => m.estado === 'Pendiente');
    if (pendientes.length > 0) {
      alertas.push({
        tipo: 'pendientes',
        titulo: 'Movimientos Pendientes',
        descripcion: `${pendientes.length} movimientos requieren procesamiento`,
        cantidad: pendientes.length,
        monto: pendientes.reduce((sum, m) => sum + m.monto, 0),
      });
    }

    const rechazados = movimientos.filter(m => m.estado === 'Rechazado');
    if (rechazados.length > 0) {
      alertas.push({
        tipo: 'rechazados',
        titulo: 'Movimientos Rechazados',
        descripcion: `${rechazados.length} movimientos fueron rechazados`,
        cantidad: rechazados.length,
        monto: rechazados.reduce((sum, m) => sum + m.monto, 0),
      });
    }

    // Movimientos de alto monto (>100k)
    const altoMonto = movimientos.filter(m => m.monto > 100000);
    if (altoMonto.length > 0) {
      alertas.push({
        tipo: 'alto_monto',
        titulo: 'Movimientos de Alto Monto',
        descripcion: `${altoMonto.length} movimientos superan los $100.000`,
        cantidad: altoMonto.length,
        monto: altoMonto.reduce((sum, m) => sum + m.monto, 0),
      });
    }

    // Promedio de días para procesamiento
    const procesados = movimientos.filter(m => 
      m.fecha_procesamiento && m.fecha_movimiento
    );
    const promedioDiasProcesamiento = procesados.length > 0 
      ? procesados.reduce((sum, m) => {
          const dias = Math.ceil(
            (new Date(m.fecha_procesamiento) - new Date(m.fecha_movimiento)) / (1000 * 60 * 60 * 24)
          );
          return sum + dias;
        }, 0) / procesados.length
      : 0;

    return {
      total_movimientos: total,
      total_ingresos: ingresos.length,
      total_egresos: egresos.length,
      total_transferencias: transferencias.length,
      monto_total_ingresos: montoTotalIngresos,
      monto_total_egresos: montoTotalEgresos,
      monto_total_transferencias: montoTotalTransferencias,
      saldo_actual: saldoActual,
      distribucion_estados: distribucionEstados,
      distribucion_usuarios: distribucionUsuarios,
      distribucion_categorias: distribucionCategorias,
      tendencia_mensual: tendenciaMensual,
      top_usuarios: topUsuarios,
      alertas,
      promedio_dias_procesamiento: Math.round(promedioDiasProcesamiento * 10) / 10,
      efectividad_procesamiento: total > 0 
        ? Math.round((movimientos.filter(m => m.estado === 'Procesado' || m.estado === 'Aprobado').length / total) * 100)
        : 0,
    };
  }, [movimientos]);

  return stats;
}

// Hook para validación de formularios de movimientos CCPP
export function useMovimientoCcppValidation() {
  const validateForm = (formData) => {
    const errors = {};

    // Validar concepto
    if (!formData.concepto?.trim()) {
      errors.concepto = 'El concepto es obligatorio';
    } else if (formData.concepto.length < 5) {
      errors.concepto = 'El concepto debe tener al menos 5 caracteres';
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
      const monto = parseInt(formData.monto);
      if (isNaN(monto) || monto <= 0) {
        errors.monto = 'El monto debe ser un número positivo';
      } else if (monto > 10000000) {
        errors.monto = 'El monto no puede exceder $10.000.000';
      }
    }

    // Validar tipo de movimiento
    if (!formData.tipo_movimiento) {
      errors.tipo_movimiento = 'El tipo de movimiento es obligatorio';
    } else if (!Object.values(TIPOS_MOVIMIENTO_CCPP).includes(formData.tipo_movimiento)) {
      errors.tipo_movimiento = 'Tipo de movimiento inválido';
    }

    // Validar categoría
    if (!formData.categoria) {
      errors.categoria = 'La categoría es obligatoria';
    } else if (!CATEGORIAS_MOVIMIENTO_CCPP.includes(formData.categoria)) {
      errors.categoria = 'Categoría inválida';
    }

    // Validar fecha de movimiento
    if (!formData.fecha_movimiento) {
      errors.fecha_movimiento = 'La fecha de movimiento es obligatoria';
    } else {
      const fecha = new Date(formData.fecha_movimiento);
      const hoy = new Date();
      const unAnoAtras = new Date();
      unAnoAtras.setFullYear(hoy.getFullYear() - 1);
      
      if (fecha > hoy) {
        errors.fecha_movimiento = 'La fecha no puede ser futura';
      } else if (fecha < unAnoAtras) {
        errors.fecha_movimiento = 'La fecha no puede ser anterior a un año';
      }
    }

    // Validar tipo de usuario
    if (!formData.usuario_tipo) {
      errors.usuario_tipo = 'El tipo de usuario es obligatorio';
    } else if (!Object.values(TIPOS_USUARIO_CCPP).includes(formData.usuario_tipo)) {
      errors.usuario_tipo = 'Tipo de usuario inválido';
    }

    // Validar nombre de usuario
    if (!formData.usuario_nombre?.trim()) {
      errors.usuario_nombre = 'El nombre del usuario es obligatorio';
    } else if (formData.usuario_nombre.length < 3) {
      errors.usuario_nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.usuario_nombre.length > 100) {
      errors.usuario_nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar RUT
    if (!formData.usuario_rut?.trim()) {
      errors.usuario_rut = 'El RUT es obligatorio';
    } else {
      const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
      if (!rutPattern.test(formData.usuario_rut)) {
        errors.usuario_rut = 'Formato de RUT inválido (XX.XXX.XXX-X)';
      }
    }

    // Validar email (opcional pero con formato)
    if (formData.usuario_email && formData.usuario_email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.usuario_email)) {
        errors.usuario_email = 'Formato de email inválido';
      }
    }

    // Validar teléfono (opcional pero con formato)
    if (formData.usuario_telefono && formData.usuario_telefono.trim()) {
      const phonePattern = /^\+56\s9\s\d{4}\s\d{4}$/;
      if (!phonePattern.test(formData.usuario_telefono)) {
        errors.usuario_telefono = 'Formato de teléfono inválido (+56 9 XXXX XXXX)';
      }
    }

    // Validar método de pago
    if (!formData.metodo_pago) {
      errors.metodo_pago = 'El método de pago es obligatorio';
    } else if (!METODOS_PAGO_CCPP.includes(formData.metodo_pago)) {
      errors.metodo_pago = 'Método de pago inválido';
    }

    // Validar número de comprobante
    if (!formData.numero_comprobante?.trim()) {
      errors.numero_comprobante = 'El número de comprobante es obligatorio';
    } else if (formData.numero_comprobante.length < 3) {
      errors.numero_comprobante = 'El número de comprobante debe tener al menos 3 caracteres';
    } else if (formData.numero_comprobante.length > 50) {
      errors.numero_comprobante = 'El número de comprobante no puede exceder 50 caracteres';
    }

    // Validar saldo anterior
    if (formData.saldo_anterior === undefined || formData.saldo_anterior === '') {
      errors.saldo_anterior = 'El saldo anterior es obligatorio';
    } else {
      const saldo = parseInt(formData.saldo_anterior);
      if (isNaN(saldo) || saldo < 0) {
        errors.saldo_anterior = 'El saldo anterior debe ser un número no negativo';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  return { validateForm };
}

