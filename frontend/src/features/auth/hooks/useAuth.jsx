/**
 * Hook de autenticación v8.0
 * Sistema con RUT como identificador único y roles múltiples
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { API_ENDPOINTS, AUTH_CONFIG, buildUrl, getAuthHeaders } from '../../../config/api';
import { validarRut, limpiarRut } from '../../../utils/rutValidator';
import { mockAuthService } from '../services/mockAuth';

// Contexto de autenticación
const AuthContext = createContext();

// --- Utilidades ---
const safeParseJSON = (value) => {
  if (!value) return null;
  if (value === 'undefined' || value === 'null') return null;
  try { return JSON.parse(value); } catch { return null; }
};

function rutParaAPI(rutLimpio) {
  const base = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  return `${base}-${dv}`.toUpperCase();
}

// Mapa de IDs ↔ nombres de roles (BD)
const ROLE_MAP = {
  1: 'apoderado',
  2: 'directiva',
  3: 'directiva_alumnos',
  4: 'profesor',
  5: 'direccion',
  6: 'ccpp',
  7: 'ccaa',
  8: 'administrador',
  9: 'tesorero',
};

function normalizeRoles(raw) {
  if (!raw) return [];
  return (Array.isArray(raw) ? raw : [raw])
    .map((r) => {
      if (typeof r === 'string') return r.toLowerCase();
      if (typeof r === 'number') return (ROLE_MAP[r] || String(r)).toLowerCase();
      const id = r?.rol_id ?? r?.id;
      const byId = id ? ROLE_MAP[id] : null;
      const byName = (r?.nombre_rol || r?.nombre || r?.codigo || r?.role || '').toLowerCase();
      return (byId || byName || '').toLowerCase();
    })
    .filter(Boolean);
}

function normalizeUser(u) {
  if (!u) return u;
  const roles = normalizeRoles(u.roles || u.persona_roles || u.permisos || []);
  return { ...u, roles };
}

// Provider de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        const storedUserRaw = localStorage.getItem(AUTH_CONFIG.USER_KEY);
        const storedUser = safeParseJSON(storedUserRaw);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
          localStorage.removeItem(AUTH_CONFIG.USER_KEY);
          localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        }
      } catch (error) {
        console.error('Error cargando datos de autenticación:', error);
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // Limpiar autenticación
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }, []);

  // Guardar autenticación (normalizando usuario/roles)
  const saveAuth = useCallback((userData, authToken, refreshToken = null) => {
    const userNorm = normalizeUser(userData || null);

    setUser(userNorm);
    setToken(authToken || null);
    setError(null);

    if (authToken) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    }

    if (userNorm && typeof userNorm === 'object') {
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userNorm));
    } else {
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }

    if (refreshToken) {
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    }
  }, []);

  // Login con RUT y contraseña
  const login = useCallback(async (rut, password, tipoUsuario = 'admin') => {
    setLoading(true);
    setError(null);

    try {
      const rutLimpio = limpiarRut(rut);
      if (!validarRut(rutLimpio)) throw new Error('RUT inválido');
      const rutApi = rutParaAPI(rutLimpio);

      const resp = await fetch(buildUrl(API_ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut: rutApi, password, tipoUsuario }),
      });

      let data = null;
      try { data = await resp.json(); } catch { data = {}; }

      if (!resp.ok) throw new Error(data?.message || data?.error || 'Credenciales inválidas');

      // Soportar respuesta plana y envuelta en data
      const token =
        data?.token || data?.accessToken || data?.jwt ||
        data?.data?.token || data?.data?.accessToken;

      let userResp =
        data?.user || data?.usuario || data?.perfil ||
        data?.data?.user || data?.data?.usuario;

      const mustChange =
        data?.debeCambiarPassword ?? data?.data?.debeCambiarPassword ?? false;

      if (!userResp) {
        userResp = {
          rut: rutApi,
          userType: data?.userType || data?.tipoUsuario || 'admin',
          roles: data?.roles || data?.data?.roles || [],
        };
      }

      if (!token) throw new Error('No se recibió token de autenticación');

      // Guardar sesión normalizando
      saveAuth(userResp, token, data?.refreshToken || data?.data?.refreshToken);

      return { success: true, user: normalizeUser(userResp), token, mustChange };
    } catch (error) {
      const msg = error.message || 'Error de conexión';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await mockAuthService.logout(); // o tu endpoint real si aplica
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      clearAuth();
      setLoading(false);
    }
  }, [clearAuth]);

  // Verificar token
  const verifyToken = useCallback(async () => {
    if (!token) return false;
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.VERIFY), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      const u = data?.user || data?.data?.user;
      if (u) {
        const userNorm = normalizeUser(u);
        setUser(userNorm);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userNorm));
      }
      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      clearAuth();
      return false;
    }
  }, [token, clearAuth]);

  // Refrescar token
  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      clearAuth();
      return false;
    }

    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      const u = data?.user || data?.data?.user;
      const t = data?.token || data?.data?.token;
      const r = data?.refreshToken || data?.data?.refreshToken;
      saveAuth(normalizeUser(u), t, r);
      return true;
    } catch (error) {
      console.error('Error refrescando token:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth, saveAuth]);

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user || !token) throw new Error('Usuario no autenticado');

    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error cambiando contraseña');

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [user, token]);

  // Obtener usuario actual
  const getCurrentUser = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.ME), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        clearAuth();
        return null;
      }

      const data = await response.json();
      const userNorm = normalizeUser(data?.user || data?.data?.user);
      setUser(userNorm);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userNorm));
      return userNorm;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }, [token, clearAuth]);

  // Roles
  const hasRole = useCallback((roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some((r) =>
      (typeof r === 'string' ? r : '').toLowerCase() === roleName.toLowerCase()
    );
  }, [user]);

  const hasAnyRole = useCallback((roleNames) => {
    if (!user || !user.roles) return false;
    return roleNames.some((roleName) => hasRole(roleName));
  }, [user, hasRole]);

  const canAccessCourse = useCallback((cursoId) => {
    if (!user) return false;
    if (hasRole('administrador')) return true;
    if (hasRole('tesorero') && user.cursoAsignado) {
      return user.cursoAsignado.id === cursoId;
    }
    return false;
  }, [user, hasRole]);

  const getUserType = useCallback(() => {
    if (!user || !user.roles) return null;
    if (hasRole('administrador')) return 'admin';
    if (hasRole('profesor')) return 'profesor';
    if (hasRole('tesorero')) return 'tesorero';
    if (hasRole('apoderado')) return 'apoderado';
    if (hasRole('alumno')) return 'alumno';
    return null;
  }, [user, hasRole]);

  // Flags
  const isAuthenticated = Boolean(user && token);
  const isAdmin = hasRole('administrador');
  const isApoderado = hasRole('apoderado');
  const isTesorero = hasRole('tesorero');
  const isProfesor = hasRole('profesor');
  const isAlumno = hasRole('alumno');

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    verifyToken,
    refreshToken,
    changePassword,
    getCurrentUser,
    hasRole,
    hasAnyRole,
    canAccessCourse,
    getUserType,
    isAdmin,
    isApoderado,
    isTesorero,
    isProfesor,
    isAlumno,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
};

// Hook para verificar autenticación en componentes
export const useRequireAuth = (requiredRoles = []) => {
  const auth = useAuth();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) return setCanAccess(false);
    if (requiredRoles.length === 0) return setCanAccess(true);
    setCanAccess(auth.hasAnyRole(requiredRoles));
  }, [auth.isAuthenticated, auth.user, requiredRoles]);

  return { ...auth, canAccess, loading: auth.loading };
};

// Hook para manejar login con RUT
export const useRutLogin = () => {
  const { login } = useAuth();
  const [rutValue, setRutValue] = useState('');
  const [rutValid, setRutValid] = useState(false);
  const [rutError, setRutError] = useState('');

  const handleRutChange = useCallback((value) => {
    const rutLimpio = limpiarRut(value);
    setRutValue(value);
    if (rutLimpio.length === 0) { setRutValid(false); setRutError(''); return; }
    const isValid = validarRut(rutLimpio);
    setRutValid(isValid);
    setRutError(isValid ? '' : 'RUT inválido');
  }, []);

  const loginWithRut = useCallback(async (password, tipoUsuario) => {
    if (!rutValid) return { success: false, error: 'RUT inválido' };
    return await login(rutValue, password, tipoUsuario);
  }, [login, rutValue, rutValid]);

  return { rutValue, rutValid, rutError, handleRutChange, loginWithRut };
};

export default useAuth;
