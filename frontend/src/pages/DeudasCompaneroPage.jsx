import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake, Plus, DollarSign, AlertTriangle, CheckCircle, Clock, Ban,
  Users, Calendar, Target, PieChart, BarChart3, TrendingDown,
  UserCheck, UserX, Network, GraduationCap
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
import { usePermissions } from '../features/auth/hooks/usePermissions';
import { cn } from '../lib/utils';
import Navbar from '../pages/Navbar';

const ALUMNOS_MOCK = [
  { id: 1, nombre: 'Juan Carlos Pérez', curso: '8° Básico A' },
  { id: 2, nombre: 'Ana María González', curso: '7° Básico B' },
  { id: 3, nombre: 'Carlos Eduardo Morales', curso: '1° Medio A' },
  { id: 4, nombre: 'Sofía Alejandra Ruiz', curso: '6° Básico A' },
  { id: 5, nombre: 'Diego Andrés López', curso: '2° Medio B' },
];

export function DeudasCompaneroPage() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('view_deudas');
  const canEdit = hasPermission('edit_deudas');
  const { validateDeudaForm } = useDeudaCompaneroValidation();

  const [showForm, setShowForm] = useState(false);
  const [editingDeuda, setEditingDeuda] = useState(null);

  const {
    deudas, isLoading, error, loadDeudas, createDeuda, updateDeuda,
    marcarComoPagada, cancelarDeuda, reactivarDeuda, deleteDeuda,
    ESTADOS_DEUDA_COMPANERO, TIPOS_DEUDA_COMPANERO,
  } = useDeudaCompanero();

  const {
    filters, filteredDeudas, updateFilter, resetFilters,
  } = useDeudaCompaneroFilter(deudas);

  const stats = useDeudaCompaneroStats(deudas);

  // Acceso
  if (!canView) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
              <p className="text-gray-600">No tienes permisos para ver deudas entre compañeros.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount || 0);

  const statsData = [
    { title: 'Total Préstamos', value: stats.total, icon: 'Handshake', color: 'blue', description: 'Préstamos registrados' },
    { title: 'Monto Total', value: formatCurrency(stats.montoTotal), icon: 'DollarSign', color: 'green', description: 'Valor total prestado' },
    { title: 'Monto Pendiente', value: formatCurrency(stats.montoPendiente), icon: 'Clock', color: 'yellow', description: 'Por devolver',
      trend: { value: stats.efectividadPago, direction: stats.efectividadPago > 80 ? 'up' : 'down', period: 'efectividad' } },
    { title: 'Préstamos Vencidos', value: stats.deudasVencidas, icon: 'AlertTriangle', color: stats.deudasVencidas > 0 ? 'red' : 'gray',
      description: 'Requieren seguimiento' },
  ];

  // Handlers
  const handleCreateDeuda = () => { if (!canEdit) return; setEditingDeuda(null); setShowForm(true); };
  const handleEditDeuda = (deuda) => { if (!canEdit) return; setEditingDeuda(deuda); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditingDeuda(null); };

  const handleSubmitForm = async (formData) => {
    if (!canEdit) return;
    try {
      if (editingDeuda) await updateDeuda(editingDeuda.id, formData);
      else await createDeuda(formData);
      handleCloseForm();
    } catch (e) { console.error('Error al guardar deuda:', e); }
  };

  const handleMarcarPagada = async (id) => {
    if (!canEdit) return;
    const metodo = prompt('¿Cómo se realizó el pago?', 'Efectivo');
    if (metodo) await marcarComoPagada(id, metodo);
  };

  const handleCancelarDeuda = async (id, motivo) => { if (canEdit) await cancelarDeuda(id, motivo); };
  const handleReactivarDeuda = async (id) => { if (canEdit) await reactivarDeuda(id); };

  const pageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <>
      <Navbar />
      <motion.div variants={pageVariants} initial="hidden" animate="visible" className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deudas entre Compañeros</h1>
            <p className="text-gray-600 mt-1">Gestión de préstamos y deudas entre estudiantes</p>
          </div>
          <Button onClick={handleCreateDeuda} size="lg" disabled={!canEdit}>
            <Plus className="w-5 h-5 mr-2" /> Nuevo Préstamo
          </Button>
        </div>

        {/* Estadísticas */}
        <StatsGrid stats={statsData} />

        {/* …(resto del componente tal cual lo tienes, sin referencias a canManageCursos)… */}

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

        <DeudaCompaneroForm
          deuda={editingDeuda}
          alumnos={ALUMNOS_MOCK}
          tiposDeuda={TIPOS_DEUDA_COMPANERO}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          validateForm={validateDeudaForm}
          readOnly={!canEdit}
        />
        {/* manejo de error igual que antes */}
      </motion.div>
    </>
  );
}

export default DeudasCompaneroPage;
