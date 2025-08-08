# Frontend v4.1.0 - Sistema de Gestión Escolar
## Documentación Técnica

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Componentes Principales](#componentes-principales)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Servicios API](#servicios-api)
8. [Rutas y Navegación](#rutas-y-navegación)
9. [Gestión de Estados](#gestión-de-estados)
10. [Despliegue](#despliegue)

---

## 1. Descripción General

### Tecnologías Principales

- **React 18.3.1**: Framework principal
- **Vite 6.3.5**: Build tool y dev server
- **React Router 6**: Navegación y rutas
- **Tailwind CSS**: Framework de estilos
- **Framer Motion**: Animaciones
- **Lucide React**: Iconografía
- **Recharts**: Gráficos y visualizaciones

### Características Clave

- **Dual Authentication**: Sistema de login para admin y apoderados
- **Responsive Design**: Optimizado para todos los dispositivos
- **Real-time Updates**: Actualizaciones en tiempo real
- **Payment Integration**: 4 pasarelas de pago integradas
- **Modern UI**: Interfaz moderna con animaciones fluidas

---

## 2. Arquitectura

### Patrón de Arquitectura

```
┌─────────────────────────────────────────┐
│                Frontend                 │
├─────────────────────────────────────────┤
│  Components  │  Hooks  │  Services     │
│  Pages       │  Utils  │  API Client   │
│  Routes      │  Types  │  Context      │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              Backend API                │
│         (Node.js + Express)             │
└─────────────────────────────────────────┘
```

### Principios de Diseño

- **Component-Based**: Componentes reutilizables y modulares
- **Hook-Driven**: Lógica encapsulada en hooks personalizados
- **API-First**: Separación clara entre frontend y backend
- **Type-Safe**: Validación de tipos con PropTypes
- **Performance-Focused**: Optimizaciones de rendimiento

---

## 3. Instalación y Configuración

### Requisitos Previos

- **Node.js**: 18.0.0 o superior
- **npm**: 8.0.0 o superior
- **Git**: Para control de versiones

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd frontend-gestion-escolar

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# Payment Gateways
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_TRANSBANK_PUBLIC_KEY=...
VITE_MERCADOPAGO_PUBLIC_KEY=...

# Environment
VITE_NODE_ENV=development
VITE_APP_VERSION=4.1.0
```

### Scripts Disponibles

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext js,jsx",
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

---

## 4. Estructura del Proyecto

```
src/
├── api/                    # Clientes API
│   ├── client.js          # Cliente HTTP base
│   ├── apoderado.js       # API de apoderados
│   └── payments.js        # API de pagos
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Componentes de layout
│   └── common/           # Componentes comunes
├── features/             # Funcionalidades por módulo
│   ├── auth/            # Autenticación
│   │   ├── components/  # Componentes de auth
│   │   ├── hooks/       # Hooks de auth
│   │   └── services/    # Servicios de auth
│   └── apoderado/       # Módulo de apoderados
│       ├── components/  # Componentes específicos
│       ├── hooks/       # Hooks del módulo
│       └── services/    # Servicios del módulo
├── pages/               # Páginas principales
│   ├── admin/          # Páginas administrativas
│   └── apoderado/      # Páginas de apoderados
├── routes/             # Configuración de rutas
├── context/            # Context providers
├── hooks/              # Hooks globales
├── utils/              # Utilidades
├── styles/             # Estilos globales
└── config/             # Configuración
```

---

## 5. Componentes Principales

### LoginFormWithApoderado

Componente dual de autenticación que maneja tanto usuarios administrativos como apoderados.

```jsx
import LoginFormWithApoderado from '@/features/auth/components/LoginFormWithApoderado';

// Uso
<LoginFormWithApoderado />
```

**Props:**
- `onSuccess`: Callback ejecutado tras login exitoso
- `redirectPath`: Ruta de redirección personalizada

### ApoderadoDashboard

Dashboard principal para apoderados con vista consolidada.

```jsx
import ApoderadoDashboard from '@/pages/apoderado/ApoderadoDashboard';

// Características:
// - Vista de resumen con estadísticas
// - Tabs organizados (Resumen, Hijos, Deudas, Historial)
// - Acciones rápidas de pago
// - Integración con backend en tiempo real
```

### ApoderadoPagos

Sistema completo de pagos con múltiples pasarelas.

```jsx
import ApoderadoPagos from '@/pages/apoderado/ApoderadoPagos';

// Funcionalidades:
// - Selección múltiple de cuotas
// - Comparación de costos por pasarela
// - Recomendación inteligente
// - Proceso de pago guiado
```

### PaymentGatewaySelector

Selector inteligente de pasarelas de pago.

```jsx
import PaymentGatewaySelector from '@/components/PaymentGatewaySelector';

<PaymentGatewaySelector
  amount={50000}
  onSelect={handleGatewaySelect}
  showRecommendation={true}
/>
```

**Props:**
- `amount`: Monto de la transacción
- `onSelect`: Callback de selección
- `showRecommendation`: Mostrar recomendación automática

---

## 6. Hooks Personalizados

### useApoderadoAuth

Hook para autenticación específica de apoderados.

```jsx
import { useApoderadoAuth } from '@/features/apoderado/hooks/useApoderado';

const {
  user,
  isAuthenticated,
  login,
  logout,
  isLoading
} = useApoderadoAuth();

// Métodos disponibles:
// - login(credentials): Autenticar apoderado
// - logout(): Cerrar sesión
// - refreshToken(): Renovar token
```

### useApoderadoData

Hook para gestión de datos del apoderado.

```jsx
import { useApoderadoData } from '@/features/apoderado/hooks/useApoderado';

const {
  hijos,
  deudasPendientes,
  historialPagos,
  loadHijos,
  loadDeudas,
  loadHistorial,
  isLoading,
  error
} = useApoderadoData();
```

### usePayments

Hook para el sistema unificado de pagos.

```jsx
import { usePayments } from '@/hooks/usePayments';

const {
  gateways,
  recommendedGateway,
  createPayment,
  confirmPayment,
  getRecommendation,
  isProcessing
} = usePayments();
```

### useAuth

Hook principal de autenticación (compatible con v3.x).

```jsx
import { useAuth } from '@/features/auth/hooks/useAuth';

const {
  user,
  isAuthenticated,
  login,
  logout,
  permissions
} = useAuth();
```

---

## 7. Servicios API

### Cliente Base

```javascript
// src/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptors para autenticación
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API de Apoderados

```javascript
// src/api/apoderado.js
export const apoderadoAPI = {
  // Autenticación
  login: (credentials) => 
    apiClient.post('/apoderados/login', credentials),
  
  // Datos del apoderado
  getHijos: (apoderadoId) => 
    apiClient.get(`/apoderados/${apoderadoId}/hijos`),
  
  getDeudasPendientes: (apoderadoId) => 
    apiClient.get(`/apoderados/${apoderadoId}/deudas-pendientes`),
  
  getHistorialPagos: (apoderadoId, limit = 50) => 
    apiClient.get(`/apoderados/${apoderadoId}/historial-pagos?limit=${limit}`)
};
```

### API de Pagos

```javascript
// src/api/payments.js
export const paymentsAPI = {
  // Pasarelas disponibles
  getGateways: () => 
    apiClient.get('/payments/gateways'),
  
  // Recomendación inteligente
  getRecommendation: (amount, country = 'CL') => 
    apiClient.get(`/payments/gateways/recommend?amount=${amount}&country=${country}`),
  
  // Crear pago
  createPayment: (apoderadoId, paymentData) => 
    apiClient.post(`/payments/apoderados/${apoderadoId}/create`, paymentData),
  
  // Confirmar pago
  confirmPayment: (apoderadoId, transactionId) => 
    apiClient.post(`/payments/apoderados/${apoderadoId}/confirm`, { transactionId })
};
```

---

## 8. Rutas y Navegación

### Configuración de Rutas

```jsx
// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/features/auth/components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginFormWithApoderado />} />

      {/* Rutas de apoderados */}
      <Route
        path="/apoderado/dashboard"
        element={
          <ProtectedRoute requiredUserType="apoderado">
            <ApoderadoDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Rutas administrativas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredUserType="admin">
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Rutas Protegidas

```jsx
// Protección por tipo de usuario
<ProtectedRoute requiredUserType="apoderado">
  <ApoderadoDashboard />
</ProtectedRoute>

// Protección por permisos (solo admin)
<ProtectedRoute requiredPermissions={['canManageFinanzas']}>
  <CobrosPage />
</ProtectedRoute>

// Protección por roles
<ProtectedRoute requiredRoles={['admin', 'tesorero']}>
  <ReportesPage />
</ProtectedRoute>
```

### Navegación Programática

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navegación simple
navigate('/apoderado/pagos');

// Navegación con estado
navigate('/apoderado/pagos', { 
  state: { selectedDeudas: [1, 2, 3] } 
});

// Reemplazo de ruta
navigate('/login', { replace: true });
```

---

## 9. Gestión de Estados

### Context Providers

```jsx
// src/context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const login = async (credentials) => {
    // Lógica de login
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Estado Local con useState

```jsx
// Gestión de estado simple
const [deudas, setDeudas] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// Patrón de carga de datos
const loadDeudas = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const response = await apoderadoAPI.getDeudasPendientes(userId);
    setDeudas(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Estado Compartido con Custom Hooks

```jsx
// Hook para compartir estado entre componentes
export const useSharedPaymentState = () => {
  const [selectedDeudas, setSelectedDeudas] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState(null);
  
  const addDeuda = (deuda) => {
    setSelectedDeudas(prev => [...prev, deuda]);
  };
  
  const removeDeuda = (deudaId) => {
    setSelectedDeudas(prev => prev.filter(d => d.id !== deudaId));
  };
  
  return {
    selectedDeudas,
    selectedGateway,
    addDeuda,
    removeDeuda,
    setSelectedGateway
  };
};
```

---

## 10. Despliegue

### Build de Producción

```bash
# Crear build optimizado
npm run build

# Previsualizar build
npm run preview

# Verificar bundle size
npm run analyze
```

### Configuración de Vite

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    allowedHosts: ['all']
  }
});
```

### Variables de Entorno por Ambiente

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_NODE_ENV=development

# .env.production
VITE_API_BASE_URL=https://api.colegio.com/api
VITE_NODE_ENV=production
```

### Despliegue con Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Configuración de Nginx

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📊 Métricas de Rendimiento

### Lighthouse Scores (Objetivo)

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 85+

### Bundle Analysis

```bash
# Analizar tamaño del bundle
npm run build
npx vite-bundle-analyzer dist
```

### Optimizaciones Implementadas

- **Code Splitting**: Carga bajo demanda
- **Tree Shaking**: Eliminación de código no usado
- **Image Optimization**: Formatos modernos (WebP)
- **Lazy Loading**: Componentes y rutas
- **Caching**: Estrategias de caché agresivas

---

## 🧪 Testing

### Configuración de Testing

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true
  }
});
```

### Ejemplos de Tests

```jsx
// Componente test
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import LoginFormWithApoderado from '@/features/auth/components/LoginFormWithApoderado';

