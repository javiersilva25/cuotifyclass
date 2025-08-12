// features/auth/hooks/usePermissions.jsx
import { useAuth } from './useAuth';

const ROLES = {
  ADMIN: 'ADMIN',
  DIRECTIVO: 'DIRECTIVO',
  PROFESOR: 'PROFESOR',
  APODERADO: 'APODERADO',
  ALUMNO: 'ALUMNO',
  TESORERO: 'TESORERO',
};

export const usePermissions = () => {
  const auth = useAuth();
  const norm = (s) => String(s || '').trim().toUpperCase();

  // Verifica rol contra user.persona_roles[].nombre_rol (BD)
  const hasRole = (role) => {
    const roles = auth?.user?.persona_roles || [];
    return roles.some((r) => norm(r?.nombre_rol) === norm(role));
  };

  const isAdmin = hasRole(ROLES.ADMIN);

  const hasPermission = (permission) => {
    if (!auth?.isAuthenticated) return false;
    if (isAdmin) return true;

    switch (permission) {
      case 'view_alumnos':            return hasRole(ROLES.ADMIN) || hasRole(ROLES.PROFESOR) || hasRole(ROLES.TESORERO);
      case 'edit_alumnos':            return hasRole(ROLES.ADMIN) || hasRole(ROLES.PROFESOR);

      case 'view_cursos':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.PROFESOR) || hasRole(ROLES.DIRECTIVO);
      case 'edit_cursos':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.PROFESOR);

      case 'view_cobros':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO) || hasRole(ROLES.DIRECTIVO);
      case 'edit_cobros':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO);

      case 'view_gastos':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO) || hasRole(ROLES.DIRECTIVO);
      case 'edit_gastos':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO);

      case 'view_categorias_gasto':   return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO);
      case 'edit_categorias_gasto':   return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO);

      case 'view_movimientos':        return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO) || hasRole(ROLES.DIRECTIVO);
      case 'edit_movimientos':        return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO);

      case 'view_deudas':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO) || hasRole(ROLES.DIRECTIVO) || hasRole(ROLES.APODERADO);
      case 'edit_deudas':             return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO);

      case 'view_reportes':           return hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO) || hasRole(ROLES.DIRECTIVO);

      case 'admin_panel':             return hasRole(ROLES.ADMIN);
      case 'carga_masiva':            return hasRole(ROLES.ADMIN);
      case 'gestion_usuarios':        return hasRole(ROLES.ADMIN);
      default: return false;
    }
  };

  const canAccessPage = (page) => {
    if (!auth?.isAuthenticated) return false;
    switch (page) {
      case 'dashboard':               return true;
      case 'alumnos':                 return hasPermission('view_alumnos');
      case 'cursos':                  return hasPermission('view_cursos');
      case 'cobros':                  return hasPermission('view_cobros');
      case 'gastos':                  return hasPermission('view_gastos');
      case 'categorias-gasto':        return hasPermission('view_categorias_gasto');
      case 'movimientos-ccaa':
      case 'movimientos-ccpp':        return hasPermission('view_movimientos');
      case 'deudas-alumno':
      case 'deudas-companero':        return hasPermission('view_deudas');
      case 'admin/carga-masiva':      return hasPermission('carga_masiva');
      case 'admin/gestion-usuarios':  return hasPermission('gestion_usuarios');

      case 'apoderado/dashboard':
      case 'apoderado/pagos':
      case 'apoderado/historial':     return hasRole(ROLES.APODERADO);

      case 'tesorero/dashboard':
      case 'tesorero/alumnos':        return hasRole(ROLES.TESORERO);

      default: return false;
    }
  };

  return {
    // base
    isAdmin,
    hasPermission,
    canAccessPage,

    // acciones genéricas
    canPerformAction: (action, resource) => {
      if (!auth?.isAuthenticated) return false;
      if (isAdmin) return true;
      switch (action) {
        case 'create':
        case 'update':
        case 'delete': return hasPermission(`edit_${resource}`);
        case 'view':   return hasPermission(`view_${resource}`);
        default: return false;
      }
    },

    // páginas accesibles (para menús)
    getAccessiblePages: () => {
      if (!auth?.isAuthenticated) return [];
      const pages = ['dashboard'];
      if (hasPermission('view_alumnos'))          pages.push('alumnos');
      if (hasPermission('view_cursos'))           pages.push('cursos');
      if (hasPermission('view_cobros'))           pages.push('cobros');
      if (hasPermission('view_gastos'))           pages.push('gastos');
      if (hasPermission('view_categorias_gasto')) pages.push('categorias-gasto');
      if (hasPermission('view_movimientos'))      pages.push('movimientos-ccaa','movimientos-ccpp');
      if (hasPermission('view_deudas'))           pages.push('deudas-alumno','deudas-companero');
      if (hasPermission('carga_masiva'))          pages.push('admin/carga-masiva');
      if (hasPermission('gestion_usuarios'))      pages.push('admin/gestion-usuarios');
      if (hasRole(ROLES.APODERADO))               pages.push('apoderado/dashboard','apoderado/pagos','apoderado/historial');
      if (hasRole(ROLES.TESORERO))                pages.push('tesorero/dashboard','tesorero/alumnos');
      return pages;
    },

    // atajos usados en páginas
    canViewAlumnos: () => hasPermission('view_alumnos'),
    canEditAlumnos: () => hasPermission('edit_alumnos'),

    canViewCursos:   () => hasPermission('view_cursos'),
    canEditCursos:   () => hasPermission('edit_cursos'),
    canManageCursos: () => hasPermission('view_cursos'),

    canViewCobros:   () => hasPermission('view_cobros'),
    canEditCobros:   () => hasPermission('edit_cobros'),

    canViewGastos:   () => hasPermission('view_gastos'),
    canEditGastos:   () => hasPermission('edit_gastos'),

    canViewDeudas:   () => hasPermission('view_deudas'),
    canEditDeudas:   () => hasPermission('edit_deudas'),

    canManageFinanzas: () =>
      hasRole(ROLES.ADMIN) || hasRole(ROLES.TESORERO) || hasRole(ROLES.DIRECTIVO),

    canAccessAdmin: () => hasPermission('admin_panel'),
  };
};

export default usePermissions;
