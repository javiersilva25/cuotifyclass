// Constantes generales de la aplicación

// Estados de entidades
export const ESTADOS_DEUDA = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  PARCIAL: 'parcial',
  ANULADO: 'anulado',
};

export const TIPOS_MOVIMIENTO = {
  INGRESO: 'ingreso',
  GASTO: 'gasto',
};

export const ESTADOS_GENERAL = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  ELIMINADO: 'eliminado',
};

// Roles de usuario
export const ROLES = {
  ADMIN: 'admin',
  ADMINISTRADOR: 'administrador',
  PROFESOR: 'profesor',
  TESORERO: 'tesorero',
  ALUMNO: 'alumno',
};

// Niveles educativos
export const NIVELES_EDUCATIVOS = {
  PREKINDER: 'prekinder',
  KINDER: 'kinder',
  PRIMERO_BASICO: '1_basico',
  SEGUNDO_BASICO: '2_basico',
  TERCERO_BASICO: '3_basico',
  CUARTO_BASICO: '4_basico',
  QUINTO_BASICO: '5_basico',
  SEXTO_BASICO: '6_basico',
  SEPTIMO_BASICO: '7_basico',
  OCTAVO_BASICO: '8_basico',
  PRIMERO_MEDIO: '1_medio',
  SEGUNDO_MEDIO: '2_medio',
  TERCERO_MEDIO: '3_medio',
  CUARTO_MEDIO: '4_medio',
};

// Etiquetas de niveles educativos
export const NIVELES_LABELS = {
  [NIVELES_EDUCATIVOS.PREKINDER]: 'Pre-Kinder',
  [NIVELES_EDUCATIVOS.KINDER]: 'Kinder',
  [NIVELES_EDUCATIVOS.PRIMERO_BASICO]: '1° Básico',
  [NIVELES_EDUCATIVOS.SEGUNDO_BASICO]: '2° Básico',
  [NIVELES_EDUCATIVOS.TERCERO_BASICO]: '3° Básico',
  [NIVELES_EDUCATIVOS.CUARTO_BASICO]: '4° Básico',
  [NIVELES_EDUCATIVOS.QUINTO_BASICO]: '5° Básico',
  [NIVELES_EDUCATIVOS.SEXTO_BASICO]: '6° Básico',
  [NIVELES_EDUCATIVOS.SEPTIMO_BASICO]: '7° Básico',
  [NIVELES_EDUCATIVOS.OCTAVO_BASICO]: '8° Básico',
  [NIVELES_EDUCATIVOS.PRIMERO_MEDIO]: '1° Medio',
  [NIVELES_EDUCATIVOS.SEGUNDO_MEDIO]: '2° Medio',
  [NIVELES_EDUCATIVOS.TERCERO_MEDIO]: '3° Medio',
  [NIVELES_EDUCATIVOS.CUARTO_MEDIO]: '4° Medio',
};

// Categorías de gasto predefinidas
export const CATEGORIAS_GASTO_DEFAULT = [
  { nombre: 'Material de Oficina', descripcion: 'Papelería, útiles de escritorio, etc.' },
  { nombre: 'Material Didáctico', descripcion: 'Libros, material educativo, etc.' },
  { nombre: 'Servicios Básicos', descripcion: 'Luz, agua, gas, internet, etc.' },
  { nombre: 'Mantención', descripcion: 'Reparaciones, mantención de equipos, etc.' },
  { nombre: 'Alimentación', descripcion: 'Desayunos, almuerzos, colaciones, etc.' },
  { nombre: 'Transporte', descripcion: 'Pasajes, combustible, etc.' },
  { nombre: 'Actividades Extracurriculares', descripcion: 'Deportes, arte, música, etc.' },
  { nombre: 'Eventos y Ceremonias', descripcion: 'Graduaciones, festivales, etc.' },
  { nombre: 'Equipamiento', descripcion: 'Mobiliario, equipos tecnológicos, etc.' },
  { nombre: 'Otros', descripcion: 'Gastos varios no categorizados' },
];

// Tipos de cobro
export const TIPOS_COBRO = {
  MATRICULA: 'matricula',
  MENSUALIDAD: 'mensualidad',
  MATERIAL: 'material',
  ACTIVIDAD: 'actividad',
  TRANSPORTE: 'transporte',
  ALIMENTACION: 'alimentacion',
  UNIFORME: 'uniforme',
  SEGURO: 'seguro',
  OTROS: 'otros',
};

// Etiquetas de tipos de cobro
export const TIPOS_COBRO_LABELS = {
  [TIPOS_COBRO.MATRICULA]: 'Matrícula',
  [TIPOS_COBRO.MENSUALIDAD]: 'Mensualidad',
  [TIPOS_COBRO.MATERIAL]: 'Material Escolar',
  [TIPOS_COBRO.ACTIVIDAD]: 'Actividad Extracurricular',
  [TIPOS_COBRO.TRANSPORTE]: 'Transporte',
  [TIPOS_COBRO.ALIMENTACION]: 'Alimentación',
  [TIPOS_COBRO.UNIFORME]: 'Uniforme',
  [TIPOS_COBRO.SEGURO]: 'Seguro Escolar',
  [TIPOS_COBRO.OTROS]: 'Otros',
};

// Meses del año
export const MESES = {
  ENERO: 1,
  FEBRERO: 2,
  MARZO: 3,
  ABRIL: 4,
  MAYO: 5,
  JUNIO: 6,
  JULIO: 7,
  AGOSTO: 8,
  SEPTIEMBRE: 9,
  OCTUBRE: 10,
  NOVIEMBRE: 11,
  DICIEMBRE: 12,
};

