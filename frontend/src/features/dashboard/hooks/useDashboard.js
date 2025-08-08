import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';

// Hook principal para datos del dashboard
export const useDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos mock para el dashboard
  const mockDashboardData = useMemo(() => ({
    stats: {
      totalAlumnos: 245,
      totalCursos: 12,
      totalIngresos: 1850000,
      totalGastos: 890000,
      deudasPendientes: 320000,
      cobrosPendientes: 15,
      gastosEsteMes: 125000,
      balanceGeneral: 960000,
      alumnosActivos: 238,
      cursosActivos: 11,
      profesoresActivos: 18,
      tesoreros: 3,
    },
    trends: {
      alumnos: { value: 12, direction: 'up', period: 'vs mes anterior' },
      ingresos: { value: 8.5, direction: 'up', period: 'vs mes anterior' },
      gastos: { value: -3.2, direction: 'down', period: 'vs mes anterior' },
      deudas: { value: -15.3, direction: 'down', period: 'vs mes anterior' },
    },
    recentActivity: [
      {
        id: 1,
        type: 'payment',
        title: 'Pago recibido',
        description: 'Juan Pérez - Cuota Marzo',
        amount: 45000,
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success',
        user: 'Juan Pérez',
        course: '3°A',
      },
      {
        id: 2,
        type: 'expense',
        title: 'Gasto registrado',
        description: 'Material de oficina',
        amount: -15000,
        time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'info',
        category: 'Material de Oficina',
        course: 'Administración',
      },
      {
        id: 3,
        type: 'student',
        title: 'Nuevo alumno',
        description: 'María González - 2°B',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'success',
        student: 'María González',
        course: '2°B',
      },
      {
        id: 4,
        type: 'overdue',
        title: 'Cobro vencido',
        description: 'Carlos Ruiz - Matrícula',
        amount: 85000,
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'warning',
        student: 'Carlos Ruiz',
        concept: 'Matrícula',
      },
      {
        id: 5,
        type: 'payment',
        title: 'Pago recibido',
        description: 'Ana Martínez - Material Escolar',
        amount: 25000,
        time: new Date(Date.now() - 36 * 60 * 60 * 1000),
        status: 'success',
        user: 'Ana Martínez',
        course: '1°A',
      },
    ],
    upcomingPayments: [
      {
        id: 1,
        student: 'Ana Martínez',
        course: '3°A',
        concept: 'Cuota Abril',
        amount: 45000,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'high',
      },
      {
        id: 2,
        student: 'Pedro Silva',
        course: '1°B',
        concept: 'Material Escolar',
        amount: 25000,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'medium',
      },
      {
        id: 3,
        student: 'Laura Torres',
        course: '4°A',
        concept: 'Actividades Extra',
        amount: 30000,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'low',
      },
      {
        id: 4,
        student: 'Miguel Rodríguez',
        course: '2°C',
        concept: 'Cuota Abril',
        amount: 45000,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'pending',
        priority: 'medium',
      },
    ],
    monthlyTrends: {
      ingresos: [650000, 780000, 850000, 920000, 880000, 950000],
      gastos: [450000, 520000, 480000, 550000, 510000, 580000],
      balance: [200000, 260000, 370000, 370000, 370000, 370000],
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    },
    courseStats: [
      { name: 'Pre-Kinder', alumnos: 18, ingresos: 810000, color: '#3b82f6' },
      { name: 'Kinder', alumnos: 22, ingresos: 990000, color: '#10b981' },
      { name: '1° Básico', alumnos: 25, ingresos: 1125000, color: '#f59e0b' },
      { name: '2° Básico', alumnos: 23, ingresos: 1035000, color: '#ef4444' },
      { name: '3° Básico', alumnos: 21, ingresos: 945000, color: '#8b5cf6' },
      { name: '4° Básico', alumnos: 24, ingresos: 1080000, color: '#06b6d4' },
      { name: '5° Básico', alumnos: 20, ingresos: 900000, color: '#84cc16' },
      { name: '6° Básico', alumnos: 19, ingresos: 855000, color: '#f97316' },
    ],
    expenseCategories: [
      { name: 'Material Didáctico', value: 280000, color: '#3b82f6' },
      { name: 'Servicios Básicos', value: 150000, color: '#10b981' },
      { name: 'Material de Oficina', value: 85000, color: '#f59e0b' },
      { name: 'Mantención', value: 120000, color: '#ef4444' },
      { name: 'Alimentación', value: 200000, color: '#8b5cf6' },
      { name: 'Otros', value: 55000, color: '#6b7280' },
    ],
    alerts: [
      {
        id: 1,
        type: 'warning',
        title: 'Cobros vencidos',
        message: '15 cobros están vencidos y requieren atención',
        action: 'Ver cobros',
        priority: 'high',
      },
      {
        id: 2,
        type: 'info',
        title: 'Nuevo mes académico',
        message: 'Abril ha comenzado. Revisa los cobros programados',
        action: 'Ver calendario',
        priority: 'medium',
      },
      {
        id: 3,
        type: 'success',
        title: 'Meta de ingresos',
        message: 'Se ha alcanzado el 95% de la meta mensual',
        action: 'Ver reportes',
        priority: 'low',
      },
    ],
  }), []);

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En producción, aquí se harían las llamadas a la API
      setData(mockDashboardData);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar datos del dashboard';
      setError(errorMessage);
      toast.error('Error al cargar dashboard', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [mockDashboardData]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    await loadDashboardData();
    toast.success('Dashboard actualizado', {
      description: 'Los datos han sido actualizados exitosamente',
    });
  }, [loadDashboardData]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    loadDashboardData,
  };
};

