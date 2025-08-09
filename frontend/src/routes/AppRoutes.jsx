import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicRoute } from '../features/auth/components/ProtectedRoute';
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

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home -> dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Pública */}
      <Route
        path="/login"
        element={
          <PublicRoute redirectTo="/dashboard">
            <SimpleLogin />
          </PublicRoute>
        }
      />

      {/* Apoderado */}
      <Route
        path="/apoderado/dashboard"
        element={
          <ProtectedRoute requiredRoles={['apoderado']}>
            <ApoderadoDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apoderado/pagos"
        element={
          <ProtectedRoute requiredRoles={['apoderado']}>
            <ApoderadoPagos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apoderado/historial"
        element={
          <ProtectedRoute requiredRoles={['apoderado']}>
            <ApoderadoHistorial />
          </ProtectedRoute>
        }
      />

      {/* Tesorero */}
      <Route
        path="/tesorero/dashboard"
        element={
          <ProtectedRoute requiredRoles={['tesorero']}>
            <TesoreroDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tesorero/alumnos"
        element={
          <ProtectedRoute requiredRoles={['tesorero']}>
            <TesoreroAlumnos />
          </ProtectedRoute>
        }
      />

      {/* Administrativas (requieren administrador) */}
      <Route path="/alumnos" element={<ProtectedRoute requiredRoles={['administrador']}><AlumnosPage /></ProtectedRoute>} />
      <Route path="/cursos" element={<ProtectedRoute requiredRoles={['administrador']}><CursosPage /></ProtectedRoute>} />
      <Route path="/cobros" element={<ProtectedRoute requiredRoles={['administrador','tesorero']}><CobrosPage /></ProtectedRoute>} />
      <Route path="/gastos" element={<ProtectedRoute requiredRoles={['administrador','tesorero']}><GastosPage /></ProtectedRoute>} />
      <Route path="/categorias-gasto" element={<ProtectedRoute requiredRoles={['administrador']}><CategoriasGastoPage /></ProtectedRoute>} />
      <Route path="/movimientos-ccaa" element={<ProtectedRoute requiredRoles={['administrador','tesorero']}><MovimientoCcaaPage /></ProtectedRoute>} />
      <Route path="/movimientos-ccpp" element={<ProtectedRoute requiredRoles={['administrador','tesorero']}><MovimientoCcppPage /></ProtectedRoute>} />
      <Route path="/deudas-alumno" element={<ProtectedRoute requiredRoles={['administrador','tesorero','apoderado']}><DeudasAlumnoPage /></ProtectedRoute>} />
      <Route path="/deudas-companero" element={<ProtectedRoute requiredRoles={['administrador','tesorero']}><DeudasCompaneroPage /></ProtectedRoute>} />

      {/* Admin general */}
      <Route path="/admin/carga-masiva" element={<ProtectedRoute requiredRoles={['administrador']}><CargaMasiva /></ProtectedRoute>} />
      <Route path="/admin/gestion-usuarios" element={<ProtectedRoute requiredRoles={['administrador']}><GestionUsuarios /></ProtectedRoute>} />

      {/* Dashboard por defecto */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
