// src/api/auth.js
import apiClient from './client.js';
import { API_ENDPOINTS, AUTH_CONFIG } from '../config/api.js';
import { mockAuthService } from '../features/auth/services/mockAuth.js';

const USE_MOCK = false;

export const authApi = {
  async login(credentials) {
    try {
      const resp = USE_MOCK
        ? await mockAuthService.login(credentials)
        : await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);

      const success = resp?.success ?? false;
      const data = resp?.data ?? resp ?? {};
      const token = data?.token;

      if (success && token) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
      }
      return { success, data };
    } catch (e) {
      throw new Error(e?.message || 'Error al iniciar sesión');
    }
  },

  async logout() {
    try {
      if (USE_MOCK) {
        await mockAuthService.logout();
      } else {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (_) {
      // silencioso
    } finally {
      this.clearAuthData();
      return { success: true, message: 'Sesión cerrada' };
    }
  },

  async getCurrentUser() {
    try {
      const resp = USE_MOCK
        ? await mockAuthService.me(localStorage.getItem(AUTH_CONFIG.TOKEN_KEY))
        : await apiClient.get(API_ENDPOINTS.AUTH.ME);

      const success = resp?.success ?? true;
      const data = resp?.data ?? resp ?? {};
      return { success, data };
    } catch (e) {
      throw new Error(e?.message || 'Error al obtener usuario');
    }
  },

  async refreshToken() {
    try {
      const resp = USE_MOCK
        ? await mockAuthService.refreshToken(localStorage.getItem(AUTH_CONFIG.TOKEN_KEY))
        : await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);

      const success = resp?.success ?? false;
      const data = resp?.data ?? resp ?? {};
      const newToken = data?.token;

      if (success && newToken) {
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, newToken);
      }
      return { success, data };
    } catch (e) {
      throw new Error(e?.message || 'Error al refrescar token');
    }
  },

  async updateProfile(profileData) {
    try {
      const resp = USE_MOCK
        ? await mockAuthService.updateProfile(localStorage.getItem(AUTH_CONFIG.TOKEN_KEY), profileData)
        : await apiClient.put(API_ENDPOINTS.AUTH.ME, profileData);

      const success = resp?.success ?? true;
      const data = resp?.data ?? resp ?? {};
      return { success, data };
    } catch (e) {
      throw new Error(e?.message || 'Error al actualizar perfil');
    }
  },

  async changePassword(passwordData) {
    try {
      const resp = USE_MOCK
        ? await mockAuthService.changePassword(localStorage.getItem(AUTH_CONFIG.TOKEN_KEY), passwordData)
        : await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);

      const success = resp?.success ?? true;
      const data = resp?.data ?? resp ?? {};
      return { success, data };
    } catch (e) {
      throw new Error(e?.message || 'Error al cambiar contraseña');
    }
  },

  async healthCheck() {
    try {
      const resp = USE_MOCK ? await mockAuthService.healthCheck() : await apiClient.get('/health');
      return resp ?? { success: true };
    } catch (e) {
      return { success: false, error: e?.message || 'Health check fallido' };
    }
  },

  // --- helpers token (tolerante a token no-JWT/mock) ---
  validateToken(token) {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return true; // token mock
    try {
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload?.exp > now;
    } catch {
      return true;
    }
  },

  getTokenInfo(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return { isMock: true };
    try {
      const payload = JSON.parse(atob(parts[1]));
      return {
        userId: payload?.sub,
        role: payload?.role,
        issuedAt: payload?.iat ? new Date(payload.iat * 1000) : null,
        expiresAt: payload?.exp ? new Date(payload.exp * 1000) : null,
        isExpired: payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : false,
      };
    } catch {
      return { isMock: true };
    }
  },

  isTokenExpiringSoon(token, bufferMinutes = 5) {
    const info = this.getTokenInfo(token);
    if (!info || info.isMock || !info.expiresAt) return false;
    return info.expiresAt.getTime() - Date.now() <= bufferMinutes * 60 * 1000;
  },

  clearAuthData() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  },

  // Interceptor: adjunta Authorization en cada request
  setupInterceptors() {
    const originalRequest = apiClient.request?.bind(apiClient);
    if (!originalRequest) return; // si no existe, no parcheamos

    apiClient.request = async (endpoint, options = {}) => {
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      const headers = { ...(options.headers || {}) };

      if (token) {
        // Refresco opcional para JWT reales
        if (this.validateToken(token) && this.isTokenExpiringSoon(token)) {
          try {
            await this.refreshToken();
          } catch {}
        }
        headers.Authorization = `Bearer ${localStorage.getItem(AUTH_CONFIG.TOKEN_KEY) || token}`;
      }

      return originalRequest(endpoint, { ...options, headers });
    };
  },
};

// configurar interceptores
authApi.setupInterceptors();

export default authApi;
