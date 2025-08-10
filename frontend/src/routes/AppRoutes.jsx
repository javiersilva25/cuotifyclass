import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicRoute } from '../features/auth/components/ProtectedRoute';
import { useAuth } from '@/features/auth/hooks/useAuth';
import SimpleLogin from '../components/ui/simple-login';

// Páginas administrativas
import AlumnosPage from '../pages/AlumnosPage';
import CursosPage from '../pages/CursosPage';
import CobrosPage from '../pages/CobrosPage';
import GastosPage from '../pages/GastosPage';
import CategoriasGastoPage from '../pages/CategoriasGastoPage';
import MovimientoCcaaPage from '../pages/MovimientoCcaaPage';
import MovimientoCcppPage from '../pages/MovimientoCcppPage';
import DeudasAlumnoPage from '../pages/DeudasAlumnoPage';
import DeudasCompaneroPage from '../pages/DeudasCompaneroPage';
import DashboardPage from '../pages/DashboardPage';

// Páginas de apoderados
import ApoderadoDashboard from '../pages/apoderado/ApoderadoDashboard';
import ApoderadoPagos from '../pages/apoderado/ApoderadoPagos';
import ApoderadoHistorial from '../pages/apoderado/ApoderadoHistorial';

// Páginas de tesoreros
import TesoreroDashboard from '../pages/tesorero/TesoreroDashboard';
import TesoreroAlumnos from '../pages/tesorero/TesoreroAlumnos';

// Páginas de administración
import CargaMasiva from '../pages/admin/CargaMasiva';
import GestionUsuarios from '../pages/admin/GestionUsuarios';

/** Landing dinámico por rol */
function RoleRedirect() {
  const { getUserType } = useAuth();
  const type = getUserType?.();

  switch (type) {
    case 'apoderado': return <Navigate to="/apoderado/dashboard" replace />;
    case 'tesorero':  return <Navigate to="/tesorero/dashboard" replace />;
    case 'admin':     return <Navigate to="/dashboard/admin" replace />;
    // Si aún no hay dashboards para estos roles, mándalos al dashboard admin protegido (verán Acceso Denegado).
    case 'profesor':
    case 'directivo':
    case 'alumno':
    default:          return <Navigate to="/dashboard/admin" replace />;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Entradas neutras: deciden por rol */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Dashboard exclusivo admin */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute requiredUserType="admin">
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Apoderado */}
      <Route
        path="/apoderado/dashboard"
        element={
          <ProtectedRoute requiredUserType="apoderado">
            <ApoderadoDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apoderado/pagos"
        element={
          <ProtectedRoute requiredUserType="apoderado">
            <ApoderadoPagos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apoderado/historial"
        element={
          <ProtectedRoute requiredUserType="apoderado">
            <ApoderadoHistorial />
          </ProtectedRoute>
        }
      />

      {/* Tesorero */}
      <Route
        path="/tesorero/dashboard"
        element={
          <ProtectedRoute requiredUserType="tesorero">
            <TesoreroDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tesorero/alumnos"
        element={
          <ProtectedRoute requiredUserType="tesorero">
            <TesoreroAlumnos />
          </ProtectedRoute>
        }
      />

      {/* Rutas “administrativas”: exige admin explícito */}
      <Route path="/alumnos" element={
        <ProtectedRoute requiredUserType="admin"><AlumnosPage/></ProtectedRoute>
      }/>
      <Route path="/cursos" element={
        <ProtectedRoute requiredUserType="admin"><CursosPage/></ProtectedRoute>
      }/>
      <Route path="/cobros" element={
        <ProtectedRoute requiredUserType="admin"><CobrosPage/></ProtectedRoute>
      }/>
      <Route path="/gastos" element={
        <ProtectedRoute requiredUserType="admin"><GastosPage/></ProtectedRoute>
      }/>
      <Route path="/categorias-gasto" element={
        <ProtectedRoute requiredUserType="admin"><CategoriasGastoPage/></ProtectedRoute>
      }/>
      <Route path="/movimientos-ccaa" element={
        <ProtectedRoute requiredUserType="admin"><MovimientoCcaaPage/></ProtectedRoute>
      }/>
      <Route path="/movimientos-ccpp" element={
        <ProtectedRoute requiredUserType="admin"><MovimientoCcppPage/></ProtectedRoute>
      }/>
      <Route path="/deudas-alumno" element={
        <ProtectedRoute requiredUserType="admin"><DeudasAlumnoPage/></ProtectedRoute>
      }/>
      <Route path="/deudas-companero" element={
        <ProtectedRoute requiredUserType="admin"><DeudasCompaneroPage/></ProtectedRoute>
      }/>

      {/* Admin tools */}
      <Route path="/admin/carga-masiva" element={
        <ProtectedRoute requiredUserType="admin"><CargaMasiva/></ProtectedRoute>
      }/>
      <Route path="/admin/gestion-usuarios" element={
        <ProtectedRoute requiredUserType="admin"><GestionUsuarios/></ProtectedRoute>
      }/>

      {/* Login público */}
      <Route
        path="/login"
        element={
          <PublicRoute redirectTo="/">
            <SimpleLogin />
          </PublicRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
