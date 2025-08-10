import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Handshake, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Ban,
  Users,
  Calendar,
  Target,
  PieChart,
  BarChart3,
  TrendingDown,
  UserCheck,
  UserX,
  ArrowRightLeft,
  Network,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import { DeudaCompaneroTable } from '../features/deudas/components/DeudaCompaneroTable.jsx';
import { DeudaCompaneroForm } from '../features/deudas/components/DeudaCompaneroForm.jsx';
import { 
  useDeudaCompanero, 
  useDeudaCompaneroFilter, 
  useDeudaCompaneroStats,
  useDeudaCompaneroValidation
} from '../features/deudas/hooks/useDeudaCompanero.js';
import { usePermissions } from "../features/auth/hooks/usePermissions";
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import Navbar from '../pages/Navbar';

// Alumnos mock para los filtros
const ALUMNOS_MOCK = [
  { id: 1, nombre: 'Juan Carlos Pérez', curso: '8° Básico A' },
  { id: 2, nombre: 'Ana María González', curso: '7° Básico B' },
  { id: 3, nombre: 'Carlos Eduardo Morales', curso: '1° Medio A' },
  { id: 4, nombre: 'Sofía Alejandra Ruiz', curso: '6° Básico A' },
  { id: 5, nombre: 'Diego Andrés López', curso: '2° Medio B' },
];

