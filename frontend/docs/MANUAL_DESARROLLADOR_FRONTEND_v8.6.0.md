# 👨‍💻 Manual del Desarrollador - Frontend Sistema de Gestión Escolar v8.6.0

## 📋 **Índice**

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Tecnologías y Dependencias](#tecnologías-y-dependencias)
6. [Sistema de Colores](#sistema-de-colores)
7. [Componentes y Hooks](#componentes-y-hooks)
8. [Gestión de Estado](#gestión-de-estado)
9. [API y Servicios](#api-y-servicios)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Mejores Prácticas](#mejores-prácticas)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 **Introducción**

El Frontend del Sistema de Gestión Escolar v8.6.0 es una aplicación React moderna que proporciona una interfaz de usuario intuitiva y responsiva para la gestión integral de instituciones educativas.

### **Características Técnicas**

✅ **React 18:** Hooks, Concurrent Features, Suspense  
✅ **Tailwind CSS v4:** Utility-first CSS framework  
✅ **Vite:** Build tool y dev server ultrarrápido  
✅ **TypeScript Ready:** Preparado para migración  
✅ **PWA Ready:** Service Workers configurados  
✅ **SEO Optimized:** Meta tags y estructura semántica  

### **Principios de Desarrollo**

- **Component-First:** Arquitectura basada en componentes reutilizables
- **Mobile-First:** Diseño responsivo desde móvil hacia desktop
- **Performance-First:** Optimización de rendimiento en cada decisión
- **Accessibility-First:** Cumplimiento de estándares WCAG 2.1
- **Maintainability:** Código limpio y bien documentado

---

## 🏗️ **Arquitectura del Sistema**

### **Patrón de Arquitectura**

```
┌─────────────────────────────────────────┐
│                Frontend                 │
├─────────────────────────────────────────┤
│  React Components + Tailwind CSS       │
│  ├── Pages (Route Components)          │
│  ├── Features (Domain Logic)           │
│  ├── Components (Reusable UI)          │
│  ├── Hooks (Custom Logic)              │
│  └── Services (API Calls)              │
├─────────────────────────────────────────┤
│              API Layer                  │
│  ├── HTTP Client (Fetch)               │
│  ├── Authentication                    │
│  ├── Error Handling                    │
│  └── Request/Response Interceptors     │
├─────────────────────────────────────────┤
│               Backend                   │
│  Node.js + Express + Sequelize         │
│  http://localhost:3001                  │
└─────────────────────────────────────────┘
```

### **Flujo de Datos**

```
User Interaction → Component → Hook → Service → API → Backend
                                ↓
Component ← State Update ← Response ← HTTP Client ← API Response
```

### **Estructura de Carpetas**

```
src/
├── api/                    # Servicios de API
│   ├── client.js          # Cliente HTTP principal
│   ├── auth.js            # Servicios de autenticación
│   └── endpoints.js       # Definición de endpoints
├── components/            # Componentes reutilizables
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── forms/             # Componentes de formularios
│   ├── charts/            # Componentes de gráficos
│   └── layout/            # Componentes de layout
├── features/              # Funcionalidades por dominio
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── alumnos/           # Gestión de alumnos
│   ├── cursos/            # Gestión de cursos
│   └── finanzas/          # Gestión financiera
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y helpers
├── pages/                 # Componentes de página
├── routes/                # Configuración de rutas
├── config/                # Configuración de la app
├── constants/             # Constantes globales
├── utils/                 # Funciones utilitarias
└── assets/                # Recursos estáticos
```

---

## ⚙️ **Configuración del Entorno**

### **Requisitos Previos**

```bash
# Node.js (versión recomendada)
node --version  # v18.0.0 o superior

# npm (incluido con Node.js)
npm --version   # v8.0.0 o superior

# Git
git --version   # v2.30.0 o superior
```

### **Instalación**

```bash
# 1. Clonar o descomprimir el proyecto
cd frontend-v8.6.0

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
npm run dev
```

### **Variables de Entorno**

```bash
# .env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="Sistema de Gestión Escolar"
VITE_APP_VERSION=8.6.0
VITE_ENABLE_LOGGING=true
VITE_ENABLE_DEBUG=true
```

### **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (puerto 3002)
npm run dev:host     # Servidor accesible desde red local

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

---

## 📁 **Estructura del Proyecto**

### **Componentes UI Base**

```javascript
// src/components/ui/
├── button.jsx           # Botones con variantes
├── card.jsx             # Tarjetas de contenido
├── input.jsx            # Campos de entrada
├── select.jsx           # Selectores
├── table.jsx            # Tablas de datos
├── chart.jsx            # Wrapper para gráficos
├── dialog.jsx           # Modales y diálogos
├── toast.jsx            # Notificaciones
└── ...                  # Más componentes base
```

### **Features (Funcionalidades)**

```javascript
// src/features/auth/
├── components/
│   ├── LoginForm.jsx
│   ├── ProtectedRoute.jsx
│   └── UserProfile.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useLogin.js
│   └── usePermissions.js
├── services/
│   └── authService.js
└── types/
    └── auth.types.js
```

### **Configuración de API**

```javascript
// src/config/api.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  TIMEOUT: 30000,
  VERSION: '8.6.0',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  // ... más endpoints
};
```

---

## 🛠️ **Tecnologías y Dependencias**

### **Dependencias Principales**

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^7.6.1",
  "tailwindcss": "^4.1.7",
  "@tailwindcss/vite": "^4.1.7",
  "framer-motion": "^12.15.0",
  "recharts": "^2.15.3",
  "lucide-react": "^0.510.0",
  "date-fns": "^2.30.0",
  "zod": "^3.24.4"
}
```

### **Dependencias de Desarrollo**

```json
{
  "@vitejs/plugin-react": "^4.4.1",
  "vite": "^6.3.5",
  "eslint": "^9.25.0",
  "prettier": "^3.0.0",
  "jest": "^29.0.0",
  "@testing-library/react": "^14.0.0"
}
```

### **Radix UI Components**

```javascript
// Componentes accesibles y sin estilos
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Tooltip from '@radix-ui/react-tooltip';
// ... más componentes
```

---

## 🎨 **Sistema de Colores**

### **Paleta Semántica v8.6.0**

```css
/* src/App.css */
:root {
  /* 🔵 Azul Primary - Fondos, encabezados, botones secundarios */
  --primary: oklch(0.25 0.15 264);           /* #1E3A8A */
  --primary-foreground: oklch(0.98 0 0);     /* #FFFFFF */
  
  /* ⚪ Blanco Secondary - Fondo general y contraste */
  --secondary: oklch(1 0 0);                 /* #FFFFFF */
  --secondary-foreground: oklch(0.25 0.15 264); /* #1E3A8A */
  
  /* 🟢 Verde Success - Confirmaciones y mensajes de éxito */
  --success: oklch(0.7 0.15 162);            /* #10B981 */
  --success-foreground: oklch(0.98 0 0);     /* #FFFFFF */
  
  /* 🟠 Naranja Action - Llamados a la acción (CTAs) */
  --action: oklch(0.68 0.15 41);             /* #F97316 */
  --action-foreground: oklch(0.98 0 0);      /* #FFFFFF */
  
  /* 🟣 Púrpura Accent - Detalles visuales y elementos de innovación */
  --accent: oklch(0.65 0.2 285);             /* #8B5CF6 */
  --accent-foreground: oklch(0.98 0 0);      /* #FFFFFF */
}
```

### **Uso en Componentes**

```jsx
// Clases Tailwind semánticas
<button className="bg-primary text-primary-foreground">
  Botón Principal
</button>

<button className="bg-success text-success-foreground">
  Confirmar
</button>

<button className="bg-action text-action-foreground">
  Llamada a la Acción
</button>

<div className="bg-accent text-accent-foreground">
  Elemento de Innovación
</div>
```

### **Gráficos sin Rojo**

```javascript
// src/features/dashboard/components/Charts.jsx
const CHART_COLORS = {
  primary: '#1E3A8A',    // Azul
  success: '#10B981',    // Verde
  action: '#F97316',     // Naranja (reemplaza rojo)
  accent: '#8B5CF6',     // Púrpura
  muted: '#6B7280',      // Gris
};

// Configuración de gráficos
const chartConfig = {
  ingresos: { color: CHART_COLORS.success },
  gastos: { color: CHART_COLORS.action },   // Naranja en lugar de rojo
  balance: { color: CHART_COLORS.accent },
};
```

---

## 🧩 **Componentes y Hooks**

### **Componentes Reutilizables**

#### **Button Component**

```jsx
// src/components/ui/button.jsx
import { cn } from '@/lib/utils';

const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  action: 'bg-action text-action-foreground hover:bg-action/90',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
};

export function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        buttonVariants[variant],
        className
      )}
      {...props}
    />
  );
}
```

#### **Chart Component**

```jsx
// src/components/ui/chart.jsx
import { ResponsiveContainer } from 'recharts';

