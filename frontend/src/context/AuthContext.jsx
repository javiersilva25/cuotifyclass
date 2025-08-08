import { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../api/client.js';
import { API_ENDPOINTS } from '../config/api.js';
import { APP_CONFIG } from '../config/app.js';
import { ROLES } from '../constants/index.js';

// Estado inicial del contexto de autenticación
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: {
    canManageAlumnos: false,
    canManageCursos: false,
    canManageFinanzas: false,
    canViewReports: false,
    isAdmin: false,
    isProfesor: false,
    isTesorero: false,
  },
};

// Tipos de acciones para el reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_SESSION: 'RESTORE_SESSION',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

// Función para calcular permisos basados en el rol del usuario
const calculatePermissions = (user) => {
  if (!user || !user.role) {
    return initialState.permissions;
  }

  const role = user.role.toLowerCase();

  return {
    canManageAlumnos: [ROLES.ADMIN, ROLES.ADMINISTRADOR, ROLES.PROFESOR].includes(role),
    canManageCursos: [ROLES.ADMIN, ROLES.ADMINISTRADOR, ROLES.PROFESOR].includes(role),
    canManageFinanzas: [ROLES.ADMIN, ROLES.ADMINISTRADOR, ROLES.TESORERO].includes(role),
    canViewReports: [ROLES.ADMIN, ROLES.ADMINISTRADOR, ROLES.TESORERO, ROLES.PROFESOR].includes(role),
    isAdmin: role === ROLES.ADMIN,
    isAdministrador: role === ROLES.ADMINISTRADOR,
    isProfesor: role === ROLES.PROFESOR,
    isTesorero: role === ROLES.TESORERO,
    isAlumno: role === ROLES.ALUMNO,
  };
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      const permissions = calculatePermissions(action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        permissions,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        permissions: initialState.permissions,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.RESTORE_SESSION:
      const restoredPermissions = calculatePermissions(action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        permissions: restoredPermissions,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      const updatedPermissions = calculatePermissions(action.payload.user);
      return {
        ...state,
        user: action.payload.user,
        permissions: updatedPermissions,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext(null);

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Hook para usar permisos
export const usePermissions = () => {
  const { permissions } = useAuth();
  return permissions;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para iniciar sesión
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Intentar login con el backend
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Guardar token en el cliente API
        apiClient.setToken(token);
        
        // Guardar en localStorage
        localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, token);
        localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(user));
        
        // Actualizar estado
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true, user };
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      return { success: false, error: errorMessage };
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    try {
      // Intentar logout en el backend
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Error al cerrar sesión en el backend:', error);
    } finally {
      // Limpiar estado local independientemente del resultado del backend
      apiClient.setToken(null);
      localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.REFRESH_TOKEN_KEY);
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Función para actualizar información del usuario
  const updateUser = async (userData) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.ME, userData);
      
      if (response.success) {
        const updatedUser = response.data;
        
        // Actualizar localStorage
        localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(updatedUser));
        
        // Actualizar estado
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { user: updatedUser },
        });

        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar usuario';
      return { success: false, error: errorMessage };
    }
  };

  // Función para refrescar token
  const refreshToken = async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      
      if (response.success) {
        const { token } = response.data;
        
        // Actualizar token
        apiClient.setToken(token);
        localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, token);
        
        return { success: true, token };
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (error) {
      // Si falla el refresh, cerrar sesión
      logout();
      return { success: false, error: error.message };
    }
  };

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = (permission) => {
    return state.permissions[permission] || false;
  };

  // Función para verificar si el usuario tiene alguno de los roles especificados
  const hasRole = (roles) => {
    if (!state.user || !state.user.role) return false;
    
    const userRole = state.user.role.toLowerCase();
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return allowedRoles.some(role => role.toLowerCase() === userRole);
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para restaurar sesión desde localStorage
  const restoreSession = () => {
    try {
      const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
      const userStr = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        
        // Configurar token en el cliente API
        apiClient.setToken(token);
        
        // Restaurar estado
        dispatch({
          type: AUTH_ACTIONS.RESTORE_SESSION,
          payload: { user, token },
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error al restaurar sesión:', error);
      // Limpiar datos corruptos
      localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
    }
    
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: { isLoading: false } });
    return false;
  };

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const sessionRestored = restoreSession();
      
      if (sessionRestored) {
        try {
          // Verificar que la sesión siga siendo válida
          const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
          
          if (!response.success) {
            // Si la sesión no es válida, cerrar sesión
            logout();
          }
        } catch (error) {
          // Si hay error al verificar, cerrar sesión
          logout();
        }
      }
    };

    initializeAuth();
  }, []);

  // Auto-logout cuando el token expire
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      const checkTokenExpiry = () => {
        try {
          const tokenPayload = JSON.parse(atob(state.token.split('.')[1]));
          const expiryTime = tokenPayload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiry = expiryTime - currentTime;
          
          // Si el token expira en menos del buffer configurado, intentar refrescar
          if (timeUntilExpiry <= APP_CONFIG.AUTH.TOKEN_EXPIRY_BUFFER) {
            refreshToken();
          }
        } catch (error) {
          console.error('Error al verificar expiración del token:', error);
        }
      };

      // Verificar cada minuto
      const interval = setInterval(checkTokenExpiry, 60000);
      
      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.token]);

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Acciones
    login,
    logout,
    updateUser,
    refreshToken,
    clearError,
    
    // Utilidades
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