describe('LoginFormWithApoderado', () => {
  it('renders both admin and apoderado tabs', () => {
    render(<LoginFormWithApoderado />);
    
    expect(screen.getByText('Administración')).toBeInTheDocument();
    expect(screen.getByText('Apoderados')).toBeInTheDocument();
  });
});

// Hook test
import { renderHook, act } from '@testing-library/react';
import { useApoderadoAuth } from '@/features/apoderado/hooks/useApoderado';

describe('useApoderadoAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useApoderadoAuth());
    
    await act(async () => {
      await result.current.login({
        email: 'test@test.com',
        password: 'password'
      });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## 🔧 Herramientas de Desarrollo

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@vitejs/eslint-config-react'
  ],
  rules: {
    'react/prop-types': 'warn',
    'no-unused-vars': 'warn',
    'no-console': 'warn'
  }
};
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

---

## 📞 Soporte y Contribución

### Reportar Issues

1. Verificar que el issue no exista
2. Usar el template de issue
3. Incluir pasos para reproducir
4. Adjuntar capturas de pantalla

### Contribuir

1. Fork del repositorio
2. Crear branch feature
3. Seguir convenciones de código
4. Escribir tests
5. Crear Pull Request

### Convenciones de Código

- **Componentes**: PascalCase
- **Hooks**: camelCase con prefijo 'use'
- **Archivos**: kebab-case
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

---

**Frontend v4.1.0 - Sistema de Gestión Escolar**  
*Documentación Técnica Completa*  
*Última actualización: 7 de Agosto, 2024*

