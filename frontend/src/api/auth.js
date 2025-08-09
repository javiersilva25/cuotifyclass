// src/api/auth.js
import apiClient from './client.js';
import { API_ENDPOINTS } from '../config/api.js';
import { APP_CONFIG } from '../config/app.js';
// import { mockAuthService } from '../features/auth/services/mockAuth.js'; // opcional

// Forzar API real (puedes mover a .env → APP_CONFIG.AUTH_USE_MOCK=false)
const USE_MOCK = Boolean(APP_CONFIG?.AUTH_USE_MOCK ?? false); // por defecto: false

export const authApi = {
  // Login (RUT puede venir con puntos/guion; el backend lo normaliza)
  async login(credentials) {
    if (USE_MOCK) {
      // return mockAuthService.login(credentials);
      throw new Error('Mock deshabilitado');
    }
    const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return res;
  },

  async logout() {
    if (USE_MOCK) {
      // return mockAuthService.logout();
      return { success: true, message: 'Sesión cerrada (mock)' };
    }
    try {
      const res = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT ?? '/api/auth/logout');
      return res;
    } catch {
      // backend aún no expone logout: limpiar local es suficiente
      return { success: true, message: 'Sesión cerrada localmente' };
    }
  },

  async getCurrentUser() {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) throw new Error('No hay token de autenticación');
      // return mockAuthService.me(token);
      throw new Error('Mock deshabilitado');
    }
    const res = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return res;
  },

  // No hay refresh real: devuelve error controlado o implementa cuando exista
  async refreshToken() {
    return { success: false, message: 'Refresh no disponible' };
  },

  async updateProfile(profileData) {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) throw new Error('No hay token de autenticación');
      // return mockAuthService.updateProfile(token, profileData);
      throw new Error('Mock deshabilitado');
    }
    const res = await apiClient.put(API_ENDPOINTS.AUTH.ME, profileData);
    return res;
  },

  async changePassword(passwordData) {
    if (USE_MOCK) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      if (!token) throw new Error('No hay token de autenticación');
      // return mockAuthService.changePassword(token, passwordData);
      throw new Error('Mock deshabilitado');
    }
    // Backend: POST /api/auth/cambiar-password
    const endpoint = API_ENDPOINTS.AUTH.CHANGE_PASSWORD ?? '/api/auth/cambiar-password';
    const res = await apiClient.post(endpoint, passwordData);
    return res;
  },

  async healthCheck() {
    if (USE_MOCK) {
      return { success: true, message: 'ok (mock)' };
    }
    try {
      const res = await apiClient.get('/health');
      return res;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // === Token opaco (no JWT) ===
  validateToken(token) {
    // Backend entrega token tipo "token_simulado_admin|<rut>"
    return typeof token === 'string' && token.length > 0;
  },

  getTokenInfo(_token) {
    // No es JWT: sin claims decodificables
    return null;
  },

  isTokenExpiringSoon(_token, _bufferMinutes = 5) {
    // Token opaco: no aplica expiración local
    return false;
  },

  clearAuthData() {
    localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
    apiClient.setToken?.(null);
  },

  // Interceptor: añade Bearer automáticamente y evita refresh inexistente
  setupInterceptors() {
    const originalRequest = apiClient.request?.bind(apiClient) || apiClient.request;

    apiClient.request = async function (endpoint, options = {}) {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);

      // Adjunta Authorization si hay token válido (opaco)
      if (token && authApi.validateToken(token)) {
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        apiClient.setToken?.(token); // si tu client administra default headers
      }

      return originalRequest(endpoint, options);
    };
  },
};

// Configurar interceptores
authApi.setupInterceptors();

export default authApi;
