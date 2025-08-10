import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/* Loading */
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
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticación...</h2>
      <p className="text-gray-600">Por favor espera mientras verificamos tu sesión</p>
    </motion.div>
  </div>
);

/* Acceso denegado */
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
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-red-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes los permisos necesarios para acceder a esta página.</p>

          {(requiredPermissions?.length || requiredRoles?.length) ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">Permisos requeridos:</span>
              </div>
              {requiredPermissions?.length ? (
                <div className="text-sm text-yellow-700 mb-2">
                  <strong>Permisos:</strong> {requiredPermissions.join(', ')}
                </div>
              ) : null}
              {requiredRoles?.length ? (
                <div className="text-sm text-yellow-700">
                  <strong>Roles:</strong> {requiredRoles.join(', ')}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
            <Button onClick={onGoBack} className="w-full" variant="outline">
              Volver Atrás
            </Button>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
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

/* Principal */
export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  requiredUserType = null, // 'admin' | 'apoderado' | 'tesorero' | 'profesor' | ...
  requireAll = false,      // true: requiere TODOS; false: requiere AL MENOS UNO
  fallback = null,
}) {
  const { isAuthenticated, loading, hasRole, getUserType } = useAuth();
  const { hasPermission } = usePermissions();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Tipo de usuario (coherente con useAuth.getUserType)
  if (requiredUserType) {
    const userType = getUserType(); // devuelve 'admin' | 'profesor' | 'tesorero' | 'apoderado' | 'alumno' | 'directivo' | null
    if (userType !== requiredUserType) {
      const redirectPath = userType === 'apoderado' ? '/apoderado/dashboard' : '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Helpers locales para permisos
  const hasAnyPermissionLocal = (perms) => perms.some((p) => hasPermission(p));
  const hasAllPermissionsLocal = (perms) => perms.every((p) => hasPermission(p));

  if (requiredPermissions.length) {
    const ok = requireAll ? hasAllPermissionsLocal(requiredPermissions) : hasAnyPermissionLocal(requiredPermissions);
    if (!ok) {
      return (
        fallback || (
          <AccessDenied
            requiredPermissions={requiredPermissions}
            onGoBack={() => window.history.back()}
          />
        )
      );
    }
  }

  if (requiredRoles.length) {
    const ok = requireAll ? requiredRoles.every((r) => hasRole(r)) : requiredRoles.some((r) => hasRole(r));
    if (!ok) {
      return (
        fallback || (
          <AccessDenied
            requiredRoles={requiredRoles}
            onGoBack={() => window.history.back()}
          />
        )
      );
    }
  }

  return children;
}

/* HOC */
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/* Hook de verificación rápida */
export function useRouteAccess(requiredPermissions = [], requiredRoles = [], requireAll = false) {
  const { isAuthenticated, hasRole } = useAuth();
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) return { canAccess: false, reason: 'not_authenticated' };

  const permOk = !requiredPermissions.length
    ? true
    : requireAll
      ? requiredPermissions.every((p) => hasPermission(p))
      : requiredPermissions.some((p) => hasPermission(p));

  if (!permOk) return { canAccess: false, reason: 'insufficient_permissions' };

  const roleOk = !requiredRoles.length
    ? true
    : requireAll
      ? requiredRoles.every((r) => hasRole(r))
      : requiredRoles.some((r) => hasRole(r));

  if (!roleOk) return { canAccess: false, reason: 'insufficient_roles' };

  return { canAccess: true, reason: null };
}

/* Rutas públicas (solo sin sesión) */
export function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return children;
}

/* Basadas en roles */
export function RoleBasedRoute({ children, allowedRoles = [], fallback = null }) {
  const { hasRole } = useAuth();
  const ok = allowedRoles.length === 0 || allowedRoles.some((r) => hasRole(r));
  if (!ok) {
    return (
      fallback || (
        <AccessDenied requiredRoles={allowedRoles} onGoBack={() => window.history.back()} />
      )
    );
  }
  return children;
}

/* Basadas en permisos */
export function PermissionBasedRoute({ children, requiredPermissions = [], requireAll = false, fallback = null }) {
  const { hasPermission } = usePermissions();
  const ok = !requiredPermissions.length
    ? true
    : requireAll
      ? requiredPermissions.every((p) => hasPermission(p))
      : requiredPermissions.some((p) => hasPermission(p));

  if (!ok) {
    return (
      fallback || (
        <AccessDenied requiredPermissions={requiredPermissions} onGoBack={() => window.history.back()} />
      )
    );
  }
  return children;
}

export default ProtectedRoute;
