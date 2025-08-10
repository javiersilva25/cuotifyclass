// src/pages/Navbar.jsx
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LogOut, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';

function normalizeRoles(user) {
  return (user?.roles || [])
    .map(r => (typeof r === 'string' ? r : (r?.nombre_rol || r?.role || r?.nombre || '')))
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const roles = useMemo(() => normalizeRoles(user), [user]);

  const homePath = useMemo(() => {
    if (roles.includes('administrador')) return '/dashboard/admin';
    if (roles.includes('tesorero'))      return '/tesorero/dashboard';
    if (roles.includes('apoderado'))     return '/apoderado/dashboard';
    return '/dashboard/admin';
  }, [roles]);

  const adminMenu = [
    { name: 'Dashboard', path: '/dashboard/admin' },
    { name: 'Alumnos', path: '/alumnos' },
    { name: 'Cursos', path: '/cursos' },
    { name: 'Cobros', path: '/cobros' },
    { name: 'Gastos', path: '/gastos' },
    { name: 'Categorías de gasto', path: '/categorias-gasto' },
    { name: 'Movimientos CCAA', path: '/movimientos-ccaa' },
    { name: 'Movimientos CCPP', path: '/movimientos-ccpp' },
    { name: 'Deudas por alumno', path: '/deudas-alumno' },
    { name: 'Deudas por compañero', path: '/deudas-companero' },
    { name: 'Carga masiva', path: '/admin/carga-masiva' },
    { name: 'Gestión de usuarios', path: '/admin/gestion-usuarios' },
  ];

  const tesoreroMenu = [
    { name: 'Dashboard (Tesorero)', path: '/tesorero/dashboard' },
    { name: 'Alumnos del curso', path: '/tesorero/alumnos' },
    { name: 'Cobros', path: '/cobros' },
    { name: 'Movimientos CCAA', path: '/movimientos-ccaa' },
    { name: 'Movimientos CCPP', path: '/movimientos-ccpp' },
    { name: 'Deudas por alumno', path: '/deudas-alumno' },
  ];

  const apoderadoMenu = [
    { name: 'Dashboard (Apoderado)', path: '/apoderado/dashboard' },
    { name: 'Mis pagos', path: '/apoderado/pagos' },
    { name: 'Historial', path: '/apoderado/historial' },
  ];

  // fusiona menús según roles
  const routes = useMemo(() => {
    let list = [];
    if (roles.includes('administrador')) list = list.concat(adminMenu);
    if (roles.includes('tesorero'))      list = list.concat(tesoreroMenu);
    if (roles.includes('apoderado'))     list = list.concat(apoderadoMenu);

    // fallback si no hay rol reconocido
    if (list.length === 0) list = [{ name: 'Dashboard', path: homePath }];

    // quita duplicados por path
    const seen = new Set();
    return list.filter(item => (seen.has(item.path) ? false : seen.add(item.path)));
  }, [roles, homePath]);

  const handleLogoClick = () => navigate(homePath, { replace: true });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="w-full bg-background text-foreground border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <button onClick={handleLogoClick} className="text-xl font-bold text-primary">
          Sistema Escolar
        </button>

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
                {routes.map(route => (
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
                <li className="border-t border-border mt-2 pt-2">
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
