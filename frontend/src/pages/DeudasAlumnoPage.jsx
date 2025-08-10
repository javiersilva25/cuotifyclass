import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Plus, DollarSign, AlertTriangle, CheckCircle,
  Clock, Ban, RotateCcw, CreditCard, Calendar, Target,
  PieChart, BarChart3, TrendingDown, UserX, GraduationCap
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '../components/ui/select';

import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import { DeudaAlumnoTable } from '../features/deudas/components/DeudaAlumnoTable.jsx';
import { DeudaAlumnoForm } from '../features/deudas/components/DeudaAlumnoForm.jsx';

import {
  useDeudaAlumno,
  useDeudaAlumnoFilter,
  useDeudaAlumnoStats,
  useDeudaAlumnoValidation
} from '../features/deudas/hooks/useDeudaAlumno.js';

import { usePermissions } from '../features/auth/hooks/usePermissions';
import { cn } from '../lib/utils';
import Navbar from '../pages/Navbar';

export function DeudasAlumnoPage() {
  // Usa permisos explícitos
  const { hasPermission } = usePermissions();
  const canViewDeudas = hasPermission('view_deudas');
  const canEditDeudas = hasPermission('edit_deudas');

  const { validateDeudaForm } = useDeudaAlumnoValidation();

  // Estados del formulario
  const [showForm, setShowForm] = useState(false);
  const [editingDeuda, setEditingDeuda] = useState(null);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [deudaPago, setDeudaPago] = useState(null);
  const [showRefinanciarForm, setShowRefinanciarForm] = useState(false);
  const [deudaRefinanciar, setDeudaRefinanciar] = useState(null);

  // Datos
  const {
    deudas,
    isLoading,
    error,
    loadDeudas,
    createDeuda,
    updateDeuda,
    registrarPago,
    condonarDeuda,
    refinanciarDeuda,
    deleteDeuda,
    ESTADOS_DEUDA,
    TIPOS_DEUDA,
  } = useDeudaAlumno();

  const {
    filters,
    filteredDeudas,
    updateFilter,
    resetFilters,
  } = useDeudaAlumnoFilter(deudas);

  const stats = useDeudaAlumnoStats(deudas);

  // Acceso
  if (!canViewDeudas) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                No tienes permisos para ver deudas de alumnos.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const statsData = [
    { title: 'Total Deudas', value: stats.total, icon: 'Users', color: 'blue', description: 'Deudas registradas' },
    { title: 'Monto Total', value: formatCurrency(stats.montoTotal), icon: 'DollarSign', color: 'green', description: 'Valor total de deudas' },
    {
      title: 'Monto Pendiente',
      value: formatCurrency(stats.montoPendiente),
      icon: 'Clock',
      color: 'yellow',
      description: 'Por cobrar',
      trend: { value: stats.efectividadCobranza, direction: stats.efectividadCobranza > 80 ? 'up' : 'down', period: 'efectividad' },
    },
    {
      title: 'Deudas Vencidas',
      value: stats.deudasVencidas,
      icon: 'AlertTriangle',
      color: stats.deudasVencidas > 0 ? 'red' : 'gray',
      description: 'Requieren atención urgente',
    },
  ];

  // Handlers
  const handleCreateDeuda = () => {
    if (!canEditDeudas) return;
    setEditingDeuda(null);
    setShowForm(true);
  };

  const handleEditDeuda = (deuda) => {
    if (!canEditDeudas) return;
    setEditingDeuda(deuda);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDeuda(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (!canEditDeudas) return;
      if (editingDeuda) await updateDeuda(editingDeuda.id, formData);
      else await createDeuda(formData);
      handleCloseForm();
    } catch (e) {
      console.error('Error al guardar deuda:', e);
    }
  };

  const handleRegistrarPago = (deuda) => {
    if (!canEditDeudas) return;
    setDeudaPago(deuda);
    setShowPagoForm(true);
  };

  const handleConfirmarPago = async (datosPago) => {
    if (!canEditDeudas) return;
    if (deudaPago) {
      await registrarPago(deudaPago.id, datosPago.monto_pago, datosPago.metodo_pago);
      setShowPagoForm(false);
      setDeudaPago(null);
    }
  };

  const handleCondonarDeuda = async (id) => {
    if (!canEditDeudas) return;
    const motivo = prompt('Ingresa el motivo de la condonación:');
    if (motivo) await condonarDeuda(id, motivo);
  };

  const handleRefinanciarDeuda = (deuda) => {
    if (!canEditDeudas) return;
    setDeudaRefinanciar(deuda);
    setShowRefinanciarForm(true);
  };

  const handleConfirmarRefinanciacion = async (nuevoPlan) => {
    if (!canEditDeudas) return;
    if (deudaRefinanciar) {
      await refinanciarDeuda(deudaRefinanciar.id, nuevoPlan);
      setShowRefinanciarForm(false);
      setDeudaRefinanciar(null);
    }
  };

  const pageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <>
      <Navbar />
      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deudas de Alumnos</h1>
            <p className="text-gray-600 mt-1">Gestión completa de deudas pendientes por alumno</p>
          </div>
          <Button onClick={handleCreateDeuda} size="lg" disabled={!canEditDeudas}>
            <Plus className="w-5 h-5 mr-2" />
            Nueva Deuda
          </Button>
        </div>

        {/* Estadísticas */}
        <StatsGrid stats={statsData} />

        {/* Resumen de morosidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Resumen de Morosidad</span>
            </CardTitle>
            <CardDescription>Estado actual de la gestión de deudas de alumnos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Efectividad de Cobranza</span>
                  <span className={cn(
                    'text-sm font-bold',
                    stats.efectividadCobranza > 80 ? 'text-green-600'
                      : stats.efectividadCobranza > 60 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {stats.efectividadCobranza.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.efectividadCobranza} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pagado: {formatCurrency(stats.montoPagado)}</span>
                  <span>Total: {formatCurrency(stats.montoTotal)}</span>
                </div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Alumnos con Deudas</p>
                <p className="text-2xl font-bold text-orange-700">{stats.alumnosConDeudas}</p>
                <p className="text-xs text-orange-600 mt-1">{stats.activas} deudas activas</p>
              </div>

              <div className={cn(
                'text-center p-4 rounded-lg',
                stats.promedioDiasVencidos > 30 ? 'bg-red-50'
                  : stats.promedioDiasVencidos > 15 ? 'bg-yellow-50' : 'bg-green-50'
              )}>
                <p className={cn(
                  'text-sm font-medium',
                  stats.promedioDiasVencidos > 30 ? 'text-red-600'
                    : stats.promedioDiasVencidos > 15 ? 'text-yellow-600' : 'text-green-600'
                )}>
                  Promedio Días Vencidos
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  stats.promedioDiasVencidos > 30 ? 'text-red-700'
                    : stats.promedioDiasVencidos > 15 ? 'text-yellow-700' : 'text-green-700'
                )}>
                  {stats.promedioDiasVencidos.toFixed(0)}
                </p>
                <p className={cn('text-xs mt-1',
                  stats.promedioDiasVencidos > 30 ? 'text-red-600'
                    : stats.promedioDiasVencidos > 15 ? 'text-yellow-600' : 'text-green-600')}>
                  días promedio
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
              <CardDescription>Cantidad de deudas por estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.porEstado).sort(([a], [b]) => a.localeCompare(b)).map(([estado, cantidad]) => {
                  const colors = {
                    Pendiente: 'text-yellow-600 bg-yellow-50',
                    Pagada: 'text-green-600 bg-green-50',
                    Vencida: 'text-red-600 bg-red-50',
                    Condonada: 'text-purple-600 bg-purple-50',
                    Refinanciada: 'text-blue-600 bg-blue-50',
                  };
                  const icons = { Pendiente: Clock, Pagada: CheckCircle, Vencida: AlertTriangle, Condonada: Ban, Refinanciada: RotateCcw };
                  const Icon = icons[estado] || Clock;
                  return (
                    <motion.div key={estado} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                      className={cn('text-center p-4 rounded-lg', colors[estado] || 'text-gray-600 bg-gray-50')}>
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{cantidad}</p>
                      <p className="text-sm font-medium">{estado}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Por tipo y planes de pago */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.keys(stats.porTipo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Por Tipo de Deuda</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.porTipo).sort(([, a], [, b]) => b - a).slice(0, 5).map(([tipo, cantidad]) => (
                    <div key={tipo} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{tipo}</span>
                        <span className="text-gray-600">{cantidad} deudas</span>
                      </div>
                      <Progress value={(cantidad / (stats.total || 1)) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Gestión de Planes de Pago</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Con Plan de Pago</p>
                      <p className="text-sm text-blue-600">Deudas refinanciadas</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{stats.conPlanPago}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserX className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Sin Plan de Pago</p>
                      <p className="text-sm text-gray-600">Deudas tradicionales</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">{stats.total - stats.conPlanPago}</p>
                </div>

                {stats.conPlanPago > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Planes de Pago</span>
                      <span>{((stats.conPlanPago / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.conPlanPago / stats.total) * 100} className="h-2" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen del mes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Resumen del Mes Actual</span>
            </CardTitle>
            <CardDescription>Actividad de deudas en el mes en curso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-3 text-red-600" />
                <p className="text-3xl font-bold text-red-700">{stats.deudasEsteMes}</p>
                <p className="text-red-600 font-medium">Deudas Creadas</p>
                <p className="text-sm text-red-500 mt-1">Este mes</p>
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <DollarSign className="w-8 h-8 mx-auto mb-3 text-orange-600" />
                <p className="text-3xl font-bold text-orange-700">{formatCurrency(stats.montoEsteMes)}</p>
                <p className="text-orange-600 font-medium">Monto Total</p>
                <p className="text-sm text-orange-500 mt-1">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de morosidad */}
        {stats.deudasVencidas > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Alertas de Morosidad</span>
              </CardTitle>
              <CardDescription className="text-red-600">Deudas que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700">{stats.deudasVencidas}</p>
                  <p className="text-sm text-red-600 font-medium">Deudas Vencidas</p>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(stats.montoVencido)}</p>
                  <p className="text-sm text-red-600 font-medium">Monto Vencido</p>
                </div>
                <div className="text-center p-4 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-700">{stats.promedioDiasVencidos.toFixed(0)}</p>
                  <p className="text-sm text-red-600 font-medium">Días Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        <DeudaAlumnoTable
          deudas={filteredDeudas}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onCreateDeuda={handleCreateDeuda}
          onEditDeuda={handleEditDeuda}
          onRegistrarPago={handleRegistrarPago}
          onCondonarDeuda={handleCondonarDeuda}
          onRefinanciarDeuda={handleRefinanciarDeuda}
          onDeleteDeuda={deleteDeuda}
          onRefresh={loadDeudas}
          ESTADOS_DEUDA={ESTADOS_DEUDA}
          TIPOS_DEUDA={TIPOS_DEUDA}
          canEdit={canEditDeudas}
        />

        {/* Formulario de deuda */}
        <DeudaAlumnoForm
          deuda={editingDeuda}
          tiposDeuda={TIPOS_DEUDA}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          validateForm={validateDeudaForm}
          readOnly={!canEditDeudas}
        />

        {/* Modal pago */}
        {showPagoForm && deudaPago && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Registrar Pago</CardTitle>
                <CardDescription>
                  {deudaPago.concepto} - {formatCurrency(deudaPago.monto_pendiente)} pendiente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Monto del Pago</Label>
                  <Input type="number" placeholder="Monto a pagar" max={deudaPago.monto_pendiente} defaultValue={deudaPago.monto_pendiente} />
                </div>
                <div>
                  <Label>Método de Pago</Label>
                  <Select defaultValue="Efectivo">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Transferencia">Transferencia</SelectItem>
                      <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                      <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowPagoForm(false)} className="flex-1">Cancelar</Button>
                  <Button onClick={() => handleConfirmarPago({ monto_pago: deudaPago.monto_pendiente, metodo_pago: 'Efectivo' })} className="flex-1">
                    Confirmar Pago
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Modal refinanciación */}
        {showRefinanciarForm && deudaRefinanciar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Refinanciar Deuda</CardTitle>
                <CardDescription>
                  {deudaRefinanciar.concepto} - {formatCurrency(deudaRefinanciar.monto_pendiente)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nueva Fecha de Vencimiento</Label>
                  <Input type="date" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Descripción del Plan</Label>
                  <Textarea placeholder="Describe el nuevo plan de pago..." rows={3} />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowRefinanciarForm(false)} className="flex-1">Cancelar</Button>
                  <Button
                    onClick={() =>
                      handleConfirmarRefinanciacion({
                        nueva_fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split('T')[0],
                        descripcion: 'Plan de pago refinanciado',
                      })
                    }
                    className="flex-1"
                  >
                    Refinanciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-4 right-4 z-50">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

export default DeudasAlumnoPage;
