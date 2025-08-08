import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Hook principal para gestión de alumnos
export const useAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos mock para alumnos
  const mockAlumnos = useMemo(() => [
    {
      id: 1,
      rut: '12345678-9',
      nombre: 'Juan',
      apellido: 'Pérez González',
      email: 'juan.perez@email.com',
      telefono: '+56912345678',
      fecha_nacimiento: '2010-03-15',
      direccion: 'Av. Principal 123, Santiago',
      curso_id: 1,
      curso: '3°A',
      apoderado_nombre: 'María González',
      apoderado_telefono: '+56987654321',
      apoderado_email: 'maria.gonzalez@email.com',
      estado: 'activo',
      fecha_matricula: '2024-03-01',
      observaciones: 'Estudiante destacado en matemáticas',
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-01-15T10:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T14:20:00Z',
    },
    {
      id: 2,
      rut: '23456789-0',
      nombre: 'María',
      apellido: 'Silva Rodríguez',
      email: 'maria.silva@email.com',
      telefono: '+56923456789',
      fecha_nacimiento: '2011-07-22',
      direccion: 'Calle Secundaria 456, Providencia',
      curso_id: 2,
      curso: '2°B',
      apoderado_nombre: 'Carlos Silva',
      apoderado_telefono: '+56976543210',
      apoderado_email: 'carlos.silva@email.com',
      estado: 'activo',
      fecha_matricula: '2024-03-01',
      observaciones: 'Excelente en deportes',
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-01-20T09:15:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T16:45:00Z',
    },
    {
      id: 3,
      rut: '34567890-1',
      nombre: 'Pedro',
      apellido: 'Martínez López',
      email: 'pedro.martinez@email.com',
      telefono: '+56934567890',
      fecha_nacimiento: '2009-11-08',
      direccion: 'Pasaje Los Álamos 789, Las Condes',
      curso_id: 3,
      curso: '4°A',
      apoderado_nombre: 'Ana López',
      apoderado_telefono: '+56965432109',
      apoderado_email: 'ana.lopez@email.com',
      estado: 'activo',
      fecha_matricula: '2024-03-01',
      observaciones: 'Líder natural, participa activamente en clases',
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-01-25T11:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T13:30:00Z',
    },
    {
      id: 4,
      rut: '45678901-2',
      nombre: 'Ana',
      apellido: 'Torres Vargas',
      email: 'ana.torres@email.com',
      telefono: '+56945678901',
      fecha_nacimiento: '2012-05-14',
      direccion: 'Av. Los Leones 321, Ñuñoa',
      curso_id: 1,
      curso: '3°A',
      apoderado_nombre: 'Luis Torres',
      apoderado_telefono: '+56954321098',
      apoderado_email: 'luis.torres@email.com',
      estado: 'activo',
      fecha_matricula: '2024-03-01',
      observaciones: 'Muy creativa en actividades artísticas',
      activo: true,
      creado_por: 1,
      fecha_creacion: '2024-02-01T08:45:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T15:15:00Z',
    },
    {
      id: 5,
      rut: '56789012-3',
      nombre: 'Carlos',
      apellido: 'Ruiz Hernández',
      email: 'carlos.ruiz@email.com',
      telefono: '+56956789012',
      fecha_nacimiento: '2010-09-30',
      direccion: 'Calle Nueva 654, Maipú',
      curso_id: 2,
      curso: '2°B',
      apoderado_nombre: 'Patricia Hernández',
      apoderado_telefono: '+56943210987',
      apoderado_email: 'patricia.hernandez@email.com',
      estado: 'inactivo',
      fecha_matricula: '2024-03-01',
      observaciones: 'Estudiante transferido a otro colegio',
      activo: false,
      creado_por: 1,
      fecha_creacion: '2024-02-05T12:20:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-15T10:00:00Z',
    },
  ], []);

  // Cargar alumnos
  const loadAlumnos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAlumnos(mockAlumnos);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar alumnos';
      setError(errorMessage);
      toast.error('Error al cargar alumnos', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [mockAlumnos]);

  // Crear alumno
  const createAlumno = useCallback(async (alumnoData) => {
    try {
      // Simular creación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAlumno = {
        ...alumnoData,
        id: Date.now(),
        activo: true,
        creado_por: 1,
        fecha_creacion: new Date().toISOString(),
        actualizado_por: 1,
        fecha_actualizacion: new Date().toISOString(),
      };
      
      setAlumnos(prev => [...prev, newAlumno]);
      
      toast.success('Alumno creado exitosamente', {
        description: `${newAlumno.nombre} ${newAlumno.apellido} ha sido registrado`,
      });
      
      return { success: true, data: newAlumno };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear alumno';
      toast.error('Error al crear alumno', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Actualizar alumno
  const updateAlumno = useCallback(async (id, alumnoData) => {
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAlumnos(prev => prev.map(alumno => 
        alumno.id === id 
          ? { 
              ...alumno, 
              ...alumnoData,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : alumno
      ));
      
      toast.success('Alumno actualizado exitosamente', {
        description: 'Los datos han sido guardados correctamente',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar alumno';
      toast.error('Error al actualizar alumno', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Eliminar alumno (soft delete)
  const deleteAlumno = useCallback(async (id) => {
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAlumnos(prev => prev.map(alumno => 
        alumno.id === id 
          ? { 
              ...alumno, 
              activo: false,
              estado: 'inactivo',
              eliminado_por: 1,
              fecha_eliminacion: new Date().toISOString(),
            }
          : alumno
      ));
      
      toast.success('Alumno eliminado exitosamente', {
        description: 'El alumno ha sido marcado como inactivo',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar alumno';
      toast.error('Error al eliminar alumno', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Restaurar alumno
  const restoreAlumno = useCallback(async (id) => {
    try {
      // Simular restauración
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAlumnos(prev => prev.map(alumno => 
        alumno.id === id 
          ? { 
              ...alumno, 
              activo: true,
              estado: 'activo',
              eliminado_por: null,
              fecha_eliminacion: null,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : alumno
      ));
      
      toast.success('Alumno restaurado exitosamente', {
        description: 'El alumno ha sido reactivado',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al restaurar alumno';
      toast.error('Error al restaurar alumno', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAlumnos();
  }, [loadAlumnos]);

  return {
    alumnos,
    isLoading,
    error,
    lastUpdated,
    loadAlumnos,
    createAlumno,
    updateAlumno,
    deleteAlumno,
    restoreAlumno,
  };
};

// Hook para filtros y búsqueda de alumnos
export const useAlumnosFilter = (alumnos) => {
  const [filters, setFilters] = useState({
    search: '',
    curso: '',
    estado: 'activo',
    sortBy: 'nombre',
    sortOrder: 'asc',
  });

  const filteredAlumnos = useMemo(() => {
    let filtered = [...alumnos];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(alumno => 
        alumno.nombre.toLowerCase().includes(searchLower) ||
        alumno.apellido.toLowerCase().includes(searchLower) ||
        alumno.rut.includes(searchLower) ||
        alumno.email.toLowerCase().includes(searchLower) ||
        alumno.curso.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por curso
    if (filters.curso) {
      filtered = filtered.filter(alumno => alumno.curso === filters.curso);
    }

    // Filtro por estado
    if (filters.estado === 'activo') {
      filtered = filtered.filter(alumno => alumno.activo);
    } else if (filters.estado === 'inactivo') {
      filtered = filtered.filter(alumno => !alumno.activo);
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
  }, [alumnos, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      curso: '',
      estado: 'activo',
      sortBy: 'nombre',
      sortOrder: 'asc',
    });
  }, []);

  return {
    filters,
    filteredAlumnos,
    updateFilter,
    resetFilters,
  };
};

// Hook para estadísticas de alumnos
export const useAlumnosStats = (alumnos) => {
  const stats = useMemo(() => {
    const total = alumnos.length;
    const activos = alumnos.filter(a => a.activo).length;
    const inactivos = total - activos;
    
    // Distribución por curso
    const porCurso = alumnos.reduce((acc, alumno) => {
      if (alumno.activo) {
        acc[alumno.curso] = (acc[alumno.curso] || 0) + 1;
      }
      return acc;
    }, {});

    // Alumnos nuevos este mes
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const nuevosEsteMes = alumnos.filter(a => 
      new Date(a.fecha_creacion) >= thisMonth && a.activo
    ).length;

    return {
      total,
      activos,
      inactivos,
      porCurso,
      nuevosEsteMes,
      porcentajeActivos: total > 0 ? (activos / total) * 100 : 0,
    };
  }, [alumnos]);

  return stats;
};

// Hook para validación de formularios de alumnos
export const useAlumnoValidation = () => {
  const validateRut = useCallback((rut) => {
    if (!rut) return 'El RUT es requerido';
    
    // Validación básica de formato RUT chileno
    const rutRegex = /^[0-9]+-[0-9kK]{1}$/;
    if (!rutRegex.test(rut)) {
      return 'Formato de RUT inválido (ej: 12345678-9)';
    }
    
    return null;
  }, []);

  const validateEmail = useCallback((email) => {
    if (!email) return 'El email es requerido';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Formato de email inválido';
    }
    
    return null;
  }, []);

  const validatePhone = useCallback((phone) => {
    if (!phone) return 'El teléfono es requerido';
    
    const phoneRegex = /^\+56[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return 'Formato de teléfono inválido (ej: +56912345678)';
    }
    
    return null;
  }, []);

  const validateAlumnoForm = useCallback((formData) => {
    const errors = {};
    
    if (!formData.nombre?.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido?.trim()) {
      errors.apellido = 'El apellido es requerido';
    }
    
    const rutError = validateRut(formData.rut);
    if (rutError) errors.rut = rutError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(formData.telefono);
    if (phoneError) errors.telefono = phoneError;
    
    if (!formData.fecha_nacimiento) {
      errors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    }
    
    if (!formData.curso_id) {
      errors.curso_id = 'El curso es requerido';
    }
    
    if (!formData.apoderado_nombre?.trim()) {
      errors.apoderado_nombre = 'El nombre del apoderado es requerido';
    }
    
    const apoderadoPhoneError = validatePhone(formData.apoderado_telefono);
    if (apoderadoPhoneError) {
      errors.apoderado_telefono = apoderadoPhoneError;
    }
    
    const apoderadoEmailError = validateEmail(formData.apoderado_email);
    if (apoderadoEmailError) {
      errors.apoderado_email = apoderadoEmailError;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [validateRut, validateEmail, validatePhone]);

  return {
    validateRut,
    validateEmail,
    validatePhone,
    validateAlumnoForm,
  };
};

export default {
  useAlumnos,
  useAlumnosFilter,
  useAlumnosStats,
  useAlumnoValidation,
};

