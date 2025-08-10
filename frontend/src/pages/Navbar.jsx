import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/features/auth/hooks/useAuth';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const routes = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Alumnos', path: '/alumnos' },
    { name: 'Cursos', path: '/cursos' },
    { name: 'Cobros', path: '/cobros' },
    { name: 'Gastos', path: '/gastos' },
    { name: 'Categorías de gasto', path: '/categorias-gasto' },
    { name: 'Movimientos CCAA', path: '/movimientos-ccaa' },
    { name: 'Movimientos CCPP', path: '/movimientos-cppp' },
    { name: 'Deudas por alumno', path: '/deudas-alumno' },
    { name: 'Deudas por compañero', path: '/deudas-companero' },
  ];

  return (
    <header className="w-full bg-background text-foreground border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / título */}
        <h1 className="text-xl font-bold text-primary">Sistema Escolar</h1>

        {/* Menú desplegable */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-[--radius-md] transition"
          >
            <Menu size={16} />
            Menú
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-md z-50">
              <ul className="py-2 text-sm">
                {routes.map((route) => (
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
