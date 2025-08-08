# Sistema de Gestión Escolar - Backend API

Backend completo para un sistema de gestión escolar desarrollado con Node.js, Express y Sequelize.

## 🚀 Características

- **Gestión de Alumnos**: CRUD completo con relaciones a cursos y apoderados
- **Gestión de Cursos**: Administración de cursos con profesores y tesoreros
- **Sistema de Cobros**: Gestión de cobros generales y específicos por alumno
- **Control de Deudas**: Seguimiento de deudas de alumnos y compañeros
- **Gestión de Gastos**: Control de gastos por categorías con boletas
- **Movimientos Financieros**: Registro de movimientos CCAA y CCPP
- **Auditoría Completa**: Campos de auditoría y soft delete en todas las entidades
- **Autenticación JWT**: Sistema de autenticación con roles
- **Rate Limiting**: Protección contra abuso de API
- **Logging Avanzado**: Sistema de logs estructurado
- **Validaciones**: Validación completa de datos de entrada

## 📋 Requisitos

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Configurar base de datos**
   - Crear base de datos MySQL
   - Actualizar credenciales en `.env`

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/          # Controladores de las rutas
│   │   ├── alumnoController.js
│   │   ├── categoriaGastoController.js
│   │   ├── cobroController.js
│   │   ├── cobroAlumnoController.js
│   │   ├── cursoController.js
│   │   ├── deudaAlumnoController.js
│   │   ├── deudaCompaneroController.js
│   │   ├── gastoController.js
│   │   ├── movimientoCcaaController.js
│   │   └── movimientoCcppController.js
│   ├── models/               # Modelos de Sequelize
│   │   ├── alumno.js
│   │   ├── categoriaGasto.js
│   │   ├── cobro.js
│   │   ├── cobroAlumno.js
│   │   ├── curso.js
│   │   ├── deudaAlumno.js
│   │   ├── deudaCompanero.js
│   │   ├── gasto.js
│   │   ├── movimientoCcaa.js
│   │   ├── movimientoCcpp.js
│   │   └── index.js
│   ├── routes/               # Definición de rutas
│   │   ├── alumnoRoutes.js
│   │   ├── categoriaGastoRoutes.js
│   │   ├── cobroRoutes.js
│   │   ├── cobroAlumnoRoutes.js
│   │   ├── cursoRoutes.js
│   │   ├── deudaAlumnoRoutes.js
│   │   ├── deudaCompaneroRoutes.js
│   │   ├── gastoRoutes.js
│   │   ├── movimientoCcaaRoutes.js
│   │   ├── movimientoCcppRoutes.js
│   │   └── index.js
│   ├── services/             # Lógica de negocio
│   │   ├── alumnoService.js
│   │   ├── categoriaGastoService.js
│   │   ├── cobroService.js
│   │   ├── cobroAlumnoService.js
│   │   ├── cursoService.js
│   │   ├── deudaAlumnoService.js
│   │   ├── deudaCompaneroService.js
│   │   ├── gastoService.js
│   │   ├── movimientoCcaaService.js
│   │   └── movimientoCcppService.js
│   ├── middleware/           # Middleware personalizado
│   │   ├── auth.js
│   │   ├── cors.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── index.js
│   ├── config/               # Configuraciones
│   │   ├── database.js
│   │   └── config.js
│   ├── utils/                # Utilidades
│   │   ├── auditFields.js
│   │   ├── logger.js
│   │   ├── responseHelper.js
│   │   └── validators.js
│   ├── app.js                # Configuración de Express
│   └── index.js              # Punto de entrada
├── package.json
├── .env                      # Variables de entorno
├── .env.example              # Ejemplo de variables
└── README.md
```

## 🔗 Endpoints de la API

### Alumnos
- `GET /api/alumnos` - Listar alumnos
- `POST /api/alumnos` - Crear alumno
- `GET /api/alumnos/:id` - Obtener alumno
- `PUT /api/alumnos/:id` - Actualizar alumno
- `DELETE /api/alumnos/:id` - Eliminar alumno
- `GET /api/alumnos/curso/:cursoId` - Alumnos por curso

### Cursos
- `GET /api/cursos` - Listar cursos
- `POST /api/cursos` - Crear curso
- `GET /api/cursos/:id` - Obtener curso
- `PUT /api/cursos/:id` - Actualizar curso
- `DELETE /api/cursos/:id` - Eliminar curso

### Cobros
- `GET /api/cobros` - Listar cobros
- `POST /api/cobros` - Crear cobro
- `GET /api/cobros/vencidos` - Cobros vencidos
- `GET /api/cobros/stats` - Estadísticas de cobros

### Deudas de Alumnos
- `GET /api/deudas-alumnos` - Listar deudas
- `POST /api/deudas-alumnos` - Crear deuda
- `PATCH /api/deudas-alumnos/:id/marcar-pagado` - Marcar como pagado

### Gastos
- `GET /api/gastos` - Listar gastos
- `POST /api/gastos` - Crear gasto
- `GET /api/gastos/stats` - Estadísticas de gastos

### Movimientos CCAA
- `GET /api/movimientos-ccaa` - Listar movimientos
- `POST /api/movimientos-ccaa` - Crear movimiento
- `GET /api/movimientos-ccaa/curso/:cursoId/balance` - Balance por curso

### Movimientos CCPP
- `GET /api/movimientos-ccpp` - Listar movimientos
- `POST /api/movimientos-ccpp` - Crear movimiento
- `GET /api/movimientos-ccpp/alumno/:alumnoId` - Movimientos por alumno

## 🔒 Autenticación

El API utiliza JWT para autenticación. Incluir el token en el header:

```
Authorization: Bearer <token>
```

### Roles disponibles:
- `admin` - Acceso completo
- `profesor` - Acceso a cursos asignados
- `tesorero` - Acceso a funciones financieras
- `alumno` - Acceso limitado a sus datos

## 📊 Campos de Auditoría

Todas las entidades incluyen campos de auditoría automáticos:

- `creado_por` - Usuario que creó el registro
- `fecha_creacion` - Fecha de creación
- `actualizado_por` - Usuario que actualizó el registro
- `fecha_actualizacion` - Fecha de última actualización
- `eliminado_por` - Usuario que eliminó el registro (soft delete)
- `fecha_eliminacion` - Fecha de eliminación (soft delete)

## 🛡️ Seguridad

- **Rate Limiting**: Protección contra abuso
- **Helmet**: Headers de seguridad
- **CORS**: Configuración de orígenes permitidos
- **Validación**: Validación estricta de entrada
- **Sanitización**: Limpieza de datos de entrada

## 📝 Logging

El sistema incluye logging estructurado con diferentes niveles:

- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `debug` - Información de depuración

Los logs se guardan en archivos y se muestran en consola durante desarrollo.

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Docker
```bash
# Construir imagen
docker build -t gestion-escolar-api .

# Ejecutar contenedor
docker run -p 3000:3000 gestion-escolar-api
```

## 📈 Monitoreo

El API incluye endpoints de monitoreo:

- `GET /` - Estado general del API
- `GET /api/health` - Health check
- `GET /api/info` - Información del API

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas:

- Email: soporte@gestionescolar.com
- Documentación: [docs.gestionescolar.com](https://docs.gestionescolar.com)
- Issues: [GitHub Issues](https://github.com/tu-repo/issues)

## 🔄 Changelog

### v1.0.0 (2024-01-XX)
- Implementación inicial del API
- Gestión completa de entidades escolares
- Sistema de autenticación y autorización
- Auditoría y soft delete
- Documentación completa