export function ChartContainer({ children, className, ...props }) {
  return (
    <div className={cn('w-full h-64', className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
```

### **Custom Hooks**

#### **useAuth Hook**

```javascript
// src/features/auth/hooks/useAuth.js
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { authApi } from '@/api/auth';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(credentials);
      if (response.success) {
        login(response.data.user, response.data.token);
        return response;
      } else {
        throw new Error(response.message || 'Error de autenticación');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { handleLogin, isLoading, error };
}
```

#### **useApi Hook**

```javascript
// src/hooks/useApi.js
import { useState, useEffect } from 'react';
import apiClient from '@/api/client';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(endpoint, options.params);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [endpoint, JSON.stringify(options.params)]);
  
  const refetch = () => {
    fetchData();
  };
  
  return { data, loading, error, refetch };
}
```

---

## 🔄 **Gestión de Estado**

### **Context API**

```jsx
// src/context/AuthContext.jsx
import { createContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });
  
  // ... lógica de autenticación
  
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### **Local State Management**

```jsx
// Usando useState para estado local
function ComponentExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <form>
      <input
        name="name"
        value={formData.name}
        onChange={handleInputChange}
      />
      {/* ... más campos */}
    </form>
  );
}
```

---

## 🌐 **API y Servicios**

### **Cliente HTTP**

```javascript
// src/api/client.js
class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.timeout = 30000;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };
    
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    
    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    return data;
  }
  
  // Métodos HTTP
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }
  
  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }
  
  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }
  
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient();
```

### **Servicios Específicos**

```javascript
// src/api/auth.js
import apiClient from './client';
import { API_ENDPOINTS } from '@/config/api';

export const authApi = {
  async login(credentials) {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
  
  async logout() {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
  
  async getCurrentUser() {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },
  
  async refreshToken() {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
  },
};
```

---

## 🧪 **Testing**

### **Configuración de Jest**

```javascript
// jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### **Testing de Componentes**

```javascript
// src/components/ui/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  test('applies correct variant class', () => {
    render(<Button variant="success">Success Button</Button>);
    const button = screen.getByText('Success Button');
    expect(button).toHaveClass('bg-success');
  });
  
  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### **Testing de Hooks**