// Etiquetas de meses
export const MESES_LABELS = {
  [MESES.ENERO]: 'Enero',
  [MESES.FEBRERO]: 'Febrero',
  [MESES.MARZO]: 'Marzo',
  [MESES.ABRIL]: 'Abril',
  [MESES.MAYO]: 'Mayo',
  [MESES.JUNIO]: 'Junio',
  [MESES.JULIO]: 'Julio',
  [MESES.AGOSTO]: 'Agosto',
  [MESES.SEPTIEMBRE]: 'Septiembre',
  [MESES.OCTUBRE]: 'Octubre',
  [MESES.NOVIEMBRE]: 'Noviembre',
  [MESES.DICIEMBRE]: 'Diciembre',
};

// Días de la semana
export const DIAS_SEMANA = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 0,
};

// Etiquetas de días de la semana
export const DIAS_SEMANA_LABELS = {
  [DIAS_SEMANA.DOMINGO]: 'Domingo',
  [DIAS_SEMANA.LUNES]: 'Lunes',
  [DIAS_SEMANA.MARTES]: 'Martes',
  [DIAS_SEMANA.MIERCOLES]: 'Miércoles',
  [DIAS_SEMANA.JUEVES]: 'Jueves',
  [DIAS_SEMANA.VIERNES]: 'Viernes',
  [DIAS_SEMANA.SABADO]: 'Sábado',
};

// Colores para gráficos
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  ORANGE: '#f97316',
  LIME: '#84cc16',
  GRAY: '#6b7280',
};

// Paleta de colores extendida para gráficos
export const CHART_COLOR_PALETTE = [
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
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#a855f7', // purple-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#0ea5e9', // sky-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

// Iconos por entidad
export const ENTITY_ICONS = {
  ALUMNOS: 'Users',
  CURSOS: 'BookOpen',
  COBROS: 'Receipt',
  DEUDAS: 'CreditCard',
  GASTOS: 'DollarSign',
  MOVIMIENTOS_CCAA: 'TrendingUp',
  MOVIMIENTOS_CCPP: 'Wallet',
  CATEGORIAS: 'Tag',
  REPORTES: 'BarChart3',
  DASHBOARD: 'Home',
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  EMAIL_INVALID: 'Ingresa un email válido',
  PHONE_INVALID: 'Ingresa un teléfono válido',
  RUT_INVALID: 'Ingresa un RUT válido',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  NAME_MIN_LENGTH: 'El nombre debe tener al menos 2 caracteres',
  NAME_MAX_LENGTH: 'El nombre no puede tener más de 100 caracteres',
  AMOUNT_POSITIVE: 'El monto debe ser mayor a 0',
  DATE_INVALID: 'Ingresa una fecha válida',
  DATE_FUTURE: 'La fecha debe ser futura',
  DATE_PAST: 'La fecha debe ser pasada',
  CONCEPT_MIN_LENGTH: 'El concepto debe tener al menos 5 caracteres',
  CONCEPT_MAX_LENGTH: 'El concepto no puede tener más de 200 caracteres',
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  CREATED: 'Registro creado exitosamente',
  UPDATED: 'Registro actualizado exitosamente',
  DELETED: 'Registro eliminado exitosamente',
  RESTORED: 'Registro restaurado exitosamente',
  PAYMENT_MARKED: 'Pago marcado exitosamente',
  DEBT_CANCELLED: 'Deuda anulada exitosamente',
  BULK_OPERATION: 'Operación masiva completada exitosamente',
  EXPORT_SUCCESS: 'Exportación completada exitosamente',
  IMPORT_SUCCESS: 'Importación completada exitosamente',
};

// Mensajes de error
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  AUTH_ERROR: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  PERMISSION_ERROR: 'No tienes permisos para realizar esta acción.',
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente.',
  NOT_FOUND: 'El registro solicitado no fue encontrado.',
  CONFLICT: 'Ya existe un registro con estos datos.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.',
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
  SHOW_TOTAL: true,
};

// Configuración de filtros
export const FILTER_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
  CLEAR_ON_UNMOUNT: false,
  PERSIST_FILTERS: true,
};

// Configuración de exportación
export const EXPORT_CONFIG = {
  FORMATS: ['xlsx', 'csv', 'pdf'],
  MAX_RECORDS: 10000,
  FILENAME_PREFIX: 'gestion_escolar_',
  DATE_FORMAT: 'YYYY-MM-DD',
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  POSITION: 'top-right',
  AUTO_CLOSE: true,
  CLOSE_BUTTON: true,
  PROGRESS_BAR: true,
  LIMIT: 5,
  DURATION: {
    SUCCESS: 4000,
    ERROR: 6000,
    WARNING: 5000,
    INFO: 4000,
  },
};

// Configuración de tema
export const THEME_CONFIG = {
  DEFAULT: 'light',
  STORAGE_KEY: 'theme',
  SYSTEM_PREFERENCE: true,
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
};

export default {
  ESTADOS_DEUDA,
  TIPOS_MOVIMIENTO,
  ESTADOS_GENERAL,
  ROLES,
  NIVELES_EDUCATIVOS,
  NIVELES_LABELS,
  CATEGORIAS_GASTO_DEFAULT,
  TIPOS_COBRO,
  TIPOS_COBRO_LABELS,
  MESES,
  MESES_LABELS,
  DIAS_SEMANA,
  DIAS_SEMANA_LABELS,
  CHART_COLORS,
  CHART_COLOR_PALETTE,
  ENTITY_ICONS,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  PAGINATION_CONFIG,
  FILTER_CONFIG,
  EXPORT_CONFIG,
  NOTIFICATION_CONFIG,
  THEME_CONFIG,
};

