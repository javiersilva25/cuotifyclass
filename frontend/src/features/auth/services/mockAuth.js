/**
 * Servicio de autenticación mock para desarrollo y testing
 * Sistema de Gestión Escolar v8.0
 */

import { validarRut, limpiarRut } from '../../../utils/rutValidator';

// Usuarios mock para testing
const MOCK_USERS = {
  // Administradores
  '12345678-9': {
    rut: '12.345.678-9',
    nombres: 'Juan Carlos',
    apellido_paterno: 'Administrador',
    apellido_materno: 'Sistema',
    email: 'admin@colegio.cl',
    telefono: '+56912345678',
    roles: ['administrador'],
    password: 'admin123',
    activo: true,
    fecha_creacion: '2024-01-01',
    direccion: {
      calle: 'Av. Principal',
      numero: '123',
      comuna: 'Santiago',
      provincia: 'Santiago',
      region: 'Metropolitana'
    }
  },
  
  // Apoderados
  '11222333-4': {
    rut: '11.222.333-4',
    nombres: 'María Elena',
    apellido_paterno: 'González',
    apellido_materno: 'López',
    email: 'maria.gonzalez@email.com',
    telefono: '+56987654321',
    roles: ['apoderado'],
    password: 'apoderado123',
    activo: true,
    fecha_creacion: '2024-01-15',
    hijos: [
      { id: 1, nombre: 'Carlos González', curso: '1°A' },
      { id: 2, nombre: 'María González', curso: '3°B' }
    ],
    direccion: {
      calle: 'Los Robles',
      numero: '456',
      comuna: 'Las Condes',
      provincia: 'Santiago',
      region: 'Metropolitana'
    }
  },
  
  '55666777-8': {
    rut: '55.666.777-8',
    nombres: 'Ana Patricia',
    apellido_paterno: 'Martínez',
    apellido_materno: 'Silva',
    email: 'ana.martinez@email.com',
    telefono: '+56911223344',
    roles: ['apoderado'],
    password: 'apoderado456',
    activo: true,
    fecha_creacion: '2024-02-01',
    hijos: [
      { id: 3, nombre: 'Sofía Martínez', curso: '2°A' }
    ],
    direccion: {
      calle: 'Las Flores',
      numero: '789',
      comuna: 'Providencia',
      provincia: 'Santiago',
      region: 'Metropolitana'
    }
  },
  
  // Tesoreros
  '22333444-5': {
    rut: '22.333.444-5',
    nombres: 'Pedro Antonio',
    apellido_paterno: 'Ramírez',
    apellido_materno: 'Torres',
    email: 'pedro.ramirez@email.com',
    telefono: '+56955667788',
    roles: ['tesorero'],
    password: 'tesorero123',
    activo: true,
    fecha_creacion: '2024-01-20',
    curso_asignado: '1°A',
    direccion: {
      calle: 'San Martín',
      numero: '321',
      comuna: 'Ñuñoa',
      provincia: 'Santiago',
      region: 'Metropolitana'
    }
  },
  
  '77888999-0': {
    rut: '77.888.999-0',
    nombres: 'Carmen Rosa',
    apellido_paterno: 'Fernández',
    apellido_materno: 'Morales',
    email: 'carmen.fernandez@email.com',
    telefono: '+56944556677',
    roles: ['tesorero'],
    password: 'tesorero456',
    activo: true,
    fecha_creacion: '2024-02-10',
    curso_asignado: '3°B',
    direccion: {
      calle: 'Libertad',
      numero: '654',
      comuna: 'San Miguel',
      provincia: 'Santiago',
      region: 'Metropolitana'
    }
  },
  
  // Profesores
  '98765432-1': {
    rut: '98.765.432-1',
    nombres: 'Roberto Carlos',
    apellido_paterno: 'Profesor',
    apellido_materno: 'Educación',
    email: 'profesor@colegio.cl',
    telefono: '+56933445566',
    roles: ['profesor'],
    password: 'profesor123',
    activo: true,
    fecha_creacion: '2024-01-10',
    materias: ['Matemáticas', 'Física'],
    direccion: {
      calle: 'Educadores',
      numero: '987',
      comuna: 'Maipú',
      provincia: 'Santiago',
      region: 'Metropolitana'
    }
  }
};

/**
 * Simula una llamada a la API con delay
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Delay en milisegundos
 */
const simulateApiCall = async (fn, delay = 1000) => {
  await new Promise(resolve => setTimeout(resolve, delay));
  return fn();
};

/**
 * Genera un token JWT mock
 * @param {object} user - Usuario
 * @returns {string} Token mock
 */
const generateMockToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.rut,
    name: `${user.nombres} ${user.apellido_paterno}`,
    roles: user.roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
  }));
  const signature = btoa('mock-signature');
  
  return `${header}.${payload}.${signature}`;
};

/**
 * Servicio de autenticación mock
 */
