import apiClient from './client.js';
import { API_ENDPOINTS } from '../config/api.js';
import { APP_CONFIG } from '../config/app.js';
import { mockAuthService } from '../features/auth/services/mockAuth.js';

// Determinar si usar mock o API real
const USE_MOCK = false; // Siempre usar API real para v8.6.00

// API de autenticación
export const authApi = {
  // Login
  async login(credentials) {
    if (USE_MOCK) {
      return mockAuthService.login(credentials);
    }
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  },

  // Logout
  async logout() {
    if (USE_MOCK) {
      return mockAuthService.logout();
    }
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      return response;
    } catch (error) {
      // No lanzar error en logout, solo loggear
      console.warn('Error al cerrar sesión:', error);
      return { success: true, message: 'Sesión cerrada localmente' };
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      return mockAuthService.me(token);
    }
    
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener usuario');
    }
  },

  // Refrescar token
  async refreshToken() {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) {
        throw new Error('No hay token para refrescar');
      }
      return mockAuthService.refreshToken(token);
    }
    
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al refrescar token');
    }
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      return mockAuthService.updateProfile(token, profileData);
    }
    
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.ME, profileData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  },

  // Cambiar contraseña
  async changePassword(passwordData) {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      return mockAuthService.changePassword(token, passwordData);
    }
    
    try {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  },

  // Verificar salud del servicio
  async healthCheck() {
    if (USE_MOCK) {
      return mockAuthService.healthCheck();
    }
    
    try {
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Validar token localmente
  validateToken(token) {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  // Obtener información del token
  getTokenInfo(token) {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        isExpired: payload.exp < Math.floor(Date.now() / 1000),
      };
    } catch {
      return null;
    }
  },

  // Verificar si el token expira pronto
  isTokenExpiringSoon(token, bufferMinutes = 5) {
    const tokenInfo = this.getTokenInfo(token);
    if (!tokenInfo) return true;
    
    const bufferMs = bufferMinutes * 60 * 1000;
    const expiryTime = tokenInfo.expiresAt.getTime();
    const currentTime = Date.now();
    
    return (expiryTime - currentTime) <= bufferMs;
  },

  // Limpiar datos de autenticación
  clearAuthData() {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    apiClient.setToken(null);
  },

  // Configurar interceptores para manejo automático de tokens
  setupInterceptors() {
    // Interceptor para agregar token automáticamente
    const originalRequest = apiClient.request.bind(apiClient);
    
    apiClient.request = async function(endpoint, options = {}) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      
      if (token && authApi.validateToken(token)) {
        // Si el token expira pronto, intentar refrescarlo
        if (authApi.isTokenExpiringSoon(token)) {
          try {
            const refreshResult = await authApi.refreshToken();
            if (refreshResult.success) {
              const newToken = refreshResult.data.token;
              localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, newToken);
              apiClient.setToken(newToken);
            }
          } catch (error) {
            console.warn('Error al refrescar token:', error);
          }
        }
      }
      
      return originalRequest(endpoint, options);
    };
  },
};

// Configurar interceptores al importar
authApi.setupInterceptors();

export default authApi;

