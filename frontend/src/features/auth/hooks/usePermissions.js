// features/auth/hooks/usePermissions.jsx
import { useAuth } from './useAuth';

const ROLES = {
  ADMIN: 'Administrador',
  DIRECTIVO: 'Directivo',
  PROFESOR: 'Profesor',
  APODERADO: 'Apoderado',
  ALUMNO: 'Alumno',
  TESORERO: 'Tesorero Alumnos',
};

export const usePermissions = () => {
  const auth = useAuth();

  const is = (r) => auth.hasRole(r);
  const isAdmin = is(ROLES.ADMIN);

  const hasPermission = (permission) => {
    if (!auth.isAuthenticated) return false;
    if (isAdmin) return true;

    switch (permission) {
      case 'view_alumnos':            return is(ROLES.ADMIN) || is(ROLES.PROFESOR) || is(ROLES.TESORERO);
      case 'edit_alumnos':            return is(ROLES.ADMIN) || is(ROLES.PROFESOR);

      case 'view_cursos':             return is(ROLES.ADMIN) || is(ROLES.PROFESOR) || is(ROLES.DIRECTIVO);
      case 'edit_cursos':             return is(ROLES.ADMIN) || is(ROLES.PROFESOR);

      case 'view_cobros':             return is(ROLES.ADMIN) || is(ROLES.TESORERO) || is(ROLES.DIRECTIVO);
      case 'edit_cobros':             return is(ROLES.ADMIN) || is(ROLES.TESORERO);

      case 'view_gastos':             return is(ROLES.ADMIN) || is(ROLES.TESORERO) || is(ROLES.DIRECTIVO);
      case 'edit_gastos':             return is(ROLES.ADMIN) || is(ROLES.TESORERO);

      case 'view_categorias_gasto':   return is(ROLES.ADMIN) || is(ROLES.TESORERO);
      case 'edit_categorias_gasto':   return is(ROLES.ADMIN) || is(ROLES.TESORERO);

      case 'view_movimientos':        return is(ROLES.ADMIN) || is(ROLES.TESORERO) || is(ROLES.DIRECTIVO);
      case 'edit_movimientos':        return is(ROLES.ADMIN) || is(ROLES.TESORERO);

      case 'view_deudas':             return is(ROLES.ADMIN) || is(ROLES.TESORERO) || is(ROLES.DIRECTIVO) || is(ROLES.APODERADO);
      case 'edit_deudas':             return is(ROLES.ADMIN) || is(ROLES.TESORERO);

      case 'view_reportes':           return is(ROLES.ADMIN) || is(ROLES.TESORERO) || is(ROLES.DIRECTIVO);
      case 'admin_panel':             return is(ROLES.ADMIN);
      case 'carga_masiva':            return is(ROLES.ADMIN);
      case 'gestion_usuarios':        return is(ROLES.ADMIN);
      default: return false;
    }
  };

  const canAccessPage = (page) => {
    if (!auth.isAuthenticated) return false;
    switch (page) {
      case 'dashboard': return true;
      case 'alumnos':   return hasPermission('view_alumnos');
      case 'cursos':    return hasPermission('view_cursos');
      case 'cobros':    return hasPermission('view_cobros');
      case 'gastos':    return hasPermission('view_gastos');
      case 'categorias-gasto': return hasPermission('view_categorias_gasto');
      case 'movimientos-ccaa':
      case 'movimientos-ccpp': return hasPermission('view_movimientos');
      case 'deudas-alumno':
      case 'deudas-companero': return hasPermission('view_deudas');
      case 'admin/carga-masiva':     return hasPermission('carga_masiva');
      case 'admin/gestion-usuarios': return hasPermission('gestion_usuarios');

      case 'apoderado/dashboard':
      case 'apoderado/pagos':
      case 'apoderado/historial':     return is(ROLES.APODERADO);

      case 'tesorero/dashboard':
      case 'tesorero/alumnos':        return is(ROLES.TESORERO);
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
      if (!auth.isAuthenticated) return false;
      if (isAdmin) return true;
      switch (action) {
        case 'create':
        case 'update':
        case 'delete': return hasPermission(`edit_${resource}`);
        case 'view':   return hasPermission(`view_${resource}`);
        default: return false;
      }
    },

    // páginas accesibles
    getAccessiblePages: () => {
      if (!auth.isAuthenticated) return [];
      const pages = ['dashboard'];
      if (hasPermission('view_alumnos')) pages.push('alumnos');
      if (hasPermission('view_cursos')) pages.push('cursos');
      if (hasPermission('view_cobros')) pages.push('cobros');
      if (hasPermission('view_gastos')) pages.push('gastos');
      if (hasPermission('view_categorias_gasto')) pages.push('categorias-gasto');
      if (hasPermission('view_movimientos')) pages.push('movimientos-ccaa','movimientos-ccpp');
      if (hasPermission('view_deudas')) pages.push('deudas-alumno','deudas-companero');
      if (hasPermission('carga_masiva')) pages.push('admin/carga-masiva');
      if (hasPermission('gestion_usuarios')) pages.push('admin/gestion-usuarios');
      if (is(ROLES.APODERADO)) pages.push('apoderado/dashboard','apoderado/pagos','apoderado/historial');
      if (is(ROLES.TESORERO))  pages.push('tesorero/dashboard','tesorero/alumnos');
      return pages;
    },

    // atajos usados en páginas
    canViewAlumnos: () => hasPermission('view_alumnos'),
    canEditAlumnos: () => hasPermission('edit_alumnos'),

    canViewCursos:   () => hasPermission('view_cursos'),
    canEditCursos:   () => hasPermission('edit_cursos'),
    canManageCursos: () => hasPermission('view_cursos'), // compatibilidad

    canViewCobros:   () => hasPermission('view_cobros'),
    canEditCobros:   () => hasPermission('edit_cobros'),

    canViewGastos:   () => hasPermission('view_gastos'),
    canEditGastos:   () => hasPermission('edit_gastos'),

    canViewDeudas:   () => hasPermission('view_deudas'),
    canEditDeudas:   () => hasPermission('edit_deudas'),

    canManageFinanzas: () =>
      is(ROLES.ADMIN) || is(ROLES.TESORERO) || is(ROLES.DIRECTIVO),

    canAccessAdmin: () => hasPermission('admin_panel'),
  };
};

export default usePermissions;
