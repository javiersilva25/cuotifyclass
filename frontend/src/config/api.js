/**
 * Configuración de API v8.0
 * Sistema de Gestión Escolar con geografía CUT 2018 completa
 */

// URL base del API según el entorno
const getApiBaseUrl = () => {
  // En producción, usar la URL real del backend
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.tu-colegio.cl';
  }
  
  // En desarrollo, usar localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

// Configuración principal de la API
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  VERSION: '8.0.0',
};

// Endpoints de la API v8.0
export const API_ENDPOINTS = {
  // Autenticación con RUT
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  
  // Geografía CUT 2018 (NUEVO v8.0)
  GEOGRAFIA: {
    REGIONES: '/api/geografia/regiones',
    PROVINCIAS: (codigoRegion) => `/api/geografia/regiones/${codigoRegion}/provincias`,
    COMUNAS_PROVINCIA: (codigoProvincia) => `/api/geografia/provincias/${codigoProvincia}/comunas`,
    COMUNAS_REGION: (codigoRegion) => `/api/geografia/regiones/${codigoRegion}/comunas`,
    COMUNA_DETALLE: (codigoComuna) => `/api/geografia/comunas/${codigoComuna}`,
    BUSCAR: '/api/geografia/buscar',
    JERARQUIA: '/api/geografia/jerarquia',
    ESTADISTICAS: '/api/geografia/estadisticas',
    HEALTH: '/api/geografia/health',
  },
  
  // Gestión de Personas (NUEVO v7.0)
  PERSONAS: {
    BASE: '/api/personas',
    BUSCAR: '/api/personas/buscar',
    BY_RUT: (rut) => `/api/personas/${rut}`,
    CREAR: '/api/personas',
    ACTUALIZAR: (rut) => `/api/personas/${rut}`,
    ELIMINAR: (rut) => `/api/personas/${rut}`,
    ROLES: (rut) => `/api/personas/${rut}/roles`,
    ASIGNAR_ROL: (rut) => `/api/personas/${rut}/roles`,
    REMOVER_ROL: (rut, rolId) => `/api/personas/${rut}/roles/${rolId}`,
  },
  
  // Gestión de Roles (NUEVO v7.0)
  ROLES: {
    BASE: '/api/roles',
    BY_ID: (id) => `/api/roles/${id}`,
    POR_CATEGORIA: '/api/roles/por-categoria',
    DISPONIBLES: '/api/roles/disponibles',
  },
  
  // Gestión de Usuarios (NUEVO v7.0)
  USUARIOS: {
    BASE: '/api/usuarios',
    BY_RUT: (rut) => `/api/usuarios/${rut}`,
    CREAR: '/api/usuarios',
    ACTUALIZAR: (rut) => `/api/usuarios/${rut}`,
    CAMBIAR_PASSWORD: (rut) => `/api/usuarios/${rut}/password`,
    RESETEAR_PASSWORD: (rut) => `/api/usuarios/${rut}/reset-password`,
    ACTIVAR: (rut) => `/api/usuarios/${rut}/activar`,
    DESACTIVAR: (rut) => `/api/usuarios/${rut}/desactivar`,
  },
  
  // Carga Masiva (NUEVO v7.0)
  CARGA_MASIVA: {
    PROCESAR: '/api/carga-masiva/procesar',
    VALIDAR: '/api/carga-masiva/validar',
    PLANTILLA_CSV: '/api/carga-masiva/plantilla/csv',
    PLANTILLA_EXCEL: '/api/carga-masiva/plantilla/excel',
    ROLES: '/api/carga-masiva/roles',
    ESTADISTICAS: '/api/carga-masiva/estadisticas',
    PERSONAS: '/api/carga-masiva/personas',
    LIMPIAR_DATOS_PRUEBA: '/api/carga-masiva/datos-prueba',
  },
  
  // Geografía (NUEVO v7.0)
  GEOGRAFIA: {
    REGIONES: '/api/geografia/regiones',
    PROVINCIAS: (regionId) => `/api/geografia/regiones/${regionId}/provincias`,
    COMUNAS: (provinciaId) => `/api/geografia/provincias/${provinciaId}/comunas`,
    BUSCAR_COMUNA: '/api/geografia/comunas/buscar',
  },
  
  // Apoderados (Actualizado v7.0)
  APODERADOS: {
    BASE: '/api/apoderados',
    LOGIN: '/api/apoderados/login',
    BY_ID: (id) => `/api/apoderados/${id}`,
    ME: '/api/apoderados/me',
    HIJOS: (id) => `/api/apoderados/${id}/hijos`,
    DEUDAS_PENDIENTES: (id) => `/api/apoderados/${id}/deudas-pendientes`,
    HISTORIAL_PAGOS: (id) => `/api/apoderados/${id}/historial-pagos`,
    CREAR_PAGO: (id) => `/api/apoderados/${id}/pagos/crear-intencion`,
    CONFIRMAR_PAGO: (id) => `/api/apoderados/${id}/pagos/confirmar`,
  },
  
  // Tesoreros (Actualizado v7.0)
  TESOREROS: {
    BASE: '/api/tesoreros',
    LOGIN: '/api/tesoreros/login',
    BY_ID: (id) => `/api/tesoreros/${id}`,
    ME: '/api/tesoreros/me',
    RESUMEN: '/api/tesoreros/resumen',
    ALUMNOS: '/api/tesoreros/alumnos',
    CHECK_ACCESS: (cursoId) => `/api/tesoreros/check-acceso/${cursoId}`,
  },
  
  // Reportes de Apoderados
  REPORTES_APODERADOS: {
    METRICAS: (id) => `/api/reportes/apoderados/${id}/metricas`,
    POR_ALUMNO: (id, alumnoId) => `/api/reportes/apoderados/${id}/por-alumno/${alumnoId}`,
    POR_TIPO_PAGO: (id) => `/api/reportes/apoderados/${id}/por-tipo-pago`,
    POR_ACTIVIDAD: (id) => `/api/reportes/apoderados/${id}/por-actividad`,
    RESUMEN_GENERAL: (id) => `/api/reportes/apoderados/${id}/resumen-general`,
    EXPORTAR: (id) => `/api/reportes/apoderados/${id}/exportar`,
  },
  
  // Reportes de Tesoreros
  REPORTES_TESOREROS: {
    DASHBOARD: (id) => `/api/reportes/tesoreros/${id}/dashboard`,
    INGRESOS: (id) => `/api/reportes/tesoreros/${id}/ingresos`,
    EGRESOS: (id) => `/api/reportes/tesoreros/${id}/egresos`,
    ESTADO_FINANCIERO: (id) => `/api/reportes/tesoreros/${id}/estado-financiero`,
    EXPORTAR: (id) => `/api/reportes/tesoreros/${id}/exportar`,
  },
  
  // Sistema de Pagos Unificado
  PAGOS_UNIFICADOS: {
    GATEWAYS: '/api/payments/gateways',
    RECOMMEND: '/api/payments/gateways/recommend',
    TEST_CONFIG: '/api/payments/gateways/test-config',
  },
  
  // Pagos Distribuidos
  PAGOS_DISTRIBUIDOS: {
    CREAR: '/api/pagos-distribuidos/crear',
    DISTRIBUCION: (pagoId) => `/api/pagos-distribuidos/distribucion/${pagoId}`,
    CONFIRMAR: (pagoId) => `/api/pagos-distribuidos/confirmar/${pagoId}`,
    PREVIEW: '/api/pagos-distribuidos/preview',
  },
  
  // Cursos
  CURSOS: {
    BASE: '/api/cursos',
    BY_ID: (id) => `/api/cursos/${id}`,
    ALUMNOS: (id) => `/api/cursos/${id}/alumnos`,
    TESORERO: (id) => `/api/cursos/${id}/tesorero`,
  },
  
  // Alumnos
  ALUMNOS: {
    BASE: '/api/alumnos',
    BY_ID: (id) => `/api/alumnos/${id}`,
    BY_CURSO: (cursoId) => `/api/alumnos/curso/${cursoId}`,
    BY_APODERADO: (apoderadoId) => `/api/alumnos/apoderado/${apoderadoId}`,
  },
  
  // Webhooks
  WEBHOOKS: {
    STRIPE: '/api/webhooks/stripe',
    TRANSBANK: '/api/webhooks/transbank',
    MERCADOPAGO: '/api/webhooks/mercadopago',
    BANCOESTADO: '/api/webhooks/bancoestado',
  },
  
  // Sistema
  SYSTEM: {
    HEALTH: '/api/health',
    INFO: '/api/info',
    METRICS: '/api/metrics',
    STATUS: '/api/status',
  },
};

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuración de autenticación v7.0
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token_v7',
  USER_KEY: 'auth_user_v7',
  REFRESH_TOKEN_KEY: 'refresh_token_v7',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos antes de expirar
  LOGIN_TYPES: {
    ADMIN: 'admin',
    APODERADO: 'apoderado',
    TESORERO: 'tesorero',
    PROFESOR: 'profesor'
  }
};

