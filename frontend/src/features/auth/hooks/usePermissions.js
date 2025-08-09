/**
 * Hook de permisos para el sistema v8.0
 * Maneja verificación de permisos y roles
 */

import { useAuth } from './useAuth';

export const usePermissions = () => {
  const auth = useAuth();

  // Roles normalizados a string en minúsculas
  const userRoles = (auth.user?.roles || [])
    .map(r =>
      typeof r === 'string'
        ? r
        : (r.nombre_rol || r.nombre || r.codigo || r.role || '')
    )
    .filter(Boolean)
    .map(s => s.toLowerCase());

  const hasPermission = (permission) => {
    if (!auth.isAuthenticated || !auth.user) return false;

    // Administradores tienen todos los permisos
    if (auth.isAdmin || userRoles.includes('administrador')) return true;

    switch (permission) {
      case 'view_alumnos':
        return userRoles.includes('administrador') || userRoles.includes('profesor') || userRoles.includes('tesorero');
      case 'edit_alumnos':
        return userRoles.includes('administrador') || userRoles.includes('profesor');

      case 'view_cursos':
        return userRoles.includes('administrador') || userRoles.includes('profesor') || userRoles.includes('tesorero');
      case 'edit_cursos':
        return userRoles.includes('administrador');

      case 'view_cobros':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');
      case 'edit_cobros':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');

      case 'view_gastos':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');
      case 'edit_gastos':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');

      case 'view_categorias_gasto':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');
      case 'edit_categorias_gasto':
        return userRoles.includes('administrador');

      case 'view_movimientos':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');
      case 'edit_movimientos':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');

      case 'view_deudas':
        return userRoles.includes('administrador') || userRoles.includes('tesorero') || userRoles.includes('apoderado');
      case 'edit_deudas':
        return userRoles.includes('administrador') || userRoles.includes('tesorero');

      case 'view_reportes':
        return userRoles.includes('administrador') || userRoles.includes('tesorero') || userRoles.includes('apoderado');

      case 'admin_panel':
      case 'carga_masiva':
      case 'gestion_usuarios':
        return userRoles.includes('administrador');

      default:
        return false;
    }
  };

  const canAccessPage = (page) => {
    if (!auth.isAuthenticated) return false;

    switch (page) {
      case 'dashboard':
        return true;

      case 'alumnos':
        return hasPermission('view_alumnos');
      case 'cursos':
        return hasPermission('view_cursos');
      case 'cobros':
        return hasPermission('view_cobros');
      case 'gastos':
        return hasPermission('view_gastos');
      case 'categorias-gasto':
        return hasPermission('view_categorias_gasto');
      case 'movimientos-ccaa':
      case 'movimientos-ccpp':
        return hasPermission('view_movimientos');
      case 'deudas-alumno':
      case 'deudas-companero':
        return hasPermission('view_deudas');

      case 'admin/carga-masiva':
        return hasPermission('carga_masiva');
      case 'admin/gestion-usuarios':
        return hasPermission('gestion_usuarios');

      case 'apoderado/dashboard':
      case 'apoderado/pagos':
      case 'apoderado/historial':
        return auth.isApoderado || userRoles.includes('apoderado');

      case 'tesorero/dashboard':
      case 'tesorero/alumnos':
        return auth.isTesorero || userRoles.includes('tesorero');

      default:
        return false;
    }
  };

  const canPerformAction = (action, resource = null) => {
    if (!auth.isAuthenticated) return false;
    if (auth.isAdmin || userRoles.includes('administrador')) return true;

    // Guard para evitar edit_null/view_null
    if (!resource) return false;

    switch (action) {
      case 'create':
      case 'update':
      case 'delete':
        return hasPermission(`edit_${resource}`);
      case 'view':
        return hasPermission(`view_${resource}`);
      default:
        return false;
    }
  };

  const getAccessiblePages = () => {
    if (!auth.isAuthenticated) return [];

    const pages = ['dashboard'];

    if (hasPermission('view_alumnos')) pages.push('alumnos');
    if (hasPermission('view_cursos')) pages.push('cursos');
    if (hasPermission('view_cobros')) pages.push('cobros');
    if (hasPermission('view_gastos')) pages.push('gastos');
    if (hasPermission('view_categorias_gasto')) pages.push('categorias-gasto');
    if (hasPermission('view_movimientos')) {
      pages.push('movimientos-ccaa', 'movimientos-ccpp');
    }
    if (hasPermission('view_deudas')) {
      pages.push('deudas-alumno', 'deudas-companero');
    }
    if (hasPermission('carga_masiva')) pages.push('admin/carga-masiva');
    if (hasPermission('gestion_usuarios')) pages.push('admin/gestion-usuarios');

    if (auth.isApoderado || userRoles.includes('apoderado')) {
      pages.push('apoderado/dashboard', 'apoderado/pagos', 'apoderado/historial');
    }
    if (auth.isTesorero || userRoles.includes('tesorero')) {
      pages.push('tesorero/dashboard', 'tesorero/alumnos');
    }

    return pages;
  };

  return {
    hasPermission,
    canAccessPage,
    canPerformAction,
    getAccessiblePages,
    // Shortcuts
    canViewAlumnos: () => hasPermission('view_alumnos'),
    canEditAlumnos: () => hasPermission('edit_alumnos'),
    canViewCobros: () => hasPermission('view_cobros'),
    canEditCobros: () => hasPermission('edit_cobros'),
    canViewGastos: () => hasPermission('view_gastos'),
    canEditGastos: () => hasPermission('edit_gastos'),
    canViewDeudas: () => hasPermission('view_deudas'),
    canEditDeudas: () => hasPermission('edit_deudas'),
    canAccessAdmin: () => hasPermission('admin_panel'),
  };
};

export default usePermissions;