export const mockAuthService = {
  /**
   * Login con RUT y contraseña
   * @param {string} rut - RUT del usuario
   * @param {string} password - Contraseña
   * @param {string} tipoUsuario - Tipo de usuario (admin, apoderado, tesorero)
   * @returns {Promise<object>} Resultado del login
   */
  async login(rut, password, tipoUsuario = 'admin') {
    return simulateApiCall(() => {
      // Limpiar y normalizar RUT
      const rutLimpio = limpiarRut(rut);
      const rutNormalizado = rutLimpio.slice(0, -1) + '-' + rutLimpio.slice(-1);
      
      // Validar RUT
      if (!validarRut(rutLimpio)) {
        return {
          success: false,
          error: 'RUT inválido',
          code: 'INVALID_RUT'
        };
      }
      
      // Buscar usuario
      const user = MOCK_USERS[rutNormalizado];
      
      if (!user) {
        return {
          success: false,
          error: 'Usuario no encontrado',
          code: 'USER_NOT_FOUND'
        };
      }
      
      // Verificar contraseña
      if (user.password !== password) {
        return {
          success: false,
          error: 'Contraseña incorrecta',
          code: 'INVALID_PASSWORD'
        };
      }
      
      // Verificar que el usuario esté activo
      if (!user.activo) {
        return {
          success: false,
          error: 'Usuario inactivo',
          code: 'USER_INACTIVE'
        };
      }
      
      // Verificar tipo de usuario
      const hasRequiredRole = tipoUsuario === 'admin' || user.roles.includes(tipoUsuario);
      
      if (!hasRequiredRole) {
        return {
          success: false,
          error: `No tiene permisos de ${tipoUsuario}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        };
      }
      
      // Generar token
      const token = generateMockToken(user);
      
      // Preparar datos del usuario (sin contraseña)
      const { password: _, ...userData } = user;
      
      return {
        success: true,
        data: {
          user: userData,
          token,
          expires_in: 86400 // 24 horas en segundos
        },
        message: 'Login exitoso'
      };
    }, 800); // Simular delay de red
  },
  
  /**
   * Obtener información del usuario actual
   * @param {string} token - Token de autenticación
   * @returns {Promise<object>} Información del usuario
   */
  async getCurrentUser(token) {
    return simulateApiCall(() => {
      try {
        // Decodificar token mock
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rutNormalizado = payload.sub;
        
        const user = MOCK_USERS[rutNormalizado];
        
        if (!user) {
          return {
            success: false,
            error: 'Usuario no encontrado',
            code: 'USER_NOT_FOUND'
          };
        }
        
        // Preparar datos del usuario (sin contraseña)
        const { password: _, ...userData } = user;
        
        return {
          success: true,
          data: userData
        };
      } catch (error) {
        return {
          success: false,
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        };
      }
    }, 300);
  },
  
  /**
   * Logout
   * @returns {Promise<object>} Resultado del logout
   */
  async logout() {
    return simulateApiCall(() => {
      return {
        success: true,
        message: 'Logout exitoso'
      };
    }, 200);
  },
  
  /**
   * Refrescar token
   * @param {string} token - Token actual
   * @returns {Promise<object>} Nuevo token
   */
  async refreshToken(token) {
    return simulateApiCall(() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rutNormalizado = payload.sub;
        
        const user = MOCK_USERS[rutNormalizado];
        
        if (!user) {
          return {
            success: false,
            error: 'Usuario no encontrado',
            code: 'USER_NOT_FOUND'
          };
        }
        
        const newToken = generateMockToken(user);
        
        return {
          success: true,
          data: {
            token: newToken,
            expires_in: 86400
          }
        };
      } catch (error) {
        return {
          success: false,
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        };
      }
    }, 400);
  },
  
  /**
   * Cambiar contraseña
   * @param {string} token - Token de autenticación
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<object>} Resultado del cambio
   */
  async changePassword(token, currentPassword, newPassword) {
    return simulateApiCall(() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rutNormalizado = payload.sub;
        
        const user = MOCK_USERS[rutNormalizado];
        
        if (!user) {
          return {
            success: false,
            error: 'Usuario no encontrado',
            code: 'USER_NOT_FOUND'
          };
        }
        
        if (user.password !== currentPassword) {
          return {
            success: false,
            error: 'Contraseña actual incorrecta',
            code: 'INVALID_CURRENT_PASSWORD'
          };
        }
        
        // Actualizar contraseña (en un sistema real esto se haría en la BD)
        user.password = newPassword;
        
        return {
          success: true,
          message: 'Contraseña actualizada exitosamente'
        };
      } catch (error) {
        return {
          success: false,
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        };
      }
    }, 600);
  },
  
  /**
   * Obtener lista de usuarios mock (para desarrollo)
   * @returns {object} Lista de usuarios disponibles
   */
  getMockUsers() {
    return Object.keys(MOCK_USERS).map(rut => {
      const user = MOCK_USERS[rut];
      return {
        rut: user.rut,
        nombre: `${user.nombres} ${user.apellido_paterno}`,
        roles: user.roles,
        password: user.password // Solo para desarrollo
      };
    });
  }
};

export default mockAuthService;