// Configuración de validación RUT v7.0
export const RUT_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 12,
  PATTERN: /^[0-9]+-[0-9kK]$/,
  CLEAN_PATTERN: /[^0-9kK]/g,
  FORMAT_PATTERN: /^(\d{1,2})(\d{3})(\d{3})([0-9kK])$/,
};

// Configuración de roles v7.0
export const ROLES_CONFIG = {
  CATEGORIAS: {
    ADMINISTRATIVO: 'administrativo',
    ACADEMICO: 'academico',
    APODERADO: 'apoderado',
    ALUMNO: 'alumno',
    TESORERO: 'tesorero'
  },
  RESTRICCIONES: {
    ADULTO_MIN_AGE: 18,
    ALUMNO_MAX_AGE: 25,
    ROLES_INCOMPATIBLES: {
      'alumno': ['apoderado', 'profesor', 'administrador'],
      'apoderado': ['alumno'],
      'profesor': ['alumno'],
      'administrador': ['alumno']
    }
  }
};

// Configuración geográfica v8.0 - CUT 2018
export const GEOGRAFIA_CONFIG = {
  REGIONES_CHILE: 16,
  PROVINCIAS_CHILE: 56,
  COMUNAS_CHILE: 346,
  FUENTE: 'CUT 2018 - Código Único Territorial',
  FORMATO_DIRECCION: {
    CALLE: { min: 3, max: 100 },
    NUMERO: { min: 1, max: 10 },
    CODIGO_COMUNA: { required: true },
    CODIGO_PROVINCIA: { required: true },
    CODIGO_REGION: { required: true }
  },
  VALIDACION: {
    CODIGO_REGION_MIN: 1,
    CODIGO_REGION_MAX: 16,
    CODIGO_PROVINCIA_MIN: 11,
    CODIGO_PROVINCIA_MAX: 163,
    CODIGO_COMUNA_MIN: 1101,
    CODIGO_COMUNA_MAX: 16302
  }
};

