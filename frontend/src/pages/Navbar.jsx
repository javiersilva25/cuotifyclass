import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { LogOut, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Navbar() {
  const { logout, isAuthenticated, getUserType } = useAuth();
  const { canAccessPage } = usePermissions();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Dashboard dinámico según rol
  const dashboardPath = useMemo(() => {
    const t = getUserType?.();
    if (t === 'apoderado') return '/apoderado/dashboard';
    if (t === 'tesorero')  return '/tesorero/dashboard';
    return '/dashboard';
  }, [getUserType]);

  const routes = [
    // General
    { name: 'Dashboard', path: dashboardPath, key: 'dashboard' },

    // Académico
    { name: 'Alumnos', path: '/alumnos', key: 'alumnos' },
    { name: 'Cursos', path: '/cursos', key: 'cursos' },

    // Finanzas
    { name: 'Cobros', path: '/cobros', key: 'cobros' },
    { name: 'Gastos', path: '/gastos', key: 'gastos' },
    { name: 'Categorías de gasto', path: '/categorias-gasto', key: 'categorias-gasto' },
    { name: 'Movimientos CCAA', path: '/movimientos-ccaa', key: 'movimientos-ccaa' },
    { name: 'Movimientos CCPP', path: '/movimientos-ccpp', key: 'movimientos-ccpp' },
    { name: 'Deudas por alumno', path: '/deudas-alumno', key: 'deudas-alumno' },
    { name: 'Deudas por compañero', path: '/deudas-companero', key: 'deudas-companero' },

    // Apoderado
    { name: 'Panel Apoderado', path: '/apoderado/dashboard', key: 'apoderado/dashboard' },
    { name: 'Pagos Apoderado', path: '/apoderado/pagos', key: 'apoderado/pagos' },
    { name: 'Historial Apoderado', path: '/apoderado/historial', key: 'apoderado/historial' },

    // Tesorero
    { name: 'Panel Tesorero', path: '/tesorero/dashboard', key: 'tesorero/dashboard' },
    { name: 'Alumnos Tesorero', path: '/tesorero/alumnos', key: 'tesorero/alumnos' },

    // Admin
    { name: 'Carga masiva', path: '/admin/carga-masiva', key: 'admin/carga-masiva' },
    { name: 'Gestión de usuarios', path: '/admin/gestion-usuarios', key: 'admin/gestion-usuarios' },
  ];

  const visibleRoutes = routes.filter(r => canAccessPage(r.key));

  return (
    <header className="w-full bg-background text-foreground border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Sistema Escolar</h1>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-[--radius-md] transition"
          >
            <Menu size={16} />
            Menú
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-md shadow-md z-50">
              <ul className="py-2 text-sm">
                {visibleRoutes.map(route => (
                  <li key={route.path}>
                    <NavLink
                      to={route.path}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 hover:bg-muted transition ${
                          isActive ? 'font-semibold text-primary' : 'text-foreground'
                        }`
                      }
                    >
                      {route.name}
                    </NavLink>
                  </li>
                ))}
                <li className="mt-1 border-t border-border" />
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
