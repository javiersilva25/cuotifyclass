import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  BarChart3, 
  List,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Home,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Ban,
  DollarSign,
  Calendar,
  Activity,
  Target,
  Zap,
  PieChart,
  LineChart,
  UserCheck,
  UserX,
  Wallet,
  CreditCard,
  Building,
  Award,
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
  ComposedChart,
  Line,
  Pie
} from 'recharts';
import { cn } from '../lib/utils';
import { useMovimientoCcpp, useMovimientoCcppStats } from '../features/movimientos-ccpp/hooks/useMovimientoCcpp';
import { MovimientoCcppTable } from '../features/movimientos-ccpp/components/MovimientoCcppTable';
import { MovimientoCcppForm } from '../features/movimientos-ccpp/components/MovimientoCcppForm';
import  Navbar  from '../pages/Navbar.jsx';

// Componente para tarjetas de estadísticas duales
function StatsCardDual({ 
  title, 
  valuePadres, 
  valueProfesores, 
  subtitlePadres, 
  subtitleProfesores, 
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className={cn(
              "p-2 rounded-lg border",
              colorClasses[color]
            )}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          
          {/* Padres */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <Home className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Padres</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{valuePadres}</p>
            {subtitlePadres && (
              <p className="text-sm text-gray-500">{subtitlePadres}</p>
            )}
          </div>
          
          {/* Profesores */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Profesores</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{valueProfesores}</p>
            {subtitleProfesores && (
              <p className="text-sm text-gray-500">{subtitleProfesores}</p>
            )}
          </div>
          
          {trend && (
            <div className="flex items-center space-x-1 mt-3 pt-3 border-t">
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
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para tarjetas de estadísticas simples
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

// Componente para gráfico comparativo padres vs profesores
function ComparativoPadresProfesores({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Comparativo Padres vs Profesores</span>
        </CardTitle>
        <CardDescription>
          Análisis mensual de movimientos por tipo de usuario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
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
                  name === 'padres' ? 'Padres' : 'Profesores'
                ]}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="padres"
                fill="#3b82f6"
                name="Padres"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="profesores"
                fill="#8b5cf6"
                name="Profesores"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                name="Total"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para distribución por categorías
function DistribucionCategorias({ data }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="w-5 h-5" />
          <span>Distribución por Categorías</span>
        </CardTitle>
        <CardDescription>
          Movimientos por tipo de actividad CCPP
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
              {Array.isArray(data) && data.map((entry, index) => (
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

// Componente para top usuarios
function TopUsuarios({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Award className="w-5 h-5" />
          <span>Top Usuarios CCPP</span>
        </CardTitle>
        <CardDescription>
          Usuarios con mayor actividad financiera
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.isArray(data) && data.map((usuario, index) => (
            <motion.div
              key={usuario.nombre}
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
                
                <div className="flex items-center space-x-2">
                  {usuario.tipo_usuario === 'Padre' ? (
                    <Home className="w-4 h-4 text-blue-600" />
                  ) : (
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{usuario.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {usuario.tipo_usuario} • {usuario.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(usuario.monto_total)}
                </p>
                <p className="text-sm text-gray-500">
                  {usuario.cantidad} movimientos
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para resumen de estados
function ResumenEstados({ data }) {
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pendiente': return Clock;
      case 'Procesado': return CheckCircle;
      case 'Aprobado': return CheckCircle;
      case 'Rechazado': return Ban;
      default: return AlertTriangle;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Procesado': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Aprobado': return 'text-green-600 bg-green-50 border-green-200';
      case 'Rechazado': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Resumen de Estados</span>
        </CardTitle>
        <CardDescription>
          Distribución de movimientos por estado de procesamiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(data) && data.map((item) => {
            const EstadoIcon = getEstadoIcon(item.estado);
            
            return (
              <motion.div
                key={item.estado}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                  getEstadoColor(item.estado)
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <EstadoIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.estado}</span>
                    </div>
                    <p className="text-2xl font-bold">{item.cantidad}</p>
                    <p className="text-sm opacity-75">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                        notation: 'compact',
                      }).format(item.monto)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para alertas específicas CCPP
function AlertasCcpp({ alertas }) {
  if (!alertas || alertas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Estado del Sistema CCPP</span>
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
          <span>Alertas CCPP</span>
        </CardTitle>
        <CardDescription>
          Movimientos de padres y profesores que requieren atención
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
export function MovimientoCcppPage() {
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
  } = useMovimientoCcpp();

  const {
    estadisticasPrincipales,
    distribucionCategorias,
    comparativoPadresProfesores,
    topUsuarios,
    resumenEstados,
    alertas,
  } = useMovimientoCcppStats();

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
              {editingMovimiento ? 'Editar Movimiento CCPP' : 'Nuevo Movimiento CCPP'}
            </h1>
            <p className="text-gray-600">
              {editingMovimiento 
                ? 'Modifica la información del movimiento de padres y profesores'
                : 'Registra un nuevo movimiento de cuenta corriente de padres y profesores'
              }
            </p>
          </div>
        </div>

        <MovimientoCcppForm
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
              <Users className="w-7 h-7" />
              <span>Movimientos CCPP</span>
            </h1>
            <p className="text-gray-600">
              Gestión de movimientos de cuentas corrientes de padres y profesores
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
            {/* Estadísticas principales duales */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCardDual
                  title="Total Ingresos"
                  valuePadres={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.ingresos_padres ?? 0)}
                  valueProfesores={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.ingresos_profesores ?? 0)}
                  subtitlePadres={`${estadisticasPrincipales?.cantidad_ingresos_padres ?? 0} movimientos`}
                  subtitleProfesores={`${estadisticasPrincipales?.cantidad_ingresos_profesores ?? 0} movimientos`}
                  icon={TrendingUp}
                  color="green"
                  trend="up"
                  trendValue="+15.3% vs mes anterior"
                />
                
                <StatsCardDual
                  title="Total Egresos"
                  valuePadres={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.egresos_padres ?? 0)}
                  valueProfesores={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.egresos_profesores ?? 0)}
                  subtitlePadres={`${estadisticasPrincipales?.cantidad_egresos_padres ?? 0} movimientos`}
                  subtitleProfesores={`${estadisticasPrincipales?.cantidad_egresos_profesores ?? 0} movimientos`}
                  icon={TrendingDown}
                  color="red"
                  trend="down"
                  trendValue="-5.7% vs mes anterior"
                />
                
                <StatsCardDual
                  title="Transferencias"
                  valuePadres={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.transferencias_padres ?? 0)}
                  valueProfesores={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.transferencias_profesores ?? 0)}
                  subtitlePadres={`${estadisticasPrincipales?.cantidad_transferencias_padres ?? 0} movimientos`}
                  subtitleProfesores={`${estadisticasPrincipales?.cantidad_transferencias_profesores ?? 0} movimientos`}
                  icon={ArrowRightLeft}
                  color="blue"
                  trend="up"
                  trendValue="+22.1% vs mes anterior"
                />
              </div>
            </motion.div>

            {/* Métricas adicionales */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Usuarios Activos"
                  value={estadisticasPrincipales?.usuarios_activos ?? 0}
                  subtitle={`${estadisticasPrincipales?.padres_activos ?? 0} padres, ${estadisticasPrincipales?.profesores_activos ?? 0} profesores`}
                  icon={Users}
                  color="blue"
                />
                
                <StatsCard
                  title="Efectividad Procesamiento"
                  value={`${estadisticasPrincipales?.efectividad_procesamiento ?? 0}%`}
                  subtitle={`${estadisticasPrincipales?.procesados ?? 0}/${estadisticasPrincipales?.total ?? 0} movimientos`}
                  icon={Zap}
                  color="green"
                />
                
                <StatsCard
                  title="Promedio por Movimiento"
                  value={new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(estadisticasPrincipales?.promedio_movimiento ?? 0)}
                  subtitle="Basado en últimos 30 días"
                  icon={Target}
                  color="purple"
                />
                
                <StatsCard
                  title="Días Promedio Procesamiento"
                  value={`${estadisticasPrincipales?.dias_promedio_procesamiento ?? 0} días`}
                  subtitle="Tiempo de aprobación"
                  icon={Clock}
                  color="orange"
                />
              </div>
            </motion.div>

            {/* Alertas CCPP */}
            <motion.div variants={itemVariants}>
              <AlertasCcpp alertas={alertas} />
            </motion.div>

            {/* Gráficos principales */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ComparativoPadresProfesores data={comparativoPadresProfesores} />
                <DistribucionCategorias data={distribucionCategorias} />
              </div>
            </motion.div>

            {/* Resumen de estados y top usuarios */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResumenEstados data={resumenEstados} />
                <TopUsuarios data={topUsuarios} />
              </div>
            </motion.div>
          </TabsContent>

          {/* Lista Tab */}
          <TabsContent value="lista" className="space-y-6">
            <motion.div variants={itemVariants}>
              <MovimientoCcppTable
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

export default MovimientoCcppPage;