// Configuración de archivos v7.0
export const FILE_CONFIG = {
  CARGA_MASIVA: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['.csv', '.xlsx', '.xls'],
    MAX_ROWS: 10000,
    REQUIRED_COLUMNS: ['rut', 'nombres', 'apellido_paterno', 'email']
  },
  IMAGES: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['.jpg', '.jpeg', '.png', '.gif'],
    MAX_WIDTH: 2048,
    MAX_HEIGHT: 2048
  }
};

// Configuración de cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  USER_DATA_TTL: 15 * 60 * 1000, // 15 minutos
  STATIC_DATA_TTL: 60 * 60 * 1000, // 1 hora
  GEOGRAFIA_TTL: 24 * 60 * 60 * 1000, // 24 horas
};

// Configuración de reintentos
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,
  BACKOFF_FACTOR: 2,
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
};

// Configuración de timeouts específicos
export const TIMEOUT_CONFIG = {
  FAST_OPERATIONS: 5000,    // Login, logout, datos simples
  NORMAL_OPERATIONS: 15000, // CRUD operations
  SLOW_OPERATIONS: 30000,   // Reportes, exportaciones
  FILE_OPERATIONS: 60000,   // Subida/descarga de archivos
  CARGA_MASIVA: 300000,     // 5 minutos para carga masiva
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
  SEARCH_MIN_CHARS: 3,
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  RUT_REGEX: /^[0-9]+-[0-9kK]$/,
};

