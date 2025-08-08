# Sistema de Gestión Escolar - Backend v4.0

## 🎓 Descripción

Backend completo para sistema de gestión escolar con **módulo de apoderados** y **sistema de pagos integrado**. Permite a los apoderados gestionar los pagos de múltiples hijos de forma independiente, donde cada hijo representa una cuenta de pago distinta.

## 🆕 Nuevas Funcionalidades v4.0

### Módulo de Apoderados
- ✅ Gestión completa de apoderados con múltiples hijos
- ✅ Autenticación independiente para apoderados
- ✅ Vista consolidada de deudas por apoderado
- ✅ Gestión de preferencias de pago
- ✅ Historial completo de pagos

### Sistema de Pagos
- ✅ Integración con Stripe para procesamiento de pagos
- ✅ Soporte para múltiples cuotas por transacción
- ✅ Webhooks para confirmación automática de pagos
- ✅ Gestión de clientes de Stripe automática
- ✅ Manejo de estados de pago (Pendiente, Pagado, Vencido, etc.)

## 🏗️ Arquitectura

### Estructura del Proyecto
```
src/
├── controllers/
│   ├── apoderadoController.js    # Gestión de apoderados
│   ├── webhookController.js      # Manejo de webhooks de Stripe
│   └── ...
├── models/
│   ├── apoderado.js             # Modelo de usuarios/apoderados
│   ├── cuota.js                 # Modelo de cuotas
│   ├── pago.js                  # Modelo de pagos
│   ├── estadoPago.js            # Estados de pago
│   └── ...
├── services/
│   └── paymentService.js        # Servicio de pagos con Stripe
├── routes/
│   ├── apoderadoRoutes.js       # Rutas del módulo de apoderados
│   ├── webhookRoutes.js         # Rutas para webhooks
│   └── ...
├── validators/
│   └── apoderadoValidator.js    # Validaciones para apoderados
└── scripts/
    └── init-payment-states.sql # Script de inicialización
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Copiar `.env.example` a `.env` y configurar:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_gestion_escolar
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Stripe (Pagos)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_stripe_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_de_stripe_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_de_stripe_aqui

# Configuración de pagos
PAYMENT_CURRENCY=clp
```

### 3. Inicializar Base de Datos
```bash
# Ejecutar el script de estados de pago
mysql -u root -p sistema_gestion_escolar < scripts/init-payment-states.sql
```

### 4. Iniciar el Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Módulo de Apoderados

#### Autenticación
- `POST /api/apoderados/login` - Login de apoderado

#### Gestión de Apoderados
- `GET /api/apoderados` - Listar apoderados
- `GET /api/apoderados/:id` - Obtener apoderado por ID
- `POST /api/apoderados` - Crear nuevo apoderado
- `PUT /api/apoderados/:id` - Actualizar apoderado
- `DELETE /api/apoderados/:id` - Desactivar apoderado

#### Gestión de Hijos y Deudas
- `GET /api/apoderados/:id/hijos` - Obtener hijos del apoderado
- `GET /api/apoderados/:id/deudas-pendientes` - Obtener deudas pendientes
- `PUT /api/apoderados/:id/preferencias-pago` - Actualizar preferencias de pago

#### Sistema de Pagos
- `POST /api/apoderados/:id/pagos/crear-intencion` - Crear intención de pago
- `POST /api/apoderados/:id/pagos/confirmar` - Confirmar pago
- `GET /api/apoderados/:id/pagos/historial` - Obtener historial de pagos

### Webhooks
- `POST /api/webhooks/stripe` - Webhook de Stripe
- `POST /api/webhooks/test` - Webhook de prueba
- `GET /api/webhooks/health` - Estado de webhooks

## 💳 Flujo de Pagos

### 1. Crear Intención de Pago
```javascript
POST /api/apoderados/123/pagos/crear-intencion
{
  "cuota_ids": [1, 2, 3],
  "alumno_id": 456
}
```

### 2. Procesar Pago en Frontend
Usar el `client_secret` retornado con Stripe Elements o Stripe.js

### 3. Confirmación Automática
El webhook de Stripe confirma automáticamente el pago exitoso

## 🔧 Configuración de Stripe

### 1. Crear Cuenta de Stripe
- Registrarse en [stripe.com](https://stripe.com)
- Obtener claves de API (test y live)

### 2. Configurar Webhooks
- URL: `https://tu-dominio.com/api/webhooks/stripe`
- Eventos a escuchar:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### 3. Configurar Métodos de Pago
El sistema soporta automáticamente:
- Tarjetas de crédito/débito
- Transferencias bancarias (según país)
- Wallets digitales (Apple Pay, Google Pay)

## 🏫 Casos de Uso

### Apoderado con Múltiples Hijos
```javascript
// Un apoderado puede tener varios hijos en diferentes cursos
{
  "apoderado": {
    "id": 123,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@email.com",
    "hijos": [
      {
        "id": 456,
        "nombre": "María Pérez",
        "curso": "3° Básico A"
      },
      {
        "id": 789,
        "nombre": "Carlos Pérez", 
        "curso": "1° Medio B"
      }
    ]
  }
}
```

### Pago de Múltiples Cuotas
```javascript
// Pagar cuotas de marzo y abril para ambos hijos
{
  "cuota_ids": [10, 11, 20, 21], // Cuotas de ambos hijos
  "monto_total": 120000,
  "descripcion": "Cuotas marzo y abril - María y Carlos Pérez"
}
```

## 🔒 Seguridad

- ✅ Autenticación JWT para apoderados
- ✅ Validación de datos con Joi
- ✅ Verificación de webhooks de Stripe
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Rate limiting en endpoints críticos
- ✅ Logs de auditoría para pagos

## 🧪 Testing

### Datos de Prueba de Stripe
```javascript
// Tarjeta de prueba exitosa
{
  "number": "4242424242424242",
  "exp_month": 12,
  "exp_year": 2025,
  "cvc": "123"
}

// Tarjeta de prueba fallida
{
  "number": "4000000000000002",
  "exp_month": 12,
  "exp_year": 2025,
  "cvc": "123"
}
```

## 📊 Monitoreo

### Logs Importantes
- Creación de Payment Intents
- Confirmación de pagos
- Errores de webhooks
- Autenticación de apoderados

### Métricas Sugeridas
- Tasa de éxito de pagos
- Tiempo promedio de procesamiento
- Cantidad de pagos por apoderado
- Cuotas más pagadas

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Consideraciones
- Configurar HTTPS obligatorio
- Configurar CORS apropiadamente
- Monitorear webhooks de Stripe
- Backup regular de base de datos

## 📞 Soporte

Para soporte técnico o consultas sobre la implementación:
- Revisar logs en `/logs/`
- Verificar estado de webhooks en Stripe Dashboard
- Consultar documentación de Stripe API

---

**Versión:** 4.0.0  
**Última actualización:** Agosto 2025  
**Compatibilidad:** Node.js 16+, MySQL 8.0+

