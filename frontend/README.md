# 🎓 Sistema de Gestión Escolar - Frontend v8.6.0

## 📋 **Descripción**

Frontend moderno del Sistema de Gestión Escolar desarrollado con React 18 y Tailwind CSS v4. Proporciona una interfaz intuitiva y responsiva para la gestión integral de instituciones educativas.

## ✨ **Características Principales**

### 🎨 **Nueva Paleta de Colores v8.6.0**
- 🔵 **Azul Primary (#1E3A8A):** Fondos principales y navegación
- ⚪ **Blanco Secondary (#FFFFFF):** Fondo general y contraste  
- 🟢 **Verde Success (#10B981):** Confirmaciones y mensajes de éxito
- 🟠 **Naranja Action (#F97316):** Llamados a la acción (reemplaza rojo)
- 🟣 **Púrpura Accent (#8B5CF6):** Detalles visuales e innovación

### 🚀 **Tecnologías**
- **React 18** - Framework principal con hooks y concurrent features
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite** - Build tool ultrarrápido
- **Recharts** - Gráficos y visualizaciones (sin color rojo)
- **Framer Motion** - Animaciones fluidas
- **Radix UI** - Componentes accesibles

### 📱 **Responsive Design**
- **Mobile-First** - Diseñado desde móvil hacia desktop
- **Touch-Friendly** - Optimizado para dispositivos táctiles
- **Cross-Browser** - Compatible con navegadores modernos

## 🚀 **Inicio Rápido**

### **Requisitos Previos**
```bash
node --version  # v18.0.0 o superior
npm --version   # v8.0.0 o superior
```

### **Instalación**
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

### **Acceso**
- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:3001 (debe estar corriendo)

## 🔐 **Credenciales Demo**

### **👨‍💼 Administrador**
- **RUT:** `11.111.111-1`
- **Contraseña:** `admin123`

### **👨‍👩‍👧‍👦 Apoderado con 3 Hijos**
- **RUT:** `12.345.678-5`
- **Contraseña:** `demo123`

### **💰 Tesorero**
- **RUT:** `33.333.333-3`
- **Contraseña:** `tesoro123`

## 📁 **Estructura del Proyecto**

```
src/
├── api/                    # Servicios de API
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── forms/            # Componentes de formularios
│   └── charts/           # Componentes de gráficos
├── features/             # Funcionalidades por dominio
│   ├── auth/            # Autenticación
│   ├── dashboard/       # Dashboard principal
│   ├── alumnos/         # Gestión de alumnos
│   └── finanzas/        # Gestión financiera
├── hooks/               # Custom hooks
├── pages/               # Componentes de página
├── routes/              # Configuración de rutas
├── config/              # Configuración de la app
└── utils/               # Funciones utilitarias
```

## 🛠️ **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run dev:host     # Accesible desde red local

# Build
npm run build        # Build de producción
npm run preview      # Preview del build

# Calidad de código
npm run lint         # ESLint
npm run lint:fix     # ESLint con auto-fix
npm run format       # Prettier

# Testing
npm run test         # Jest tests
npm run test:watch   # Jest en modo watch
npm run test:coverage # Coverage report
```

## 🎨 **Sistema de Diseño**

### **Componentes Base**
```jsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Uso con nueva paleta semántica
<Button variant="primary">Botón Principal</Button>
<Button variant="success">Confirmar</Button>
<Button variant="action">Llamada a la Acción</Button>
```

### **Gráficos sin Rojo**
```jsx
import { BarChart, LineChart, PieChart } from 'recharts';

// Configuración con nueva paleta
const chartColors = {
  primary: '#1E3A8A',    // Azul
  success: '#10B981',    // Verde
  action: '#F97316',     // Naranja (reemplaza rojo)
  accent: '#8B5CF6',     // Púrpura
};
```

## 🔗 **Integración con Backend**

### **Configuración de API**
```javascript
// src/config/api.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  VERSION: '8.6.0',
};
```

### **Servicios**
```javascript
// src/api/auth.js
import apiClient from './client';

export const authApi = {
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  logout: () => apiClient.post('/api/auth/logout'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
};
```

## 📊 **Funcionalidades por Rol**

### **👨‍💼 Administrador**
- Dashboard ejecutivo completo
- Gestión de usuarios y cursos
- Reportes financieros y académicos
- Configuración del sistema

### **👨‍👩‍👧‍👦 Apoderado**
- Dashboard personal con información de hijos
- Estado de cuotas y pagos
- Historial financiero
- Actualización de datos personales

### **💰 Tesorero**
- Dashboard financiero
- Gestión de cuotas y pagos
- Control de deudas
- Reportes de cobranza

### **👩‍🏫 Profesor**
- Dashboard del curso asignado
- Lista de alumnos
- Reportes académicos
- Comunicación con apoderados

## 🧪 **Testing**

### **Ejecutar Tests**
```bash
npm run test              # Ejecutar todos los tests
npm run test:watch        # Modo watch
npm run test:coverage     # Con coverage
```

### **Estructura de Tests**
```
src/
├── components/
│   └── ui/
│       ├── Button.jsx
│       └── Button.test.jsx
├── hooks/
│   ├── useAuth.js
│   └── useAuth.test.js
└── test/
    ├── setup.js
    └── utils.js
```

## 🚀 **Deployment**

### **Build de Producción**
```bash
# 1. Instalar dependencias
npm ci

# 2. Ejecutar tests
npm run test

# 3. Build
npm run build

# 4. Preview
npm run preview
```

### **Variables de Entorno**
```bash
# .env.production
VITE_API_URL=https://api.tu-colegio.cl
VITE_APP_VERSION=8.6.0
VITE_ENABLE_LOGGING=false
```

## 📱 **Responsive Breakpoints**

```css
/* Mobile First */
sm: 640px    /* Tablet pequeña */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop pequeño */
xl: 1280px   /* Desktop */
2xl: 1536px  /* Desktop grande */
```

## 🎯 **Mejores Prácticas**

### **Componentes**
- Usar TypeScript para props (preparado para migración)
- Implementar PropTypes para validación
- Memoizar componentes costosos con `memo()`
- Usar `useCallback` y `useMemo` apropiadamente

### **Estado**
- Context API para estado global
- useState para estado local
- Custom hooks para lógica reutilizable
- Evitar prop drilling

### **Performance**
- Lazy loading de rutas
- Code splitting por features
- Optimización de imágenes
- Bundle analysis regular

### **Accesibilidad**
- Semantic HTML
- ARIA labels apropiados
- Keyboard navigation
- Color contrast WCAG 2.1

## 🔧 **Troubleshooting**

### **Problemas Comunes**

#### **Build Failures**
```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Verificar Node.js version
node --version
```

#### **Styling Issues**
```bash
# Verificar Tailwind
npx tailwindcss --help

# Regenerar CSS
npm run build
```

#### **API Connection**
```bash
# Verificar backend
curl http://localhost:3001/health

# Verificar variables de entorno
echo $VITE_API_URL
```

## 📚 **Documentación**

- **[Manual de Usuario](docs/MANUAL_USUARIO_FRONTEND_v8.6.0.md)** - Guía completa para usuarios finales
- **[Manual del Desarrollador](docs/MANUAL_DESARROLLADOR_FRONTEND_v8.6.0.md)** - Documentación técnica detallada
- **[Changelog](CHANGELOG.md)** - Historial de cambios
- **[Contributing](CONTRIBUTING.md)** - Guía de contribución

## 🆕 **Novedades v8.6.0**

### **🎨 Nueva Paleta de Colores**
- ✅ Colores más profesionales y accesibles
- ✅ Eliminación completa del color rojo
- ✅ Semántica mejorada (primary, success, action, accent)

### **🔗 Integración Backend**
- ✅ Conexión directa con backend v8.6.0
- ✅ Desactivación de mocks para producción
- ✅ Autenticación JWT funcional

### **📊 Gráficos Mejorados**
- ✅ Paleta coherente en todos los charts
- ✅ Naranja para alertas (reemplaza rojo)
- ✅ Mejor legibilidad y contraste

### **🚀 Performance**
- ✅ Bundle optimizado
- ✅ Lazy loading mejorado
- ✅ Carga más rápida

## 📞 **Soporte**

### **Información del Proyecto**
- **Versión:** 8.6.0
- **Fecha:** Enero 2025
- **Licencia:** MIT

### **Contacto**
- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

---

## 🤝 **Contribución**

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Gracias por usar el Sistema de Gestión Escolar v8.6.0! 🎓✨**

