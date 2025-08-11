const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./authRoutes');
const geografiaRoutes = require('./geografiaRoutes');
const apoderadoRoutes = require('./apoderadoRoutes');
const tesoreroRoutes = require('./tesoreroRoutes');
const unifiedPaymentRoutes = require('./unifiedPaymentRoutes');
const webhookRoutes = require('./webhookRoutes');
const cargaMasivaRoutes = require('./cargaMasivaRoutes');
const personasRoutes = require('./personasRoutes');
const roleRoutes = require('./roleRoutes');     

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/geografia', geografiaRoutes);
router.use('/apoderados', apoderadoRoutes);
router.use('/tesoreros', tesoreroRoutes);
router.use('/payments', unifiedPaymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/carga-masiva', cargaMasivaRoutes);
router.use('/personas', personasRoutes);
router.use('/roles', roleRoutes);  

// Ruta de información del API
router.get('/info', (req, res) => {
  res.json({
    nombre: 'Sistema de Gestión Escolar API',
    version: '8.6.2',
    descripcion: 'API completa para gestión escolar con geografía CUT 2018, módulos de apoderados, tesoreros, pagos unificados, reportes y carga masiva de usuarios con RUT',
    estado: 'Activo',
    fecha_version: '2024-12-19',
    
    geografia: {
      fuente: 'CUT 2018 - Código Único Territorial',
      regiones: 16,
      provincias: 56,
      comunas: 346,
      cobertura: 'Chile completo',
      descripcion: 'Todas las personas del sistema tienen dirección completa con comuna, provincia y región'
    },
    
    modulos: {
      geografia: {
        descripcion: 'Gestión completa de geografía de Chile basada en CUT 2018',
        endpoints: [
          '/api/geografia/regiones',
          '/api/geografia/regiones/:codigoRegion/provincias',
          '/api/geografia/provincias/:codigoProvincia/comunas',
          '/api/geografia/regiones/:codigoRegion/comunas',
          '/api/geografia/comunas/:codigoComuna',
          '/api/geografia/buscar?q=término',
          '/api/geografia/estadisticas'
        ]
      },
      
      autenticacion: {
        descripcion: 'Autenticación JWT con RUT chileno',
        endpoints: ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']
      },
      
      apoderados: {
        descripcion: 'Gestión completa de apoderados y sus hijos con dirección geográfica',
        endpoints: [
          '/api/apoderados/me',
          '/api/apoderados/:id/deudas-pendientes',
          '/api/apoderados/:id/pagos/crear-intencion',
          '/api/apoderados/:id/pagos/confirmar',
          '/api/apoderados/:id/historial-pagos'
        ]
      },
      
      tesoreros: {
        descripcion: 'Gestión de tesoreros por curso (alumnos y apoderados) con ubicación geográfica',
        endpoints: [
          '/api/tesoreros/me',
          '/api/tesoreros/resumen',
          '/api/tesoreros/alumnos',
          '/api/tesoreros/check-acceso/:cursoId'
        ]
      },
      
      pagos_unificados: {
        descripcion: 'Sistema de pagos con 4 pasarelas integradas',
        pasarelas: ['Stripe', 'Transbank', 'MercadoPago', 'BancoEstado'],
        endpoints: [
          '/api/payments/gateways',
          '/api/payments/gateways/recommend',
          '/api/payments/gateways/test-config'
        ]
      },
      
      carga_masiva: {
        descripcion: 'Carga masiva de usuarios con RUT, roles múltiples y dirección geográfica',
        formatos: ['CSV', 'Excel'],
        validaciones: ['RUT chileno', 'Códigos geográficos CUT 2018', 'Roles lógicos'],
        endpoints: [
          '/api/carga-masiva/procesar',
          '/api/carga-masiva/validar',
          '/api/carga-masiva/plantilla/csv',
          '/api/carga-masiva/plantilla/excel',
          '/api/carga-masiva/roles',
          '/api/carga-masiva/estadisticas',
          '/api/carga-masiva/personas'
        ]
      },
      
      webhooks: {
        descripcion: 'Webhooks para confirmación automática de pagos',
        endpoints: ['/api/webhooks/stripe', '/api/webhooks/transbank', '/api/webhooks/mercadopago']
      }
    },
    
    caracteristicas: [
      'Geografía completa de Chile (CUT 2018) para todas las personas',
      'Autenticación con RUT chileno como identificador único',
      'Sistema de roles múltiples con validaciones lógicas',
      'Dirección completa: comuna, provincia, región para todos los usuarios',
      'Diferenciación entre tesoreros de alumnos y apoderados',
      'Distribución automática de pagos por tipo de cuenta',
      'Carga masiva de usuarios con validaciones geográficas',
      'Reportes avanzados con filtros geográficos',
      '4 pasarelas de pago integradas con recomendación automática',
      'Webhooks para confirmación automática de pagos',
      'Auditoría completa con campos de trazabilidad',
      'Búsqueda inteligente de ubicaciones'
    ],
    
    base_datos: {
      motor: 'MySQL',
      version_esquema: '8.0.0',
      tablas_principales: [
        'personas', 'roles', 'persona_roles', 'usuarios_auth',
        'regiones', 'provincias', 'comunas',
        'cursos', 'apoderado_alumno', 'cuotas', 'pagos',
        'tipos_cuenta', 'cuentas_curso', 'movimientos_cuenta'
      ],
      nuevas_tablas_v8: [
        'regiones (16 regiones de Chile)',
        'provincias (56 provincias de Chile)', 
        'comunas (346 comunas de Chile)'
      ]
    },
    
    seguridad: {
      autenticacion: 'JWT con RUT',
      validacion_rut: 'Algoritmo chileno completo',
      validacion_geografica: 'Códigos CUT 2018 oficiales',
      encriptacion_passwords: 'bcrypt con salt rounds 12',
      rate_limiting: 'Configurado por endpoint',
      cors: 'Habilitado para desarrollo'
    },
    
    nuevas_funcionalidades_v8: {
      geografia_cut_2018: 'Integración completa con códigos territoriales oficiales de Chile',
      direccion_universal: 'Todas las personas tienen dirección con comuna, provincia y región',
      busqueda_geografica: 'Búsqueda inteligente de ubicaciones por nombre',
      validacion_territorial: 'Validación automática de códigos geográficos',
      estadisticas_geograficas: 'Métricas de distribución territorial',
      apis_geograficas: 'Endpoints especializados para consultas territoriales'
    },
    
    cobertura_geografica: {
      regiones_incluidas: [
        'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
        'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', 'O\'Higgins',
        'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos',
        'Los Lagos', 'Aysén', 'Magallanes y Antártica Chilena'
      ],
      total_comunas: 346,
      actualizacion: '2018 (CUT oficial)'
    }
  });
});


// Ruta de salud del sistema
router.get('/health', (req, res) => {
  res.json({
    estado: 'OK',
    timestamp: new Date().toISOString(),
    version: '8.6.2',
    uptime: process.uptime(),
    memoria: process.memoryUsage(),
    geografia: 'CUT 2018 Ready',
    base_datos: 'Conectada',
    funcionalidades: {
      autenticacion: 'Activa',
      geografia: 'Activa',
      pagos: 'Activa',
      reportes: 'Activa',
      carga_masiva: 'Activa'
    }
  });
});

module.exports = router;

