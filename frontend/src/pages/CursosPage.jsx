import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Users, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import { CursosTable } from '../features/cursos/components/CursosTable.jsx';
import { CursoForm } from '../features/cursos/components/CursoForm.jsx';
import { 
  useCursos, 
  useCursosFilter, 
  useCursosStats,
  useCursoValidation 
} from '../features/cursos/hooks/useCursos.js';
import { usePermissions } from "../features/auth/hooks/usePermissions";
import { toast } from 'sonner';
import Navbar from '../pages/Navbar';

export function CursosPage() {
  const { hasPermission } = usePermissions();
  const { validateCursoForm } = useCursoValidation();

  // Derivar permisos reales
  const canViewCursos = hasPermission('view_cursos');
  const canEditCursos = hasPermission('edit_cursos');

  // Estados del formulario
  const [showForm, setShowForm] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  
  // Hooks de datos
  const {
    cursos,
    isLoading,
    error,
    loadCursos,
    createCurso,
    updateCurso,
    deleteCurso,
    restoreCurso,
  } = useCursos();

  const {
    filters,
    filteredCursos,
    updateFilter,
    resetFilters,
  } = useCursosFilter(cursos);

  const stats = useCursosStats(cursos);

  // Bloqueo por acceso
  if (!canViewCursos) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                No tienes permisos para gestionar cursos.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Formateo monedas
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);

  // Estadísticas
  const statsData = [
    { title: 'Total Cursos', value: stats.total, icon: 'BookOpen', color: 'blue', description: 'Cursos registrados' },
    { title: 'Cursos Activos', value: stats.activos, icon: 'GraduationCap', color: 'green', description: 'Cursos en funcionamiento', trend: { value: stats.porcentajeActivos, direction: 'up', period: 'del total' } },
    { title: 'Alumnos Matriculados', value: stats.alumnosMatriculados, icon: 'Users', color: 'emerald', description: 'Total de estudiantes' },
    { title: 'Ingresos Mensuales', value: formatCurrency(stats.ingresosMensuales), icon: 'DollarSign', color: 'purple', description: 'Ingresos estimados' },
  ];

  // Handlers (respetan permisos)
  const handleCreateCurso = () => {
    if (!canEditCursos) return toast.warning('No tienes permiso para crear cursos');
    setEditingCurso(null);
    setShowForm(true);
  };

  const handleEditCurso = (curso) => {
    if (!canEditCursos) return toast.warning('No tienes permiso para editar cursos');
    setEditingCurso(curso);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCurso(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingCurso) {
        await updateCurso(editingCurso.id, formData);
      } else {
        await createCurso(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar curso:', error);
    }
  };

  const handleDeleteCurso = async (id) => {
    if (!canEditCursos) return toast.warning('No tienes permiso para desactivar cursos');
    if (window.confirm('¿Estás seguro de que deseas desactivar este curso?')) {
      await deleteCurso(id);
    }
  };

  const handleRestoreCurso = async (id) => {
    if (!canEditCursos) return toast.warning('No tienes permiso para restaurar cursos');
    await restoreCurso(id);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
            <p className="text-gray-600 mt-1">Administra los cursos y programas académicos del centro educativo</p>
          </div>
          
          <Button onClick={handleCreateCurso} size="lg" disabled={!canEditCursos}>
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Curso
          </Button>
        </div>

        {/* Estadísticas */}
        <StatsGrid stats={statsData} />

        {/* Distribución por nivel */}
        {Object.keys(stats.porNivel).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Distribución por Nivel</span>
              </CardTitle>
              <CardDescription>Número de cursos activos por nivel académico</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.porNivel)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([nivel, cantidad]) => (
                    <motion.div
                      key={nivel}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-blue-600">{cantidad}</p>
                      <p className="text-sm text-gray-600 font-medium">{nivel}</p>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cursos con mayor demanda */}
        {stats.cursosMayorDemanda.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Cursos con Mayor Demanda</span>
              </CardTitle>
              <CardDescription>Cursos con mayor porcentaje de ocupación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.cursosMayorDemanda.map((curso, index) => {
                  const ocupacion = (curso.alumnos_matriculados / curso.capacidad_maxima) * 100;
                  return (
                    <motion.div
                      key={curso.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{curso.nombre}</p>
                          <p className="text-sm text-gray-600">{curso.nivel} - {curso.profesor_principal}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{ocupacion.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">
                          {curso.alumnos_matriculados}/{curso.capacidad_maxima} alumnos
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen de ocupación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Resumen de Ocupación</span>
            </CardTitle>
            <CardDescription>Estadísticas generales de capacidad y ocupación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.capacidadTotal}</p>
                <p className="text-sm text-blue-700 font-medium">Capacidad Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.alumnosMatriculados}</p>
                <p className="text-sm text-green-700 font-medium">Alumnos Matriculados</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.ocupacionPromedio.toFixed(1)}%</p>
                <p className="text-sm text-purple-700 font-medium">Ocupación Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <CursosTable
          cursos={filteredCursos}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onCreateCurso={handleCreateCurso}
          onEditCurso={handleEditCurso}
          onDeleteCurso={handleDeleteCurso}
          onRestoreCurso={handleRestoreCurso}
          onRefresh={loadCursos}
          canEdit={canEditCursos}
        />

        {/* Formulario */}
        <CursoForm
          curso={editingCurso}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          validateForm={validateCursoForm}
          readOnly={!canEditCursos}
        />

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

export default CursosPage;
