# Sistema de Gestión Escolar - Backend v4.1.0

## 🎯 Descripción

Backend completo para sistema de gestión escolar con **módulo de apoderados** y **sistema unificado de pagos** que integra múltiples pasarelas para ofrecer la mejor experiencia y costos optimizados.

## ✨ Características Principales

### 🏫 Gestión Escolar Completa
- Gestión de alumnos y cursos
- Sistema de cobros y deudas
- Movimientos financieros (CCAA/CCPP)
- Reportes y estadísticas

### 👨‍👩‍👧‍👦 Módulo de Apoderados
- **Autenticación independiente** para apoderados
- **Múltiples hijos por apoderado** - Cada hijo es una cuenta de pago independiente
- **Vista consolidada de deudas** de todos los hijos
- **Gestión de preferencias** de pago

### 💳 Sistema Unificado de Pagos (NUEVO v4.1)
- **4 Pasarelas Integradas**:
  - 🌍 **Stripe** - Internacional, premium UX
  - 🇨🇱 **Transbank** - Líder en Chile, más económico
  - 🌎 **MercadoPago** - Cobertura latinoamericana
  - 🏛️ **BancoEstado** - Transferencias económicas

- **Recomendación Inteligente**: Selección automática de la pasarela más económica
- **Webhooks Unificados**: Confirmación automática de pagos
- **Historial Consolidado**: Vista unificada de pagos de todas las pasarelas

## 📊 Comparación de Costos

| Pasarela | Costo Estimado (50.000 CLP) | Mejor Para |
|----------|----------------------------|------------|
| **BancoEstado** | ~$500 CLP | Transferencias grandes |
| **Transbank** | ~$1.595 CLP | Tarjetas en Chile |
| **MercadoPago** | ~$1.745 CLP | Cobertura regional |
| **Stripe** | ~$2.030 CLP | Pagos internacionales |

*El sistema recomienda automáticamente la opción más económica*

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- MySQL 8.0+
- NPM o Yarn

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd backend-gestion-escolar

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Configuración de Base de Datos
```bash
# El sistema creará automáticamente las tablas necesarias
# Solo asegúrate de que la base de datos exista
mysql -u root -p -e "CREATE DATABASE sistema_gestion_escolar;"
```

### Variables de Entorno Críticas

#### Base de Datos
```env
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

#### Pasarelas de Pago
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_tu_clave_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica

# Transbank
TRANSBANK_COMMERCE_CODE=tu_codigo_comercio
TRANSBANK_API_KEY=tu_api_key_transbank

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR_tu_token_produccion

# BancoEstado
BANCOESTADO_MERCHANT_ID=tu_merchant_id
BANCOESTADO_SECRET_KEY=tu_secret_key
```

## 🎮 Uso del Sistema

### Iniciar Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Endpoints Principales

#### Sistema Unificado de Pagos
```bash
# Ver pasarelas disponibles
GET /api/payments/gateways

# Obtener recomendación
GET /api/payments/gateways/recommend?country=CL&priority=cost

# Crear pago (selección automática de pasarela)
POST /api/payments/apoderados/1/create
{
  "cuota_ids": [1, 2],
  "payment_method": "card",
  "country": "CL"
}

# Crear pago con pasarela específica
POST /api/payments/apoderados/1/create
{
  "cuota_ids": [1, 2],
  "gateway": "transbank"
}
```

#### Módulo de Apoderados
```bash
# Login de apoderado
POST /api/apoderados/login
{
  "email": "apoderado@email.com",
  "password": "password"
}

# Ver deudas pendientes de todos los hijos
GET /api/apoderados/1/deudas-pendientes

# Historial consolidado de pagos
GET /api/payments/apoderados/1/history
```

## 🔄 Flujo de Pago Completo

### 1. Frontend: Consultar Opciones
```javascript
// Obtener pasarelas disponibles
const gateways = await fetch('/api/payments/gateways');

// Obtener recomendación para Chile, priorizando costo
const recommendation = await fetch('/api/payments/gateways/recommend?country=CL&priority=cost');
// Respuesta: { gateway: "transbank", reason: "Tarifas preferenciales para Chile" }
```

### 2. Frontend: Crear Pago
```javascript
const payment = await fetch('/api/payments/apoderados/1/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cuota_ids: [1, 2],
    // gateway: "transbank" // Opcional, si no se especifica usa recomendación
  })
});

// Respuesta incluye URL/token específico de la pasarela seleccionada
const { gateway, token, url, amount } = payment.data;
```

### 3. Frontend: Procesar Según Pasarela
```javascript
switch (gateway) {
  case 'stripe':
    // Usar Stripe Elements con client_secret
    break;
  case 'transbank':
    // Redirigir a URL de Transbank
    window.location.href = url;
    break;
  case 'mercadopago':
    // Redirigir a init_point de MercadoPago
    break;
  case 'bancoestado':
    // Redirigir a URL de BancoEstado
    break;
}
```

