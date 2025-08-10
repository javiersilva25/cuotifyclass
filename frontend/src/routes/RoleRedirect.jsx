// src/routes/RoleRedirect.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function RoleRedirect() {
  const { getUserType } = useAuth();
  const t = getUserType?.();

  if (t === 'apoderado') return <Navigate to="/apoderado/dashboard" replace />;
  if (t === 'tesorero')  return <Navigate to="/tesorero/dashboard" replace />;
  return <Navigate to="/dashboard/admin" replace />; // dashboard sólo para admin
}
