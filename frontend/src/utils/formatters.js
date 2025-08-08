/**
 * Utilidades de formateo para el frontend v8.0
 * Sistema de Gestión Escolar
 */

/**
 * Formatea un número como moneda chilena
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como CLP
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha en formato chileno
 * @param {string|Date} date - Fecha a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  return new Intl.DateTimeFormat('es-CL', defaultOptions).format(dateObj);
};

/**
 * Formatea una fecha y hora en formato chileno
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea solo la hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Hora formateada
 */
export const formatTime = (date) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT sin formato
 * @returns {string} - RUT formateado
 */
export const formatRut = (rut) => {
  if (!rut) return '';
  
  // Limpiar el RUT
  const cleanRut = rut.toString().replace(/[^0-9kK]/g, '');
  
  if (cleanRut.length < 2) return cleanRut;
  
  // Separar cuerpo y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Formatear el cuerpo con puntos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
};

/**
 * Formatea un número de teléfono chileno
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Limpiar el teléfono
  const cleanPhone = phone.toString().replace(/[^0-9+]/g, '');
  
  // Si empieza con +56, formatear como teléfono chileno
  if (cleanPhone.startsWith('+56')) {
    const number = cleanPhone.substring(3);
    if (number.length === 9) {
      return `+56 ${number.substring(0, 1)} ${number.substring(1, 5)} ${number.substring(5)}`;
    }
  }
  
  // Si es un número de 9 dígitos, asumir que es chileno
  if (cleanPhone.length === 9) {
    return `+56 ${cleanPhone.substring(0, 1)} ${cleanPhone.substring(1, 5)} ${cleanPhone.substring(5)}`;
  }
  
  return phone;
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor decimal (0.15 = 15%)
 * @param {number} decimals - Número de decimales
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('es-CL').format(number);
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea el estado de un pago
 * @param {string} status - Estado del pago
 * @returns {object} - Objeto con texto y color
 */
export const formatPaymentStatus = (status) => {
  const statusMap = {
    'pendiente': { text: 'Pendiente', color: 'yellow' },
    'pagado': { text: 'Pagado', color: 'green' },
    'vencido': { text: 'Vencido', color: 'red' },
    'parcial': { text: 'Pago Parcial', color: 'blue' },
    'cancelado': { text: 'Cancelado', color: 'gray' },
  };
  
  return statusMap[status?.toLowerCase()] || { text: status || 'Desconocido', color: 'gray' };
};

/**
 * Formatea el tipo de usuario/rol
 * @param {string} role - Rol del usuario
 * @returns {string} - Rol formateado
 */
export const formatUserRole = (role) => {
  const roleMap = {
    'admin': 'Administrador',
    'administrador': 'Administrador',
    'profesor': 'Profesor',
    'tesorero': 'Tesorero',
    'apoderado': 'Apoderado',
    'alumno': 'Alumno',
  };
  
  return roleMap[role?.toLowerCase()] || capitalizeWords(role || 'Usuario');
};

/**
 * Formatea una dirección completa
 * @param {object} address - Objeto con datos de dirección
 * @returns {string} - Dirección formateada
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.calle) parts.push(address.calle);
  if (address.numero) parts.push(`#${address.numero}`);
  if (address.comuna) parts.push(address.comuna);
  if (address.provincia) parts.push(address.provincia);
  if (address.region) parts.push(address.region);
  
  return parts.join(', ');
};

/**
 * Formatea el tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatea tiempo relativo (hace X tiempo)
 * @param {string|Date} date - Fecha
 * @returns {string} - Tiempo relativo
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  
  return formatDate(dateObj);
};

/**
 * Valida y formatea un email
 * @param {string} email - Email a formatear
 * @returns {string} - Email formateado
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

// Exportar todas las funciones como default también
export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatRut,
  formatPhone,
  formatPercentage,
  formatNumber,
  truncateText,
  capitalizeWords,
  formatPaymentStatus,
  formatUserRole,
  formatAddress,
  formatFileSize,
  formatRelativeTime,
  formatEmail,
};

