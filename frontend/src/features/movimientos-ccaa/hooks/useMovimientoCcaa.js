import { useState, useEffect, useMemo } from 'react';

// Datos mock para movimientos CCAA
const MOVIMIENTOS_CCAA_MOCK = [
  {
    id: 1,
    concepto: 'Depósito Mensualidades Enero',
    descripcion: 'Depósito consolidado de mensualidades del mes de enero 2024',
    monto: 2500000,
    tipo_movimiento: 'Depósito',
    categoria: 'Ingresos Académicos',
    fecha_movimiento: '2024-01-31',
    fecha_procesamiento: '2024-01-31',
    estado: 'Conciliado',
    cuenta_origen: 'Caja Recaudación',
    cuenta_destino: 'Cuenta Corriente Principal',
    numero_operacion: 'DEP-240131-001',
    banco: 'Banco de Chile',
    sucursal: 'Sucursal Centro',
    ejecutivo_responsable: 'María Fernández',
    saldo_anterior: 15000000,
    saldo_actual: 17500000,
    comision: 0,
    interes: 0,
    conciliado: true,
    fecha_conciliacion: '2024-02-01',
    observaciones: 'Depósito mensual regular de mensualidades estudiantiles',
    creado_por: 'Sistema Automático',
    fecha_creacion: '2024-01-31',
    fecha_actualizacion: '2024-02-01',
  },
  {
    id: 2,
    concepto: 'Retiro Pago Proveedores',
    descripcion: 'Retiro para pago de proveedores de servicios básicos y mantenimiento',
    monto: 850000,
    tipo_movimiento: 'Retiro',
    categoria: 'Gastos Operacionales',
    fecha_movimiento: '2024-02-05',
    fecha_procesamiento: '2024-02-05',
    estado: 'Procesado',
    cuenta_origen: 'Cuenta Corriente Principal',
    cuenta_destino: 'Caja Pagos',
    numero_operacion: 'RET-240205-002',
    banco: 'Banco de Chile',
    sucursal: 'Sucursal Centro',
    ejecutivo_responsable: 'Carlos Mendoza',
    saldo_anterior: 17500000,
    saldo_actual: 16650000,
    comision: 2500,
    interes: 0,
    conciliado: false,
    fecha_conciliacion: null,
    observaciones: 'Retiro programado para pagos mensuales de proveedores',
    creado_por: 'Tesorero',
    fecha_creacion: '2024-02-05',
    fecha_actualizacion: '2024-02-05',
  },
  {
    id: 3,
    concepto: 'Transferencia Fondo Emergencia',
    descripcion: 'Transferencia al fondo de emergencia para contingencias',
    monto: 500000,
    tipo_movimiento: 'Transferencia',
    categoria: 'Reservas',
    fecha_movimiento: '2024-02-10',
    fecha_procesamiento: '2024-02-11',
    estado: 'Pendiente',
    cuenta_origen: 'Cuenta Corriente Principal',
    cuenta_destino: 'Cuenta Ahorro Emergencia',
    numero_operacion: 'TRF-240210-003',
    banco: 'Banco de Chile',
    sucursal: 'Sucursal Centro',
    ejecutivo_responsable: 'Ana Rodríguez',
    saldo_anterior: 16650000,
    saldo_actual: 16650000, // No cambia hasta procesar
    comision: 1500,
    interes: 0,
    conciliado: false,
    fecha_conciliacion: null,
    observaciones: 'Transferencia mensual al fondo de emergencia según política institucional',
    creado_por: 'Director Financiero',
    fecha_creacion: '2024-02-10',
    fecha_actualizacion: '2024-02-11',
  },
  {
    id: 4,
    concepto: 'Interés Cuenta Ahorro',
    descripcion: 'Interés generado por cuenta de ahorro institucional',
    monto: 125000,
    tipo_movimiento: 'Interés',
    categoria: 'Ingresos Financieros',
    fecha_movimiento: '2024-02-15',
    fecha_procesamiento: '2024-02-15',
    estado: 'Conciliado',
    cuenta_origen: 'Banco de Chile',
    cuenta_destino: 'Cuenta Ahorro Principal',
    numero_operacion: 'INT-240215-004',
    banco: 'Banco de Chile',
    sucursal: 'Sucursal Centro',
    ejecutivo_responsable: 'Sistema Bancario',
    saldo_anterior: 8500000,
    saldo_actual: 8625000,
    comision: 0,
    interes: 125000,
    conciliado: true,
    fecha_conciliacion: '2024-02-15',
    observaciones: 'Interés mensual generado automáticamente por el banco',
    creado_por: 'Sistema Bancario',
    fecha_creacion: '2024-02-15',
    fecha_actualizacion: '2024-02-15',
  },
  {
    id: 5,
    concepto: 'Comisión Mantenimiento Cuenta',
    descripcion: 'Comisión mensual por mantenimiento de cuenta corriente',
    monto: 15000,
    tipo_movimiento: 'Comisión',
    categoria: 'Gastos Bancarios',
    fecha_movimiento: '2024-02-20',
    fecha_procesamiento: '2024-02-20',
    estado: 'Conciliado',
    cuenta_origen: 'Cuenta Corriente Principal',
    cuenta_destino: 'Banco de Chile',
    numero_operacion: 'COM-240220-005',
    banco: 'Banco de Chile',
    sucursal: 'Sucursal Centro',
    ejecutivo_responsable: 'Sistema Bancario',
    saldo_anterior: 16650000,
    saldo_actual: 16635000,
    comision: 15000,
    interes: 0,
    conciliado: true,
    fecha_conciliacion: '2024-02-20',
    observaciones: 'Comisión mensual automática por mantenimiento de cuenta',
    creado_por: 'Sistema Bancario',
    fecha_creacion: '2024-02-20',
    fecha_actualizacion: '2024-02-20',
  },
  {
    id: 6,
    concepto: 'Depósito Donación Anónima',
    descripcion: 'Depósito de donación anónima para mejoras de infraestructura',
    monto: 1000000,
    tipo_movimiento: 'Depósito',
    categoria: 'Donaciones',
    fecha_movimiento: '2024-02-25',
    fecha_procesamiento: null,
    estado: 'Rechazado',
    cuenta_origen: 'Donante Anónimo',
    cuenta_destino: 'Cuenta Corriente Principal',
    numero_operacion: 'DEP-240225-006',
    banco: 'Banco de Chile',
    sucursal: 'Sucursal Centro',
    ejecutivo_responsable: 'Patricia Silva',
    saldo_anterior: 16635000,
    saldo_actual: 16635000, // No cambia por rechazo
    comision: 0,
    interes: 0,
    conciliado: false,
    fecha_conciliacion: null,
    observaciones: 'Rechazado por falta de documentación de origen de fondos',
    creado_por: 'Patricia Silva',
    fecha_creacion: '2024-02-25',
    fecha_actualizacion: '2024-02-26',
  },
];