// Hook para estadísticas del dashboard
export const useDashboardStats = () => {
  const { data } = useDashboard();

  const stats = useMemo(() => {
    if (!data) return null;

    return [
      {
        title: 'Total Alumnos',
        value: data.stats.totalAlumnos,
        trend: data.trends.alumnos,
        icon: 'Users',
        color: 'blue',
        description: 'Estudiantes registrados',
      },
      {
        title: 'Cursos Activos',
        value: data.stats.totalCursos,
        trend: { value: 2, direction: 'up', period: 'nuevos este año' },
        icon: 'BookOpen',
        color: 'green',
        description: 'Cursos en funcionamiento',
      },
      {
        title: 'Ingresos del Mes',
        value: data.stats.totalIngresos,
        trend: data.trends.ingresos,
        icon: 'TrendingUp',
        color: 'emerald',
        description: 'Ingresos acumulados',
        format: 'currency',
      },
      {
        title: 'Gastos del Mes',
        value: data.stats.totalGastos,
        trend: data.trends.gastos,
        icon: 'DollarSign',
        color: 'red',
        description: 'Gastos registrados',
        format: 'currency',
      },
      {
        title: 'Deudas Pendientes',
        value: data.stats.deudasPendientes,
        trend: data.trends.deudas,
        icon: 'CreditCard',
        color: 'orange',
        description: 'Montos por cobrar',
        format: 'currency',
      },
      {
        title: 'Balance General',
        value: data.stats.balanceGeneral,
        trend: { value: 12.5, direction: 'up', period: 'vs mes anterior' },
        icon: 'BarChart3',
        color: 'purple',
        description: 'Balance financiero',
        format: 'currency',
      },
    ];
  }, [data]);

  return stats;
};

// Hook para actividad reciente
export const useRecentActivity = (limit = 5) => {
  const { data } = useDashboard();

  const recentActivity = useMemo(() => {
    if (!data) return [];
    return data.recentActivity.slice(0, limit);
  }, [data, limit]);

  return recentActivity;
};

// Hook para próximos pagos
export const useUpcomingPayments = (limit = 5) => {
  const { data } = useDashboard();

  const upcomingPayments = useMemo(() => {
    if (!data) return [];
    return data.upcomingPayments
      .slice(0, limit)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [data, limit]);

  return upcomingPayments;
};

// Hook para alertas del dashboard
export const useDashboardAlerts = () => {
  const { data } = useDashboard();
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const alerts = useMemo(() => {
    if (!data) return [];
    return data.alerts.filter(alert => !dismissedAlerts.has(alert.id));
  }, [data, dismissedAlerts]);

  const dismissAlert = useCallback((alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  const clearAllAlerts = useCallback(() => {
    if (data) {
      setDismissedAlerts(new Set(data.alerts.map(alert => alert.id)));
    }
  }, [data]);

  return {
    alerts,
    dismissAlert,
    clearAllAlerts,
    hasAlerts: alerts.length > 0,
  };
};

// Hook para métricas de rendimiento
export const usePerformanceMetrics = () => {
  const { data } = useDashboard();

  const metrics = useMemo(() => {
    if (!data) return null;

    const totalIngresos = data.stats.totalIngresos;
    const totalGastos = data.stats.totalGastos;
    const balance = totalIngresos - totalGastos;
    const margenGanancia = totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0;
    
    const promedioIngresoPorAlumno = data.stats.totalAlumnos > 0 
      ? totalIngresos / data.stats.totalAlumnos 
      : 0;
    
    const promedioIngresoPorCurso = data.stats.totalCursos > 0 
      ? totalIngresos / data.stats.totalCursos 
      : 0;

    const eficienciaCobranza = data.stats.deudasPendientes > 0 
      ? ((totalIngresos / (totalIngresos + data.stats.deudasPendientes)) * 100)
      : 100;

    return {
      balance,
      margenGanancia,
      promedioIngresoPorAlumno,
      promedioIngresoPorCurso,
      eficienciaCobranza,
      totalIngresos,
      totalGastos,
      deudasPendientes: data.stats.deudasPendientes,
    };
  }, [data]);

  return metrics;
};

// Hook para datos de gráficos
export const useChartData = () => {
  const { data } = useDashboard();

  const chartData = useMemo(() => {
    if (!data) return null;

    return {
      monthlyTrends: data.monthlyTrends,
      courseStats: data.courseStats,
      expenseCategories: data.expenseCategories,
      
      // Datos adicionales para gráficos
      incomeVsExpenses: data.monthlyTrends.labels.map((label, index) => ({
        month: label,
        ingresos: data.monthlyTrends.ingresos[index],
        gastos: data.monthlyTrends.gastos[index],
        balance: data.monthlyTrends.balance[index],
      })),
      
      studentDistribution: data.courseStats.map(course => ({
        name: course.name,
        value: course.alumnos,
        color: course.color,
      })),
      
      revenueDistribution: data.courseStats.map(course => ({
        name: course.name,
        value: course.ingresos,
        color: course.color,
      })),
    };
  }, [data]);

  return chartData;
};

export default {
  useDashboard,
  useDashboardStats,
  useRecentActivity,
  useUpcomingPayments,
  useDashboardAlerts,
  usePerformanceMetrics,
  useChartData,
};