```javascript
// src/hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '@/context/AuthContext';

const wrapper = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  test('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

---

## 🚀 **Deployment**

### **Build de Producción**

```bash
# 1. Instalar dependencias
npm ci

# 2. Ejecutar tests
npm run test

# 3. Lint y format
npm run lint
npm run format

# 4. Build de producción
npm run build

# 5. Preview del build
npm run preview
```

### **Variables de Entorno de Producción**

```bash
# .env.production
VITE_API_URL=https://api.tu-colegio.cl
VITE_APP_NAME="Sistema de Gestión Escolar"
VITE_APP_VERSION=8.6.0
VITE_ENABLE_LOGGING=false
VITE_ENABLE_DEBUG=false
```

### **Configuración de Vite**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: ['all'],
  },
});
```

### **Optimizaciones de Build**

```javascript
// Lazy loading de rutas
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AlumnosPage = lazy(() => import('@/pages/AlumnosPage'));

// Code splitting por features
const AuthFeature = lazy(() => import('@/features/auth'));
const FinanzasFeature = lazy(() => import('@/features/finanzas'));
```

---

## 📝 **Mejores Prácticas**

### **Estructura de Componentes**

```jsx
// ✅ Buena práctica
function UserCard({ user, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => {
    setIsEditing(true);
    onEdit?.(user.id);
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleEdit}>
            Editar
          </Button>
          <Button variant="action" onClick={() => onDelete?.(user.id)}>
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### **Manejo de Errores**

```jsx
// Error Boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Algo salió mal
          </h2>
          <p className="text-muted-foreground mt-2">
            Por favor, recarga la página o contacta al soporte.
          </p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### **Performance**

