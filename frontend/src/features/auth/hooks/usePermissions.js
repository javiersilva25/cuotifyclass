// features/auth/hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const auth = useAuth();

  const is = (r) => auth.hasRole(r);             // 👈 delega al hook
  const isAdmin = auth.isAdmin;

  const hasPermission = (permission) => {
    if (!auth.isAuthenticated) return false;
    if (isAdmin) return true;

    switch (permission) {
      case 'view_alumnos':            return is('administrador') || is('profesor') || is('tesorero');
      case 'edit_alumnos':            return is('administrador') || is('profesor');
      case 'view_cursos':             return is('administrador') || is('profesor') || is('tesorero');
      case 'edit_cursos':             return is('administrador');
      case 'view_cobros':             return is('administrador') || is('tesorero');
      case 'edit_cobros':             return is('administrador') || is('tesorero');
      case 'view_gastos':             return is('administrador') || is('tesorero');
      case 'edit_gastos':             return is('administrador') || is('tesorero');
      case 'view_categorias_gasto':   return is('administrador') || is('tesorero');
      case 'edit_categorias_gasto':   return is('administrador');
      case 'view_movimientos':        return is('administrador') || is('tesorero');
      case 'edit_movimientos':        return is('administrador') || is('tesorero');
      case 'view_deudas':             return is('administrador') || is('tesorero') || is('apoderado');
      case 'edit_deudas':             return is('administrador') || is('tesorero');
      case 'view_reportes':           return is('administrador') || is('tesorero') || is('apoderado');
      case 'admin_panel':             return is('administrador');
      case 'carga_masiva':            return is('administrador');
      case 'gestion_usuarios':        return is('administrador');
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
      case 'apoderado/historial':     return is('apoderado');
      case 'tesorero/dashboard':
      case 'tesorero/alumnos':        return is('tesorero');
      default: return false;
    }
  };

  // ... resto igual
  return {
    hasPermission,
    canAccessPage,
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
      if (is('apoderado')) pages.push('apoderado/dashboard','apoderado/pagos','apoderado/historial');
      if (is('tesorero'))  pages.push('tesorero/dashboard','tesorero/alumnos');
      return pages;
    },

    // shortcuts
    canViewAlumnos: () => hasPermission('view_alumnos'),
    canEditAlumnos: () => hasPermission('edit_alumnos'),
    canViewCobros:  () => hasPermission('view_cobros'),
    canEditCobros:  () => hasPermission('edit_cobros'),
    canViewGastos:  () => hasPermission('view_gastos'),
    canEditGastos:  () => hasPermission('edit_gastos'),
    canViewDeudas:  () => hasPermission('view_deudas'),
    canEditDeudas:  () => hasPermission('edit_deudas'),
    canAccessAdmin: () => hasPermission('admin_panel'),
  };
};
