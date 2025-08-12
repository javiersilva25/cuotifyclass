import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import tesoreroAPI from '../../../api/tesorero';
import { toast } from 'sonner';

// Hook principal para gestión de tesoreros
export const useTesorero = () => {
  const [tesoreros, setTesoreros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Obtener todos los tesoreros
  const fetchTesoreros = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setTesoreros(response.data.tesoreros || []);
      setPagination(response.data.pagination || pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tesoreros');
      toast.error('Error al cargar tesoreros');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Crear tesorero
  const createTesorero = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.create(data);
      toast.success('Tesorero asignado exitosamente');
      await fetchTesoreros();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear tesorero';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTesoreros]);

  // Actualizar tesorero
  const updateTesorero = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.update(id, data);
      toast.success('Tesorero actualizado exitosamente');
      await fetchTesoreros();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar tesorero';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTesoreros]);

  // Eliminar tesorero
  const deleteTesorero = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await tesoreroAPI.delete(id);
      toast.success('Tesorero eliminado exitosamente');
      await fetchTesoreros();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar tesorero';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTesoreros]);

  // Activar tesorero
  const activateTesorero = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await tesoreroAPI.activate(id);
      toast.success('Tesorero activado exitosamente');
      await fetchTesoreros();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al activar tesorero';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTesoreros]);

  // Desactivar tesorero
  const deactivateTesorero = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await tesoreroAPI.deactivate(id);
      toast.success('Tesorero desactivado exitosamente');
      await fetchTesoreros();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al desactivar tesorero';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTesoreros]);

  // Cambiar página
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Cambiar límite por página
  const changeLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  return {
    tesoreros,
    loading,
    error,
    pagination,
    fetchTesoreros,
    createTesorero,
    updateTesorero,
    deleteTesorero,
    activateTesorero,
    deactivateTesorero,
    changePage,
    changeLimit
  };
};

// Hook para datos del tesorero actual
export const useTesoreroActual = () => {
  const { user } = useAuth();
  const [tesorero, setTesorero] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const esTesorero = Array.isArray(user?.roles)
    ? user.roles.includes('tesorero') || user.roles.includes('admin')
    : (user?.role === 'tesorero' || user?.role === 'admin');

  const fetchMyData = useCallback(async () => {
    if (!esTesorero) return;

    setLoading(true);
    setError(null);
    try {
      const data = await tesoreroAPI.getMyData(); // ← ya retorna el objeto { rut_persona, curso, ... }
      setTesorero(data || null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cargar datos del tesorero');
      setTesorero(null);
    } finally {
      setLoading(false);
    }
  }, [esTesorero]);

  useEffect(() => {
    fetchMyData();
  }, [fetchMyData]);

  return { tesorero, loading, error, refetch: fetchMyData };
};

// Hook para resumen del curso del tesorero
export const useResumenCursoTesorero = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.getResumenCurso();
      setResumen(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar resumen del curso');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  return {
    resumen,
    loading,
    error,
    refetch: fetchResumen
  };
};

// Hook para estadísticas financieras del curso
export const useEstadisticasFinancierasCurso = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.getEstadisticasFinancierasCurso();
      setEstadisticas(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas financieras');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    estadisticas,
    loading,
    error,
    refetch: fetchEstadisticas
  };
};

// Hook para alumnos del curso del tesorero
export const useAlumnosCursoTesorero = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  const fetchAlumnos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.getAlumnosCurso({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setAlumnos(response.data.alumnos || response.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar alumnos del curso');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  return {
    alumnos,
    loading,
    error,
    pagination,
    fetchAlumnos,
    changePage
  };
};

// Hook para pagos del curso del tesorero
export const usePagosCursoTesorero = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  const fetchPagos = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tesoreroAPI.getPagosCurso({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      
      setPagos(response.data.pagos || response.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar pagos del curso');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  return {
    pagos,
    loading,
    error,
    pagination,
    fetchPagos,
    changePage
  };
};

// Hook para verificar acceso a curso
export const useVerificarAccesoCurso = () => {
  const { user } = useAuth();

  const verificarAcceso = useCallback(async (cursoId) => {
    if (!user || user.role !== 'tesorero') {
      return false;
    }

    try {
      const response = await tesoreroAPI.checkCourseAccess(user.id, cursoId);
      return response.data.puede_acceder;
    } catch (err) {
      console.error('Error al verificar acceso al curso:', err);
      return false;
    }
  }, [user]);

  return { verificarAcceso };
};