// Estados de movimiento CCAA
export const ESTADOS_MOVIMIENTO_CCAA = {
  PENDIENTE: 'Pendiente',
  PROCESADO: 'Procesado',
  CONCILIADO: 'Conciliado',
  RECHAZADO: 'Rechazado',
};

// Tipos de movimiento CCAA
export const TIPOS_MOVIMIENTO_CCAA = {
  DEPOSITO: 'Depósito',
  RETIRO: 'Retiro',
  TRANSFERENCIA: 'Transferencia',
  INTERES: 'Interés',
  COMISION: 'Comisión',
};

// Categorías de movimiento CCAA
export const CATEGORIAS_MOVIMIENTO_CCAA = [
  'Ingresos Académicos',
  'Ingresos Financieros',
  'Donaciones',
  'Subsidios',
  'Gastos Operacionales',
  'Gastos Bancarios',
  'Inversiones',
  'Reservas',
  'Mantenimiento',
  'Personal',
  'Otros',
];

// Bancos disponibles
export const BANCOS_CCAA = [
  'Banco de Chile',
  'Banco Santander',
  'Banco Estado',
  'Banco BCI',
  'Banco Falabella',
  'Banco Security',
  'Banco Itaú',
  'Scotiabank',
];

// Tipos de cuenta
export const TIPOS_CUENTA_CCAA = [
  'Cuenta Corriente Principal',
  'Cuenta Ahorro Principal',
  'Cuenta Ahorro Emergencia',
  'Cuenta Inversiones',
  'Caja Recaudación',
  'Caja Pagos',
];

