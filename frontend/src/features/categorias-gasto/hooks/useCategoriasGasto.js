import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Hook principal para gestión de categorías de gasto
export const useCategoriasGasto = () => {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Datos mock para categorías de gasto
  const mockCategorias = useMemo(() => [
    {
      id: 1,
      nombre: 'Material Didáctico',
      descripcion: 'Libros, cuadernos, lápices y material educativo',
      codigo: 'MAT-DID',
      tipo: 'Educativo',
      presupuesto_mensual: 150000,
      gasto_actual: 125000,
      activo: true,
      categoria_padre_id: null,
      nivel: 0,
      orden: 1,
      color: '#3B82F6',
      icono: 'BookOpen',
      creado_por: 1,
      fecha_creacion: '2024-01-15T10:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T14:20:00Z',
    },
    {
      id: 2,
      nombre: 'Libros de Texto',
      descripcion: 'Libros oficiales del curriculum',
      codigo: 'MAT-LIB',
      tipo: 'Educativo',
      presupuesto_mensual: 80000,
      gasto_actual: 75000,
      activo: true,
      categoria_padre_id: 1,
      nivel: 1,
      orden: 1,
      color: '#3B82F6',
      icono: 'Book',
      creado_por: 1,
      fecha_creacion: '2024-01-20T09:15:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T16:45:00Z',
    },
    {
      id: 3,
      nombre: 'Material de Arte',
      descripcion: 'Pinturas, pinceles, papel y material artístico',
      codigo: 'MAT-ART',
      tipo: 'Educativo',
      presupuesto_mensual: 45000,
      gasto_actual: 38000,
      activo: true,
      categoria_padre_id: 1,
      nivel: 1,
      orden: 2,
      color: '#3B82F6',
      icono: 'Palette',
      creado_por: 1,
      fecha_creacion: '2024-01-25T11:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T13:30:00Z',
    },
    {
      id: 4,
      nombre: 'Servicios Básicos',
      descripcion: 'Electricidad, agua, gas e internet',
      codigo: 'SER-BAS',
      tipo: 'Operacional',
      presupuesto_mensual: 300000,
      gasto_actual: 285000,
      activo: true,
      categoria_padre_id: null,
      nivel: 0,
      orden: 2,
      color: '#10B981',
      icono: 'Zap',
      creado_por: 1,
      fecha_creacion: '2024-02-01T08:45:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T15:15:00Z',
    },
    {
      id: 5,
      nombre: 'Electricidad',
      descripcion: 'Consumo eléctrico del establecimiento',
      codigo: 'SER-ELE',
      tipo: 'Operacional',
      presupuesto_mensual: 120000,
      gasto_actual: 115000,
      activo: true,
      categoria_padre_id: 4,
      nivel: 1,
      orden: 1,
      color: '#10B981',
      icono: 'Zap',
      creado_por: 1,
      fecha_creacion: '2024-02-05T12:20:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-15T10:00:00Z',
    },
    {
      id: 6,
      nombre: 'Agua',
      descripcion: 'Consumo de agua potable',
      codigo: 'SER-AGU',
      tipo: 'Operacional',
      presupuesto_mensual: 80000,
      gasto_actual: 75000,
      activo: true,
      categoria_padre_id: 4,
      nivel: 1,
      orden: 2,
      color: '#10B981',
      icono: 'Droplets',
      creado_por: 1,
      fecha_creacion: '2024-02-10T14:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-20T11:45:00Z',
    },
    {
      id: 7,
      nombre: 'Internet',
      descripcion: 'Servicio de internet y telecomunicaciones',
      codigo: 'SER-INT',
      tipo: 'Operacional',
      presupuesto_mensual: 100000,
      gasto_actual: 95000,
      activo: true,
      categoria_padre_id: 4,
      nivel: 1,
      orden: 3,
      color: '#10B981',
      icono: 'Wifi',
      creado_por: 1,
      fecha_creacion: '2024-02-15T16:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-25T09:30:00Z',
    },
    {
      id: 8,
      nombre: 'Personal',
      descripcion: 'Sueldos y beneficios del personal',
      codigo: 'PER-SUE',
      tipo: 'Personal',
      presupuesto_mensual: 2500000,
      gasto_actual: 2450000,
      activo: true,
      categoria_padre_id: null,
      nivel: 0,
      orden: 3,
      color: '#8B5CF6',
      icono: 'Users',
      creado_por: 1,
      fecha_creacion: '2024-01-10T07:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T12:00:00Z',
    },
    {
      id: 9,
      nombre: 'Sueldos Profesores',
      descripcion: 'Remuneraciones del cuerpo docente',
      codigo: 'PER-PRO',
      tipo: 'Personal',
      presupuesto_mensual: 1800000,
      gasto_actual: 1750000,
      activo: true,
      categoria_padre_id: 8,
      nivel: 1,
      orden: 1,
      color: '#8B5CF6',
      icono: 'GraduationCap',
      creado_por: 1,
      fecha_creacion: '2024-01-12T08:00:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T14:30:00Z',
    },
    {
      id: 10,
      nombre: 'Sueldos Administrativos',
      descripcion: 'Remuneraciones del personal administrativo',
      codigo: 'PER-ADM',
      tipo: 'Personal',
      presupuesto_mensual: 700000,
      gasto_actual: 700000,
      activo: true,
      categoria_padre_id: 8,
      nivel: 1,
      orden: 2,
      color: '#8B5CF6',
      icono: 'Briefcase',
      creado_por: 1,
      fecha_creacion: '2024-01-14T09:30:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-01T16:00:00Z',
    },
    {
      id: 11,
      nombre: 'Mantenimiento',
      descripcion: 'Reparaciones y mantención de infraestructura',
      codigo: 'MAN-INF',
      tipo: 'Mantenimiento',
      presupuesto_mensual: 200000,
      gasto_actual: 150000,
      activo: true,
      categoria_padre_id: null,
      nivel: 0,
      orden: 4,
      color: '#F59E0B',
      icono: 'Wrench',
      creado_por: 1,
      fecha_creacion: '2024-02-20T10:15:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-10T13:45:00Z',
    },
    {
      id: 12,
      nombre: 'Alimentación',
      descripcion: 'Programa de alimentación escolar',
      codigo: 'ALI-ESC',
      tipo: 'Bienestar',
      presupuesto_mensual: 400000,
      gasto_actual: 380000,
      activo: true,
      categoria_padre_id: null,
      nivel: 0,
      orden: 5,
      color: '#EF4444',
      icono: 'UtensilsCrossed',
      creado_por: 1,
      fecha_creacion: '2024-01-30T11:45:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-03-05T15:20:00Z',
    },
    {
      id: 13,
      nombre: 'Transporte Escolar',
      descripcion: 'Servicio de transporte para estudiantes',
      codigo: 'TRA-ESC',
      tipo: 'Transporte',
      presupuesto_mensual: 250000,
      gasto_actual: 240000,
      activo: false,
      categoria_padre_id: null,
      nivel: 0,
      orden: 6,
      color: '#6B7280',
      icono: 'Bus',
      creado_por: 1,
      fecha_creacion: '2024-01-05T14:20:00Z',
      actualizado_por: 1,
      fecha_actualizacion: '2024-02-28T10:30:00Z',
      eliminado_por: 1,
      fecha_eliminacion: '2024-02-28T10:30:00Z',
    },
  ], []);

  // Cargar categorías
  const loadCategorias = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCategorias(mockCategorias);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar categorías de gasto';
      setError(errorMessage);
      toast.error('Error al cargar categorías', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [mockCategorias]);

  // Crear categoría
  const createCategoria = useCallback(async (categoriaData) => {
    try {
      // Simular creación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCategoria = {
        ...categoriaData,
        id: Date.now(),
        gasto_actual: 0,
        activo: true,
        creado_por: 1,
        fecha_creacion: new Date().toISOString(),
        actualizado_por: 1,
        fecha_actualizacion: new Date().toISOString(),
      };
      
      setCategorias(prev => [...prev, newCategoria]);
      
      toast.success('Categoría creada exitosamente', {
        description: `${newCategoria.nombre} ha sido registrada`,
      });
      
      return { success: true, data: newCategoria };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear categoría';
      toast.error('Error al crear categoría', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Actualizar categoría
  const updateCategoria = useCallback(async (id, categoriaData) => {
    try {
      // Simular actualización
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategorias(prev => prev.map(categoria => 
        categoria.id === id 
          ? { 
              ...categoria, 
              ...categoriaData,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : categoria
      ));
      
      toast.success('Categoría actualizada exitosamente', {
        description: 'Los datos han sido guardados correctamente',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar categoría';
      toast.error('Error al actualizar categoría', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Eliminar categoría (soft delete)
  const deleteCategoria = useCallback(async (id) => {
    try {
      // Simular eliminación
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCategorias(prev => prev.map(categoria => 
        categoria.id === id 
          ? { 
              ...categoria, 
              activo: false,
              eliminado_por: 1,
              fecha_eliminacion: new Date().toISOString(),
            }
          : categoria
      ));
      
      toast.success('Categoría desactivada exitosamente', {
        description: 'La categoría ha sido marcada como inactiva',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar categoría';
      toast.error('Error al eliminar categoría', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Restaurar categoría
  const restoreCategoria = useCallback(async (id) => {
    try {
      // Simular restauración
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCategorias(prev => prev.map(categoria => 
        categoria.id === id 
          ? { 
              ...categoria, 
              activo: true,
              eliminado_por: null,
              fecha_eliminacion: null,
              actualizado_por: 1,
              fecha_actualizacion: new Date().toISOString(),
            }
          : categoria
      ));
      
      toast.success('Categoría restaurada exitosamente', {
        description: 'La categoría ha sido reactivada',
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al restaurar categoría';
      toast.error('Error al restaurar categoría', {
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  return {
    categorias,
    isLoading,
    error,
    lastUpdated,
    loadCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    restoreCategoria,
  };
};

// Hook para filtros y búsqueda de categorías
export const useCategoriasGastoFilter = (categorias) => {
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    estado: 'activo',
    nivel: 'todos',
    sortBy: 'nombre',
    sortOrder: 'asc',
  });

  const filteredCategorias = useMemo(() => {
    let filtered = [...categorias];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(categoria => 
        categoria.nombre.toLowerCase().includes(searchLower) ||
        categoria.descripcion.toLowerCase().includes(searchLower) ||
        categoria.codigo.toLowerCase().includes(searchLower) ||
        categoria.tipo.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (filters.tipo) {
      filtered = filtered.filter(categoria => categoria.tipo === filters.tipo);
    }

    // Filtro por estado
    if (filters.estado === 'activo') {
      filtered = filtered.filter(categoria => categoria.activo);
    } else if (filters.estado === 'inactivo') {
      filtered = filtered.filter(categoria => !categoria.activo);
    }

    // Filtro por nivel
    if (filters.nivel === 'padre') {
      filtered = filtered.filter(categoria => categoria.nivel === 0);
    } else if (filters.nivel === 'hijo') {
      filtered = filtered.filter(categoria => categoria.nivel > 0);
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
  }, [categorias, filters]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      tipo: '',
      estado: 'activo',
      nivel: 'todos',
      sortBy: 'nombre',
      sortOrder: 'asc',
    });
  }, []);

  return {
    filters,
    filteredCategorias,
    updateFilter,
    resetFilters,
  };
};

// Hook para estadísticas de categorías
export const useCategoriasGastoStats = (categorias) => {
  const stats = useMemo(() => {
    const total = categorias.length;
    const activas = categorias.filter(c => c.activo).length;
    const inactivas = total - activas;
    
    // Distribución por tipo
    const porTipo = categorias.reduce((acc, categoria) => {
      if (categoria.activo) {
        acc[categoria.tipo] = (acc[categoria.tipo] || 0) + 1;
      }
      return acc;
    }, {});

    // Presupuesto y gastos
    const categoriasActivas = categorias.filter(c => c.activo);
    const presupuestoTotal = categoriasActivas.reduce((sum, c) => sum + c.presupuesto_mensual, 0);
    const gastoTotal = categoriasActivas.reduce((sum, c) => sum + c.gasto_actual, 0);
    const porcentajeEjecucion = presupuestoTotal > 0 ? (gastoTotal / presupuestoTotal) * 100 : 0;

    // Categorías con mayor gasto
    const categoriasMayorGasto = categoriasActivas
      .filter(c => c.gasto_actual > 0)
      .sort((a, b) => b.gasto_actual - a.gasto_actual)
      .slice(0, 5);

    // Categorías con presupuesto excedido
    const categoriasExcedidas = categoriasActivas
      .filter(c => c.gasto_actual > c.presupuesto_mensual)
      .length;

    // Distribución por nivel
    const categoriasPadre = categorias.filter(c => c.activo && c.nivel === 0).length;
    const categoriasHijo = categorias.filter(c => c.activo && c.nivel > 0).length;

    return {
      total,
      activas,
      inactivas,
      porTipo,
      presupuestoTotal,
      gastoTotal,
      porcentajeEjecucion,
      categoriasMayorGasto,
      categoriasExcedidas,
      categoriasPadre,
      categoriasHijo,
      porcentajeActivas: total > 0 ? (activas / total) * 100 : 0,
      disponible: presupuestoTotal - gastoTotal,
    };
  }, [categorias]);

  return stats;
};

// Hook para validación de formularios de categorías
export const useCategoriaGastoValidation = () => {
  const validateNombre = useCallback((nombre) => {
    if (!nombre?.trim()) return 'El nombre de la categoría es requerido';
    if (nombre.length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (nombre.length > 100) return 'El nombre no puede exceder 100 caracteres';
    return null;
  }, []);

  const validateCodigo = useCallback((codigo) => {
    if (!codigo?.trim()) return 'El código es requerido';
    if (codigo.length < 3) return 'El código debe tener al menos 3 caracteres';
    if (codigo.length > 20) return 'El código no puede exceder 20 caracteres';
    if (!/^[A-Z0-9-_]+$/.test(codigo)) {
      return 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos';
    }
    return null;
  }, []);

  const validatePresupuesto = useCallback((presupuesto) => {
    if (!presupuesto) return 'El presupuesto mensual es requerido';
    const num = parseInt(presupuesto);
    if (isNaN(num) || num < 0) return 'El presupuesto debe ser un número mayor o igual a 0';
    return null;
  }, []);

  const validateCategoriaForm = useCallback((formData) => {
    const errors = {};
    
    const nombreError = validateNombre(formData.nombre);
    if (nombreError) errors.nombre = nombreError;
    
    const codigoError = validateCodigo(formData.codigo);
    if (codigoError) errors.codigo = codigoError;
    
    if (!formData.tipo?.trim()) {
      errors.tipo = 'El tipo es requerido';
    }
    
    const presupuestoError = validatePresupuesto(formData.presupuesto_mensual);
    if (presupuestoError) errors.presupuesto_mensual = presupuestoError;
    
    if (!formData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.color?.trim()) {
      errors.color = 'El color es requerido';
    }
    
    if (!formData.icono?.trim()) {
      errors.icono = 'El ícono es requerido';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [validateNombre, validateCodigo, validatePresupuesto]);

  return {
    validateNombre,
    validateCodigo,
    validatePresupuesto,
    validateCategoriaForm,
  };
};

// Hook para estructura jerárquica de categorías
export const useCategoriasHierarchy = (categorias) => {
  const hierarchicalCategorias = useMemo(() => {
    const categoriasPadre = categorias.filter(c => c.nivel === 0);
    
    return categoriasPadre.map(padre => ({
      ...padre,
      hijos: categorias
        .filter(c => c.categoria_padre_id === padre.id)
        .sort((a, b) => a.orden - b.orden),
    })).sort((a, b) => a.orden - b.orden);
  }, [categorias]);

  const getCategoriasPadre = useCallback(() => {
    return categorias.filter(c => c.activo && c.nivel === 0);
  }, [categorias]);

  return {
    hierarchicalCategorias,
    getCategoriasPadre,
  };
};

export default {
  useCategoriasGasto,
  useCategoriasGastoFilter,
  useCategoriasGastoStats,
  useCategoriaGastoValidation,
  useCategoriasHierarchy,
};

