# 👥 Manual de Usuario - Frontend Sistema de Gestión Escolar v8.6.0

## 📋 **Índice**

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Interfaz de Usuario](#interfaz-de-usuario)
4. [Navegación](#navegación)
5. [Funcionalidades por Rol](#funcionalidades-por-rol)
6. [Dashboard y Reportes](#dashboard-y-reportes)
7. [Gestión de Datos](#gestión-de-datos)
8. [Configuración Personal](#configuración-personal)
9. [Resolución de Problemas](#resolución-de-problemas)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 **Introducción**

El Frontend del Sistema de Gestión Escolar v8.6.0 es una aplicación web moderna desarrollada con React y Tailwind CSS que proporciona una interfaz intuitiva y responsiva para la gestión integral de instituciones educativas.

### **Características Principales**

✅ **Interfaz Moderna:** Diseño limpio y profesional con nueva paleta de colores  
✅ **Responsivo:** Funciona perfectamente en desktop, tablet y móvil  
✅ **Tiempo Real:** Actualizaciones instantáneas de datos  
✅ **Accesible:** Cumple estándares de accesibilidad web  
✅ **Rápido:** Optimizado para rendimiento y velocidad  
✅ **Seguro:** Autenticación robusta y protección de datos  

### **Nueva Paleta de Colores v8.6.0**

🔵 **Azul Primary (#1E3A8A):** Fondos principales, encabezados y navegación  
⚪ **Blanco Secondary (#FFFFFF):** Fondo general y contraste  
🟢 **Verde Success (#10B981):** Botones de confirmación y mensajes de éxito  
🟠 **Naranja Action (#F97316):** Llamados a la acción y botones importantes  
🟣 **Púrpura Accent (#8B5CF6):** Detalles visuales y elementos de innovación  

### **Tecnologías Utilizadas**

- **React 18:** Framework principal
- **Tailwind CSS v4:** Estilos y diseño
- **Vite:** Herramienta de desarrollo
- **Recharts:** Gráficos y visualizaciones
- **Framer Motion:** Animaciones
- **Radix UI:** Componentes accesibles

---

## 🚀 **Acceso al Sistema**

### **URL de Acceso**

**Desarrollo:** http://localhost:3002  
**Producción:** [URL proporcionada por el administrador]

### **Requisitos del Sistema**

**Navegadores Compatibles:**
- Chrome 90+ (Recomendado)
- Firefox 88+
- Safari 14+
- Edge 90+

**Dispositivos:**
- Desktop: Windows, macOS, Linux
- Tablet: iPad, Android tablets
- Móvil: iOS 14+, Android 8+

**Conexión:**
- Internet estable
- Velocidad mínima: 1 Mbps

### **Proceso de Login**

1. **Acceder a la URL**
   - Abra su navegador web
   - Vaya a la URL del sistema
   - Verá la pantalla de inicio de sesión

2. **Ingresar Credenciales**
   - **RUT:** Su RUT chileno (con o sin formato)
   - **Contraseña:** Su contraseña personal

3. **Iniciar Sesión**
   - Haga clic en "Iniciar Sesión"
   - El sistema validará sus credenciales
   - Será redirigido al dashboard correspondiente

### **Credenciales Demo (Para Pruebas)**

#### **👨‍💼 Administrador**
- **RUT:** `11.111.111-1`
- **Contraseña:** `admin123`
- **Acceso:** Completo al sistema

#### **👨‍👩‍👧‍👦 Apoderado con 3 Hijos**
- **RUT:** `12.345.678-5`
- **Contraseña:** `demo123`
- **Hijos:** Sofía, Diego, Valentina

#### **💰 Tesorero**
- **RUT:** `33.333.333-3`
- **Contraseña:** `tesoro123`
- **Acceso:** Gestión financiera

---

## 🎨 **Interfaz de Usuario**

### **Diseño General**

La interfaz está diseñada con principios de usabilidad moderna:

**Header (Barra Superior):**
- Logo del sistema
- Navegación principal
- Notificaciones
- Perfil de usuario

**Sidebar (Barra Lateral):**
- Menú de navegación
- Accesos rápidos
- Estado del sistema

**Área Principal:**
- Contenido dinámico
- Dashboards
- Formularios
- Tablas de datos

**Footer (Pie de Página):**
- Información del sistema
- Enlaces útiles
- Estado de conexión

### **Elementos de la Interfaz**

#### **Botones**
- **Primarios (Azul):** Acciones principales
- **Secundarios (Blanco):** Acciones secundarias
- **Éxito (Verde):** Confirmaciones y guardado
- **Acción (Naranja):** CTAs importantes
- **Accent (Púrpura):** Funciones especiales

#### **Tarjetas (Cards)**
- Contenedores de información
- Bordes redondeados
- Sombras sutiles
- Hover effects

#### **Formularios**
- Campos claramente etiquetados
- Validación en tiempo real
- Mensajes de error descriptivos
- Autocompletado inteligente

#### **Tablas**
- Ordenamiento por columnas
- Filtros avanzados
- Paginación
- Acciones por fila

### **Responsive Design**

#### **Desktop (1200px+)**
- Sidebar completo visible
- Múltiples columnas
- Gráficos expandidos
- Tooltips detallados

#### **Tablet (768px - 1199px)**
- Sidebar colapsable
- Dos columnas
- Gráficos adaptados
- Touch-friendly

#### **Móvil (< 768px)**
- Menú hamburguesa
- Una columna
- Gráficos simplificados
- Gestos táctiles

---

## 🧭 **Navegación**

### **Menú Principal**

#### **🏠 Dashboard**
- Resumen general
- Métricas clave
- Gráficos principales
- Accesos rápidos

#### **👥 Gestión de Usuarios**
- Alumnos
- Apoderados
- Profesores
- Administradores

#### **📚 Gestión Académica**
- Cursos
- Niveles educativos
- Asignaciones
- Reportes académicos

#### **💰 Gestión Financiera**
- Cuotas y pagos
- Deudas pendientes
- Movimientos
- Reportes financieros

#### **📊 Reportes**
- Dashboards ejecutivos
- Reportes personalizados
- Exportaciones
- Análisis

#### **⚙️ Configuración**
- Perfil personal
- Preferencias
- Configuración del sistema
- Ayuda

### **Navegación por Breadcrumbs**

El sistema muestra la ruta actual:
```
Inicio > Gestión Financiera > Cuotas > Nueva Cuota
```

### **Accesos Rápidos**

- **Búsqueda Global:** Ctrl/Cmd + K
- **Nuevo Registro:** Ctrl/Cmd + N
- **Guardar:** Ctrl/Cmd + S
- **Ayuda:** F1

---

## 👥 **Funcionalidades por Rol**

### **👨‍💼 Administrador**

#### **Dashboard Ejecutivo**
- **Métricas Generales:**
  - Total de alumnos matriculados
  - Ingresos del mes actual
  - Porcentaje de morosidad
  - Usuarios activos del sistema

- **Gráficos Principales:**
  - Tendencias mensuales de ingresos/gastos
  - Distribución de alumnos por curso
  - Balance financiero
  - Estadísticas de uso del sistema

#### **Gestión Completa**
- **Usuarios:** Crear, editar, eliminar usuarios
- **Cursos:** Administrar estructura académica
- **Finanzas:** Supervisar estado financiero
- **Reportes:** Acceso a todos los reportes
- **Configuración:** Ajustes del sistema

### **👨‍👩‍👧‍👦 Apoderado**

#### **Dashboard Personal**
- **Información de Hijos:**
  - Lista de alumnos a cargo
  - Estado académico actual
  - Próximas actividades

- **Estado Financiero:**
  - Cuotas pendientes
  - Historial de pagos
  - Próximos vencimientos

#### **Funcionalidades Disponibles**
- **Ver Información:** Datos de sus hijos
- **Consultar Pagos:** Estado de cuotas
- **Historial:** Pagos realizados
- **Actualizar Datos:** Información personal

### **💰 Tesorero**

#### **Dashboard Financiero**
- **Resumen del Día:**
  - Pagos recibidos
  - Cuotas vencidas
  - Monto total recaudado

- **Indicadores Clave:**
  - Tasa de cobranza
  - Morosidad por curso
  - Proyección mensual

#### **Herramientas de Trabajo**
- **Gestión de Cuotas:** Crear y administrar
- **Registro de Pagos:** Procesar pagos
- **Control de Deudas:** Seguimiento
- **Reportes:** Financieros detallados

### **👩‍🏫 Profesor**

#### **Dashboard del Curso**
- **Mi Curso:**
  - Lista de alumnos
  - Estado de pagos
  - Información de contacto

- **Herramientas:**
  - Reportes del curso
  - Comunicación con apoderados
  - Gestión de información académica

---

## 📊 **Dashboard y Reportes**

### **Tipos de Gráficos**

#### **📈 Gráficos de Líneas**
- **Uso:** Tendencias temporales
- **Ejemplo:** Evolución de ingresos mensuales
- **Colores:** Azul primary, verde success

#### **📊 Gráficos de Barras**
- **Uso:** Comparaciones entre categorías
- **Ejemplo:** Alumnos por curso
- **Colores:** Azul primary, naranja action

#### **🥧 Gráficos de Torta**
- **Uso:** Distribuciones porcentuales
- **Ejemplo:** Categorías de gastos
- **Colores:** Paleta completa sin rojo

#### **📉 Gráficos de Área**
- **Uso:** Volúmenes acumulados
- **Ejemplo:** Ingresos vs gastos
- **Colores:** Verde success, naranja action

### **Interactividad**

#### **Tooltips Informativos**
- Hover sobre elementos
- Información detallada
- Valores exactos
- Contexto adicional

#### **Filtros Dinámicos**
- Por fecha
- Por curso
- Por categoría
- Por estado

#### **Zoom y Pan**
- Acercar/alejar gráficos
- Navegar por períodos
- Seleccionar rangos
- Resetear vista

### **Exportación**

#### **Formatos Disponibles**
- **PDF:** Para presentaciones
- **Excel:** Para análisis
- **PNG:** Para documentos
- **CSV:** Para datos

#### **Opciones de Exportación**
- Gráfico individual
- Dashboard completo
- Datos subyacentes
- Reportes programados

---

## 📝 **Gestión de Datos**

### **Formularios Inteligentes**

#### **Validación en Tiempo Real**
- **RUT Chileno:** Formato y dígito verificador
- **Email:** Formato válido
- **Teléfono:** Formato chileno
- **Fechas:** Rangos válidos

#### **Autocompletado**
- **Direcciones:** Integración CUT 2018
- **Personas:** Búsqueda por RUT/nombre
- **Cursos:** Selección inteligente
- **Categorías:** Sugerencias contextuales

#### **Campos Inteligentes**
- **RUT:** Formato automático (XX.XXX.XXX-X)
- **Montos:** Separadores de miles
- **Fechas:** Calendario visual
- **Selecciones:** Búsqueda y filtrado

### **Tablas Avanzadas**

#### **Funcionalidades**
- **Ordenamiento:** Por cualquier columna
- **Filtrado:** Múltiples criterios
- **Búsqueda:** Global y por columna
- **Paginación:** Configurable

#### **Acciones Masivas**
- Selección múltiple
- Operaciones en lote
- Exportación filtrada
- Actualización masiva

#### **Personalización**
- Columnas visibles
- Orden de columnas
- Tamaño de página
- Filtros guardados

### **Carga de Archivos**

#### **Formatos Soportados**
- **Excel:** .xlsx, .xls
- **CSV:** Separado por comas
- **Imágenes:** .jpg, .png, .gif
- **Documentos:** .pdf

#### **Validación de Archivos**
- Tamaño máximo
- Formato correcto
- Estructura de datos
- Contenido válido

---

## ⚙️ **Configuración Personal**

### **Perfil de Usuario**

#### **Información Personal**
- Nombre completo
- RUT
- Email de contacto
- Teléfono
- Dirección completa

#### **Configuración de Cuenta**
- Cambio de contraseña
- Configuración de notificaciones
- Preferencias de idioma
- Zona horaria

### **Preferencias de Interfaz**

#### **Tema Visual**
- Modo claro/oscuro
- Tamaño de fuente
- Densidad de información
- Animaciones

#### **Dashboard Personal**
- Widgets visibles
- Orden de elementos
- Métricas favoritas
- Accesos rápidos

### **Notificaciones**

#### **Tipos de Notificaciones**
- **Email:** Resúmenes y alertas
- **Push:** Notificaciones inmediatas
- **In-App:** Dentro del sistema
- **SMS:** Urgentes (opcional)

#### **Configuración**
- Frecuencia de envío
- Tipos de eventos
- Horarios permitidos
- Canales preferidos

---

## 🔧 **Resolución de Problemas**

### **Problemas Comunes**

#### **No Puedo Iniciar Sesión**

**Síntomas:**
- "Usuario no encontrado"
- "Contraseña incorrecta"
- Página no carga

**Soluciones:**
1. **Verificar Credenciales:**
   - RUT correcto (con o sin formato)
   - Contraseña exacta (mayúsculas/minúsculas)
   - Usar credenciales demo si es necesario

2. **Limpiar Cache:**
   - Ctrl+Shift+Delete
   - Eliminar cookies y cache
   - Reiniciar navegador

3. **Verificar Conexión:**
   - Internet estable
   - URL correcta
   - Firewall/antivirus

#### **La Página Se Ve Mal**

**Síntomas:**
- Elementos desalineados
- Colores incorrectos
- Texto cortado

**Soluciones:**
1. **Actualizar Navegador:**
   - Versión más reciente
   - Habilitar JavaScript
   - Deshabilitar extensiones

2. **Ajustar Zoom:**
   - Zoom al 100%
   - Resolución adecuada
   - Modo pantalla completa

#### **Los Datos No Se Cargan**

**Síntomas:**
- Tablas vacías
- Gráficos sin datos
- Mensajes de error

**Soluciones:**
1. **Refrescar Página:**
   - F5 o Ctrl+R
   - Esperar carga completa
   - Verificar conexión

2. **Verificar Permisos:**
   - Rol correcto
   - Acceso autorizado
   - Contactar administrador

### **Problemas de Rendimiento**

#### **El Sistema Está Lento**

**Causas Comunes:**
- Conexión lenta
- Muchas pestañas abiertas
- Cache lleno
- Recursos del sistema

**Soluciones:**
1. **Optimizar Navegador:**
   - Cerrar pestañas innecesarias
   - Limpiar cache
   - Reiniciar navegador

2. **Verificar Conexión:**
   - Velocidad de internet
   - Estabilidad de red
   - Otros dispositivos

#### **Errores de JavaScript**

**Síntomas:**
- Funciones no responden
- Botones no funcionan
- Mensajes de error

**Soluciones:**
1. **Habilitar JavaScript:**
   - Configuración del navegador
   - Permitir scripts
   - Deshabilitar bloqueadores

2. **Modo Incógnito:**
   - Probar en ventana privada
   - Sin extensiones
   - Cache limpio

---

## ❓ **Preguntas Frecuentes**

### **Acceso y Navegación**

**P: ¿Puedo usar el sistema en mi teléfono móvil?**
R: Sí, el sistema es completamente responsivo y funciona perfectamente en dispositivos móviles. Recomendamos usar Chrome o Safari en móviles.

**P: ¿Cómo cambio mi contraseña?**
R: Vaya a su perfil (icono de usuario en la esquina superior derecha) → Configuración → Cambiar Contraseña.

**P: ¿Puedo personalizar mi dashboard?**
R: Sí, puede personalizar widgets, métricas visibles y accesos rápidos desde Configuración → Preferencias de Dashboard.

### **Funcionalidades**

**P: ¿Cómo exporto un reporte?**
R: En cualquier gráfico o tabla, busque el botón "Exportar" (icono de descarga). Seleccione el formato deseado (PDF, Excel, PNG).

**P: ¿Los datos se actualizan en tiempo real?**
R: Sí, la mayoría de los datos se actualizan automáticamente. Algunos reportes complejos pueden requerir refrescar la página.

**P: ¿Puedo ver información de otros cursos?**
R: Depende de su rol. Los administradores ven todo, los profesores solo su curso, y los apoderados solo sus hijos.

### **Problemas Técnicos**

**P: ¿Qué hago si encuentro un error?**
R: Tome una captura de pantalla del error, anote qué estaba haciendo, y contacte al administrador del sistema con esta información.

**P: ¿El sistema funciona sin internet?**
R: No, el sistema requiere conexión a internet para funcionar. Los datos se almacenan en la nube de forma segura.

**P: ¿Mis datos están seguros?**
R: Sí, el sistema usa encriptación avanzada y cumple con estándares de seguridad. Solo usuarios autorizados pueden acceder a la información.

### **Soporte**

**P: ¿Dónde encuentro ayuda adicional?**
R: Presione F1 en cualquier momento para acceder a la ayuda contextual, o contacte al administrador del sistema.

**P: ¿Hay tutoriales disponibles?**
R: Sí, en el menú Ayuda encontrará tutoriales interactivos y videos explicativos para cada funcionalidad.

**P: ¿Puedo sugerir mejoras?**
R: ¡Por supuesto! Use el formulario de feedback en Configuración → Enviar Sugerencia.

---

## 📞 **Información de Contacto**

### **Soporte Técnico**
- **Sistema:** http://localhost:3002
- **Backend:** http://localhost:3001
- **Estado:** http://localhost:3001/health

### **Recursos Adicionales**
- **Manual del Desarrollador:** `docs/MANUAL_DESARROLLADOR_FRONTEND_v8.6.0.md`
- **Documentación Técnica:** Carpeta `docs/`
- **Código Fuente:** Carpeta `src/`

---

## 📝 **Notas de Versión v8.6.0**

### **Nuevas Funcionalidades**
✅ **Nueva paleta de colores semántica**  
✅ **Gráficos sin color rojo**  
✅ **Integración completa con backend v8.6.0**  
✅ **Interfaz optimizada para 2025**  
✅ **Mejoras de accesibilidad**  
✅ **Rendimiento optimizado**  

### **Mejoras de Diseño**
✅ **Colores más profesionales y accesibles**  
✅ **Consistencia visual mejorada**  
✅ **Animaciones más fluidas**  
✅ **Responsive design perfeccionado**  

### **Optimizaciones Técnicas**
✅ **Carga más rápida**  
✅ **Menor uso de memoria**  
✅ **Mejor compatibilidad con navegadores**  
✅ **Código más mantenible**  

---

**¡Gracias por usar el Sistema de Gestión Escolar v8.6.0!**

Este manual le proporciona toda la información necesaria para usar efectivamente la interfaz del sistema. Para preguntas adicionales o soporte técnico, no dude en contactar al administrador del sistema.

**¡Que tenga una excelente experiencia usando nuestro sistema! 🎓**

