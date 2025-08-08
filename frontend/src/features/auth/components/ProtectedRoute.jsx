import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

// Componente para mostrar loading
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      <div className="mb-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Verificando autenticación...
      </h2>
      <p className="text-gray-600">
        Por favor espera mientras verificamos tu sesión
      </p>
    </motion.div>
  </div>
);

// Componente para mostrar acceso denegado
const AccessDenied = ({ requiredPermissions, requiredRoles, onGoBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full"
    >
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-red-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          
          <p className="text-gray-600 mb-6">
            No tienes los permisos necesarios para acceder a esta página.
          </p>

          {(requiredPermissions || requiredRoles) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Permisos requeridos:
                </span>
              </div>
              
              {requiredPermissions && (
                <div className="text-sm text-yellow-700 mb-2">
                  <strong>Permisos:</strong> {requiredPermissions.join(', ')}
                </div>
              )}
              
              {requiredRoles && (
                <div className="text-sm text-yellow-700">
                  <strong>Roles:</strong> {requiredRoles.join(', ')}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={onGoBack}
              className="w-full"
              variant="outline"
            >
              Volver Atrás
            </Button>
            
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

// Componente principal de ruta protegida
export function ProtectedRoute({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  requiredUserType = null, // 'admin' o 'apoderado'
  requireAll = false, // Si true, requiere TODOS los permisos/roles. Si false, requiere AL MENOS UNO
  fallback = null,
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const { hasPermission, canAccessPage, hasAllPermissions, hasAnyPermission } = usePermissions();
  const location = useLocation();

  // Mostrar loading mientras se inicializa la autenticación
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar tipo de usuario si se especificó
  if (requiredUserType) {
    const userType = user?.userType || 'admin'; // Por defecto admin para compatibilidad
    
    if (userType !== requiredUserType) {
      // Redirigir al dashboard apropiado según el tipo de usuario
      const redirectPath = userType === 'apoderado' ? '/apoderado/dashboard' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Verificar permisos si se especificaron (solo para usuarios admin)
  if (requiredPermissions.length > 0 && user?.userType !== 'apoderado') {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      if (fallback) {
        return fallback;
      }
      
      return (
        <AccessDenied
          requiredPermissions={requiredPermissions}
          onGoBack={() => window.history.back()}
        />
      );
    }
  }

  // Verificar roles si se especificaron (solo para usuarios admin)
  if (requiredRoles.length > 0 && user?.userType !== 'apoderado') {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role));

    if (!hasRequiredRoles) {
      if (fallback) {
        return fallback;
      }
      
      return (
        <AccessDenied
          requiredRoles={requiredRoles}
          onGoBack={() => window.history.back()}
        />
      );
    }
  }

  // Si pasa todas las verificaciones, renderizar el contenido
  return children;
}

// HOC para proteger componentes
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook para verificar si una ruta es accesible
export function useRouteAccess(requiredPermissions = [], requiredRoles = [], requireAll = false) {
  const { isAuthenticated } = useAuthStatus();
  const { hasAllPermissions, hasAnyPermission, hasRole } = usePermissions();

  if (!isAuthenticated) {
    return { canAccess: false, reason: 'not_authenticated' };
  }

  // Verificar permisos
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      return { canAccess: false, reason: 'insufficient_permissions' };
    }
  }

  // Verificar roles
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role));

    if (!hasRequiredRoles) {
      return { canAccess: false, reason: 'insufficient_roles' };
    }
  }

  return { canAccess: true, reason: null };
}

// Componente para rutas públicas (solo accesibles si NO está autenticado)
export function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

// Componente para rutas condicionales basadas en roles
export function RoleBasedRoute({ children, allowedRoles = [], fallback = null }) {
  const { hasRole } = usePermissions();
  
  const hasAllowedRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasAllowedRole) {
    return fallback || (
      <AccessDenied
        requiredRoles={allowedRoles}
        onGoBack={() => window.history.back()}
      />
    );
  }
  
  return children;
}

// Componente para rutas condicionales basadas en permisos
export function PermissionBasedRoute({ children, requiredPermissions = [], fallback = null }) {
  const { hasAnyPermission } = usePermissions();
  
  const hasRequiredPermissions = hasAnyPermission(requiredPermissions);
  
  if (!hasRequiredPermissions) {
    return fallback || (
      <AccessDenied
        requiredPermissions={requiredPermissions}
        onGoBack={() => window.history.back()}
      />
    );
  }
  
  return children;
}

export default ProtectedRoute;

