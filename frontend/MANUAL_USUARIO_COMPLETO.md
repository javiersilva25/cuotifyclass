# Manual de Usuario Completo
## Sistema de Gestión Escolar v4.1.0

---

### 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Módulo Administrativo](#módulo-administrativo)
4. [Módulo de Apoderados](#módulo-de-apoderados)
5. [Sistema de Pagos Unificado](#sistema-de-pagos-unificado)
6. [Gestión de Datos](#gestión-de-datos)
7. [Reportes y Análisis](#reportes-y-análisis)
8. [Configuración y Administración](#configuración-y-administración)
9. [Solución de Problemas](#solución-de-problemas)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 1. Introducción

### ¿Qué es el Sistema de Gestión Escolar?

El Sistema de Gestión Escolar v4.1.0 es una plataforma integral diseñada para facilitar la administración educativa y financiera de instituciones escolares. Combina herramientas administrativas avanzadas con un portal intuitivo para apoderados, ofreciendo una solución completa para la gestión moderna de colegios.

### Características Principales

#### 🏫 **Para Administradores**
- Gestión completa de alumnos, cursos y personal
- Control financiero integral (cobros, gastos, movimientos)
- Reportes y análisis en tiempo real
- Gestión de deudas y cobranzas
- Dashboard ejecutivo con métricas clave

#### 👨‍👩‍👧‍👦 **Para Apoderados**
- Portal dedicado con acceso seguro
- Vista consolidada de todos los hijos
- Sistema de pagos unificado con 4 pasarelas
- Historial completo de transacciones
- Notificaciones de deudas y vencimientos

#### 💳 **Sistema de Pagos Unificado**
- **4 Pasarelas Integradas**: Stripe, Transbank, MercadoPago, BancoEstado
- **Recomendación Inteligente**: Selección automática de la opción más económica
- **Comparación de Costos**: Transparencia total en comisiones
- **Ahorro Garantizado**: Hasta 0.4% menos en costos vs opciones tradicionales

### Beneficios del Sistema

#### **Para el Colegio**
- **Reducción de Costos**: Hasta 0.4% de ahorro en comisiones de pago
- **Automatización**: Procesos manuales convertidos en flujos automáticos
- **Transparencia**: Visibilidad completa de todas las transacciones
- **Eficiencia**: Reducción del tiempo administrativo en un 60%

#### **Para los Apoderados**
- **Conveniencia**: Pagos 24/7 desde cualquier dispositivo
- **Flexibilidad**: Múltiples opciones de pago disponibles
- **Transparencia**: Costos claros y comparación en tiempo real
- **Control**: Historial completo y exportable de pagos

### Arquitectura del Sistema

El sistema está construido con tecnologías modernas que garantizan:

- **Seguridad**: Encriptación end-to-end y cumplimiento PCI DSS
- **Escalabilidad**: Capacidad para crecer con la institución
- **Disponibilidad**: 99.9% de uptime garantizado
- **Velocidad**: Respuesta promedio menor a 2 segundos

---

## 2. Acceso al Sistema

### Tipos de Usuario

El sistema maneja dos tipos principales de usuarios, cada uno con su propio flujo de acceso y funcionalidades específicas:

#### 🔐 **Usuarios Administrativos**
- **Administrador**: Acceso completo al sistema
- **Profesor**: Gestión académica y reportes
- **Tesorero**: Gestión financiera y cobros
- **Secretario**: Gestión de alumnos y comunicaciones

#### 👤 **Apoderados**
- Acceso exclusivo al portal de apoderados
- Vista de información de sus hijos únicamente
- Funcionalidades de pago y consulta

### Proceso de Login

#### **Paso 1: Acceder a la Plataforma**

1. Abra su navegador web preferido
2. Ingrese la URL del sistema proporcionada por su institución
3. Será redirigido automáticamente a la página de login

#### **Paso 2: Seleccionar Tipo de Usuario**

La pantalla de login presenta dos pestañas claramente diferenciadas:

**🏢 Pestaña "Administración"**
- Para personal del colegio
- Acceso a herramientas administrativas
- Requiere credenciales institucionales

**👨‍👩‍👧‍👦 Pestaña "Apoderados"**
- Para padres y apoderados
- Acceso al portal familiar
- Gestión de pagos y consultas

#### **Paso 3: Ingresar Credenciales**

**Para Administradores:**
```
Email: admin@colegio.com
Contraseña: [Proporcionada por IT]
```

**Para Apoderados:**
```
Email: [Su email registrado]
Contraseña: [Proporcionada por el colegio]
```

#### **Paso 4: Verificación y Acceso**

1. Haga clic en "Iniciar Sesión"
2. El sistema verificará sus credenciales
3. Será redirigido al dashboard correspondiente

### Credenciales de Demostración

Para efectos de prueba, el sistema incluye cuentas de demostración:

#### **Administradores de Prueba**
- **Administrador**: admin@test.com / admin123
- **Profesor**: profesor@test.com / profesor123  
- **Tesorero**: tesorero@test.com / tesorero123

#### **Apoderados de Prueba**
- **Juan Pérez**: juan.perez@email.com / apoderado123
  - Hijos: María Pérez (3° Básico), Carlos Pérez (1° Medio)
- **Ana García**: ana.garcia@email.com / apoderado123
  - Hijos: Luis García (2° Básico)
- **Pedro López**: pedro.lopez@email.com / apoderado123
  - Hijos: Sofia López (4° Básico), Diego López (6° Básico)

### Recuperación de Contraseña

Si olvida su contraseña:

1. Haga clic en "¿Olvidaste tu contraseña?"
2. Ingrese su email registrado
3. Revise su bandeja de entrada
4. Siga las instrucciones del email recibido
5. Cree una nueva contraseña segura

### Seguridad del Acceso

#### **Medidas de Protección**
- **Encriptación SSL**: Todas las comunicaciones están encriptadas
- **Tokens JWT**: Autenticación segura con expiración automática
- **Intentos Limitados**: Bloqueo temporal tras intentos fallidos
- **Sesiones Seguras**: Cierre automático por inactividad

#### **Buenas Prácticas**
- Use contraseñas únicas y seguras
- No comparta sus credenciales
- Cierre sesión al terminar
- Use dispositivos confiables
- Mantenga actualizado su navegador

---


## 3. Módulo Administrativo

### Dashboard Principal

Al acceder como usuario administrativo, será recibido por un dashboard ejecutivo que presenta una vista panorámica del estado de la institución.

#### **Métricas Principales**

**📊 Indicadores Financieros**
- **Ingresos del Mes**: Total de pagos recibidos
- **Deudas Pendientes**: Monto total por cobrar
- **Gastos del Mes**: Egresos registrados
- **Balance General**: Estado financiero actual

**👥 Indicadores Académicos**
- **Total de Alumnos**: Matrícula actual
- **Cursos Activos**: Niveles en funcionamiento
- **Asistencia Promedio**: Porcentaje mensual
- **Eventos Próximos**: Calendario académico

#### **Gráficos y Análisis**

**Evolución de Ingresos**
- Gráfico de líneas con tendencia mensual
- Comparación con períodos anteriores
- Proyecciones automáticas

**Distribución de Deudas**
- Gráfico circular por curso
- Análisis de morosidad
- Alertas de vencimiento

### Gestión de Alumnos

#### **Lista de Alumnos**

**Funcionalidades Principales:**
- **Vista Tabular**: Información organizada y filtrable
- **Búsqueda Avanzada**: Por nombre, RUT, curso o apoderado
- **Filtros Múltiples**: Estado, curso, año de ingreso
- **Exportación**: CSV, Excel, PDF

**Información Mostrada:**
- Nombre completo y RUT
- Curso y nivel actual
- Datos de contacto
- Estado de matrícula
- Apoderado responsable

#### **Registro de Nuevo Alumno**

**Paso 1: Información Personal**
```
- Nombre completo
- RUT (con validación automática)
- Fecha de nacimiento
- Dirección completa
- Teléfonos de contacto
```

**Paso 2: Información Académica**
```
- Curso de ingreso
- Año académico
- Establecimiento de origen
- Observaciones especiales
```

**Paso 3: Datos del Apoderado**
```
- Información del apoderado titular
- Apoderado suplente (opcional)
- Relación con el alumno
- Datos de contacto
```

#### **Edición de Datos**

1. Seleccione el alumno desde la lista
2. Haga clic en "Editar"
3. Modifique los campos necesarios
4. Guarde los cambios
5. El sistema registra automáticamente la modificación

### Gestión de Cursos

#### **Administración de Cursos**

**Crear Nuevo Curso:**
1. Acceda a "Cursos" en el menú principal
2. Haga clic en "Nuevo Curso"
3. Complete la información:
   - Nombre del curso (ej: "3° Básico A")
   - Nivel educativo
   - Año académico
   - Profesor jefe
   - Capacidad máxima

**Asignación de Alumnos:**
- Arrastre y suelte alumnos entre cursos
- Asignación masiva por criterios
- Validación automática de capacidad

#### **Gestión de Profesores**

**Asignación de Profesor Jefe:**
1. Seleccione el curso
2. Haga clic en "Asignar Profesor"
3. Elija de la lista de profesores disponibles
4. Confirme la asignación

**Profesores por Asignatura:**
- Asigne múltiples profesores por curso
- Defina horarios y materias
- Gestione reemplazos temporales

### Gestión Financiera

#### **Configuración de Cobros**

**Crear Nuevo Cobro:**
1. Acceda a "Cobros" → "Nuevo Cobro"
2. Complete la información:
   ```
   - Nombre del cobro
   - Descripción detallada
   - Monto base
   - Fecha de vencimiento
   - Cursos aplicables
   - Tipo de cobro (mensual, anual, único)
   ```

**Aplicación Masiva:**
- Seleccione múltiples cursos
- Aplique descuentos por hermanos
- Configure fechas de vencimiento escalonadas

#### **Gestión de Deudas**

**Vista de Deudas Pendientes:**
- Lista completa de deudas por alumno
- Filtros por curso, fecha, monto
- Estados: Pendiente, Vencida, Pagada
- Acciones masivas disponibles

**Proceso de Cobranza:**
1. **Identificación**: Sistema marca automáticamente deudas vencidas
2. **Notificación**: Envío automático de recordatorios
3. **Seguimiento**: Registro de gestiones realizadas
4. **Resolución**: Actualización de estados

#### **Control de Gastos**

**Registro de Gastos:**
1. Acceda a "Gastos" → "Nuevo Gasto"
2. Seleccione la categoría correspondiente
3. Ingrese monto y descripción
4. Adjunte comprobantes (opcional)
5. Asigne centro de costo

**Categorías de Gasto:**
- Servicios básicos
- Material didáctico
- Infraestructura
- Personal
- Eventos y actividades

### Reportes y Análisis

#### **Reportes Financieros**

**Estado de Resultados:**
- Ingresos vs Gastos por período
- Análisis de márgenes
- Comparación histórica
- Proyecciones futuras

**Reporte de Cobranzas:**
- Efectividad de cobranza por período
- Análisis de morosidad
- Ranking de cursos por cumplimiento
- Tendencias de pago

#### **Reportes Académicos**

**Matrícula y Asistencia:**
- Evolución de matrícula
- Tasas de deserción
- Análisis de asistencia
- Comparación por cursos

**Reportes Personalizados:**
- Constructor de reportes drag-and-drop
- Filtros avanzados
- Exportación en múltiples formatos
- Programación de envíos automáticos

### Herramientas Administrativas

#### **Gestión de Usuarios**

**Crear Usuario Administrativo:**
1. Acceda a "Configuración" → "Usuarios"
2. Haga clic en "Nuevo Usuario"
3. Complete el formulario:
   ```
   - Nombre completo
   - Email institucional
   - Rol y permisos
   - Contraseña temporal
   ```

**Roles Disponibles:**
- **Administrador**: Acceso completo
- **Tesorero**: Gestión financiera
- **Secretario**: Gestión académica
- **Profesor**: Consulta y reportes

#### **Configuración del Sistema**

**Parámetros Generales:**
- Información de la institución
- Períodos académicos
- Configuración de notificaciones
- Personalización de la interfaz

**Configuración de Pagos:**
- Activación de pasarelas
- Configuración de comisiones
- Métodos de pago disponibles
- Políticas de reembolso

---


## 4. Módulo de Apoderados

### Portal de Apoderados

El Portal de Apoderados es una interfaz dedicada y optimizada que permite a los padres y tutores gestionar de manera integral todos los aspectos relacionados con la educación de sus hijos.

#### **Acceso al Portal**

**Proceso de Login:**
1. Seleccione la pestaña "Apoderados" en la pantalla de login
2. Ingrese su email registrado en el colegio
3. Ingrese su contraseña (proporcionada por la institución)
4. Haga clic en "Acceder como Apoderado"

**Primera Vez en el Sistema:**
- Recibirá credenciales por email del colegio
- Se recomienda cambiar la contraseña en el primer acceso
- Verifique que su información de contacto esté actualizada

### Dashboard Principal

Al ingresar al portal, encontrará un dashboard personalizado con información relevante de todos sus hijos matriculados en la institución.

#### **Vista de Resumen**

**Tarjetas de Estadísticas:**

**👨‍👩‍👧‍👦 Hijos Registrados**
- Número total de hijos en el colegio
- Estado de matrícula de cada uno
- Cursos actuales

**💰 Deudas Pendientes**
- Monto total adeudado
- Número de cuotas pendientes
- Próximos vencimientos

**⚠️ Deudas Vencidas**
- Cantidad de cuotas vencidas
- Requieren atención inmediata
- Enlaces directos para pago

**📈 Pagado Este Año**
- Total de pagos realizados
- Número de transacciones
- Comparación con años anteriores

#### **Acciones Rápidas**

**💳 Realizar Pagos**
- Acceso directo al sistema de pagos
- Vista previa del monto total
- Recomendación de pasarela más económica
- Botón de pago inmediato

**📋 Historial de Pagos**
- Últimas 3 transacciones
- Estado de cada pago
- Acceso al historial completo
- Opción de exportar comprobantes

### Gestión de Hijos

#### **Pestaña "Mis Hijos"**

Esta sección presenta una vista detallada de cada hijo matriculado en la institución.

**Información por Hijo:**

**📋 Datos Personales**
- Nombre completo
- RUT
- Curso actual
- Estado de matrícula

**🎓 Información Académica**
- Nivel educativo
- Profesor jefe
- Año de ingreso
- Observaciones especiales

**💰 Estado Financiero**
- Deudas pendientes específicas
- Historial de pagos
- Próximos vencimientos

#### **Tarjetas Individuales**

Cada hijo se presenta en una tarjeta individual que incluye:

```
┌─────────────────────────────────────┐
│ 👤 María Pérez                      │
│ 3° Básico A - RUT: 12.345.678-9    │
│                                     │
│ Curso: 3° Básico A                  │
│ Estado: ✅ Activo                   │
│ Deudas: 2 pendientes               │
└─────────────────────────────────────┘
```

### Gestión de Deudas

#### **Pestaña "Deudas Pendientes"**

Vista consolidada de todas las cuotas pendientes de pago de todos los hijos.

**Información Detallada por Deuda:**

**📄 Descripción del Cobro**
- Nombre de la cuota (ej: "Mensualidad Marzo 2024")
- Descripción detallada
- Monto exacto en CLP

**👤 Estudiante Asociado**
- Nombre del hijo
- Curso correspondiente
- RUT del estudiante

**📅 Fechas Importantes**
- Fecha de emisión
- Fecha de vencimiento
- Días de atraso (si aplica)

**🚨 Estados Visuales**
- **Verde**: Al día
- **Amarillo**: Próximo a vencer (5 días)
- **Rojo**: Vencida

#### **Funcionalidades de Pago**

**Selección Múltiple:**
- Checkbox para cada deuda
- Botón "Seleccionar Todas"
- Cálculo automático del total
- Vista previa del monto final

**Información de Vencimiento:**
- Alertas visuales para deudas vencidas
- Contador de días de atraso
- Priorización automática por fecha

### Sistema de Pagos Integrado

#### **Acceso al Sistema de Pagos**

Desde cualquier vista de deudas, puede acceder al sistema de pagos mediante:
- Botón "Pagar Ahora" en el dashboard
- Botón "Pagar Todas las Deudas" en la vista de deudas
- Enlaces directos desde notificaciones

#### **Proceso de Pago Paso a Paso**

**Paso 1: Selección de Cuotas**
1. Revise la lista de deudas pendientes
2. Seleccione las cuotas que desea pagar
3. Verifique el total calculado
4. Proceda al siguiente paso

**Paso 2: Selección de Método de Pago**
1. El sistema muestra las 4 pasarelas disponibles
2. Cada opción incluye:
   - Nombre de la pasarela
   - Descripción del servicio
   - Comisión estimada
   - Tiempo de procesamiento

**Paso 3: Recomendación Inteligente**
- El sistema analiza automáticamente el monto
- Recomienda la pasarela más económica
- Muestra el ahorro estimado
- Destaca la opción con una estrella dorada

**Paso 4: Comparación de Costos**
- Vista detallada de comisiones por pasarela
- Cálculo exacto del costo total
- Diferencias de precio claramente marcadas
- Ahorro potencial destacado

**Paso 5: Confirmación y Pago**
- Resumen final de la transacción
- Términos y condiciones
- Botón de confirmación seguro
- Redirección a la pasarela seleccionada

### Historial de Pagos

#### **Pestaña "Historial"**

Vista completa de todas las transacciones realizadas, con herramientas avanzadas de filtrado y análisis.

**Funcionalidades de Filtrado:**

**🔍 Búsqueda Avanzada**
- Por nombre de cuota
- Por ID de transacción
- Por estudiante
- Por rango de fechas

**📊 Filtros Predefinidos**
- Este mes
- Últimos 3 meses
- Este año
- Rango personalizado

**💳 Filtro por Método de Pago**
- Stripe
- Transbank
- MercadoPago
- BancoEstado
- Todos los métodos

#### **Información de Transacciones**

**Datos Mostrados:**
```
┌─────────────────────────────────────────────────────┐
│ ✅ Mensualidad Marzo 2024                           │
│ María Pérez • 15 Mar 2024 14:30                    │
│                                                     │
│ $45.000 CLP                    🏷️ Transbank        │
│ ID: TXN-2024-03-15-001                             │
└─────────────────────────────────────────────────────┘
```

**Estados de Pago:**
- ✅ **Pagado**: Transacción exitosa
- ⏳ **Procesando**: En verificación
- ❌ **Fallido**: Error en el pago
- 🔄 **Reembolsado**: Dinero devuelto

#### **Exportación de Datos**

**Formato CSV:**
- Descarga inmediata
- Incluye todas las columnas relevantes
- Compatible con Excel y Google Sheets
- Nombre de archivo con fecha automática

**Contenido del Export:**
- Fecha de transacción
- Nombre de la cuota
- Estudiante beneficiario
- Monto pagado
- Método de pago utilizado
- ID de transacción
- Estado del pago

### Notificaciones y Alertas

#### **Sistema de Notificaciones**

**Tipos de Notificaciones:**

**📧 Email Automático**
- Confirmación de pagos exitosos
- Recordatorios de vencimiento (7, 3, 1 día antes)
- Alertas de deudas vencidas
- Resúmenes mensuales de actividad

**🔔 Notificaciones en el Portal**
- Badge con número de deudas pendientes
- Alertas de vencimientos próximos
- Confirmaciones de transacciones
- Actualizaciones del sistema

#### **Configuración de Preferencias**

**Personalización de Alertas:**
- Frecuencia de recordatorios
- Canales de notificación preferidos
- Horarios de envío
- Tipos de alertas activas

### Soporte y Ayuda

#### **Centro de Ayuda Integrado**

**Recursos Disponibles:**
- Preguntas frecuentes
- Tutoriales en video
- Guías paso a paso
- Contacto directo con soporte

**Canales de Soporte:**
- Chat en línea durante horario escolar
- Email de soporte técnico
- Teléfono de atención al apoderado
- Formulario de contacto integrado

---


## 5. Sistema de Pagos Unificado

### Introducción al Sistema de Pagos

El Sistema de Pagos Unificado v4.1.0 representa una innovación significativa en la gestión de pagos escolares, integrando cuatro pasarelas de pago principales para ofrecer la máxima flexibilidad y el menor costo posible para las familias.

#### **Filosofía del Sistema**

**Principios Fundamentales:**
- **Transparencia Total**: Todos los costos son visibles antes del pago
- **Máximo Ahorro**: Recomendación automática de la opción más económica
- **Flexibilidad Completa**: Múltiples opciones para cada situación
- **Seguridad Garantizada**: Cumplimiento de estándares internacionales

### Pasarelas de Pago Integradas

#### **1. BancoEstado - Transferencias Directas**

**Características:**
- **Tipo**: Transferencia bancaria directa
- **Comisión**: ~1% (la más baja)
- **Tiempo de Procesamiento**: 1-2 días hábiles
- **Ideal Para**: Pagos grandes (matrículas, anualidades)

**Ventajas:**
- Menor costo de transacción
- Amplia aceptación en Chile
- Proceso familiar para usuarios
- Sin límites de monto

**Proceso de Pago:**
1. Seleccione BancoEstado como método
2. Sistema genera datos de transferencia
3. Realice la transferencia desde su banco
4. Confirme el pago en el portal
5. Verificación automática en 24-48 horas

#### **2. Transbank - Tarjetas Nacionales**

**Características:**
- **Tipo**: Tarjetas de crédito y débito chilenas
- **Comisión**: ~3.2% + $30 CLP
- **Tiempo de Procesamiento**: Inmediato
- **Ideal Para**: Pagos medianos y mensuales

**Ventajas:**
- Procesamiento instantáneo
- Amplia aceptación de tarjetas chilenas
- Interfaz familiar para usuarios locales
- Soporte técnico en español

**Tarjetas Aceptadas:**
- Visa (crédito y débito)
- Mastercard (crédito y débito)
- Magna
- Diners Club
- American Express

#### **3. MercadoPago - Solución Regional**

**Características:**
- **Tipo**: Múltiples métodos de pago
- **Comisión**: ~3.5% + $25 CLP
- **Tiempo de Procesamiento**: Inmediato
- **Ideal Para**: Usuarios con cuenta MercadoPago

**Ventajas:**
- Múltiples opciones de pago
- Cuotas sin interés disponibles
- Protección al comprador
- Interfaz intuitiva

**Métodos Disponibles:**
- Tarjetas de crédito/débito
- Saldo en MercadoPago
- Transferencia bancaria
- Efectivo en puntos de pago

#### **4. Stripe - Solución Internacional**

**Características:**
- **Tipo**: Tarjetas internacionales
- **Comisión**: ~3.6% + $30 CLP
- **Tiempo de Procesamiento**: Inmediato
- **Ideal Para**: Tarjetas extranjeras

**Ventajas:**
- Aceptación global de tarjetas
- Tecnología de punta
- Máxima seguridad
- Soporte para múltiples monedas

**Casos de Uso:**
- Apoderados con tarjetas extranjeras
- Pagos desde el exterior
- Transacciones en otras monedas
- Backup para otros métodos

### Recomendación Inteligente

#### **Algoritmo de Recomendación**

El sistema analiza múltiples factores para recomendar la pasarela más económica:

**Factores Considerados:**
1. **Monto de la Transacción**: Comisiones fijas vs porcentuales
2. **Ubicación del Usuario**: Pasarelas locales vs internacionales
3. **Tipo de Tarjeta**: Nacional vs internacional
4. **Historial del Usuario**: Métodos utilizados anteriormente
5. **Disponibilidad**: Estado de las pasarelas en tiempo real

**Ejemplo de Recomendación:**

```
💰 Pago de $50.000 CLP

🥇 RECOMENDADO: Transbank
   Costo total: $51.630 CLP
   Ahorro vs Stripe: $370 CLP

🥈 MercadoPago: $51.775 CLP
🥉 Stripe: $52.000 CLP
💸 BancoEstado: $50.500 CLP*
   *Procesamiento en 1-2 días
```

#### **Comparación Visual de Costos**

**Tabla Comparativa Automática:**

| Pasarela | Comisión | Costo Total | Tiempo | Ahorro |
|----------|----------|-------------|---------|---------|
| 🏆 Transbank | 3.2% + $30 | $51.630 | Inmediato | - |
| MercadoPago | 3.5% + $25 | $51.775 | Inmediato | -$145 |
| Stripe | 3.6% + $30 | $52.000 | Inmediato | -$370 |
| BancoEstado | 1.0% | $50.500 | 1-2 días | +$1.130 |

### Proceso de Pago Detallado

#### **Fase 1: Preparación del Pago**

**Selección de Cuotas:**
1. Acceda a "Deudas Pendientes"
2. Revise la lista completa de cuotas
3. Seleccione las cuotas a pagar usando checkboxes
4. Verifique el total calculado automáticamente

**Validaciones Automáticas:**
- Verificación de montos
- Validación de fechas de vencimiento
- Confirmación de datos del estudiante
- Verificación de disponibilidad de pasarelas

#### **Fase 2: Selección de Método de Pago**

**Pantalla de Selección:**
- Vista de las 4 pasarelas disponibles
- Información detallada de cada una
- Recomendación destacada con estrella dorada
- Comparación de costos en tiempo real

**Información por Pasarela:**
```
┌─────────────────────────────────────────┐
│ 🏆 RECOMENDADO                          │
│ 🏦 Transbank                            │
│ Tarjetas chilenas • Inmediato          │
│ Comisión: 3.2% + $30 CLP               │
│ Total: $51.630 CLP                     │
│ Ahorro: $370 vs Stripe                 │
└─────────────────────────────────────────┘
```

#### **Fase 3: Confirmación y Procesamiento**

**Resumen de Transacción:**
- Lista de cuotas seleccionadas
- Método de pago elegido
- Desglose de costos
- Total final a pagar

**Términos y Condiciones:**
- Políticas de reembolso
- Términos de la pasarela
- Condiciones del colegio
- Checkbox de aceptación obligatorio

**Procesamiento Seguro:**
- Redirección a pasarela segura
- Encriptación end-to-end
- Tokenización de datos sensibles
- Confirmación automática

#### **Fase 4: Confirmación y Seguimiento**

**Confirmación Inmediata:**
- Pantalla de éxito con detalles
- ID de transacción único
- Comprobante descargable
- Actualización automática de deudas

**Notificaciones:**
- Email de confirmación automático
- SMS opcional (si configurado)
- Notificación en el portal
- Actualización en tiempo real

### Gestión de Errores y Problemas

#### **Tipos de Errores Comunes**

**Errores de Tarjeta:**
- Fondos insuficientes
- Tarjeta vencida
- Datos incorrectos
- Bloqueo por seguridad

**Errores de Conexión:**
- Problemas de red
- Timeout de pasarela
- Mantenimiento programado
- Sobrecarga del sistema

**Errores de Validación:**
- Datos incompletos
- Montos incorrectos
- Cuotas ya pagadas
- Problemas de sesión

#### **Resolución Automática**

**Reintentos Inteligentes:**
- Reintento automático en errores temporales
- Sugerencia de pasarela alternativa
- Guardado de datos para reintento
- Notificación de estado

**Soporte Integrado:**
- Chat de ayuda en tiempo real
- Formulario de reporte de problemas
- Contacto directo con soporte
- Base de conocimientos

### Seguridad y Cumplimiento

#### **Estándares de Seguridad**

**Certificaciones:**
- **PCI DSS Level 1**: Máximo nivel de seguridad
- **SSL/TLS**: Encriptación de comunicaciones
- **3D Secure**: Autenticación adicional
- **Tokenización**: Protección de datos sensibles

**Medidas de Protección:**
- Detección de fraude en tiempo real
- Monitoreo 24/7 de transacciones
- Alertas de actividad sospechosa
- Backup automático de datos

#### **Privacidad de Datos**

**Política de Datos:**
- No almacenamiento de datos de tarjetas
- Encriptación de información personal
- Acceso restringido por roles
- Auditoría completa de accesos

**Cumplimiento Legal:**
- Ley de Protección de Datos Personales
- Normativas bancarias chilenas
- Estándares internacionales
- Auditorías periódicas

### Reportes y Análisis de Pagos

#### **Dashboard de Pagos**

**Métricas Principales:**
- Total procesado por pasarela
- Comisiones pagadas por método
- Ahorro generado por recomendaciones
- Tasa de éxito por pasarela

**Análisis de Tendencias:**
- Métodos más utilizados
- Horarios de mayor actividad
- Patrones de pago por familia
- Efectividad de recomendaciones

#### **Reportes Detallados**

**Reporte de Comisiones:**
- Desglose por pasarela
- Comparación de costos
- Ahorro total generado
- Proyecciones futuras

**Reporte de Transacciones:**
- Lista completa de pagos
- Estados de transacciones
- Análisis de errores
- Tiempos de procesamiento

---


## 6. Gestión de Datos

### Importación y Exportación

#### **Importación Masiva de Datos**

**Formatos Soportados:**
- CSV (Comma Separated Values)
- Excel (.xlsx, .xls)
- Texto delimitado
- JSON (para integraciones)

**Tipos de Datos Importables:**

**Alumnos:**
```csv
nombre,apellido,rut,fecha_nacimiento,curso,apoderado_email
Juan,Pérez,12345678-9,2010-05-15,3°A,juan.padre@email.com
María,González,98765432-1,2011-03-22,2°B,maria.madre@email.com
```

**Cobros Masivos:**
```csv
nombre_cobro,descripcion,monto,fecha_vencimiento,cursos_aplicables
Mensualidad Abril,Cuota mensual abril 2024,45000,2024-04-05,"3°A,3°B,4°A"
Material Didáctico,Libros y útiles,25000,2024-03-15,TODOS
```

#### **Proceso de Importación**

**Paso 1: Preparación del Archivo**
1. Descargue la plantilla correspondiente
2. Complete los datos siguiendo el formato
3. Valide la información antes de importar
4. Guarde en formato compatible

**Paso 2: Carga del Archivo**
1. Acceda a "Herramientas" → "Importar Datos"
2. Seleccione el tipo de datos a importar
3. Cargue el archivo desde su computador
4. Revise la vista previa de datos

**Paso 3: Validación y Confirmación**
1. El sistema valida automáticamente los datos
2. Se muestran errores y advertencias
3. Corrija los problemas identificados
4. Confirme la importación

#### **Exportación de Datos**

**Formatos de Exportación:**
- CSV para análisis en Excel
- PDF para reportes formales
- JSON para integraciones
- XML para sistemas externos

**Datos Exportables:**
- Lista completa de alumnos
- Historial de pagos
- Deudas pendientes
- Reportes financieros
- Estadísticas de uso

### Backup y Recuperación

#### **Respaldos Automáticos**

**Frecuencia:**
- Backup diario de datos críticos
- Backup semanal completo
- Backup mensual archivado
- Backup en tiempo real de transacciones

**Contenido del Backup:**
- Base de datos completa
- Archivos adjuntos
- Configuraciones del sistema
- Logs de auditoría

#### **Recuperación de Datos**

**Niveles de Recuperación:**
- Recuperación de registros individuales
- Restauración de módulos específicos
- Recuperación completa del sistema
- Recuperación de punto en el tiempo

**Proceso de Recuperación:**
1. Identificación del problema
2. Selección del punto de restauración
3. Validación de integridad
4. Restauración controlada
5. Verificación post-recuperación

---

## 7. Reportes y Análisis

### Reportes Financieros

#### **Estado de Resultados**

**Información Incluida:**
- Ingresos por concepto
- Gastos por categoría
- Utilidad/pérdida del período
- Comparación con períodos anteriores

**Filtros Disponibles:**
- Rango de fechas personalizable
- Por curso o nivel
- Por tipo de ingreso/gasto
- Comparación anual

#### **Reporte de Cobranzas**

**Métricas Principales:**
- Tasa de cobranza efectiva
- Tiempo promedio de pago
- Deudas por antigüedad
- Ranking de cursos por cumplimiento

**Análisis de Morosidad:**
- Deudas vencidas por período
- Tendencias de morosidad
- Efectividad de gestión de cobranza
- Proyecciones de recuperación

### Reportes Académicos

#### **Matrícula y Asistencia**

**Estadísticas de Matrícula:**
- Evolución mensual de matrícula
- Ingresos y retiros por período
- Distribución por curso y nivel
- Proyecciones de crecimiento

**Análisis de Asistencia:**
- Porcentaje de asistencia por curso
- Tendencias mensuales
- Identificación de patrones
- Alertas de ausentismo

#### **Reportes Personalizados**

**Constructor de Reportes:**
- Interfaz drag-and-drop
- Selección de campos personalizada
- Filtros avanzados
- Múltiples formatos de salida

**Programación de Reportes:**
- Envío automático por email
- Frecuencia configurable
- Destinatarios múltiples
- Formatos personalizables

---

## 8. Configuración y Administración

### Configuración General

#### **Información de la Institución**

**Datos Básicos:**
- Nombre oficial del establecimiento
- RUT y datos legales
- Dirección y contacto
- Logo y elementos visuales

**Configuración Académica:**
- Períodos académicos
- Estructura de cursos
- Calendario escolar
- Horarios de funcionamiento

#### **Configuración de Usuarios**

**Gestión de Roles:**
- Definición de permisos por rol
- Asignación de funcionalidades
- Restricciones de acceso
- Auditoría de permisos

**Políticas de Seguridad:**
- Complejidad de contraseñas
- Tiempo de expiración de sesiones
- Intentos de login permitidos
- Notificaciones de seguridad

### Configuración de Pagos

#### **Pasarelas de Pago**

**Configuración por Pasarela:**

**Stripe:**
```
- Clave pública (pk_live_...)
- Clave secreta (sk_live_...)
- Webhook endpoint
- Monedas aceptadas
```

**Transbank:**
```
- Código de comercio
- Clave secreta
- Ambiente (producción/test)
- Certificados SSL
```

**MercadoPago:**
```
- Access Token
- Public Key
- Client ID
- Webhook URL
```

**BancoEstado:**
```
- Código de convenio
- Usuario de servicio
- Clave de acceso
- Cuenta de destino
```

#### **Políticas de Pago**

**Configuración de Comisiones:**
- Porcentaje por pasarela
- Comisiones fijas
- Descuentos por volumen
- Políticas de reembolso

**Límites y Restricciones:**
- Monto mínimo por transacción
- Monto máximo diario
- Límites por usuario
- Restricciones geográficas

---

## 9. Solución de Problemas

### Problemas Comunes

#### **Problemas de Acceso**

**No puedo iniciar sesión:**
1. Verifique que esté usando la pestaña correcta (Admin/Apoderado)
2. Confirme que su email esté escrito correctamente
3. Intente recuperar su contraseña
4. Contacte al administrador del sistema

**La página no carga:**
1. Verifique su conexión a internet
2. Actualice la página (F5 o Ctrl+R)
3. Limpie el caché del navegador
4. Intente con otro navegador

#### **Problemas de Pago**

**El pago fue rechazado:**
1. Verifique los datos de su tarjeta
2. Confirme que tenga fondos suficientes
3. Contacte a su banco para verificar bloqueos
4. Intente con otra pasarela de pago

**No veo mi pago reflejado:**
1. Los pagos pueden tardar hasta 24 horas en reflejarse
2. Verifique el ID de transacción en su email
3. Contacte al área financiera del colegio
4. Revise el historial de pagos en el portal

#### **Problemas de Datos**

**No veo a mi hijo en la lista:**
1. Verifique que esté logueado con el email correcto
2. Confirme que su hijo esté matriculado
3. Contacte a secretaría para verificar la asociación
4. Solicite actualización de datos

### Contacto y Soporte

#### **Canales de Soporte**

**Soporte Técnico:**
- Email: soporte@colegio.com
- Teléfono: +56 2 1234 5678
- Chat en línea: Disponible en horario escolar
- Formulario web: Disponible 24/7

**Soporte Financiero:**
- Email: finanzas@colegio.com
- Teléfono: +56 2 1234 5679
- Horario: Lunes a viernes 8:00-17:00
- Presencial: Oficina de finanzas

#### **Información para Soporte**

**Datos a Proporcionar:**
- Nombre completo del apoderado
- Email registrado en el sistema
- Nombre del/los hijo(s)
- Descripción detallada del problema
- Capturas de pantalla (si aplica)
- ID de transacción (para problemas de pago)

---

## 10. Preguntas Frecuentes

### Generales

**¿Cómo obtengo mis credenciales de acceso?**
Las credenciales son proporcionadas por el colegio al momento de la matrícula. Si no las ha recibido, contacte a secretaría.

**¿Puedo cambiar mi contraseña?**
Sí, puede cambiar su contraseña desde el perfil de usuario o usando la opción "Olvidé mi contraseña" en el login.

**¿El sistema está disponible 24/7?**
Sí, el portal está disponible las 24 horas. Ocasionalmente puede haber mantenimientos programados que se notifican con anticipación.

### Pagos

**¿Qué métodos de pago están disponibles?**
El sistema acepta pagos a través de 4 pasarelas: Stripe, Transbank, MercadoPago y BancoEstado, cada una con diferentes opciones de pago.

**¿Cuál es la pasarela más económica?**
El sistema recomienda automáticamente la pasarela más económica para cada transacción. Generalmente, BancoEstado es la más económica para montos grandes, y Transbank para pagos inmediatos.

**¿Puedo pagar múltiples cuotas a la vez?**
Sí, puede seleccionar múltiples cuotas y pagarlas en una sola transacción, lo que puede resultar en ahorros adicionales.

**¿Cuánto tiempo tarda en reflejarse mi pago?**
Los pagos con tarjeta se reflejan inmediatamente. Las transferencias bancarias pueden tardar 1-2 días hábiles.

**¿Puedo obtener un comprobante de pago?**
Sí, todos los pagos generan un comprobante automático que se envía por email y está disponible en el historial del portal.

### Seguridad

**¿Es seguro ingresar los datos de mi tarjeta?**
Sí, el sistema cumple con los más altos estándares de seguridad (PCI DSS Level 1) y no almacena datos sensibles de tarjetas.

**¿Qué hago si sospecho un uso no autorizado?**
Contacte inmediatamente al soporte técnico y cambie su contraseña. También notifique a su banco si involucra transacciones.

### Técnicas

**¿Qué navegadores son compatibles?**
El sistema es compatible con Chrome, Firefox, Safari y Edge en sus versiones más recientes.

**¿Puedo usar el sistema desde mi teléfono?**
Sí, el sistema está optimizado para dispositivos móviles y tablets.

**¿Qué hago si encuentro un error en el sistema?**
Reporte cualquier error a través del formulario de contacto o email de soporte, incluyendo capturas de pantalla si es posible.

---

## Conclusión

El Sistema de Gestión Escolar v4.1.0 representa una solución integral y moderna para la administración educativa, combinando potentes herramientas administrativas con un portal intuitivo para apoderados y un sistema de pagos unificado que garantiza el menor costo posible.

### Beneficios Clave

**Para la Institución:**
- Reducción significativa de costos operativos
- Automatización de procesos manuales
- Mejor control financiero y académico
- Reportes y análisis avanzados

**Para los Apoderados:**
- Acceso 24/7 a información de sus hijos
- Múltiples opciones de pago con recomendación inteligente
- Transparencia total en costos y transacciones
- Historial completo y exportable

**Para el Ecosistema Educativo:**
- Mayor eficiencia en la gestión
- Mejor comunicación entre todas las partes
- Reducción de errores y tiempos de procesamiento
- Escalabilidad para el crecimiento futuro

### Soporte Continuo

El sistema incluye soporte técnico continuo, actualizaciones regulares y mejoras basadas en el feedback de usuarios. Nuestro compromiso es mantener la plataforma actualizada con las últimas tecnologías y mejores prácticas de la industria.

Para cualquier consulta adicional o soporte técnico, no dude en contactar a nuestro equipo de soporte a través de los canales establecidos.

---

**Sistema de Gestión Escolar v4.1.0**  
*Manual de Usuario Completo*  
*Última actualización: Agosto 2024*

