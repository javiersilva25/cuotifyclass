/**
 * Hook de permisos para el sistema v8.0
 * Maneja verificación de permisos y roles
 */

import { useAuth } from './useAuth';

/**
 * Hook para verificar permisos específicos
 * @returns {object} Funciones de verificación de permisos
 */
export const usePermissions = () => {
  const auth = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permission - Permiso a verificar
   * @returns {boolean} True si tiene el permiso
   */
  const hasPermission = (permission) => {
    if (!auth.isAuthenticated || !auth.user) {
      return false;
    }

    // Administradores tienen todos los permisos
    if (auth.isAdmin) {
      return true;
    }

    // Verificar permisos específicos por rol
    const userRoles = auth.user.roles || [];
    
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
        return userRoles.includes('administrador');
      
      case 'carga_masiva':
        return userRoles.includes('administrador');
      
      case 'gestion_usuarios':
        return userRoles.includes('administrador');
      
      default:
        return false;
    }
  };

  /**
   * Verifica si el usuario puede acceder a una página específica
   * @param {string} page - Página a verificar
   * @returns {boolean} True si puede acceder
   */
  const canAccessPage = (page) => {
    if (!auth.isAuthenticated) {
      return false;
    }

    switch (page) {
      case 'dashboard':
        return true; // Todos los usuarios autenticados pueden ver el dashboard
      
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
        return auth.isApoderado;
      
      case 'tesorero/dashboard':
      case 'tesorero/alumnos':
        return auth.isTesorero;
      
      default:
        return false;
    }
  };

  /**
   * Verifica si el usuario puede realizar una acción específica
   * @param {string} action - Acción a verificar
   * @param {object} resource - Recurso sobre el que se realiza la acción
   * @returns {boolean} True si puede realizar la acción
   */
  const canPerformAction = (action, resource = null) => {
    if (!auth.isAuthenticated) {
      return false;
    }

    // Administradores pueden hacer todo
    if (auth.isAdmin) {
      return true;
    }

    switch (action) {
      case 'create':
        return hasPermission(`edit_${resource}`);
      
      case 'update':
        return hasPermission(`edit_${resource}`);
      
      case 'delete':
        return hasPermission(`edit_${resource}`);
      
      case 'view':
        return hasPermission(`view_${resource}`);
      
      default:
        return false;
    }
  };

  /**
   * Obtiene la lista de páginas accesibles para el usuario actual
   * @returns {string[]} Array de páginas accesibles
   */
  const getAccessiblePages = () => {
    if (!auth.isAuthenticated) {
      return [];
    }

    const pages = [];
    
    // Páginas comunes
    pages.push('dashboard');
    
    // Páginas según permisos
    if (hasPermission('view_alumnos')) pages.push('alumnos');
    if (hasPermission('view_cursos')) pages.push('cursos');
    if (hasPermission('view_cobros')) pages.push('cobros');
    if (hasPermission('view_gastos')) pages.push('gastos');
    if (hasPermission('view_categorias_gasto')) pages.push('categorias-gasto');
    if (hasPermission('view_movimientos')) {
      pages.push('movimientos-ccaa');
      pages.push('movimientos-ccpp');
    }
    if (hasPermission('view_deudas')) {
      pages.push('deudas-alumno');
      pages.push('deudas-companero');
    }
    
    // Páginas de administración
    if (hasPermission('carga_masiva')) pages.push('admin/carga-masiva');
    if (hasPermission('gestion_usuarios')) pages.push('admin/gestion-usuarios');
    
    // Páginas específicas por rol
    if (auth.isApoderado) {
      pages.push('apoderado/dashboard');
      pages.push('apoderado/pagos');
      pages.push('apoderado/historial');
    }
    
    if (auth.isTesorero) {
      pages.push('tesorero/dashboard');
      pages.push('tesorero/alumnos');
    }
    
    return pages;
  };

  return {
    hasPermission,
    canAccessPage,
    canPerformAction,
    getAccessiblePages,
    
    // Shortcuts para permisos comunes
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

