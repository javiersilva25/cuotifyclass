import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // BYPASS: si es admin, siempre pasa
  const roles = (user?.roles || []).map(r => (typeof r === 'string' ? r : (r?.nombre_rol || r?.role || r?.nombre || ''))?.toLowerCase());
  if (roles.includes('administrador')) return children;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Pública
export function PublicRoute({ children, redirectTo = '/dashboard' }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;
  return children;
}
