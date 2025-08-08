import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BarChart3, 
  List,
  Building,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Percent,
  CreditCard,
  Clock,
  CheckCircle,
  Shield,
  Ban,
  AlertTriangle,
  DollarSign,
  Calendar,
  Users,
  Activity,
  Target,
  Zap,
  PieChart,
  LineChart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { useMovimientoCcaa, useMovimientoCcaaStats } from '../features/movimientos-ccaa/hooks/useMovimientoCcaa';
import { MovimientoCcaaTable } from '../features/movimientos-ccaa/components/MovimientoCcaaTable';
import { MovimientoCcaaForm } from '../features/movimientos-ccaa/components/MovimientoCcaaForm';
import  Navbar  from '../pages/Navbar.jsx';


// Componente para tarjetas de estadísticas
function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue',
  onClick 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          onClick && "hover:bg-gray-50"
        )}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center space-x-1">
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  ) : (
                    <ArrowRightLeft className="w-3 h-3 text-gray-500" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    trend === 'up' && "text-green-600",
                    trend === 'down' && "text-red-600",
                    trend === 'neutral' && "text-gray-600"
                  )}>
                    {trendValue}
                  </span>
                </div>
              )}
            </div>
            
            <div className={cn(
              "p-3 rounded-lg border",
              colorClasses[color]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para gráfico de tendencia mensual
function TendenciaMensual({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <LineChart className="w-5 h-5" />
          <span>Tendencia Mensual de Movimientos</span>
        </CardTitle>
        <CardDescription>
          Flujo de ingresos, egresos y neto de los últimos 6 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
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
                formatter={(value, name) => [
                  new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                  }).format(value),
                  name === 'ingresos' ? 'Ingresos' : 
                  name === 'egresos' ? 'Egresos' : 'Flujo Neto'
                ]}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="egresos"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Egresos"
              />
              <Area
                type="monotone"
                dataKey="neto"
                stackId="3"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
                name="Flujo Neto"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para distribución por bancos
function DistribucionBancos({ data }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Distribución por Bancos</span>
        </CardTitle>
        <CardDescription>
          Movimientos y montos por institución bancaria
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
                  'Monto Total'
                ]}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para top ejecutivos
function TopEjecutivos({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Top Ejecutivos Bancarios</span>
        </CardTitle>
        <CardDescription>
          Ejecutivos con mayor volumen de movimientos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(data) &&
            data.map((ejecutivo, index) => (
              <motion.div
                key={ejecutivo.nombre}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                  index === 0 && "bg-yellow-500",
                  index === 1 && "bg-gray-400",
                  index === 2 && "bg-orange-600",
                  index > 2 && "bg-blue-500"
                )}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ejecutivo.nombre}</p>
                  <p className="text-sm text-gray-500">{ejecutivo.banco}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(ejecutivo.monto_total)}
                </p>
                <p className="text-sm text-gray-500">
                  {ejecutivo.cantidad} movimientos
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para alertas de gestión
function AlertasGestion({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Estado del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">No hay alertas pendientes</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <span>Alertas de Gestión</span>
        </CardTitle>
        <CardDescription>
          Movimientos que requieren atención
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertas.map((alerta, index) => (
          <Alert key={index} className={cn(
            alerta.tipo === 'error' && "border-red-200 bg-red-50",
            alerta.tipo === 'warning' && "border-orange-200 bg-orange-50",
            alerta.tipo === 'info' && "border-blue-200 bg-blue-50"
          )}>
            <AlertTriangle className={cn(
              "h-4 w-4",
              alerta.tipo === 'error' && "text-red-600",
              alerta.tipo === 'warning' && "text-orange-600",
              alerta.tipo === 'info' && "text-blue-600"
            )} />
            <AlertDescription className="flex items-center justify-between">
              <span>{alerta.mensaje}</span>
              <Badge variant="outline" className="ml-2">
                {alerta.cantidad}
              </Badge>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}

// Componente principal de la página
export function MovimientoCcaaPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingMovimiento, setEditingMovimiento] = useState(null);

  // Hooks para datos y estadísticas
  const { 
    movimientos, 
    isLoading, 
    createMovimiento, 
    updateMovimiento, 
    deleteMovimiento 
  } = useMovimientoCcaa();

  const {
    estadisticasPrincipales,
    distribucionBancos,
    tendenciaMensual,
    topEjecutivos,
    alertas,
  } = useMovimientoCcaaStats();

  // Manejar creación de movimiento
  const handleCreateMovimiento = async (data) => {
    try {
      await createMovimiento(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error al crear movimiento:', error);
    }
  };

  // Manejar edición de movimiento
  const handleEditMovimiento = (movimiento) => {
    setEditingMovimiento(movimiento);
    setShowForm(true);
  };

  // Manejar actualización de movimiento
  const handleUpdateMovimiento = async (data) => {
    try {
      await updateMovimiento(editingMovimiento.id, data);
      setEditingMovimiento(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error al actualizar movimiento:', error);
    }
  };

  // Manejar eliminación de movimiento
  const handleDeleteMovimiento = async (id) => {
    try {
      await deleteMovimiento(id);
    } catch (error) {
      console.error('Error al eliminar movimiento:', error);
    }
  };

  // Cancelar formulario
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMovimiento(null);
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

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingMovimiento ? 'Editar Movimiento CCAA' : 'Nuevo Movimiento CCAA'}
            </h1>
            <p className="text-gray-600">
              {editingMovimiento 
                ? 'Modifica la información del movimiento bancario'
                : 'Registra un nuevo movimiento de cuenta corriente de ahorro y aporte'
              }
            </p>
          </div>
        </div>

        <MovimientoCcaaForm
          initialData={editingMovimiento}
          isEditing={!!editingMovimiento}
          isLoading={isLoading}
          onSubmit={editingMovimiento ? handleUpdateMovimiento : handleCreateMovimiento}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <>
          <Navbar /> {/* ✅ Sección navbar agregada */}
    
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Building className="w-7 h-7" />
              <span>Movimientos CCAA</span>
            </h1>
            <p className="text-gray-600">
              Gestión de movimientos de cuentas corrientes de ahorro y aporte
            </p>
          </div>
          
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </Button>
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
            <TabsTrigger value="lista" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>Lista de Movimientos</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas principales */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Depósitos"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.depositos ?? 0)}
                  subtitle={`${estadisticasPrincipales?.cantidad_depositos ?? 0} movimientos`}
                  icon={TrendingUp}
                  color="green"
                  trend="up"
                  trendValue="+12.5% vs mes anterior"
                />
                
                <StatsCard
                  title="Total Retiros"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.retiros ?? 0)}
                  subtitle={`${estadisticasPrincipales?.cantidad_retiros ?? 0} movimientos`}
                  icon={TrendingDown}
                  color="red"
                  trend="down"
                  trendValue="-3.2% vs mes anterior"
                />
                
                <StatsCard
                  title="Transferencias"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.transferencias ?? 0)}
                  subtitle={`${estadisticasPrincipales?.cantidad_transferencias ?? 0} movimientos`}
                  icon={ArrowRightLeft}
                  color="blue"
                  trend="up"
                  trendValue="+8.7% vs mes anterior"
                />
                
                <StatsCard
                  title="Flujo Neto"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.flujo_neto ?? 0)}
                  subtitle="Ingresos - Egresos"
                  icon={Activity}
                  color={estadisticasPrincipales?.flujo_neto >= 0 ? 'green' : 'red'}
                  trend={estadisticasPrincipales?.flujo_neto >= 0 ? 'up' : 'down'}
                  trendValue={estadisticasPrincipales?.flujo_neto >= 0 ? 'Positivo' : 'Negativo'}
                />
              </div>
            </motion.div>

            {/* Métricas adicionales */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Intereses Generados"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.intereses ?? 0)}
                  subtitle={`${estadisticasPrincipales?.cantidad_intereses ?? 0} movimientos`}
                  icon={Percent}
                  color="purple"
                />
                
                <StatsCard
                  title="Comisiones Pagadas"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.comisiones ?? 0)}
                  subtitle={`${estadisticasPrincipales?.cantidad_comisiones ?? 0} movimientos`}
                  icon={CreditCard}
                  color="orange"
                />
                
                <StatsCard
                  title="Tasa Conciliación"
                  value={`${estadisticasPrincipales?.tasa_conciliacion ?? 0}%`}
                  subtitle={`${estadisticasPrincipales?.conciliados ?? 0}/${estadisticasPrincipales?.total ?? 0} movimientos`}
                  icon={Shield}
                  color="blue"
                />
                
                <StatsCard
                  title="Saldo Estimado"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.saldo_actual ?? 0)}
                  subtitle="Basado en último conciliado"
                  icon={Target}
                  color="green"
                />
              </div>
            </motion.div>

            {/* Alertas de gestión */}
            <motion.div variants={itemVariants}>
              <AlertasGestion alertas={alertas} />
            </motion.div>

            {/* Gráficos */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TendenciaMensual data={tendenciaMensual} />
                <DistribucionBancos data={distribucionBancos} />
              </div>
            </motion.div>

            {/* Top ejecutivos */}
            <motion.div variants={itemVariants}>
              <TopEjecutivos data={topEjecutivos} />
            </motion.div>
          </TabsContent>

          {/* Lista Tab */}
          <TabsContent value="lista" className="space-y-6">
            <motion.div variants={itemVariants}>
              <MovimientoCcaaTable
                movimientos={movimientos}
                isLoading={isLoading}
                onEdit={handleEditMovimiento}
                onDelete={handleDeleteMovimiento}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
    </>
  );
}

export default MovimientoCcaaPage;