// Hook principal para gestión de movimientos CCAA
export function useMovimientoCcaa() {
  const [movimientos, setMovimientos] = useState(MOVIMIENTOS_CCAA_MOCK);
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
      conciliado: false,
      fecha_conciliacion: null,
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
        let nuevoSaldo = movimiento.saldo_anterior;
        
        // Calcular nuevo saldo según tipo de movimiento
        switch (movimiento.tipo_movimiento) {
          case 'Depósito':
          case 'Interés':
            nuevoSaldo = movimiento.saldo_anterior + movimiento.monto;
            break;
          case 'Retiro':
          case 'Comisión':
            nuevoSaldo = movimiento.saldo_anterior - movimiento.monto - (movimiento.comision || 0);
            break;
          case 'Transferencia':
            // Las transferencias requieren lógica especial según cuenta origen/destino
            nuevoSaldo = movimiento.saldo_anterior - movimiento.monto - (movimiento.comision || 0);
            break;
          default:
            nuevoSaldo = movimiento.saldo_anterior;
        }
        
        return {
          ...movimiento,
          estado: 'Procesado',
          fecha_procesamiento: new Date().toISOString().split('T')[0],
          saldo_actual: nuevoSaldo,
          ejecutivo_responsable: procesadoPor,
          fecha_actualizacion: new Date().toISOString().split('T')[0],
        };
      }
      return movimiento;
    }));
    
    setIsLoading(false);
  };

  // Conciliar movimiento
  const conciliarMovimiento = async (id, conciliadoPor) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMovimientos(prev => prev.map(movimiento => 
      movimiento.id === id 
        ? { 
            ...movimiento, 
            estado: 'Conciliado',
            conciliado: true,
            fecha_conciliacion: new Date().toISOString().split('T')[0],
            ejecutivo_responsable: conciliadoPor,
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
    conciliarMovimiento,
    rechazarMovimiento,
    refreshMovimientos,
  };
}

// Hook para filtros de movimientos CCAA
export function useMovimientoCcaaFilter(movimientos = []) {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo_movimiento: '',
    categoria: '',
    banco: '',
    cuenta_origen: '',
    cuenta_destino: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    solo_conciliados: false,
    solo_pendientes: false,
    con_comision: false,
    con_interes: false,
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
      banco: '',
      cuenta_origen: '',
      cuenta_destino: '',
      fecha_desde: '',
      fecha_hasta: '',
      monto_min: '',
      monto_max: '',
      solo_conciliados: false,
      solo_pendientes: false,
      con_comision: false,
      con_interes: false,
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
        movimiento.numero_operacion.toLowerCase().includes(searchLower) ||
        movimiento.ejecutivo_responsable.toLowerCase().includes(searchLower) ||
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

    // Filtro por banco
    if (filters.banco) {
      filtered = filtered.filter(movimiento => movimiento.banco === filters.banco);
    }

    // Filtro por cuenta origen
    if (filters.cuenta_origen) {
      filtered = filtered.filter(movimiento => movimiento.cuenta_origen === filters.cuenta_origen);
    }

    // Filtro por cuenta destino
    if (filters.cuenta_destino) {
      filtered = filtered.filter(movimiento => movimiento.cuenta_destino === filters.cuenta_destino);
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

    // Filtro solo conciliados
    if (filters.solo_conciliados) {
      filtered = filtered.filter(movimiento => movimiento.conciliado === true);
    }

    // Filtro solo pendientes
    if (filters.solo_pendientes) {
      filtered = filtered.filter(movimiento => movimiento.estado === 'Pendiente');
    }

    // Filtro con comisión
    if (filters.con_comision) {
      filtered = filtered.filter(movimiento => movimiento.comision > 0);
    }

    // Filtro con interés
    if (filters.con_interes) {
      filtered = filtered.filter(movimiento => movimiento.interes > 0);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[filters.orderBy];
      let bValue = b[filters.orderBy];

      // Manejar diferentes tipos de datos
      if (filters.orderBy === 'monto' || filters.orderBy === 'comision' || filters.orderBy === 'interes') {
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

// Hook para estadísticas de movimientos CCAA
export function useMovimientoCcaaStats(movimientos = []) {
  const stats = useMemo(() => {
    const total = movimientos.length;
    const depositos = movimientos.filter(m => m.tipo_movimiento === 'Depósito');
    const retiros = movimientos.filter(m => m.tipo_movimiento === 'Retiro');
    const transferencias = movimientos.filter(m => m.tipo_movimiento === 'Transferencia');
    const intereses = movimientos.filter(m => m.tipo_movimiento === 'Interés');
    const comisiones = movimientos.filter(m => m.tipo_movimiento === 'Comisión');
    
    const montoTotalDepositos = depositos.reduce((sum, m) => sum + m.monto, 0);
    const montoTotalRetiros = retiros.reduce((sum, m) => sum + m.monto, 0);
    const montoTotalTransferencias = transferencias.reduce((sum, m) => sum + m.monto, 0);
    const montoTotalIntereses = intereses.reduce((sum, m) => sum + m.monto, 0);
    const montoTotalComisiones = comisiones.reduce((sum, m) => sum + m.monto, 0);
    
    const flujoNeto = montoTotalDepositos + montoTotalIntereses - montoTotalRetiros - montoTotalComisiones;
    
    // Movimientos por estado
    const distribucionEstados = movimientos.reduce((acc, movimiento) => {
      acc[movimiento.estado.toLowerCase()] = (acc[movimiento.estado.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    // Movimientos por banco
    const distribucionBancos = movimientos.reduce((acc, movimiento) => {
      const banco = movimiento.banco;
      const existing = acc.find(item => item.banco === banco);
      if (existing) {
        existing.cantidad += 1;
        existing.monto += movimiento.monto;
      } else {
        acc.push({
          banco,
          cantidad: 1,
          monto: movimiento.monto,
        });
      }
      return acc;
    }, []);

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
      
      const depositosMes = movimientosMes
        .filter(m => m.tipo_movimiento === 'Depósito' || m.tipo_movimiento === 'Interés')
        .reduce((sum, m) => sum + m.monto, 0);
      
      const retirosMes = movimientosMes
        .filter(m => m.tipo_movimiento === 'Retiro' || m.tipo_movimiento === 'Comisión')
        .reduce((sum, m) => sum + m.monto, 0);
      
      const transferenciasMes = movimientosMes
        .filter(m => m.tipo_movimiento === 'Transferencia')
        .reduce((sum, m) => sum + m.monto, 0);
      
      tendenciaMensual.push({
        mes,
        depositos: depositosMes,
        retiros: retirosMes,
        transferencias: transferenciasMes,
        flujo_neto: depositosMes - retirosMes,
      });
    }

    // Top ejecutivos por movimientos
    const topEjecutivos = movimientos.reduce((acc, movimiento) => {
      const ejecutivo = movimiento.ejecutivo_responsable;
      const existing = acc.find(item => item.nombre === ejecutivo);
      if (existing) {
        existing.movimientos += 1;
        existing.monto_total += movimiento.monto;
      } else {
        acc.push({
          nombre: ejecutivo,
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

    const sinConciliar = movimientos.filter(m => !m.conciliado && m.estado === 'Procesado');
    if (sinConciliar.length > 0) {
      alertas.push({
        tipo: 'sin_conciliar',
        titulo: 'Movimientos Sin Conciliar',
        descripcion: `${sinConciliar.length} movimientos procesados requieren conciliación`,
        cantidad: sinConciliar.length,
        monto: sinConciliar.reduce((sum, m) => sum + m.monto, 0),
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

    // Movimientos de alto monto (>1M)
    const altoMonto = movimientos.filter(m => m.monto > 1000000);
    if (altoMonto.length > 0) {
      alertas.push({
        tipo: 'alto_monto',
        titulo: 'Movimientos de Alto Monto',
        descripcion: `${altoMonto.length} movimientos superan $1.000.000`,
        cantidad: altoMonto.length,
        monto: altoMonto.reduce((sum, m) => sum + m.monto, 0),
      });
    }

    // Promedio de días para conciliación
    const conciliados = movimientos.filter(m => 
      m.fecha_conciliacion && m.fecha_procesamiento
    );
    const promedioDiasConciliacion = conciliados.length > 0 
      ? conciliados.reduce((sum, m) => {
          const dias = Math.ceil(
            (new Date(m.fecha_conciliacion) - new Date(m.fecha_procesamiento)) / (1000 * 60 * 60 * 24)
          );
          return sum + dias;
        }, 0) / conciliados.length
      : 0;

    // Saldo actual estimado (último movimiento conciliado)
    const ultimoMovimientoConciliado = movimientos
      .filter(m => m.conciliado)
      .sort((a, b) => new Date(b.fecha_conciliacion) - new Date(a.fecha_conciliacion))[0];
    
    const saldoActualEstimado = ultimoMovimientoConciliado?.saldo_actual || 0;

    return {
      total_movimientos: total,
      total_depositos: depositos.length,
      total_retiros: retiros.length,
      total_transferencias: transferencias.length,
      total_intereses: intereses.length,
      total_comisiones: comisiones.length,
      monto_total_depositos: montoTotalDepositos,
      monto_total_retiros: montoTotalRetiros,
      monto_total_transferencias: montoTotalTransferencias,
      monto_total_intereses: montoTotalIntereses,
      monto_total_comisiones: montoTotalComisiones,
      flujo_neto: flujoNeto,
      saldo_actual_estimado: saldoActualEstimado,
      distribucion_estados: distribucionEstados,
      distribucion_bancos: distribucionBancos,
      distribucion_categorias: distribucionCategorias,
      tendencia_mensual: tendenciaMensual,
      top_ejecutivos: topEjecutivos,
      alertas,
      promedio_dias_conciliacion: Math.round(promedioDiasConciliacion * 10) / 10,
      tasa_conciliacion: total > 0 
        ? Math.round((movimientos.filter(m => m.conciliado).length / total) * 100)
        : 0,
      efectividad_procesamiento: total > 0 
        ? Math.round((movimientos.filter(m => m.estado === 'Procesado' || m.estado === 'Conciliado').length / total) * 100)
        : 0,
    };
  }, [movimientos]);

  return stats;
}

// Hook para validación de formularios de movimientos CCAA
export function useMovimientoCcaaValidation() {
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
      } else if (monto > 100000000) {
        errors.monto = 'El monto no puede exceder $100.000.000';
      }
    }

    // Validar tipo de movimiento
    if (!formData.tipo_movimiento) {
      errors.tipo_movimiento = 'El tipo de movimiento es obligatorio';
    } else if (!Object.values(TIPOS_MOVIMIENTO_CCAA).includes(formData.tipo_movimiento)) {
      errors.tipo_movimiento = 'Tipo de movimiento inválido';
    }

    // Validar categoría
    if (!formData.categoria) {
      errors.categoria = 'La categoría es obligatoria';
    } else if (!CATEGORIAS_MOVIMIENTO_CCAA.includes(formData.categoria)) {
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

    // Validar banco
    if (!formData.banco) {
      errors.banco = 'El banco es obligatorio';
    } else if (!BANCOS_CCAA.includes(formData.banco)) {
      errors.banco = 'Banco inválido';
    }

    // Validar cuenta origen
    if (!formData.cuenta_origen?.trim()) {
      errors.cuenta_origen = 'La cuenta origen es obligatoria';
    } else if (formData.cuenta_origen.length < 3) {
      errors.cuenta_origen = 'La cuenta origen debe tener al menos 3 caracteres';
    }

    // Validar cuenta destino
    if (!formData.cuenta_destino?.trim()) {
      errors.cuenta_destino = 'La cuenta destino es obligatoria';
    } else if (formData.cuenta_destino.length < 3) {
      errors.cuenta_destino = 'La cuenta destino debe tener al menos 3 caracteres';
    }

    // Validar que cuenta origen y destino sean diferentes
    if (formData.cuenta_origen && formData.cuenta_destino && 
        formData.cuenta_origen === formData.cuenta_destino) {
      errors.cuenta_destino = 'La cuenta destino debe ser diferente a la cuenta origen';
    }

    // Validar número de operación
    if (!formData.numero_operacion?.trim()) {
      errors.numero_operacion = 'El número de operación es obligatorio';
    } else if (formData.numero_operacion.length < 5) {
      errors.numero_operacion = 'El número de operación debe tener al menos 5 caracteres';
    } else if (formData.numero_operacion.length > 50) {
      errors.numero_operacion = 'El número de operación no puede exceder 50 caracteres';
    }

    // Validar ejecutivo responsable
    if (!formData.ejecutivo_responsable?.trim()) {
      errors.ejecutivo_responsable = 'El ejecutivo responsable es obligatorio';
    } else if (formData.ejecutivo_responsable.length < 3) {
      errors.ejecutivo_responsable = 'El ejecutivo responsable debe tener al menos 3 caracteres';
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

    // Validar comisión (opcional pero debe ser válida si se proporciona)
    if (formData.comision !== undefined && formData.comision !== '') {
      const comision = parseInt(formData.comision);
      if (isNaN(comision) || comision < 0) {
        errors.comision = 'La comisión debe ser un número no negativo';
      } else if (comision > formData.monto) {
        errors.comision = 'La comisión no puede ser mayor al monto del movimiento';
      }
    }

    // Validar interés (opcional pero debe ser válida si se proporciona)
    if (formData.interes !== undefined && formData.interes !== '') {
      const interes = parseInt(formData.interes);
      if (isNaN(interes) || interes < 0) {
        errors.interes = 'El interés debe ser un número no negativo';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  return { validateForm };
}

