/**
 * Hook de autenticación v8.0
 * Sistema con RUT como identificador único y roles múltiples
 * Incluye servicio mock para desarrollo
 */

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { API_ENDPOINTS, AUTH_CONFIG, buildUrl, getAuthHeaders } from '../../../config/api';
import { validarRut, limpiarRut } from '../../../utils/rutValidator';
import { mockAuthService } from '../services/mockAuth';
import { authApi } from '@/api/auth.js';

// Contexto de autenticación
const AuthContext = createContext();

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
        const storedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error cargando datos de autenticación:', error);
        clearAuth();
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

  // Guardar autenticación
  const saveAuth = useCallback((userData, authToken, refreshToken = null) => {
    setUser(userData);
    setToken(authToken);
    setError(null);
    
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authToken);
    localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(userData));
    
    if (refreshToken) {
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    }
  }, []);

  // Login con RUT y contraseña
  const login = useCallback(async (rut, password, tipoUsuario = 'admin') => {
    setLoading(true);
    setError(null);

    try {
      // Validar RUT
      const rutLimpio = limpiarRut(rut);
      if (!validarRut(rutLimpio)) {
        throw new Error('RUT inválido');
      }

      // Usar servicio mock para desarrollo
      const result = await authApi.login({ rut, password });

      if (!result.success) {
        throw new Error(result.error || 'Error en el login');
      }

      // Guardar datos de autenticación
      saveAuth(result.data.user, result.data.token);

      return {
        success: true,
        user: result.data.user,
        token: result.data.token
      };

    } catch (error) {
      const errorMessage = error.message || 'Error de conexión';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);
  // Logout
  const logout = useCallback(async () => {
    setLoading(true);

    try {
      // Usar servicio mock para logout
      await mockAuthService.logout();
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
      
      // Actualizar datos del usuario si han cambiado
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(data.user));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: storedRefreshToken
        }),
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      saveAuth(data.user, data.token, data.refreshToken);
      
      return true;
    } catch (error) {
      console.error('Error refrescando token:', error);
      clearAuth();
      return false;
    }
  }, [clearAuth, saveAuth]);

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user || !token) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error cambiando contraseña');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }, [user, token]);

  // Obtener datos del usuario actual
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
      
      // Actualizar datos del usuario
      setUser(data.user);
      localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }, [token, clearAuth]);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(rol => rol.nombre === roleName || rol.codigo === roleName);
  }, [user]);

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = useCallback((roleNames) => {
    if (!user || !user.roles) return false;
    return roleNames.some(roleName => hasRole(roleName));
  }, [user, hasRole]);

  // Verificar si el usuario puede acceder a un curso específico (para tesoreros)
  const canAccessCourse = useCallback((cursoId) => {
    if (!user) return false;
    
    // Administradores pueden acceder a todo
    if (hasRole('administrador')) return true;
    
    // Tesoreros solo pueden acceder a su curso asignado
    if (hasRole('tesorero') && user.cursoAsignado) {
      return user.cursoAsignado.id === cursoId;
    }
    
    return false;
  }, [user, hasRole]);

  // Obtener tipo de usuario principal
  const getUserType = useCallback(() => {
    if (!user || !user.roles) return null;
    
    // Prioridad: administrador > profesor > tesorero > apoderado > alumno
    if (hasRole('administrador')) return 'admin';
    if (hasRole('profesor')) return 'profesor';
    if (hasRole('tesorero')) return 'tesorero';
    if (hasRole('apoderado')) return 'apoderado';
    if (hasRole('alumno')) return 'alumno';
    
    return null;
  }, [user, hasRole]);

  // Verificar si está autenticado
  const isAuthenticated = Boolean(user && token);

  // Verificar si es administrador
  const isAdmin = hasRole('administrador');

  // Verificar si es apoderado
  const isApoderado = hasRole('apoderado');

  // Verificar si es tesorero
  const isTesorero = hasRole('tesorero');

  // Verificar si es profesor
  const isProfesor = hasRole('profesor');

  // Verificar si es alumno
  const isAlumno = hasRole('alumno');

  const value = {
    // Estado
    user,
    token,
    loading,
    error,
    isAuthenticated,
    
    // Métodos de autenticación
    login,
    logout,
    verifyToken,
    refreshToken,
    changePassword,
    getCurrentUser,
    
    // Verificación de roles
    hasRole,
    hasAnyRole,
    canAccessCourse,
    getUserType,
    
    // Helpers de roles
    isAdmin,
    isApoderado,
    isTesorero,
    isProfesor,
    isAlumno,
    
    // Utilidades
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Hook para verificar autenticación en componentes
export const useRequireAuth = (requiredRoles = []) => {
  const auth = useAuth();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      if (!auth.isAuthenticated) {
        setCanAccess(false);
        return;
      }

      if (requiredRoles.length === 0) {
        setCanAccess(true);
        return;
      }

      const hasRequiredRole = auth.hasAnyRole(requiredRoles);
      setCanAccess(hasRequiredRole);
    };

    checkAccess();
  }, [auth.isAuthenticated, auth.user, requiredRoles]);

  return {
    ...auth,
    canAccess,
    loading: auth.loading
  };
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
    
    if (rutLimpio.length === 0) {
      setRutValid(false);
      setRutError('');
      return;
    }

    const isValid = validarRut(rutLimpio);
    setRutValid(isValid);
    setRutError(isValid ? '' : 'RUT inválido');
  }, []);

  const loginWithRut = useCallback(async (password, tipoUsuario) => {
    if (!rutValid) {
      return {
        success: false,
        error: 'RUT inválido'
      };
    }

    return await login(rutValue, password, tipoUsuario);
  }, [login, rutValue, rutValid]);

  return {
    rutValue,
    rutValid,
    rutError,
    handleRutChange,
    loginWithRut
  };
};

export default useAuth;

