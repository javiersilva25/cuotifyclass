# Guía de Despliegue - Backend v4.0

## 🚀 Preparación para Despliegue

### Archivos de Configuración
- `.env.production` - Variables de entorno para producción
- `app.js` - Punto de entrada para despliegue
- `package.json` - Scripts actualizados con `start:prod`

### Variables de Entorno Críticas

#### Base de Datos
```env
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=sistema_gestion_escolar
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
```

#### Stripe (APIs de Pago)
```env
STRIPE_SECRET_KEY=sk_live_your_real_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_real_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Seguridad
```env
JWT_SECRET=your_very_secure_jwt_secret_for_production
NODE_ENV=production
```

## 📋 Checklist Pre-Despliegue

### ✅ Base de Datos
- [ ] Crear base de datos MySQL
- [ ] Ejecutar script de inicialización: `scripts/init-payment-states.sql`
- [ ] Verificar conexión desde el servidor

### ✅ Stripe
- [ ] Crear cuenta de Stripe (modo live)
- [ ] Obtener claves de API de producción
- [ ] Configurar webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
- [ ] Activar eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### ✅ Seguridad
- [ ] Generar JWT_SECRET seguro (mínimo 32 caracteres)
- [ ] Configurar CORS para dominios específicos
- [ ] Habilitar HTTPS
- [ ] Configurar rate limiting

### ✅ Monitoreo
- [ ] Configurar logs de aplicación
- [ ] Configurar alertas para errores críticos
- [ ] Monitorear webhooks de Stripe
- [ ] Configurar backup de base de datos

## 🔧 Comandos de Despliegue

### Instalación
```bash
npm install --production
```

### Inicialización de Base de Datos
```bash
mysql -u root -p sistema_gestion_escolar < scripts/init-payment-states.sql
```

### Inicio en Producción
```bash
npm run start:prod
```

## 🌐 Endpoints Disponibles

### API Principal
- `GET /api/health` - Estado del sistema
- `GET /api/info` - Información del API v4.0

### Módulo de Apoderados
- `POST /api/apoderados/login` - Login de apoderados
- `GET /api/apoderados` - Lista de apoderados
- `GET /api/apoderados/:id` - Datos del apoderado
- `GET /api/apoderados/:id/hijos` - Hijos del apoderado
- `GET /api/apoderados/:id/deudas-pendientes` - Deudas pendientes

### Sistema de Pagos
- `POST /api/apoderados/:id/pagos/crear-intencion` - Crear pago
- `POST /api/apoderados/:id/pagos/confirmar` - Confirmar pago
- `GET /api/apoderados/:id/pagos/historial` - Historial de pagos

### Webhooks
- `POST /api/webhooks/stripe` - Webhook de Stripe

## 📊 Monitoreo Post-Despliegue

### Métricas Importantes
- Tiempo de respuesta de endpoints
- Tasa de éxito de pagos
- Errores de webhooks
- Conexiones a base de datos

### Logs a Monitorear
- Errores de autenticación
- Fallos en pagos
- Errores de webhook
- Conexiones de base de datos

## 🔒 Consideraciones de Seguridad

### HTTPS Obligatorio
- Todos los endpoints deben usar HTTPS
- Especialmente crítico para webhooks de Stripe

### Rate Limiting
- Implementar límites por IP
- Especial atención a endpoints de login y pagos

### Validación de Datos
- Todos los inputs están validados con Joi
- Sanitización de datos de entrada

## 🆘 Troubleshooting

### Error de Conexión a Base de Datos
1. Verificar credenciales en `.env.production`
2. Confirmar que MySQL esté ejecutándose
3. Verificar permisos de usuario de base de datos

### Errores de Stripe
1. Verificar claves de API en variables de entorno
2. Confirmar configuración de webhook en Stripe Dashboard
3. Verificar que el endpoint sea accesible públicamente

### Problemas de Autenticación
1. Verificar JWT_SECRET en producción
2. Confirmar que los tokens no hayan expirado
3. Verificar configuración de CORS

## 📞 Soporte

Para problemas de despliegue:
1. Revisar logs en `/logs/`
2. Verificar variables de entorno
3. Confirmar estado de servicios externos (MySQL, Stripe)

---

**Versión:** 4.0.0  
**Última actualización:** Agosto 2025

