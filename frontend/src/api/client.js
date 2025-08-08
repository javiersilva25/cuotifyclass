// Cliente API para producción v6.0.0 - Sin datos mock
import { API_CONFIG, API_ENDPOINTS, DEFAULT_HEADERS, AUTH_CONFIG, RETRY_CONFIG } from '../config/api.js';

// Clase para manejar errores de API
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
};

// Función para establecer el token de autenticación
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  }
};

// Función para obtener headers con autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = { ...DEFAULT_HEADERS };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Función para manejar respuestas de la API
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  
  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new ApiError(message, response.status, data);
  }
  
  return data;
};

// Función para realizar peticiones con reintentos
const fetchWithRetry = async (url, options = {}, attempt = 1) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      timeout: options.timeout || API_CONFIG.TIMEOUT,
    });
    
    return await handleResponse(response);
  } catch (error) {
    // Si es el último intento o no es un error retryable, lanzar el error
    if (attempt >= RETRY_CONFIG.MAX_ATTEMPTS || !isRetryableError(error)) {
      throw error;
    }
    
    // Esperar antes del siguiente intento
    const delay = RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, attempt - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Reintentar
    return fetchWithRetry(url, options, attempt + 1);
  }
};

// Función para determinar si un error es retryable
const isRetryableError = (error) => {
  if (error instanceof ApiError) {
    return RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(error.status);
  }
  
  // Errores de red son retryables
  return error.name === 'TypeError' || error.name === 'NetworkError';
};

