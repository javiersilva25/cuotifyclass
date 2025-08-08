import { useState, useEffect, useCallback } from 'react';
import apoderadoClient, { paymentsAPI } from '../../../api/apoderado';
import { useAuth } from '../../../context/AuthContext';

// Hook para autenticación de apoderados
export const useApoderadoAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apoderadoClient.login(credentials);
      
      if (response.success) {
        // Guardar datos del apoderado en el contexto de auth
        const userData = {
          ...response.data.apoderado,
          token: response.data.token,
          userType: 'apoderado'
        };
        
        login(userData);
        return { success: true, data: userData };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return {
    handleLogin,
    isLoading,
    error,
  };
};

// Hook para datos del apoderado
export const useApoderadoData = () => {
  const [profile, setProfile] = useState(null);
  const [hijos, setHijos] = useState([]);
  const [deudasPendientes, setDeudasPendientes] = useState([]);
  const [historialPagos, setHistorialPagos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar perfil del apoderado
  const loadProfile = useCallback(async () => {
    if (!user?.id || !user?.token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apoderadoClient.getProfile(user.id, user.token);
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar hijos del apoderado
  const loadHijos = useCallback(async () => {
    if (!user?.id || !user?.token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apoderadoClient.getHijos(user.id, user.token);
      if (response.success) {
        setHijos(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar deudas pendientes
  const loadDeudasPendientes = useCallback(async () => {
    if (!user?.id || !user?.token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apoderadoClient.getDeudasPendientes(user.id, user.token);
      if (response.success) {
        setDeudasPendientes(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar historial de pagos
  const loadHistorialPagos = useCallback(async (limit = 50) => {
    if (!user?.id || !user?.token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apoderadoClient.getHistorialPagos(user.id, user.token, limit);
      if (response.success) {
        setHistorialPagos(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Recargar todos los datos
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadProfile(),
      loadHijos(),
      loadDeudasPendientes(),
      loadHistorialPagos()
    ]);
  }, [loadProfile, loadHijos, loadDeudasPendientes, loadHistorialPagos]);

  return {
    profile,
    hijos,
    deudasPendientes,
    historialPagos,
    isLoading,
    error,
    loadProfile,
    loadHijos,
    loadDeudasPendientes,
    loadHistorialPagos,
    refreshData,
  };
};

// Hook para sistema de pagos unificado
export const usePayments = () => {
  const [gateways, setGateways] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar pasarelas disponibles
  const loadGateways = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentsAPI.getGateways();
      if (response.success) {
        setGateways(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener recomendación de pasarela
  const getRecommendation = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentsAPI.getRecommendation({
        country: 'CL',
        priority: 'cost',
        ...params
      });
      if (response.success) {
        setRecommendation(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Comparar costos de pasarelas
  const compareGateways = useCallback(async (amount) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentsAPI.compareGateways(amount);
      if (response.success) {
        setComparison(response.data);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear pago
  const createPayment = useCallback(async (paymentData) => {
    if (!user?.id || !user?.token) {
      throw new Error('Usuario no autenticado');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentsAPI.createPayment(user.id, paymentData, user.token);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear pago');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Probar configuraciones
  const testGateways = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentsAPI.testGateways();
      if (response.success) {
        return response.data;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadGateways();
  }, [loadGateways]);

  return {
    gateways,
    recommendation,
    comparison,
    isLoading,
    error,
    loadGateways,
    getRecommendation,
    compareGateways,
    createPayment,
    testGateways,
  };
};

