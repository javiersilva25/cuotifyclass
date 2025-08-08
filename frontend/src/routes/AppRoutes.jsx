import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import { PublicRoute } from '../features/auth/components/ProtectedRoute';
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
      {/* Ruta pública */}
      <Route
        path="/login"
        element={
          <PublicRoute redirectTo="/dashboard">
            <SimpleLogin />
          </PublicRoute>
        }
      />

      {/* Rutas de apoderados */}
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

      {/* Rutas de tesoreros */}
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

      {/* Rutas administrativas protegidas */}
      <Route
        path="/alumnos"
        element={
          <ProtectedRoute>
            <AlumnosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cursos"
        element={
          <ProtectedRoute>
            <CursosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cobros"
        element={
          <ProtectedRoute>
            <CobrosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gastos"
        element={
          <ProtectedRoute>
            <GastosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorias-gasto"
        element={
          <ProtectedRoute>
            <CategoriasGastoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimientos-ccaa"
        element={
          <ProtectedRoute>
            <MovimientoCcaaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/movimientos-cppp"
        element={
          <ProtectedRoute>
            <MovimientoCcppPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deudas-alumno"
        element={
          <ProtectedRoute>
            <DeudasAlumnoPage />
          </ProtectedRoute>
        }
      />      <Route
        path="/deudas-companero"
        element={
          <ProtectedRoute>
            <DeudasCompaneroPage />
          </ProtectedRoute>
        }
      />
      
      {/* Ruta de carga masiva */}
      <Route
        path="/admin/carga-masiva"
        element={
          <ProtectedRoute requiredUserType="admin">
            <CargaMasiva />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/gestion-usuarios"
        element={
          <ProtectedRoute requiredUserType="admin">
            <GestionUsuarios />
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
