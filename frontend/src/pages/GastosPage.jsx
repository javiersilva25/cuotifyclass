import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building, 
  Receipt, 
  BarChart3,
  PieChart,
  FileText,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Target,
  Wallet,
  CreditCard,
  Ban,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from 'recharts';
import { GastosTable } from '../features/gastos/components/GastosTable';
import { GastoForm } from '../features/gastos/components/GastoForm';
import { useGastos, useGastosFilter, useGastosStats, useGastosValidation } from '../features/gastos/hooks/useGastos';
import { cn } from '../lib/utils';
import  Navbar  from '../pages/Navbar.jsx';

// Componente para tarjeta de estadística
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = 'blue',
  description,
  trend,
  onClick 
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-500 text-white',
    indigo: 'bg-indigo-500 text-white',
  };

  const bgColorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "cursor-pointer",
        onClick && "hover:shadow-lg transition-shadow"
      )}
    >
      <Card className={cn("border-2", bgColorClasses[color])}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {description && (
                  <p className="text-xs text-gray-500">{description}</p>
                )}
              </div>
              
              {change && (
                <div className="flex items-center space-x-1">
                  {changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : changeType === 'decrease' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    changeType === 'increase' && "text-green-600",
                    changeType === 'decrease' && "text-red-600",
                    changeType === 'neutral' && "text-gray-600"
                  )}>
                    {change}
                  </span>
                </div>
              )}
            </div>
            
            <div className={cn("p-3 rounded-full", colorClasses[color])}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          
          {trend && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progreso</span>
                <span>{trend.percentage}%</span>
              </div>
              <Progress value={trend.percentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para gráfico de gastos por categoría
function GastosPorCategoriaChart({ data }) {
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Gastos por Categoría</span>
        </CardTitle>
        <CardDescription>
          Distribución de gastos por tipo de categoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="monto"
              >
                {Array.isArray(data) &&
                  data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                  }).format(value),
                  'Monto'
                ]}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para gráfico de tendencia mensual
function TendenciaMensualChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Tendencia Mensual</span>
        </CardTitle>
        <CardDescription>
          Evolución de gastos en los últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis 
                tickFormatter={(value) => 
                  new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(value)
                }
              />
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                  }).format(value),
                  'Monto'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="monto" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para top proveedores
function TopProveedoresCard({ proveedores }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="w-5 h-5" />
          <span>Top Proveedores</span>
        </CardTitle>
        <CardDescription>
          Proveedores con mayor volumen de gastos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(proveedores) &&
            proveedores.map((proveedor, index) => (
              <motion.div
                key={proveedor.nombre}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  index === 0 && "bg-yellow-500",
                  index === 1 && "bg-gray-400",
                  index === 2 && "bg-orange-600",
                  index > 2 && "bg-blue-500"
                )}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{proveedor.nombre}</p>
                  <p className="text-sm text-gray-500">{proveedor.gastos} gastos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                  }).format(proveedor.monto_total)}
                </p>
                <p className="text-sm text-gray-500">
                  Promedio: {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                  }).format(proveedor.promedio)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para alertas de gastos