### 4. Backend: Confirmación Automática
Los webhooks se encargan automáticamente de confirmar los pagos:
- `POST /api/payments/webhooks/stripe`
- `POST /api/payments/webhooks/mercadopago`
- `POST /api/payments/webhooks/bancoestado`
- Transbank usa confirmación directa (no webhook)

## 🏗️ Arquitectura del Sistema

### Servicios de Pago
```
UnifiedPaymentService
├── PaymentService (Stripe)
├── TransbankService
├── MercadoPagoService
└── BancoEstadoService
```

### Base de Datos
```
usuarios (apoderados)
├── apoderado_alumno (relación N:M)
├── alumnos
├── cuotas
├── pagos (unificado para todas las pasarelas)
└── estado_pago
```

### Controladores
- `UnifiedPaymentController` - Gestión unificada
- `ApoderadoController` - Módulo de apoderados
- `WebhookController` - Procesamiento de webhooks

## 🔧 Configuración de Producción

### 1. Configurar Pasarelas

#### Stripe
1. Crear cuenta en [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtener claves de producción
3. Configurar webhooks: `https://tu-dominio.com/api/payments/webhooks/stripe`

#### Transbank
1. Solicitar certificación comercial
2. Obtener código de comercio y API key
3. Configurar URL de retorno: `https://tu-dominio.com/api/transbank/return`

#### MercadoPago
1. Crear aplicación en [MercadoPago Developers](https://www.mercadopago.com/developers)
2. Obtener Access Token de producción
3. Configurar webhook: `https://tu-dominio.com/api/payments/webhooks/mercadopago`

#### BancoEstado
1. Contactar BancoEstado Empresas
2. Solicitar credenciales de Compraquí Web
3. Configurar URLs de notificación

### 2. Configurar Webhooks
Cada pasarela debe configurarse para enviar notificaciones a:
```
https://tu-dominio.com/api/payments/webhooks/{gateway}
```

### 3. Variables de Producción
```env
NODE_ENV=production
BASE_URL=https://tu-dominio.com

# Usar claves reales de cada pasarela
STRIPE_SECRET_KEY=sk_live_...
TRANSBANK_COMMERCE_CODE=codigo_real
MERCADOPAGO_ACCESS_TOKEN=APP_USR_...
BANCOESTADO_MERCHANT_ID=merchant_real
```

## 📊 Monitoreo y Logs

### Logs Importantes
```bash
# Ver logs de pagos
tail -f logs/app.log | grep "Pago\|Payment\|Webhook"

# Ver errores de pasarelas
tail -f logs/app.log | grep "ERROR.*gateway"
```

### Métricas Clave
- Tasa de éxito de pagos por pasarela
- Tiempo de respuesta de webhooks
- Distribución de uso de pasarelas
- Ahorro en comisiones vs Stripe

## 🧪 Testing

### Ejecutar Pruebas
```bash
# Probar configuraciones
curl http://localhost:3000/api/payments/gateways/test

# Probar recomendaciones
curl "http://localhost:3000/api/payments/gateways/recommend?country=CL&priority=cost"

# Comparar costos
curl "http://localhost:3000/api/payments/gateways/compare?amount=50000"
```

### Datos de Prueba
El sistema incluye datos simulados para testing sin base de datos real.

## 🚨 Troubleshooting

### Problemas Comunes

#### Error: "Pasarela no está habilitada"
- Verificar variables de entorno de la pasarela
- Revisar logs de inicialización
- Usar endpoint `/api/payments/gateways/test`

#### Error: "Apoderado no encontrado"
- Verificar que existan usuarios con rol 'apoderado'
- Revisar relación apoderado_alumno
- Verificar ID del apoderado

#### Webhook no funciona
- Verificar URL pública accesible
- Revisar configuración en dashboard de la pasarela
- Verificar logs de webhook

## 📈 Roadmap

### v4.2 (Próximo)
- [ ] Dashboard de administración de pagos
- [ ] Reportes de comisiones por pasarela
- [ ] Notificaciones por email/SMS
- [ ] API de conciliación bancaria

### v4.3 (Futuro)
- [ ] Pagos recurrentes automáticos
- [ ] Integración con más bancos chilenos
- [ ] Sistema de descuentos y promociones
- [ ] App móvil para apoderados

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **Email**: soporte@gestionescolar.com
- **Documentación**: [Wiki del proyecto](wiki-url)
- **Issues**: [GitHub Issues](issues-url)

---

**Versión**: 4.1.0  
**Última actualización**: Agosto 2025  
**Compatibilidad**: Node.js 18+, MySQL 8.0+