// Configuración de formatos
export const FORMAT_CONFIG = {
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm',
  CURRENCY_FORMAT: 'CLP',
  DECIMAL_PLACES: 0,
  RUT_FORMAT: 'XX.XXX.XXX-X',
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 8000,
  WARNING_DURATION: 6000,
  INFO_DURATION: 4000,
};

// Configuración de desarrollo vs producción
export const ENVIRONMENT_CONFIG = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  ENABLE_LOGGING: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true',
  ENABLE_DEBUG: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG === 'true',
  API_VERSION: '8.0.0',
  FEATURES: {
    CARGA_MASIVA: true,
    ROLES_MULTIPLES: true,
    VALIDACION_RUT: true,
    GEOGRAFIA_CUT_2018: true, // NUEVO v8.0
    DIRECCION_COMPLETA: true, // NUEVO v8.0
    BUSQUEDA_GEOGRAFICA: true, // NUEVO v8.0
    PAGOS_DISTRIBUIDOS: true,
    REPORTES_AVANZADOS: true
  }
};

// Función para obtener la configuración completa
export const getApiConfig = () => ({
  ...API_CONFIG,
  endpoints: API_ENDPOINTS,
  headers: DEFAULT_HEADERS,
  auth: AUTH_CONFIG,
  rut: RUT_CONFIG,
  roles: ROLES_CONFIG,
  geografia: GEOGRAFIA_CONFIG,
  files: FILE_CONFIG,
  cache: CACHE_CONFIG,
  retry: RETRY_CONFIG,
  timeout: TIMEOUT_CONFIG,
  pagination: PAGINATION_CONFIG,
  validation: VALIDATION_CONFIG,
  format: FORMAT_CONFIG,
  notification: NOTIFICATION_CONFIG,
  environment: ENVIRONMENT_CONFIG,
});

// Función para validar la configuración
export const validateApiConfig = () => {
  const requiredEnvVars = [];
  
  if (import.meta.env.PROD) {
    if (!import.meta.env.VITE_API_URL) {
      requiredEnvVars.push('VITE_API_URL');
    }
  }
  
  if (requiredEnvVars.length > 0) {
    console.error('Variables de entorno requeridas faltantes:', requiredEnvVars);
    return false;
  }
  
  return true;
};

// Función helper para construir URLs
export const buildUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        searchParams.append(key, params[key]);
      }
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Función para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  return {
    ...DEFAULT_HEADERS,
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Exportar configuración por defecto
export default {
  API_CONFIG,
  API_ENDPOINTS,
  DEFAULT_HEADERS,
  AUTH_CONFIG,
  RUT_CONFIG,
  ROLES_CONFIG,
  GEOGRAFIA_CONFIG,
  FILE_CONFIG,
  CACHE_CONFIG,
  RETRY_CONFIG,
  TIMEOUT_CONFIG,
  PAGINATION_CONFIG,
  VALIDATION_CONFIG,
  FORMAT_CONFIG,
  NOTIFICATION_CONFIG,
  ENVIRONMENT_CONFIG,
  getApiConfig,
  validateApiConfig,
  buildUrl,
  getAuthHeaders,
};