export function DeudasCompaneroPage() {
  const { canManageFinanzas } = usePermissions();
  const { validateDeudaForm } = useDeudaCompaneroValidation();
  
  // Estados del formulario
  const [showForm, setShowForm] = useState(false);
  const [editingDeuda, setEditingDeuda] = useState(null);
  
  // Hooks de datos
  const {
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
  } = useDeudaCompanero();

  const {
    filters,
    filteredDeudas,
    updateFilter,
    resetFilters,
  } = useDeudaCompaneroFilter(deudas);

  const stats = useDeudaCompaneroStats(deudas);

  // Verificar permisos
  if (!canManageFinanzas) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                No tienes permisos para gestionar finanzas.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Función para formatear montos
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Estadísticas para mostrar
  const statsData = [
    {
      title: 'Total Préstamos',
      value: stats.total,
      icon: 'Handshake',
      color: 'blue',
      description: 'Préstamos registrados',
    },
    {
      title: 'Monto Total',
      value: formatCurrency(stats.montoTotal),
      icon: 'DollarSign',
      color: 'green',
      description: 'Valor total prestado',
    },
    {
      title: 'Monto Pendiente',
      value: formatCurrency(stats.montoPendiente),
      icon: 'Clock',
      color: 'yellow',
      description: 'Por devolver',
      trend: {
        value: stats.efectividadPago,
        direction: stats.efectividadPago > 80 ? 'up' : 'down',
        period: 'efectividad',
      },
    },
    {
      title: 'Préstamos Vencidos',
      value: stats.deudasVencidas,
      icon: 'AlertTriangle',
      color: stats.deudasVencidas > 0 ? 'red' : 'gray',
      description: 'Requieren seguimiento',
    },
  ];

  // Handlers
  const handleCreateDeuda = () => {
    setEditingDeuda(null);
    setShowForm(true);
  };

  const handleEditDeuda = (deuda) => {
    setEditingDeuda(deuda);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDeuda(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingDeuda) {
        await updateDeuda(editingDeuda.id, formData);
      } else {
        await createDeuda(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar deuda:', error);
    }
  };

  const handleMarcarPagada = async (id) => {
    const metodo = prompt('¿Cómo se realizó el pago?', 'Efectivo');
    if (metodo) {
      await marcarComoPagada(id, metodo);
    }
  };

  const handleCancelarDeuda = async (id, motivo) => {
    await cancelarDeuda(id, motivo);
  };

  const handleReactivarDeuda = async (id) => {
    await reactivarDeuda(id);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
  };

  return (
      <>
        <Navbar />
    
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="p-4 max-w-7xl mx-auto space-y-6"
          >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Deudas entre Compañeros
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de préstamos y deudas entre estudiantes
          </p>
        </div>
        
        <Button onClick={handleCreateDeuda} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Préstamo
        </Button>
      </div>

      {/* Estadísticas */}
      <StatsGrid stats={statsData} />

      {/* Resumen de relaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="w-5 h-5" />
            <span>Resumen de Relaciones Estudiantiles</span>
          </CardTitle>
          <CardDescription>
            Estado actual de los préstamos entre compañeros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Efectividad de Pago */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Efectividad de Pago</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats.efectividadPago > 80 ? "text-green-600" : 
                  stats.efectividadPago > 60 ? "text-yellow-600" : "text-red-600"
                )}>
                  {stats.efectividadPago.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={stats.efectividadPago} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Pagado: {formatCurrency(stats.montoPagado)}</span>
                <span>Total: {formatCurrency(stats.montoTotal)}</span>
              </div>
            </div>

            {/* Alumnos Involucrados */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Alumnos Involucrados
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.alumnosInvolucrados}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.deudores} deudores, {stats.acreedores} acreedores
              </p>
            </div>

            {/* Préstamos Activos */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">
                Préstamos Activos
              </p>
              <p className="text-2xl font-bold text-orange-700">
                {stats.activas}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                de {stats.total} totales
              </p>
            </div>

            {/* Promedio por Préstamo */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">
                Promedio por Préstamo
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(stats.montoPromedio)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                monto promedio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución por estado */}
      {Object.keys(stats.porEstado).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Distribución por Estado</span>
            </CardTitle>
            <CardDescription>
              Cantidad de préstamos por estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.porEstado)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([estado, cantidad]) => {
                  const getEstadoColor = (estado) => {
                    const colors = {
                      'Pendiente': 'text-yellow-600 bg-yellow-50',
                      'Pagada': 'text-green-600 bg-green-50',
                      'Vencida': 'text-red-600 bg-red-50',
                      'Cancelada': 'text-gray-600 bg-gray-50',
                    };
                    return colors[estado] || 'text-gray-600 bg-gray-50';
                  };

                  const getEstadoIcon = (estado) => {
                    const icons = {
                      'Pendiente': Clock,
                      'Pagada': CheckCircle,
                      'Vencida': AlertTriangle,
                      'Cancelada': Ban,
                    };
                    return icons[estado] || Clock;
                  };

                  const IconComponent = getEstadoIcon(estado);

                  return (
                    <motion.div
                      key={estado}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={cn("text-center p-4 rounded-lg", getEstadoColor(estado))}
                    >
                      <IconComponent className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-2xl font-bold">
                        {cantidad}
                      </p>
                      <p className="text-sm font-medium">
                        {estado}
                      </p>
                    </motion.div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis de relaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deudores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-600" />
              <span>Top Deudores</span>
            </CardTitle>
            <CardDescription>
              Estudiantes que más préstamos han solicitado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.relacionesDeudor)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([nombre, cantidad]) => (
                  <div key={nombre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center space-x-2">
                        <UserX className="w-3 h-3 text-red-600" />
                        <span>{nombre}</span>
                      </span>
                      <span className="text-gray-600">{cantidad} préstamos</span>
                    </div>
                    <Progress 
                      value={(cantidad / Math.max(...Object.values(stats.relacionesDeudor))) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Acreedores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <span>Top Acreedores</span>
            </CardTitle>
            <CardDescription>
              Estudiantes que más préstamos han otorgado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.relacionesAcreedor)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([nombre, cantidad]) => (
                  <div key={nombre} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium flex items-center space-x-2">
                        <UserCheck className="w-3 h-3 text-green-600" />
                        <span>{nombre}</span>
                      </span>
                      <span className="text-gray-600">{cantidad} préstamos</span>
                    </div>
                    <Progress 
                      value={(cantidad / Math.max(...Object.values(stats.relacionesAcreedor))) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por tipo */}
      {Object.keys(stats.porTipo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Tipos de Préstamos más Comunes</span>
            </CardTitle>
            <CardDescription>
              Distribución de préstamos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.porTipo)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([tipo, cantidad]) => (
                  <div key={tipo} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{tipo}</span>
                      <span className="text-gray-600">{cantidad} préstamos</span>
                    </div>
                    <Progress 
                      value={(cantidad / stats.total) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {((cantidad / stats.total) * 100).toFixed(1)}% del total
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen del mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Actividad del Mes Actual</span>
          </CardTitle>
          <CardDescription>
            Préstamos registrados en el mes en curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <Handshake className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <p className="text-3xl font-bold text-blue-700">{stats.deudasEsteMes}</p>
              <p className="text-blue-600 font-medium">Préstamos Nuevos</p>
              <p className="text-sm text-blue-500 mt-1">Este mes</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(stats.montoEsteMes)}
              </p>
              <p className="text-green-600 font-medium">Monto Prestado</p>
              <p className="text-sm text-green-500 mt-1">Este mes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de préstamos vencidos */}
      {stats.deudasVencidas > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas de Préstamos Vencidos</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              Préstamos que requieren seguimiento inmediato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-700">{stats.deudasVencidas}</p>
                <p className="text-sm text-red-600 font-medium">Préstamos Vencidos</p>
              </div>
              
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(stats.montoVencido)}
                </p>
                <p className="text-sm text-red-600 font-medium">Monto Vencido</p>
              </div>
              
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold text-red-700">
                  {stats.promedioDiasVencidos.toFixed(0)}
                </p>
                <p className="text-sm text-red-600 font-medium">Días Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de deudas */}
      <DeudaCompaneroTable
        deudas={filteredDeudas}
        alumnos={ALUMNOS_MOCK}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onCreateDeuda={handleCreateDeuda}
        onEditDeuda={handleEditDeuda}
        onMarcarPagada={handleMarcarPagada}
        onCancelarDeuda={handleCancelarDeuda}
        onReactivarDeuda={handleReactivarDeuda}
        onDeleteDeuda={deleteDeuda}
        onRefresh={loadDeudas}
        ESTADOS_DEUDA_COMPANERO={ESTADOS_DEUDA_COMPANERO}
        TIPOS_DEUDA_COMPANERO={TIPOS_DEUDA_COMPANERO}
      />

      {/* Formulario de deuda */}
      <DeudaCompaneroForm
        deuda={editingDeuda}
        alumnos={ALUMNOS_MOCK}
        tiposDeuda={TIPOS_DEUDA_COMPANERO}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        validateForm={validateDeudaForm}
      />

      {/* Mensaje de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 text-sm">
                {error}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}

export default DeudasCompaneroPage;