function AlertasGastosCard({ alertas }) {
  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'vencido':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'por_vencer':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'sin_aprobar':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'presupuesto':
        return <Target className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertColor = (tipo) => {
    switch (tipo) {
      case 'vencido':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'por_vencer':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'sin_aprobar':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'presupuesto':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Alertas y Notificaciones</span>
        </CardTitle>
        <CardDescription>
          Gastos que requieren atención inmediata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.isArray(alertas) && alertas.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
              <p className="text-gray-500">No hay alertas pendientes</p>
              <p className="text-sm text-gray-400">Todos los gastos están al día</p>
            </div>
          ) : (
            Array.isArray(alertas) && alertas.map((alerta, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border-2",
                  getAlertColor(alerta.tipo)
                )}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alerta.tipo)}
                  <div className="flex-1">
                    <p className="font-medium">{alerta.titulo}</p>
                    <p className="text-sm opacity-90">{alerta.descripcion}</p>
                    {alerta.monto && (
                      <p className="text-sm font-medium mt-1">
                        Monto: {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(alerta.monto)}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {alerta.cantidad}
                  </Badge>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal de la página
export function GastosPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Hooks personalizados
  const { 
    gastos, 
    isLoading, 
    createGasto, 
    updateGasto, 
    deleteGasto, 
    aprobarGasto,
    rechazarGasto,
    marcarComoPagado,
    refreshGastos 
  } = useGastos();

  const { 
    filters, 
    filteredGastos, 
    updateFilter, 
    resetFilters 
  } = useGastosFilter(gastos);

  const { 
    stats, 
    distribucionCategorias, 
    tendenciaMensual, 
    topProveedores, 
    alertas 
  } = useGastosStats(gastos);

  const { validateForm } = useGastosValidation();

  // Constantes para el formulario
  const TIPOS_DOCUMENTO = [
    'Boleta', 'Factura', 'Recibo', 'Comprobante', 
    'Orden de Compra', 'Nota de Crédito', 'Nota de Débito'
  ];

  const ESTADOS_GASTO = {
    REGISTRADO: 'Registrado',
    APROBADO: 'Aprobado', 
    PAGADO: 'Pagado',
    RECHAZADO: 'Rechazado',
  };

  // Handlers
  const handleCreateGasto = () => {
    setSelectedGasto(null);
    setShowForm(true);
  };

  const handleEditGasto = (gasto) => {
    setSelectedGasto(gasto);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedGasto(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (selectedGasto) {
        await updateGasto(selectedGasto.id, formData);
      } else {
        await createGasto(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      throw error;
    }
  };

  const handleDeleteGasto = async (gastoId) => {
    try {
      await deleteGasto(gastoId);
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
    }
  };

  const handleAprobarGasto = async (gastoId, aprobadoPor) => {
    try {
      await aprobarGasto(gastoId, aprobadoPor);
    } catch (error) {
      console.error('Error al aprobar gasto:', error);
    }
  };

  const handleRechazarGasto = async (gastoId, motivo) => {
    try {
      await rechazarGasto(gastoId, motivo);
    } catch (error) {
      console.error('Error al rechazar gasto:', error);
    }
  };

  const handleMarcarPagado = async (gastoId, metodoPago) => {
    try {
      await marcarComoPagado(gastoId, metodoPago);
    } catch (error) {
      console.error('Error al marcar como pagado:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Navbar />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-4 max-w-7xl mx-auto"
      >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8" />
              <span>Gestión de Gastos</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Control completo de gastos operacionales, proveedores y documentos
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={refreshGastos}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Actualizar
            </Button>
            
            <Button onClick={handleCreateGasto}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Gasto
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Lista de Gastos</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas principales */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total de Gastos"
                  value={stats?.total_gastos ?? '—'}
                  description="Gastos registrados"
                  icon={Receipt}
                  color="blue"
                  change={`${stats?.gastos_mes ?? '—'} este mes`}
                  changeType="neutral"
                />
                
                <StatsCard
                  title="Monto Total"
                  value={
                    stats?.monto_total != null
                      ? new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          notation: 'compact',
                        }).format(stats.monto_total)
                      : '—'
                  }
                  description="En gastos operacionales"
                  icon={DollarSign}
                  color="green"
                  change={
                    stats?.monto_mes != null
                      ? `${new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          notation: 'compact',
                        }).format(stats.monto_mes)} este mes`
                      : '—'
                  }
                  changeType="increase"
                />
                
                <StatsCard
                  title="Gastos Pendientes"
                  value={stats?.gastos_pendientes ?? '—'}
                  description="Requieren aprobación"
                  icon={Clock}
                  color="yellow"
                  change={
                    stats?.gastos_vencidos > 0
                      ? `${stats.gastos_vencidos} vencidos`
                      : stats?.gastos_vencidos === 0
                        ? 'Al día'
                        : '—'
                  }
                  changeType={
                    stats?.gastos_vencidos > 0
                      ? 'decrease'
                      : stats?.gastos_vencidos === 0
                        ? 'neutral'
                        : 'neutral'
                  }
                />
                
                <StatsCard
                  title="Promedio por Gasto"
                  value={
                    stats?.promedio_gasto != null
                      ? new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(stats.promedio_gasto)
                      : '—'
                  }
                  description="Monto promedio"
                  icon={Target}
                  color="purple"
                  change={
                    stats?.promedio_dias_pago != null
                      ? `${stats.promedio_dias_pago} días prom. pago`
                      : '—'
                  }
                  changeType="neutral"
                />
              </div>
            </motion.div>

            {/* Gráficos y análisis */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GastosPorCategoriaChart data={distribucionCategorias} />
                <TendenciaMensualChart data={tendenciaMensual} />
              </div>
            </motion.div>

            {/* Top proveedores y alertas */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProveedoresCard proveedores={topProveedores} />
                <AlertasGastosCard alertas={alertas} />
              </div>
            </motion.div>

            {/* Resumen de estados */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Resumen por Estados</span>
                  </CardTitle>
                  <CardDescription>
                    Distribución de gastos según su estado actual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-900">
                        {stats?.distribucion_estados?.registrado ?? 0}
                      </p>
                      <p className="text-sm text-blue-600">Registrados</p>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold text-yellow-900">
                        {stats?.distribucion_estados?.aprobado ?? 0}
                      </p>
                      <p className="text-sm text-yellow-600">Aprobados</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CreditCard className="w-8 h-8 mx-auto text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-900">
                        {stats?.distribucion_estados?.pagado ?? 0}
                      </p>
                      <p className="text-sm text-green-600">Pagados</p>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <Ban className="w-8 h-8 mx-auto text-red-600 mb-2" />
                      <p className="text-2xl font-bold text-red-900">
                        {stats?.distribucion_estados?.rechazado ?? 0}
                      </p>
                      <p className="text-sm text-red-600">Rechazados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Lista de Gastos Tab */}
          <TabsContent value="gastos">
            <motion.div variants={itemVariants}>
              <GastosTable
                gastos={filteredGastos}
                isLoading={isLoading}
                filters={filters}
                onFilterChange={updateFilter}
                onResetFilters={resetFilters}
                onCreateGasto={handleCreateGasto}
                onEditGasto={handleEditGasto}
                onDeleteGasto={handleDeleteGasto}
                onAprobarGasto={handleAprobarGasto}
                onRechazarGasto={handleRechazarGasto}
                onMarcarPagado={handleMarcarPagado}
                onRefresh={refreshGastos}
                ESTADOS_GASTO={ESTADOS_GASTO}
                TIPOS_DOCUMENTO={TIPOS_DOCUMENTO}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Formulario de gasto */}
      <GastoForm
        gasto={selectedGasto}
        tiposDocumento={TIPOS_DOCUMENTO}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        isLoading={isLoading}
        validateForm={validateForm}
      />
    </motion.div>
    </>
  );
}

export default GastosPage;

