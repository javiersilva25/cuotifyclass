// Configuración general de la aplicación
export const APP_CONFIG = {
  NAME: 'Sistema de Gestión Escolar',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema integral de gestión escolar para administrar alumnos, cursos, cobros, gastos y movimientos financieros',
  AUTHOR: 'Sistema de Gestión Escolar',
  
  // Configuración de entorno
  ENV: import.meta.env.MODE || 'development',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
  
  // URLs y dominios
  BASE_URL: import.meta.env.VITE_BASE_URL || 'http://localhost:5173',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'auth_user',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos antes de expirar
    AUTO_LOGOUT_TIME: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Configuración de localStorage
  STORAGE: {
    PREFIX: 'gestion_escolar_',
    SETTINGS_KEY: 'user_settings',
    THEME_KEY: 'theme',
    LANGUAGE_KEY: 'language',
    SIDEBAR_KEY: 'sidebar_collapsed',
    TABLE_FILTERS_PREFIX: 'table_filters_',
    RECENT_ITEMS_PREFIX: 'recent_',
    FAVORITES_PREFIX: 'favorites_',
    FORM_DRAFT_PREFIX: 'form_draft_',
  },
  
  // Configuración de tema
  THEME: {
    DEFAULT: 'light',
    OPTIONS: ['light', 'dark', 'system'],
    STORAGE_KEY: 'theme',
  },
  
  // Configuración de idioma
  LANGUAGE: {
    DEFAULT: 'es',
    OPTIONS: ['es', 'en'],
    STORAGE_KEY: 'language',
  },
  
  // Configuración de notificaciones
  NOTIFICATIONS: {
    POSITION: 'top-right',
    DURATION: {
      SUCCESS: 4000,
      ERROR: 6000,
      WARNING: 5000,
      INFO: 4000,
      LOADING: Infinity,
    },
    MAX_VISIBLE: 5,
  },
  
  // Configuración de tablas
  TABLE: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
    MAX_PAGE_SIZE: 100,
    SEARCH_DEBOUNCE: 300,
    FILTER_DEBOUNCE: 500,
  },
  
  // Configuración de formularios
  FORMS: {
    AUTO_SAVE_INTERVAL: 30000, // 30 segundos
    VALIDATION_DEBOUNCE: 300,
    DRAFT_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
  
  // Configuración de archivos
  FILES: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    },
  },
  
  // Configuración de gráficos
  CHARTS: {
    DEFAULT_COLORS: [
      '#3b82f6', // blue-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#8b5cf6', // violet-500
      '#06b6d4', // cyan-500
      '#84cc16', // lime-500
      '#f97316', // orange-500
      '#ec4899', // pink-500
      '#6b7280', // gray-500
    ],
    ANIMATION_DURATION: 300,
    RESPONSIVE_BREAKPOINTS: {
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
    },
  },
  
  // Configuración de validación
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(\+56|56)?[2-9]\d{8}$/,
    RUT_REGEX: /^[0-9]+-[0-9kK]{1}$/,
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    CONCEPT_MIN_LENGTH: 5,
    CONCEPT_MAX_LENGTH: 200,
  },
  
  // Configuración de formato
  FORMAT: {
    DATE: 'dd/MM/yyyy',
    DATE_TIME: 'dd/MM/yyyy HH:mm',
    TIME: 'HH:mm',
    CURRENCY: 'CLP',
    LOCALE: 'es-CL',
    DECIMAL_PLACES: 0,
  },
  
  // Configuración de roles y permisos
  ROLES: {
    ADMIN: 'admin',
    ADMINISTRADOR: 'administrador',
    PROFESOR: 'profesor',
    TESORERO: 'tesorero',
    ALUMNO: 'alumno',
  },
  
  // Estados de entidades
  ESTADOS: {
    DEUDA: {
      PENDIENTE: 'pendiente',
      PAGADO: 'pagado',
      PARCIAL: 'parcial',
      ANULADO: 'anulado',
    },
    MOVIMIENTO: {
      INGRESO: 'ingreso',
      GASTO: 'gasto',
    },
    GENERAL: {
      ACTIVO: 'activo',
      INACTIVO: 'inactivo',
      ELIMINADO: 'eliminado',
    },
  },
  
  // Configuración de animaciones
  ANIMATIONS: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      EASE_IN: 'ease-in',
      EASE_OUT: 'ease-out',
      EASE_IN_OUT: 'ease-in-out',
    },
  },
  
  // Configuración de breakpoints responsive
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
  
  // Configuración de debugging
  DEBUG: {
    ENABLED: import.meta.env.MODE === 'development',
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
    SHOW_REDUX_DEVTOOLS: import.meta.env.MODE === 'development',
  },
};

// Configuración específica por entorno
export const ENV_CONFIG = {
  development: {
    API_URL: 'http://localhost:3000/api',
    ENABLE_MOCK_DATA: true,
    SHOW_DEBUG_INFO: true,
    AUTO_LOGIN: false,
  },
  production: {
    API_URL: import.meta.env.VITE_API_URL,
    ENABLE_MOCK_DATA: false,
    SHOW_DEBUG_INFO: false,
    AUTO_LOGIN: false,
  },
  test: {
    API_URL: 'http://localhost:3001/api',
    ENABLE_MOCK_DATA: true,
    SHOW_DEBUG_INFO: true,
    AUTO_LOGIN: true,
  },
};

// Obtener configuración actual basada en el entorno
export const getCurrentConfig = () => {
  const envConfig = ENV_CONFIG[APP_CONFIG.ENV] || ENV_CONFIG.development;
  return { ...APP_CONFIG, ...envConfig };
};

export default APP_CONFIG;

