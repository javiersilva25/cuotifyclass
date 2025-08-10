/**
 * Hook de autenticación v8.3 (roles normalizados + /me tras login)
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { API_ENDPOINTS, AUTH_CONFIG, buildUrl, getAuthHeaders } from '../../../config/api';
import { validarRut, limpiarRut } from '../../../utils/rutValidator';
import { mockAuthService } from '../services/mockAuth';
import { authApi } from '@/api/auth.js';

const AuthContext = createContext();

/* ===== Utilidades de roles ===== */

const ROLES = {
  ADMIN: 'Administrador',
  DIRECTIVO: 'Directivo',
  PROFESOR: 'Profesor',
  APODERADO: 'Apoderado',
  ALUMNO: 'Alumno',
  TESORERO: 'Tesorero Alumnos',
};

// normaliza texto (case-insensitive, trim)
const norm = (v) => String(v || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();

// mapea alias conocidos a nombre canónico
const roleAliasToCanonical = (name) => {
  const n = norm(name);
  if (['administrador', 'admin'].includes(n)) return ROLES.ADMIN;
  if (['directivo', 'direccion'].includes(n)) return ROLES.DIRECTIVO;
  if (['profesor', 'docente'].includes(n)) return ROLES.PROFESOR;
  if (['apoderado', 'apoderada', 'tutor'].includes(n)) return ROLES.APODERADO;
  if (['alumno', 'estudiante'].includes(n)) return ROLES.ALUMNO;
  if (['tesorero alumnos', 'tesorero', 'tesoreria'].includes(n)) return ROLES.TESORERO;
  return name;
};

// extrae nombre de rol desde objeto o string y lo normaliza a canónico
const extractRoleName = (rol) => {
  if (!rol) return '';
  const raw = typeof rol === 'string'
    ? rol
    : (rol.nombre_rol ?? rol.nombre ?? rol.codigo ?? '');
  return roleAliasToCanonical(raw);
};

// convierte cualquier forma de roles a: roles: [{ nombre: 'Administrador' }, ...]
const normalizeUser = (userData) => {
  const rawRoles = Array.isArray(userData?.persona_roles)
    ? userData.persona_roles
    : (Array.isArray(userData?.roles) ? userData.roles : []);

  const roles = rawRoles.map((r) => {
    const nombre = extractRoleName(r);
    return { nombre };
  });

  return { ...userData, roles };
};

/* ================================= */

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
        const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error cargando datos de autenticación:', e);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  }, []);

  const saveAuth = useCallback((userData, authToken, refreshToken = null) => {
    const normalizedUser = normalizeUser(userData || {});
    setUser(normalizedUser);
    setToken(authToken);
    setError(null);

    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authToken);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(normalizedUser));
    if (refreshToken) localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
  }, []);

  // Login: ahora /login devuelve solo token → luego llamamos /me
  const login = useCallback(async (rut, password) => {
    setLoading(true);
    setError(null);
    try {
      const rutLimpio = limpiarRut(rut);
      if (!validarRut(rutLimpio)) throw new Error('RUT inválido');

      const result = await authApi.login({ rut, password });
      if (!result?.success) throw new Error(result?.error || 'Error en el login');

      const token = result.data.token;
      // guarda token temporal para que getAuthHeaders lo use
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
      setToken(token);

      // obtener usuario real con roles desde /me
      const me = await authApi.getCurrentUser();
      if (!me?.success || !me?.data?.user) {
        throw new Error('No se pudo obtener el perfil');
      }

      saveAuth(me.data.user, token);
      return { success: true, user: me.data.user, token };
    } catch (e) {
      const msg = e.message || 'Error de conexión';
      setError(msg);
      clearAuth();
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [saveAuth, clearAuth]);

  const logout = useCallback(async () => {
    setLoading(true);
    try { await mockAuthService.logout(); } catch (e) { console.error('Error en logout:', e); }
    finally { clearAuth(); setLoading(false); }
  }, [clearAuth]);

  const verifyToken = useCallback(async () => {
    if (!token) return false;
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.VERIFY), {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) { clearAuth(); return false; }
      const data = await response.json();
      if (data.user) {
        const normalized = normalizeUser(data.user);
        setUser(normalized);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(normalized));
      }
      return true;
    } catch (e) {
      console.error('Error verificando token:', e);
      clearAuth();
      return false;
    }
  }, [token, clearAuth]);

  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) { clearAuth(); return false; }
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
      if (!response.ok) { clearAuth(); return false; }
      const data = await response.json();
      saveAuth(data.user, data.token, data.refreshToken);
      return true;
    } catch (e) {
      console.error('Error refrescando token:', e);
      clearAuth();
      return false;
    }
  }, [clearAuth, saveAuth]);

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
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, token]);

  const getCurrentUser = useCallback(async () => {
    if (!token) return null;
    try {
      const me = await authApi.getCurrentUser();
      if (!me?.success || !me?.data?.user) return null;
      const normalized = normalizeUser(me.data.user);
      setUser(normalized);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(normalized));
      return normalized;
    } catch (e) {
      console.error('Error obteniendo usuario actual:', e);
      return null;
    }
  }, [token]);

  /* ===== Roles ===== */

  const hasRole = useCallback((roleName) => {
    if (!user || !Array.isArray(user.roles)) return false;
    const target = roleAliasToCanonical(roleName);
    return user.roles.some((r) => extractRoleName(r) === target);
  }, [user]);

  const hasAnyRole = useCallback((roleNames) => {
    if (!user || !Array.isArray(user.roles)) return false;
    return roleNames.some((r) => hasRole(r));
  }, [user, hasRole]);

  const canAccessCourse = useCallback((cursoId) => {
    if (!user) return false;
    if (hasRole(ROLES.ADMIN)) return true;
    if (hasRole(ROLES.TESORERO) && user.cursoAsignado) {
      return user.cursoAsignado.id === cursoId;
    }
    return false;
  }, [user, hasRole]);

  const getUserType = useCallback(() => {
    if (!user || !user.roles) return null;
    if (hasRole(ROLES.ADMIN))     return 'admin';
    if (hasRole(ROLES.PROFESOR))  return 'profesor';
    if (hasRole(ROLES.TESORERO))  return 'tesorero';
    if (hasRole(ROLES.APODERADO)) return 'apoderado';
    if (hasRole(ROLES.ALUMNO))    return 'alumno';
    if (hasRole(ROLES.DIRECTIVO)) return 'directivo';
    return null;
  }, [user, hasRole]);

  /* ===== Flags ===== */
  const isAuthenticated = Boolean(user && token);
  const isAdmin     = hasRole(ROLES.ADMIN);
  const isApoderado = hasRole(ROLES.APODERADO);
  const isTesorero  = hasRole(ROLES.TESORERO);
  const isProfesor  = hasRole(ROLES.PROFESOR);
  const isAlumno    = hasRole(ROLES.ALUMNO);
  const isDirectivo = hasRole(ROLES.DIRECTIVO);

  const value = {
    user, token, loading, error, isAuthenticated,
    login, logout, verifyToken, refreshToken, changePassword, getCurrentUser,
    hasRole, hasAnyRole, canAccessCourse, getUserType,
    isAdmin, isApoderado, isTesorero, isProfesor, isAlumno, isDirectivo,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return ctx;
};

export const useRequireAuth = (requiredRoles = []) => {
  const auth = useAuth();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) { setCanAccess(false); return; }
    if (requiredRoles.length === 0) { setCanAccess(true); return; }
    setCanAccess(auth.hasAnyRole(requiredRoles));
  }, [auth.isAuthenticated, auth.user, requiredRoles]);

  return { ...auth, canAccess, loading: auth.loading };
};

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
