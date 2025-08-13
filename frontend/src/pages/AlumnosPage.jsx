// src/pages/AlumnosPage.jsx
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatsGrid } from '../features/dashboard/components/StatsCard.jsx';
import AlumnosTable from '../features/alumnos/components/AlumnosTable.jsx';
import AlumnoForm from '../features/alumnos/components/AlumnoForm.jsx';
import {
  useAlumnos,
  useAlumnosFilter,
  useAlumnosStats,
} from '../features/alumnos/hooks/useAlumnos.js';
import Navbar from '../pages/Navbar.jsx';

export default function AlumnosPage() {
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

  // Derivar lista de cursos desde los alumnos (si el backend no adjunta catálogo)
  const cursos = useMemo(() => {
    const map = new Map();
    for (const a of alumnos) {
      if (!a?.curso_id) continue;
      const nombre = a.curso?.nombre_curso || a.curso_nombre || `Curso ${a.curso_id}`;
      if (!map.has(a.curso_id)) map.set(a.curso_id, { id: a.curso_id, nombre_curso: nombre });
    }
    return Array.from(map.values()).sort((x, y) =>
      String(x.nombre_curso).localeCompare(String(y.nombre_curso))
    );
  }, [alumnos]);

  // Filtros en memoria
  const { filters, filteredAlumnos, updateFilter, resetFilters } = useAlumnosFilter(alumnos);

  // Stats
  const stats = useAlumnosStats(alumnos);
  const statsData = [
    { title: 'Total Alumnos', value: stats.total, icon: 'Users', color: 'blue', description: 'Registrados' },
    { title: 'Activos', value: stats.activos, icon: 'UserPlus', color: 'emerald', description: 'Con estado activo' },
    { title: 'Cursos con alumnos', value: cursos.length, icon: 'GraduationCap', color: 'purple', description: 'Únicos' },
  ];

  // Handlers
  const handleCreateAlumno = () => { setEditingAlumno(null); setShowForm(true); };
  const handleEditAlumno   = (alumno) => { setEditingAlumno(alumno); setShowForm(true); };
  const handleCloseForm    = () => { setShowForm(false); setEditingAlumno(null); };

  const handleSubmitForm = async (formData) => {
    if (editingAlumno) await updateAlumno(editingAlumno.id, formData);
    else await createAlumno(formData);
    handleCloseForm();
  };

  const handleDeleteAlumno  = async (id) => { if (window.confirm('¿Desactivar alumno?')) await deleteAlumno(id); };
  const handleRestoreAlumno = async (id) => { await restoreAlumno(id); };

  const pageVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const distribPorCurso = useMemo(() => {
    const m = new Map();
    for (const a of alumnos) {
      if (!a?.curso_id) continue;
      m.set(a.curso_id, (m.get(a.curso_id) || 0) + 1);
    }
    return Array.from(m.entries())
      .map(([id, cantidad]) => ({
        id,
        nombre: cursos.find(c => c.id === id)?.nombre_curso || `Curso ${id}`,
        cantidad,
      }))
      .sort((x, y) => x.nombre.localeCompare(y.nombre));
  }, [alumnos, cursos]);

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
            <p className="text-gray-600 mt-1">Administra los estudiantes registrados</p>
          </div>

          <Button onClick={handleCreateAlumno} size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            Nuevo Alumno
          </Button>
        </div>

        {/* Estadísticas */}
        <StatsGrid stats={statsData} />

        {/* Distribución por curso */}
        {distribPorCurso.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span>Distribución por Curso</span>
              </CardTitle>
              <CardDescription>Número de alumnos por curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {distribPorCurso.map(({ id, nombre, cantidad }) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-blue-600">{cantidad}</p>
                    <p className="text-sm text-gray-600 font-medium">{nombre}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        <AlumnosTable
          alumnos={filteredAlumnos}
          cursos={cursos}
          isLoading={isLoading}
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          onCreateAlumno={handleCreateAlumno}
          onEditAlumno={handleEditAlumno}
          onDeleteAlumno={handleDeleteAlumno}
          onRestoreAlumno={handleRestoreAlumno}
          onRefresh={loadAlumnos}
        />

        {/* Formulario */}
        <AlumnoForm
          alumno={editingAlumno}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
        />

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
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
