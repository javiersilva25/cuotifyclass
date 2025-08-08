import apiClient from './client';

// URL base del backend v4.1.0
const API_BASE_URL = 'https://3000-i2rtjntwdxcsspj1a79oy-71f64272.manusvm.computer';

// Cliente API específico para apoderados
const apoderadoClient = {
  // Autenticación de apoderados
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apoderados/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el login');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en login de apoderado:', error);
      throw error;
    }
  },

  // Obtener perfil del apoderado
  getProfile: async (apoderadoId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apoderados/${apoderadoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener perfil');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  // Obtener hijos del apoderado
  getHijos: async (apoderadoId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apoderados/${apoderadoId}/hijos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener hijos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener hijos:', error);
      throw error;
    }
  },

  // Obtener deudas pendientes consolidadas
  getDeudasPendientes: async (apoderadoId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/apoderados/${apoderadoId}/deudas-pendientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener deudas pendientes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener deudas pendientes:', error);
      throw error;
    }
  },

  // Obtener historial de pagos
  getHistorialPagos: async (apoderadoId, token, limit = 50) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/apoderados/${apoderadoId}/history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener historial de pagos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener historial de pagos:', error);
      throw error;
    }
  },
};

// API del Sistema Unificado de Pagos
export const paymentsAPI = {
  // Obtener pasarelas disponibles
  getGateways: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/gateways`);
      
      if (!response.ok) {
        throw new Error('Error al obtener pasarelas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener pasarelas:', error);
      throw error;
    }
  },

  // Obtener recomendación de pasarela
  getRecommendation: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/api/payments/gateways/recommend?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener recomendación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener recomendación:', error);
      throw error;
    }
  },

  // Comparar costos de pasarelas
  compareGateways: async (amount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/gateways/compare?amount=${amount}`);
      
      if (!response.ok) {
        throw new Error('Error al comparar pasarelas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al comparar pasarelas:', error);
      throw error;
    }
  },

  // Crear pago unificado
  createPayment: async (apoderadoId, paymentData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/apoderados/${apoderadoId}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear pago');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error;
    }
  },

  // Probar configuraciones de pasarelas
  testGateways: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/gateways/test`);
      
      if (!response.ok) {
        throw new Error('Error al probar pasarelas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al probar pasarelas:', error);
      throw error;
    }
  },
};

export default apoderadoClient;