// Cliente API principal
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }
  
  // Método genérico para realizar peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: getAuthHeaders(),
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    // Si hay body y no es FormData, convertir a JSON
    if (finalOptions.body && !(finalOptions.body instanceof FormData)) {
      finalOptions.body = JSON.stringify(finalOptions.body);
    }
    
    return fetchWithRetry(url, finalOptions);
  }
  
  // Métodos HTTP básicos
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url);
  }
  
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }
  
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }
  
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }
  
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
  
  // Métodos de autenticación
  async login(credentials) {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
      
      // Guardar información del usuario
      if (response.data.user) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.user));
      }
    }
    
    return response;
  }
  
  async logout() {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Error durante logout:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      setAuthToken(null);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    }
  }
  
  async getCurrentUser() {
    return this.get(API_ENDPOINTS.AUTH.ME);
  }
  
  async refreshToken() {
    const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await this.post(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  }
  
  // Métodos para apoderados
  async loginApoderado(credentials) {
    const response = await this.post(API_ENDPOINTS.APODERADOS.LOGIN, credentials);
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
      
      if (response.data.apoderado) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify({
          ...response.data.apoderado,
          role: 'apoderado'
        }));
      }
    }
    
    return response;
  }
  
  async getApoderadoHijos(apoderadoId) {
    return this.get(API_ENDPOINTS.APODERADOS.HIJOS(apoderadoId));
  }
  
  async getApoderadoDeudasPendientes(apoderadoId) {
    return this.get(API_ENDPOINTS.APODERADOS.DEUDAS_PENDIENTES(apoderadoId));
  }
  
  async getApoderadoHistorialPagos(apoderadoId, filtros = {}) {
    return this.get(API_ENDPOINTS.APODERADOS.HISTORIAL_PAGOS(apoderadoId), filtros);
  }
  
  async crearIntencionPago(apoderadoId, datosPago) {
    return this.post(API_ENDPOINTS.APODERADOS.CREAR_PAGO(apoderadoId), datosPago);
  }
  
  async confirmarPago(apoderadoId, datosConfirmacion) {
    return this.post(API_ENDPOINTS.APODERADOS.CONFIRMAR_PAGO(apoderadoId), datosConfirmacion);
  }
  
  // Métodos para tesoreros
  async loginTesorero(credentials) {
    const response = await this.post(API_ENDPOINTS.TESOREROS.LOGIN, credentials);
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
      
      if (response.data.tesorero) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify({
          ...response.data.tesorero,
          role: 'tesorero'
        }));
      }
    }
    
    return response;
  }
  
  async getTesoreroInfo() {
    return this.get(API_ENDPOINTS.TESOREROS.ME);
  }
  
  async getTesoreroResumen() {
    return this.get(API_ENDPOINTS.TESOREROS.RESUMEN);
  }
  
  async getTesoreroAlumnos() {
    return this.get(API_ENDPOINTS.TESOREROS.ALUMNOS);
  }
  
  async checkTesoreroAccess(cursoId) {
    return this.get(API_ENDPOINTS.TESOREROS.CHECK_ACCESS(cursoId));
  }
  
  // Métodos para reportes de apoderados
  async getApoderadoMetricasRapidas(apoderadoId) {
    return this.get(API_ENDPOINTS.REPORTES_APODERADOS.METRICAS_RAPIDAS(apoderadoId));
  }
  
  async getApoderadoActividadesDisponibles(apoderadoId) {
    return this.get(API_ENDPOINTS.REPORTES_APODERADOS.ACTIVIDADES_DISPONIBLES(apoderadoId));
  }
  
  async getApoderadoResumenGeneral(apoderadoId) {
    return this.get(API_ENDPOINTS.REPORTES_APODERADOS.RESUMEN_GENERAL(apoderadoId));
  }
  
  async getApoderadoReportePorAlumno(apoderadoId, alumnoId) {
    return this.get(API_ENDPOINTS.REPORTES_APODERADOS.POR_ALUMNO(apoderadoId, alumnoId));
  }
  
  async getApoderadoReportePorTipoPago(apoderadoId) {
    return this.get(API_ENDPOINTS.REPORTES_APODERADOS.POR_TIPO_PAGO(apoderadoId));
  }
  
  async getApoderadoReportePorActividad(apoderadoId, actividadId) {
    return this.get(API_ENDPOINTS.REPORTES_APODERADOS.POR_ACTIVIDAD(apoderadoId, actividadId));
  }
  
  async exportarApoderadoReporteCompleto(apoderadoId, formato = 'pdf') {
    return this.post(API_ENDPOINTS.REPORTES_APODERADOS.EXPORTAR_COMPLETO(apoderadoId), { formato });
  }
  
  async programarEnvioApoderado(apoderadoId, configuracion) {
    return this.post(API_ENDPOINTS.REPORTES_APODERADOS.PROGRAMAR_ENVIO(apoderadoId), configuracion);
  }
  
  // Métodos para reportes de tesoreros
  async getTesoreroDashboard(tesoreroId) {
    return this.get(API_ENDPOINTS.REPORTES_TESOREROS.DASHBOARD(tesoreroId));
  }
  
  async getTesoreroMetricasRapidas(tesoreroId) {
    return this.get(API_ENDPOINTS.REPORTES_TESOREROS.METRICAS_RAPIDAS(tesoreroId));
  }
  
  async getTesoreroResumenIngresos(tesoreroId) {
    return this.get(API_ENDPOINTS.REPORTES_TESOREROS.RESUMEN_INGRESOS(tesoreroId));
  }
  
  async getTesoreroResumenEgresos(tesoreroId) {
    return this.get(API_ENDPOINTS.REPORTES_TESOREROS.RESUMEN_EGRESOS(tesoreroId));
  }
  
  async getTesoreroEstadoFinanciero(tesoreroId) {
    return this.get(API_ENDPOINTS.REPORTES_TESOREROS.ESTADO_FINANCIERO(tesoreroId));
  }
  
  async exportarTesoreroReporteCompleto(tesoreroId, formato = 'pdf') {
    return this.post(API_ENDPOINTS.REPORTES_TESOREROS.EXPORTAR_COMPLETO(tesoreroId), { formato });
  }
  
  // Métodos para sistema de pagos distribuidos
  async getGatewaysDisponibles() {
    return this.get(API_ENDPOINTS.PAGOS_DISTRIBUIDOS.GATEWAYS);
  }
  
  async getGatewayRecomendado(pais = 'CL', monto = 0) {
    return this.get(API_ENDPOINTS.PAGOS_DISTRIBUIDOS.RECOMMEND, { pais, monto });
  }
  
  async crearPagoDistribuido(apoderadoId, datosPago) {
    return this.post(API_ENDPOINTS.PAGOS_DISTRIBUIDOS.CREATE(apoderadoId), datosPago);
  }
  
  async confirmarPagoDistribuido(apoderadoId, datosConfirmacion) {
    return this.post(API_ENDPOINTS.PAGOS_DISTRIBUIDOS.CONFIRM(apoderadoId), datosConfirmacion);
  }
  
  async getEstadoPago(paymentId) {
    return this.get(API_ENDPOINTS.PAGOS_DISTRIBUIDOS.STATUS(paymentId));
  }
  
  // Métodos para datos básicos
  async getAlumnos(filtros = {}) {
    return this.get(API_ENDPOINTS.ALUMNOS.BASE, filtros);
  }
  
  async getAlumno(id) {
    return this.get(API_ENDPOINTS.ALUMNOS.BY_ID(id));
  }
  
  async getCursos(filtros = {}) {
    return this.get(API_ENDPOINTS.CURSOS.BASE, filtros);
  }
  
  async getCurso(id) {
    return this.get(API_ENDPOINTS.CURSOS.BY_ID(id));
  }
  
  async getDeudas(filtros = {}) {
    return this.get(API_ENDPOINTS.DEUDAS.ALUMNO, filtros);
  }
  
  async getPagos(filtros = {}) {
    return this.get(API_ENDPOINTS.PAGOS.BASE, filtros);
  }
  
  // Métodos del sistema
  async getSystemHealth() {
    return this.get(API_ENDPOINTS.SYSTEM.HEALTH);
  }
  
  async getSystemInfo() {
    return this.get(API_ENDPOINTS.SYSTEM.INFO);
  }
  
  async getSystemMetrics() {
    return this.get(API_ENDPOINTS.SYSTEM.METRICS);
  }
  
  async getSystemStatus() {
    return this.get(API_ENDPOINTS.SYSTEM.STATUS);
  }
}

// Crear instancia única del cliente
const apiClient = new ApiClient();

// Interceptor para manejar tokens expirados
const originalRequest = apiClient.request.bind(apiClient);
apiClient.request = async function(endpoint, options = {}) {
  try {
    return await originalRequest(endpoint, options);
  } catch (error) {
    // Si el token ha expirado, intentar refrescarlo
    if (error instanceof ApiError && error.status === 401) {
      try {
        await this.refreshToken();
        // Reintentar la petición original
        return await originalRequest(endpoint, options);
      } catch (refreshError) {
        // Si no se puede refrescar, redirigir al login
        setAuthToken(null);
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        
        // Emitir evento para que la aplicación maneje el logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        throw error;
      }
    }
    
    throw error;
  }
};

// Funciones de utilidad
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

export const clearAuthData = () => {
  setAuthToken(null);
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

// Exportar cliente y utilidades
export { ApiError, apiClient as default };
export {
  getAuthToken,
  setAuthToken,
  getAuthHeaders,
};

