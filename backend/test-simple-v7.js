/**
 * Servidor de prueba simplificado v7.0
 * Para probar funcionalidades sin problemas de BD
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware básico
app.use(cors());
app.use(express.json());

// Datos de prueba para v7.0
const datosUsuarios = [
  {
    rut: '12345678-9',
    nombres: 'Juan Carlos',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'González',
    email: 'juan.perez@test.com',
    telefono: '+56912345678',
    direccion: 'Av. Libertador 1234',
    comuna: 'Santiago',
    provincia: 'Santiago',
    region: 'RM',
    roles: ['apoderado', 'tesorero'],
    activo: true,
    esDatoPrueba: true
  },
  {
    rut: '98765432-1',
    nombres: 'María Elena',
    apellidoPaterno: 'González',
    apellidoMaterno: 'Silva',
    email: 'maria.gonzalez@test.com',
    telefono: '+56987654321',
    direccion: 'Calle Principal 567',
    comuna: 'Providencia',
    provincia: 'Santiago',
    region: 'RM',
    roles: ['profesor'],
    activo: true,
    esDatoPrueba: true
  }
];

const rolesDisponibles = [
  { codigo: 'ADMINISTRADOR', nombre: 'Administrador del Sistema', descripcion: 'Acceso completo al sistema' },
  { codigo: 'PROFESOR', nombre: 'Profesor', descripcion: 'Gestión académica y pedagógica' },
  { codigo: 'APODERADO', nombre: 'Apoderado', descripcion: 'Representante legal del alumno' },
  { codigo: 'TESORERO_APODERADOS', nombre: 'Tesorero de Apoderados', descripcion: 'Gestión financiera del curso (apoderados)' },
  { codigo: 'TESORERO_ALUMNOS', nombre: 'Tesorero de Alumnos', descripcion: 'Gestión financiera del curso (alumnos)' },
  { codigo: 'ALUMNO', nombre: 'Alumno', descripcion: 'Estudiante del establecimiento' }
];

// Rutas de información
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '7.0.0',
    message: 'Sistema de Gestión Escolar v7.0 - Servidor de prueba funcionando'
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    nombre: 'Sistema de Gestión Escolar API v7.0',
    version: '7.0.0',
    descripcion: 'Sistema con RUT como identificador único y roles múltiples',
    estado: 'Servidor de prueba activo',
    caracteristicas: [
      'RUT como identificador único',
      'Roles múltiples por persona',
      'Información geográfica de Chile',
      'Carga masiva de usuarios',
      'Validación de RUT chileno',
      'Sistema de auditoría completo'
    ],
    endpoints: {
      usuarios: '/api/usuarios',
      roles: '/api/roles',
      cargaMasiva: '/api/carga-masiva',
      validacion: '/api/validacion'
    },
    baseDatos: 'Datos de prueba en memoria',
    timestamp: new Date().toISOString()
  });
});

// Rutas de usuarios
app.get('/api/usuarios', (req, res) => {
  res.json({
    success: true,
    data: datosUsuarios,
    total: datosUsuarios.length,
    message: 'Usuarios obtenidos exitosamente (datos de prueba v7.0)'
  });
});

app.get('/api/usuarios/:rut', (req, res) => {
  const { rut } = req.params;
  const usuario = datosUsuarios.find(u => u.rut === rut);
  
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
  
  res.json({
    success: true,
    data: usuario,
    message: 'Usuario encontrado exitosamente'
  });
});

// Rutas de roles
app.get('/api/roles', (req, res) => {
  res.json({
    success: true,
    data: rolesDisponibles,
    total: rolesDisponibles.length,
    message: 'Roles obtenidos exitosamente'
  });
});

// Rutas de carga masiva
app.get('/api/carga-masiva/estadisticas', (req, res) => {
  res.json({
    success: true,
    estadisticas: {
      totalUsuarios: datosUsuarios.length,
      usuariosActivos: datosUsuarios.filter(u => u.activo).length,
      usuariosPrueba: datosUsuarios.filter(u => u.esDatoPrueba).length,
      rolesDisponibles: rolesDisponibles.length,
      ultimaCarga: new Date().toISOString()
    },
    message: 'Estadísticas obtenidas exitosamente'
  });
});

app.post('/api/carga-masiva/validar', (req, res) => {
  const { archivo } = req.body;
  
  // Simular validación
  setTimeout(() => {
    res.json({
      success: true,
      validacion: {
        totalRegistros: 150,
        registrosValidos: 145,
        registrosInvalidos: 5,
        errores: [
          { fila: 15, error: 'RUT inválido: 12345678-0', campo: 'rut' },
          { fila: 23, error: 'Email duplicado', campo: 'email' },
          { fila: 45, error: 'Rol no válido', campo: 'roles' },
          { fila: 67, error: 'Comuna no encontrada', campo: 'comuna' },
          { fila: 89, error: 'Fecha inválida', campo: 'fechaNacimiento' }
        ]
      },
      message: 'Validación completada exitosamente'
    });
  }, 2000);
});

app.post('/api/carga-masiva/procesar', (req, res) => {
  const { archivo, opciones } = req.body;
  
  // Simular procesamiento
  setTimeout(() => {
    res.json({
      success: true,
      resultado: {
        totalProcesados: 145,
        nuevosUsuarios: 120,
        usuariosActualizados: 25,
        errores: 5,
        credencialesGeneradas: 145,
        emailsEnviados: opciones?.enviarCredenciales ? 145 : 0
      },
      message: 'Carga masiva completada exitosamente'
    });
  }, 3000);
});

// Rutas de validación
app.post('/api/validacion/rut', (req, res) => {
  const { rut } = req.body;
  
  // Validación básica de RUT chileno
  const rutLimpio = rut.replace(/[.-]/g, '');
  const esValido = rutLimpio.length >= 8 && rutLimpio.length <= 9;
  
  res.json({
    success: true,
    data: {
      rut: rut,
      rutLimpio: rutLimpio,
      esValido: esValido,
      formato: esValido ? 'Válido' : 'Inválido'
    },
    message: esValido ? 'RUT válido' : 'RUT inválido'
  });
});

app.post('/api/validacion/geografia', (req, res) => {
  const { region, provincia, comuna } = req.body;
  
  // Validación básica de geografía chilena
  const regionesValidas = ['RM', 'V', 'VIII', 'IX', 'X'];
  const esRegionValida = regionesValidas.includes(region);
  
  res.json({
    success: true,
    data: {
      region: region,
      provincia: provincia,
      comuna: comuna,
      regionValida: esRegionValida,
      provinciaValida: provincia && provincia.length > 0,
      comunaValida: comuna && comuna.length > 0
    },
    message: 'Validación geográfica completada'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/info',
      'GET /api/usuarios',
      'GET /api/roles',
      'GET /api/carga-masiva/estadisticas',
      'POST /api/carga-masiva/validar',
      'POST /api/carga-masiva/procesar',
      'POST /api/validacion/rut',
      'POST /api/validacion/geografia'
    ]
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            🚀 SERVIDOR DE PRUEBA v7.0 INICIADO 🚀           ║
║                                                              ║
║  Puerto: ${PORT}                                                ║
║  Host: 0.0.0.0 (acceso externo habilitado)                  ║
║  Versión: 7.0.0                                             ║
║  Modo: Servidor de prueba con datos en memoria              ║
║                                                              ║
║  Endpoints principales:                                      ║
║  • GET  /api/health - Estado del servidor                   ║
║  • GET  /api/info - Información completa                    ║
║  • GET  /api/usuarios - Lista de usuarios                   ║
║  • GET  /api/roles - Roles disponibles                      ║
║  • POST /api/carga-masiva/* - Carga masiva                  ║
║  • POST /api/validacion/* - Validaciones                    ║
║                                                              ║
║  Características v7.0:                                      ║
║  ✅ RUT como identificador único                            ║
║  ✅ Roles múltiples por persona                             ║
║  ✅ Información geográfica de Chile                         ║
║  ✅ Validación de RUT chileno                               ║
║  ✅ Sistema de carga masiva                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

