import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import { AlumnosTable } from '../features/alumnos/components/AlumnosTable.jsx';
import { AlumnoForm } from '../features/alumnos/components/AlumnoForm.jsx';
import { usePermissions } from '../features/auth/hooks/usePermissions';
import {
  useAlumnos,
  useAlumnosFilter,
  useAlumnosStats,
  useAlumnoValidation
} from '../features/alumnos/hooks/useAlumnos.js';
import Navbar from '../pages/Navbar.jsx';
import { toast } from 'sonner';

export function AlumnosPage() {
  const { hasPermission } = usePermissions();
  const { validateAlumnoForm } = useAlumnoValidation();

  // Derivar permisos reales
  const canViewAlumnos = hasPermission('view_alumnos');
  const canEditAlumnos = hasPermission('edit_alumnos');
  const canManageAlumnos = canViewAlumnos; // controla acceso a la página

  const [showForm, setShowForm] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);

  const {
    alumnos,
    isLoading,
    error,
    loadAlumnos,
    createAlumno,
    updateAlumno,
    deleteAlumno,
    restoreAlumno,
  } = useAlumnos();

  const {
    filters,
    filteredAlumnos,
    updateFilter,
    resetFilters,
  } = useAlumnosFilter(alumnos);

  const stats = useAlumnosStats(alumnos);

  if (!canManageAlumnos) {
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

  const statsData = [
    { title: 'Total Alumnos', value: stats.total, icon: 'Users', color: 'blue', description: 'Estudiantes registrados' },
    { title: 'Alumnos Activos', value: stats.activos, icon: 'UserCheck', color: 'green', description: 'Estudiantes activos', trend: { value: stats.porcentajeActivos, direction: 'up', period: 'del total' } },
    { title: 'Nuevos Este Mes', value: stats.nuevosEsteMes, icon: 'UserPlus', color: 'emerald', description: 'Matrículas recientes' },
    { title: 'Cursos Activos', value: Object.keys(stats.porCurso).length, icon: 'GraduationCap', color: 'purple', description: 'Cursos con alumnos' },
  ];

  const handleCreateAlumno = () => {
    if (!canEditAlumnos) return toast.warning('No tienes permiso para crear alumnos');
    setEditingAlumno(null);
    setShowForm(true);
  };

  const handleEditAlumno = (alumno) => {
    if (!canEditAlumnos) return toast.warning('No tienes permiso para editar alumnos');
    setEditingAlumno(alumno);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAlumno(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (editingAlumno) {
        await updateAlumno(editingAlumno.id, formData);
      } else {
        await createAlumno(formData);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar alumno:', error);
    }
  };

  const handleDeleteAlumno = async (id) => {
    if (!canEditAlumnos) return toast.warning('No tienes permiso para desactivar alumnos');
    if (window.confirm('¿Estás seguro de que deseas desactivar este alumno?')) {
      await deleteAlumno(id);
    }
  };

  const handleRestoreAlumno = async (id) => {
    if (!canEditAlumnos) return toast.warning('No tienes permiso para restaurar alumnos');
    await restoreAlumno(id);
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
        className="space-y-6 p-4 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Alumnos</h1>
            <p className="text-gray-600 mt-1">Administra la información de los estudiantes del centro educativo</p>
          </div>

          <Button onClick={handleCreateAlumno} size="lg" disabled={!canEditAlumnos}>
            <UserPlus className="w-5 h-5 mr-2" />
            Nuevo Alumno
          </Button>
        </div>

        {/* Estadísticas */}
        <StatsGrid stats={statsData} />

        {/* Distribución por curso */}
        {Object.keys(stats.porCurso).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Distribución por Curso</span>
              </CardTitle>
              <CardDescription>Número de alumnos activos por curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(stats.porCurso)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([curso, cantidad]) => (
                    <motion.div
                      key={curso}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <p className="text-2xl font-bold text-blue-600">{cantidad}</p>
                      <p className="text-sm text-gray-600 font-medium">{curso}</p>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de alumnos */}
        <AlumnosTable
          alumnos={filteredAlumnos}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onCreateAlumno={handleCreateAlumno}
          onEditAlumno={handleEditAlumno}
          onDeleteAlumno={handleDeleteAlumno}
          onRestoreAlumno={handleRestoreAlumno}
          onRefresh={loadAlumnos}
          canEdit={canEditAlumnos}
        />

        {/* Formulario */}
        <AlumnoForm
          alumno={editingAlumno}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          validateForm={validateAlumnoForm}
          readOnly={!canEditAlumnos}
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

export default AlumnosPage;
