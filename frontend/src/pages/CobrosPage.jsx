import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  PieChart,
  CreditCard,
  Calendar,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import { CobrosTable } from '../features/cobros/components/CobrosTable.jsx';
import CobroForm from '../features/cobros/components/CobroForm.jsx';
import { 
  useCobros, 
  useCobrosFilter, 
  useCobrosStats,
  useCobroValidation
} from '../features/cobros/hooks/useCobros.js';
import { usePermissions } from "../features/auth/hooks/usePermissions";
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import  Navbar  from '../pages/Navbar';

export function CobrosPage() {
  const { canManageFinanzas } = usePermissions();
  const { validateCobroForm } = useCobroValidation();
  
  // Estados del formulario
  const [showForm, setShowForm] = useState(false);
  const [editingCobro, setEditingCobro] = useState(null);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [cobroPago, setCobroPago] = useState(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState("Efectivo");

  
  // Hooks de datos
  const {
    cobros,
    isLoading,
    error,
    loadCobros,
    createCobro,
    updateCobro,
    marcarComoPagado,
    cancelarCobro,
    reactivarCobro,
  } = useCobros();

  const {
    filters,
    filteredCobros,
    updateFilter,
    resetFilters,
  } = useCobrosFilter(cobros);

  const stats = useCobrosStats(cobros);

  // Verificar permisos
  if (!canManageFinanzas) {
    return (
      <>
              <Navbar />
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Acceso Restringido
            </h3>
            <p className="text-gray-600">
              No tienes permisos para gestionar cobros.
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
      title: 'Total Cobros',
      value: stats.total,
      icon: 'Receipt',
      color: 'blue',
      description: 'Cobros registrados',
    },
    {
      title: 'Monto Total',
      value: formatCurrency(stats.montoTotal),
      icon: 'DollarSign',
      color: 'green',
      description: 'Valor total de cobros',
    },
    {
      title: 'Cobrado',
      value: formatCurrency(stats.montoPagado),
      icon: 'CheckCircle',
      color: 'emerald',
      description: 'Monto ya cobrado',
      trend: {
        value: stats.efectividadCobranza,
        direction: stats.efectividadCobranza > 80 ? 'up' : 'down',
        period: 'efectividad',
      },
    },
    {
      title: 'Cobros Vencidos',
      value: stats.cobrosVencidos,
      icon: 'AlertTriangle',
      color: stats.cobrosVencidos > 0 ? 'red' : 'gray',
      description: 'Requieren atención',
    },
  ];

  // Handlers
  const handleCreateCobro = () => {
    setEditingCobro(null);
    setShowForm(true);
  };

  const handleEditCobro = (cobro) => {
    setEditingCobro(cobro);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCobro(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingCobro) {
        await updateCobro(editingCobro.id, formData);
      } else {
        await createCobro(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar cobro:', error);
    }
  };

  const handleMarcarPagado = (cobro) => {
    setCobroPago(cobro);
    setShowPagoForm(true);
  };

  const handleConfirmarPago = async (datosPago) => {
    if (cobroPago) {
      await marcarComoPagado(cobroPago.id, datosPago);
      setShowPagoForm(false);
      setCobroPago(null);
    }
  };

  const handleCancelarCobro = async (id) => {
    const motivo = prompt('Ingresa el motivo de la cancelación:');
    if (motivo) {
      await cancelarCobro(id, motivo);
    }
  };

  const handleReactivarCobro = async (id) => {
    await reactivarCobro(id);
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
      <Navbar /> {/* ✅ Sección navbar agregada */}

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 p-4 max-w-7xl mx-auto"
      >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Cobros
          </h1>
          <p className="text-gray-600 mt-1">
            Administra todos los cobros generales y por alumno
          </p>
        </div>
        
        <Button onClick={handleCreateCobro} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Cobro
        </Button>
      </div>

      {/* Estadísticas */}
      <StatsGrid stats={statsData} />

      {/* Resumen de cobranza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Resumen de Cobranza</span>
          </CardTitle>
          <CardDescription>
            Estado actual de la gestión de cobros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Efectividad de Cobranza */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Efectividad de Cobranza</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats.efectividadCobranza > 80 ? "text-green-600" : 
                  stats.efectividadCobranza > 60 ? "text-yellow-600" : "text-red-600"
                )}>
                  {stats.efectividadCobranza.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={stats.efectividadCobranza} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Cobrado: {formatCurrency(stats.montoPagado)}</span>
                <span>Total: {formatCurrency(stats.montoTotal)}</span>
              </div>
            </div>

            {/* Pendiente de Cobro */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">
                Pendiente de Cobro
              </p>
              <p className="text-2xl font-bold text-yellow-700">
                {formatCurrency(stats.montoPendiente)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {stats.porEstado.Pendiente || 0} cobros pendientes
              </p>
            </div>

            {/* Cobros Vencidos */}
            <div className={cn(
              "text-center p-4 rounded-lg",
              stats.cobrosVencidos > 0 ? "bg-red-50" : "bg-green-50"
            )}>
              <p className={cn(
                "text-sm font-medium",
                stats.cobrosVencidos > 0 ? "text-red-600" : "text-green-600"
              )}>
                {stats.cobrosVencidos > 0 ? 'Cobros Vencidos' : 'Sin Vencidos'}
              </p>
              <p className={cn(
                "text-2xl font-bold",
                stats.cobrosVencidos > 0 ? "text-red-700" : "text-green-700"
              )}>
                {stats.cobrosVencidos > 0 ? formatCurrency(stats.montoVencido) : '¡Excelente!'}
              </p>
              <p className={cn(
                "text-xs mt-1",
                stats.cobrosVencidos > 0 ? "text-red-600" : "text-green-600"
              )}>
                {stats.cobrosVencidos > 0 ? `${stats.cobrosVencidos} cobros vencidos` : 'Todos al día'}
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
              Cantidad de cobros por estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.porEstado)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([estado, cantidad]) => {
                  const getEstadoColor = (estado) => {
                    const colors = {
                      'Pendiente': 'text-yellow-600 bg-yellow-50',
                      'Pagado': 'text-green-600 bg-green-50',
                      'Vencido': 'text-red-600 bg-red-50',
                      'Por Vencer': 'text-blue-600 bg-blue-50',
                      'Cancelado': 'text-gray-600 bg-gray-50',
                    };
                    return colors[estado] || 'text-gray-600 bg-gray-50';
                  };

                  const getEstadoIcon = (estado) => {
                    const icons = {
                      'Pendiente': Clock,
                      'Pagado': CheckCircle,
                      'Vencido': AlertTriangle,
                      'Por Vencer': Calendar,
                      'Cancelado': Receipt,
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

      {/* Distribución por tipo y categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Tipo */}
        {Object.keys(stats.porTipo).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Por Tipo de Cobro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.porTipo).map(([tipo, cantidad]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {tipo === 'General' ? (
                        <Users className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Receipt className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="font-medium">{tipo}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{cantidad}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Por Categoría */}
        {Object.keys(stats.porCategoria).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Por Categoría</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.porCategoria)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([categoria, cantidad]) => (
                    <div key={categoria} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{categoria}</span>
                        <span className="text-gray-600">{cantidad} cobros</span>
                      </div>
                      <Progress 
                        value={(cantidad / stats.activos) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Métodos de pago más usados */}
      {Object.keys(stats.porMetodoPago).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Métodos de Pago Más Usados</span>
            </CardTitle>
            <CardDescription>
              Distribución de métodos de pago en cobros pagados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.porMetodoPago)
                .sort(([,a], [,b]) => b - a)
                .map(([metodo, cantidad]) => (
                  <motion.div
                    key={metodo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center p-4 bg-blue-50 rounded-lg"
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-lg font-bold text-blue-700">{cantidad}</p>
                    <p className="text-sm text-blue-600 font-medium">{metodo}</p>
                  </motion.div>
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
            <span>Resumen del Mes Actual</span>
          </CardTitle>
          <CardDescription>
            Actividad de cobros en el mes en curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <Receipt className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <p className="text-3xl font-bold text-blue-700">{stats.cobrosEsteMes}</p>
              <p className="text-blue-600 font-medium">Cobros Emitidos</p>
              <p className="text-sm text-blue-500 mt-1">Este mes</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(stats.montoEsteMes)}
              </p>
              <p className="text-green-600 font-medium">Monto Total</p>
              <p className="text-sm text-green-500 mt-1">Este mes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de cobros */}
      <CobrosTable
        cobros={filteredCobros}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onCreateCobro={handleCreateCobro}
        onEditCobro={handleEditCobro}
        onMarcarPagado={handleMarcarPagado}
        onCancelarCobro={handleCancelarCobro}
        onReactivarCobro={handleReactivarCobro}
        onRefresh={loadCobros}
      />

      {/* Formulario de cobro */}
      <CobroForm
        cobro={editingCobro}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        validateForm={validateCobroForm}
      />

      {/* Formulario de pago (simplificado para demo) */}
      {showPagoForm && cobroPago && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Registrar Pago</CardTitle>
              <CardDescription>
                {cobroPago.concepto} - {formatCurrency(cobroPago.monto)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Método de Pago</Label>
                <Select 
                  value={metodoPagoSeleccionado}
                  onValueChange={setMetodoPagoSeleccionado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                    <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPagoForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleConfirmarPago({ 
                    metodo_pago: metodoPagoSeleccionado,
                    monto_pagado: cobroPago.monto 
                  })}
                  className="flex-1"
                >
                  Confirmar Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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

export default CobrosPage;

