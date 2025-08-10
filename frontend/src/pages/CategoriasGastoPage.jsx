import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, DollarSign, TrendingUp, AlertTriangle, BarChart3, PieChart, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import { CategoriasGastoTable } from '../features/categorias-gasto/components/CategoriasGastoTable.jsx';
import { CategoriaGastoForm } from '../features/categorias-gasto/components/CategoriaGastoForm.jsx';
import { 
  useCategoriasGasto, 
  useCategoriasGastoFilter, 
  useCategoriasGastoStats,
  useCategoriaGastoValidation,
  useCategoriasHierarchy
} from '../features/categorias-gasto/hooks/useCategoriasGasto.js';
import { usePermissions } from "../features/auth/hooks/usePermissions";
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import  Navbar  from '../pages/Navbar.jsx';

export function CategoriasGastoPage() {
  const { canManageFinanzas } = usePermissions();
  const { validateCategoriaForm } = useCategoriaGastoValidation();
  
  // Estados del formulario
  const [showForm, setShowForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  
  // Hooks de datos
  const {
    categorias,
    isLoading,
    error,
    loadCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    restoreCategoria,
  } = useCategoriasGasto();

  const {
    filters,
    filteredCategorias,
    updateFilter,
    resetFilters,
  } = useCategoriasGastoFilter(categorias);

  const stats = useCategoriasGastoStats(categorias);
  const { getCategoriasPadre } = useCategoriasHierarchy(categorias);

  // Verificar permisos
  if (!canManageFinanzas) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                No tienes permisos para gestionar alumnos.
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
      title: 'Total Categorías',
      value: stats.total,
      icon: 'Tag',
      color: 'blue',
      description: 'Categorías registradas',
    },
    {
      title: 'Presupuesto Total',
      value: formatCurrency(stats.presupuestoTotal),
      icon: 'DollarSign',
      color: 'green',
      description: 'Presupuesto mensual',
    },
    {
      title: 'Gasto Ejecutado',
      value: formatCurrency(stats.gastoTotal),
      icon: 'TrendingUp',
      color: 'emerald',
      description: 'Gasto actual',
      trend: {
        value: stats.porcentajeEjecucion,
        direction: stats.porcentajeEjecucion > 100 ? 'down' : 'up',
        period: 'del presupuesto',
      },
    },
    {
      title: 'Categorías Excedidas',
      value: stats.categoriasExcedidas,
      icon: 'AlertTriangle',
      color: stats.categoriasExcedidas > 0 ? 'red' : 'gray',
      description: 'Presupuesto superado',
    },
  ];

  // Handlers
  const handleCreateCategoria = () => {
    setEditingCategoria(null);
    setShowForm(true);
  };

  const handleEditCategoria = (categoria) => {
    setEditingCategoria(categoria);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategoria(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
      } else {
        await createCategoria(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas desactivar esta categoría?')) {
      await deleteCategoria(id);
    }
  };

  const handleRestoreCategoria = async (id) => {
    await restoreCategoria(id);
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
            Categorías de Gasto
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las categorías y subcategorías para organizar los gastos
          </p>
        </div>
        
        <Button onClick={handleCreateCategoria} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Estadísticas */}
      <StatsGrid stats={statsData} />

      {/* Resumen de ejecución presupuestaria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Ejecución Presupuestaria</span>
          </CardTitle>
          <CardDescription>
            Resumen del estado del presupuesto mensual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Presupuesto vs Gasto */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Ejecución Total</span>
                <span className={cn(
                  "text-sm font-bold",
                  stats.porcentajeEjecucion > 100 ? "text-red-600" : "text-green-600"
                )}>
                  {stats.porcentajeEjecucion.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(stats.porcentajeEjecucion, 100)} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Ejecutado: {formatCurrency(stats.gastoTotal)}</span>
                <span>Presupuesto: {formatCurrency(stats.presupuestoTotal)}</span>
              </div>
            </div>

            {/* Disponible */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                {stats.disponible >= 0 ? 'Disponible' : 'Excedido'}
              </p>
              <p className={cn(
                "text-2xl font-bold",
                stats.disponible >= 0 ? "text-blue-700" : "text-red-700"
              )}>
                {formatCurrency(Math.abs(stats.disponible))}
              </p>
            </div>

            {/* Estructura */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categorías Principales</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.categoriasPadre}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subcategorías</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.categoriasHijo}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Categorías Activas</span>
                <span className="text-sm font-bold text-green-600">
                  {stats.activas}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución por tipo */}
      {Object.keys(stats.porTipo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Distribución por Tipo</span>
            </CardTitle>
            <CardDescription>
              Número de categorías activas por tipo de gasto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(stats.porTipo)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([tipo, cantidad]) => (
                  <motion.div
                    key={tipo}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-blue-600">
                      {cantidad}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {tipo}
                    </p>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorías con mayor gasto */}
      {stats.categoriasMayorGasto.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Categorías con Mayor Gasto</span>
            </CardTitle>
            <CardDescription>
              Top 5 de categorías con mayor ejecución presupuestaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoriasMayorGasto.map((categoria, index) => {
                const porcentaje = (categoria.gasto_actual / categoria.presupuesto_mensual) * 100;
                return (
                  <motion.div
                    key={categoria.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div 
                        className="p-2 rounded flex items-center justify-center"
                        style={{ backgroundColor: categoria.color + '20', color: categoria.color }}
                      >
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {categoria.nombre}
                        </p>
                        <p className="text-sm text-gray-600">
                          {categoria.tipo} - {categoria.codigo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(categoria.gasto_actual)}
                      </p>
                      <p className={cn(
                        "text-sm",
                        porcentaje > 100 ? "text-red-600" : "text-green-600"
                      )}>
                        {porcentaje.toFixed(1)}% del presupuesto
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de categorías */}
      <CategoriasGastoTable
        categorias={filteredCategorias}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onCreateCategoria={handleCreateCategoria}
        onEditCategoria={handleEditCategoria}
        onDeleteCategoria={handleDeleteCategoria}
        onRestoreCategoria={handleRestoreCategoria}
        onRefresh={loadCategorias}
      />

      {/* Formulario de categoría */}
      <CategoriaGastoForm
        categoria={editingCategoria}
        categoriasPadre={getCategoriasPadre()}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        validateForm={validateCategoriaForm}
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

export default CategoriasGastoPage;

