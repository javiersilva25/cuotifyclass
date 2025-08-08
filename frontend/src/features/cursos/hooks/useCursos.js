import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Hook principal para gestión de cursos
export const useCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos mock para cursos
  const mockCursos = useMemo(() => [
    {
      id: 1,
      nombre: 'Pre-Kinder',
      nivel: 'Preescolar',
      descripcion: 'Curso preparatorio para niños de 4 años',
      capacidad_maxima: 20,
      alumnos_matriculados: 18,
      profesor_principal: 'María Elena Rodríguez',
      profesor_id: 1,
      aula: 'Sala Amarilla',
      horario_inicio: '08:30',
      horario_fin: '12:30',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      costo_matricula: 50000,
      costo_mensual: 45000,
      activo: true,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-12-15',
      observaciones: 'Incluye material didáctico y alimentación',
      creado_por: 1,
      fecha_creacion: '2024-01-15T10:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T14:20:00Z',
    },
    {
      id: 2,
      nombre: 'Kinder',
      nivel: 'Preescolar',
      descripcion: 'Curso para niños de 5 años, preparación para básica',
      capacidad_maxima: 22,
      alumnos_matriculados: 20,
      profesor_principal: 'Carmen Silva Torres',
      profesor_id: 2,
      aula: 'Sala Verde',
      horario_inicio: '08:30',
      horario_fin: '13:00',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      costo_matricula: 55000,
      costo_mensual: 48000,
      activo: true,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-12-15',
      observaciones: 'Enfoque en lectoescritura y matemáticas básicas',
      creado_por: 1,
      fecha_creacion: '2024-01-20T09:15:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T16:45:00Z',
    },
    {
      id: 3,
      nombre: '1°A',
      nivel: 'Básica',
      descripcion: 'Primer año básico, sección A',
      capacidad_maxima: 25,
      alumnos_matriculados: 23,
      profesor_principal: 'Pedro Martínez López',
      profesor_id: 3,
      aula: 'Aula 101',
      horario_inicio: '08:00',
      horario_fin: '15:30',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      costo_matricula: 60000,
      costo_mensual: 52000,
      activo: true,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-12-15',
      observaciones: 'Curso con énfasis en desarrollo de habilidades básicas',
      creado_por: 1,
      fecha_creacion: '2024-01-25T11:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T13:30:00Z',
    },
    {
      id: 4,
      nombre: '1°B',
      nivel: 'Básica',
      descripcion: 'Primer año básico, sección B',
      capacidad_maxima: 25,
      alumnos_matriculados: 22,
      profesor_principal: 'Ana Torres Vargas',
      profesor_id: 4,
      aula: 'Aula 102',
      horario_inicio: '08:00',
      horario_fin: '15:30',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      costo_matricula: 60000,
      costo_mensual: 52000,
      activo: true,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-12-15',
      observaciones: 'Metodología lúdica y participativa',
      creado_por: 1,
      fecha_creacion: '2024-02-01T08:45:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T15:15:00Z',
    },
    {
      id: 5,
      nombre: '2°A',
      nivel: 'Básica',
      descripcion: 'Segundo año básico, sección A',
      capacidad_maxima: 28,
      alumnos_matriculados: 25,
      profesor_principal: 'Luis Hernández Castro',
      profesor_id: 5,
      aula: 'Aula 201',
      horario_inicio: '08:00',
      horario_fin: '15:45',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      costo_matricula: 65000,
      costo_mensual: 55000,
      activo: true,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-12-15',
      observaciones: 'Fortalecimiento de competencias lectoras',
      creado_por: 1,
      fecha_creacion: '2024-02-05T12:20:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-15T10:00:00Z',
    },
    {
      id: 6,
      nombre: '3°A',
      nivel: 'Básica',
      descripcion: 'Tercer año básico, sección A',
      capacidad_maxima: 30,
      alumnos_matriculados: 28,
      profesor_principal: 'Patricia González Ruiz',
      profesor_id: 6,
      aula: 'Aula 301',
      horario_inicio: '08:00',
      horario_fin: '16:00',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      costo_matricula: 70000,
      costo_mensual: 58000,
      activo: true,
      fecha_inicio: '2024-03-01',
      fecha_fin: '2024-12-15',
      observaciones: 'Introducción a ciencias naturales y sociales',
      creado_por: 1,
      fecha_creacion: '2024-02-10T14:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-20T11:45:00Z',
    },
    {
      id: 7,
      nombre: 'Curso de Verano',
      nivel: 'Especial',
      descripcion: 'Curso de reforzamiento durante vacaciones',
      capacidad_maxima: 15,
      alumnos_matriculados: 0,
      profesor_principal: 'Roberto Silva Mendoza',
      profesor_id: 7,
      aula: 'Aula Multiuso',
      horario_inicio: '09:00',
      horario_fin: '12:00',
      dias_semana: ['Lunes', 'Martes', 'Miércoles', 'Jueves'],
      costo_matricula: 30000,
      costo_mensual: 25000,
      activo: false,
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-02-28',
      observaciones: 'Curso finalizado, próxima edición en enero 2025',
      creado_por: 1,
      fecha_creacion: '2023-12-01T10:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T09:00:00Z',
    },
  ], []);

  // Cargar cursos
  const loadCursos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCursos(mockCursos);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar cursos';
      setError(errorMessage);
      toast.error('Error al cargar cursos', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [mockCursos]);

  // Crear curso
  const createCurso = useCallback(async (cursoData) => {
    try {
      // Simular creación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCurso = {
        ...cursoData,
        id: Date.now(),
        alumnos_matriculados: 0,
        activo: true,
        creado_por: 1,
        fecha_creacion: new Date().toISOString(),
        actualizado_por: 1,
        fecha_actualizacion: new Date().toISOString(),
      };
      
      setCursos(prev => [...prev, newCurso]);
      
      toast.success('Curso creado exitosamente', {
        description: `${newCurso.nombre} ha sido registrado`,
      });
      
      return { success: true, data: newCurso };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear curso';
      toast.error('Error al crear curso', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Actualizar curso
  const updateCurso = useCallback(async (id, cursoData) => {
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCursos(prev => prev.map(curso => 
        curso.id === id 
          ? { 
              ...curso, 
              ...cursoData,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : curso
      ));
      
      toast.success('Curso actualizado exitosamente', {
        description: 'Los datos han sido guardados correctamente',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar curso';
      toast.error('Error al actualizar curso', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Eliminar curso (soft delete)
  const deleteCurso = useCallback(async (id) => {
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCursos(prev => prev.map(curso => 
        curso.id === id 
          ? { 
              ...curso, 
              activo: false,
              eliminado_por: 1,
              fecha_eliminacion: new Date().toISOString(),
            }
          : curso
      ));
      
      toast.success('Curso desactivado exitosamente', {
        description: 'El curso ha sido marcado como inactivo',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar curso';
      toast.error('Error al eliminar curso', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Restaurar curso
  const restoreCurso = useCallback(async (id) => {
    try {
      // Simular restauración
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCursos(prev => prev.map(curso => 
        curso.id === id 
          ? { 
              ...curso, 
              activo: true,
              eliminado_por: null,
              fecha_eliminacion: null,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : curso
      ));
      
      toast.success('Curso restaurado exitosamente', {
        description: 'El curso ha sido reactivado',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al restaurar curso';
      toast.error('Error al restaurar curso', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCursos();
  }, [loadCursos]);

  return {
    cursos,
    isLoading,
    error,
    lastUpdated,
    loadCursos,
    createCurso,
    updateCurso,
    deleteCurso,
    restoreCurso,
  };
};

// Hook para filtros y búsqueda de cursos
export const useCursosFilter = (cursos) => {
  const [filters, setFilters] = useState({
    search: '',
    nivel: '',
    estado: 'activo',
    sortBy: 'nombre',
    sortOrder: 'asc',
  });

  const filteredCursos = useMemo(() => {
    let filtered = [...cursos];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(curso => 
        curso.nombre.toLowerCase().includes(searchLower) ||
        curso.nivel.toLowerCase().includes(searchLower) ||
        curso.profesor_principal.toLowerCase().includes(searchLower) ||
        curso.aula.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por nivel
    if (filters.nivel) {
      filtered = filtered.filter(curso => curso.nivel === filters.nivel);
    }

    // Filtro por estado
    if (filters.estado === 'activo') {
      filtered = filtered.filter(curso => curso.activo);
    } else if (filters.estado === 'inactivo') {
      filtered = filtered.filter(curso => !curso.activo);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [cursos, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      nivel: '',
      estado: 'activo',
      sortBy: 'nombre',
      sortOrder: 'asc',
    });
  }, []);

  return {
    filters,
    filteredCursos,
    updateFilter,
    resetFilters,
  };
};

// Hook para estadísticas de cursos
export const useCursosStats = (cursos) => {
  const stats = useMemo(() => {
    const total = cursos.length;
    const activos = cursos.filter(c => c.activo).length;
    const inactivos = total - activos;
    
    // Distribución por nivel
    const porNivel = cursos.reduce((acc, curso) => {
      if (curso.activo) {
        acc[curso.nivel] = (acc[curso.nivel] || 0) + 1;
      }
      return acc;
    }, {});

    // Capacidad total y ocupación
    const cursosActivos = cursos.filter(c => c.activo);
    const capacidadTotal = cursosActivos.reduce((sum, c) => sum + c.capacidad_maxima, 0);
    const alumnosMatriculados = cursosActivos.reduce((sum, c) => sum + c.alumnos_matriculados, 0);
    const ocupacionPromedio = capacidadTotal > 0 ? (alumnosMatriculados / capacidadTotal) * 100 : 0;

    // Ingresos estimados
    const ingresosMensuales = cursosActivos.reduce((sum, c) => 
      sum + (c.alumnos_matriculados * c.costo_mensual), 0
    );

    // Cursos con mayor demanda
    const cursosMayorDemanda = cursosActivos
      .filter(c => c.alumnos_matriculados > 0)
      .sort((a, b) => (b.alumnos_matriculados / b.capacidad_maxima) - (a.alumnos_matriculados / a.capacidad_maxima))
      .slice(0, 3);

    return {
      total,
      activos,
      inactivos,
      porNivel,
      capacidadTotal,
      alumnosMatriculados,
      ocupacionPromedio,
      ingresosMensuales,
      cursosMayorDemanda,
      porcentajeActivos: total > 0 ? (activos / total) * 100 : 0,
    };
  }, [cursos]);

  return stats;
};

// Hook para validación de formularios de cursos
export const useCursoValidation = () => {
  const validateNombre = useCallback((nombre) => {
    if (!nombre?.trim()) return 'El nombre del curso es requerido';
    if (nombre.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (nombre.length > 50) return 'El nombre no puede exceder 50 caracteres';
    return null;
  }, []);

  const validateCapacidad = useCallback((capacidad) => {
    if (!capacidad) return 'La capacidad máxima es requerida';
    const num = parseInt(capacidad);
    if (isNaN(num) || num <= 0) return 'La capacidad debe ser un número mayor a 0';
    if (num > 50) return 'La capacidad no puede exceder 50 alumnos';
    return null;
  }, []);

  const validateCosto = useCallback((costo) => {
    if (!costo) return 'El costo es requerido';
    const num = parseInt(costo);
    if (isNaN(num) || num < 0) return 'El costo debe ser un número mayor o igual a 0';
    return null;
  }, []);

  const validateHorario = useCallback((inicio, fin) => {
    if (!inicio) return 'La hora de inicio es requerida';
    if (!fin) return 'La hora de fin es requerida';
    
    if (inicio >= fin) {
      return 'La hora de inicio debe ser anterior a la hora de fin';
    }
    
    return null;
  }, []);

  const validateCursoForm = useCallback((formData) => {
    const errors = {};
    
    const nombreError = validateNombre(formData.nombre);
    if (nombreError) errors.nombre = nombreError;
    
    if (!formData.nivel?.trim()) {
      errors.nivel = 'El nivel es requerido';
    }
    
    const capacidadError = validateCapacidad(formData.capacidad_maxima);
    if (capacidadError) errors.capacidad_maxima = capacidadError;
    
    if (!formData.profesor_principal?.trim()) {
      errors.profesor_principal = 'El profesor principal es requerido';
    }
    
    if (!formData.aula?.trim()) {
      errors.aula = 'El aula es requerida';
    }
    
    const horarioError = validateHorario(formData.horario_inicio, formData.horario_fin);
    if (horarioError) {
      errors.horario_inicio = horarioError;
      errors.horario_fin = horarioError;
    }
    
    const matriculaError = validateCosto(formData.costo_matricula);
    if (matriculaError) errors.costo_matricula = matriculaError;
    
    const mensualError = validateCosto(formData.costo_mensual);
    if (mensualError) errors.costo_mensual = mensualError;
    
    if (!formData.fecha_inicio) {
      errors.fecha_inicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fecha_fin) {
      errors.fecha_fin = 'La fecha de fin es requerida';
    }
    
    if (formData.fecha_inicio && formData.fecha_fin && formData.fecha_inicio >= formData.fecha_fin) {
      errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    if (!formData.dias_semana || formData.dias_semana.length === 0) {
      errors.dias_semana = 'Debe seleccionar al menos un día de la semana';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [validateNombre, validateCapacidad, validateCosto, validateHorario]);

  return {
    validateNombre,
    validateCapacidad,
    validateCosto,
    validateHorario,
    validateCursoForm,
  };
};

export default {
  useCursos,
  useCursosFilter,
  useCursosStats,
  useCursoValidation,
};