```jsx
// Memoización de componentes
const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      calculated: item.value * 1.21, // IVA
    }));
  }, [data]);
  
  const handleUpdate = useCallback((id, newValue) => {
    onUpdate?.(id, newValue);
  }, [onUpdate]);
  
  return (
    <div>
      {processedData.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});
```

### **Accesibilidad**

```jsx
// ✅ Componente accesible
function AccessibleButton({ children, ...props }) {
  return (
    <button
      className="px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={props['aria-label'] || children}
      {...props}
    >
      {children}
    </button>
  );
}

// ✅ Formulario accesible
function AccessibleForm() {
  return (
    <form>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          aria-describedby="email-error"
          className="w-full px-3 py-2 border rounded-md"
        />
        <div id="email-error" className="text-red-600 text-sm mt-1">
          {/* Mensaje de error */}
        </div>
      </div>
    </form>
  );
}
```

---

## 🔧 **Troubleshooting**

### **Problemas Comunes**

#### **Build Failures**

```bash
# Error: Module not found
# Solución: Verificar imports y paths
npm run build 2>&1 | grep "Module not found"

# Error: Out of memory
# Solución: Aumentar memoria de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### **Performance Issues**

```javascript
// Problema: Re-renders innecesarios
// Solución: Usar React DevTools Profiler

// Problema: Bundle size grande
// Solución: Analizar bundle
npm install --save-dev webpack-bundle-analyzer
npm run build && npx webpack-bundle-analyzer dist/assets/*.js
```

#### **Styling Issues**

```bash
# Problema: Tailwind classes no funcionan
# Solución: Verificar configuración
npx tailwindcss --help

# Problema: CSS no se aplica
# Solución: Verificar orden de imports en main.jsx
```

### **Debugging**

```javascript
// React DevTools
// Instalar extensión del navegador

// Console debugging
console.log('Debug info:', { user, data, state });

// Performance debugging
console.time('expensive-operation');
// ... código costoso
console.timeEnd('expensive-operation');

// Network debugging
// Usar Network tab en DevTools
```

### **Logs y Monitoreo**

```javascript
// src/utils/logger.js
class Logger {
  static log(level, message, data = {}) {
    if (import.meta.env.VITE_ENABLE_LOGGING === 'true') {
      console[level](`[${new Date().toISOString()}] ${message}`, data);
    }
  }
  
  static info(message, data) {
    this.log('info', message, data);
  }
  
  static error(message, data) {
    this.log('error', message, data);
  }
  
  static warn(message, data) {
    this.log('warn', message, data);
  }
}

export default Logger;
```

---

## 📚 **Recursos Adicionales**

### **Documentación**

- **React:** https://react.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Vite:** https://vitejs.dev/
- **Radix UI:** https://www.radix-ui.com/
- **Recharts:** https://recharts.org/

### **Herramientas de Desarrollo**

- **React DevTools:** Extensión del navegador
- **Tailwind CSS IntelliSense:** Extensión de VS Code
- **ES7+ React/Redux/React-Native snippets:** VS Code
- **Prettier:** Formateo de código
- **ESLint:** Linting de código

### **Testing**

- **Jest:** Framework de testing
- **React Testing Library:** Testing de componentes
- **MSW:** Mock Service Worker para APIs
- **Cypress:** Testing E2E

---

## 📞 **Soporte y Contacto**

### **Información del Proyecto**
- **Versión:** 8.6.0
- **Fecha:** Enero 2025
- **Tecnología:** React 18 + Tailwind CSS v4

### **Recursos del Proyecto**
- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:3001
- **Documentación:** `/docs`
- **Código Fuente:** `/src`

---

**¡Gracias por contribuir al Sistema de Gestión Escolar v8.6.0!**

Este manual proporciona toda la información técnica necesaria para desarrollar, mantener y extender el frontend del sistema. Para preguntas específicas o contribuciones, consulte la documentación adicional en la carpeta `docs/`.

**¡Happy Coding! 👨‍💻🚀**

