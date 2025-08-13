// src/pages/GestionUsuarios.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, UserPlus, Users, Edit, Trash2, Mail, Phone, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Checkbox } from '../../components/ui/checkbox';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { validarRut, formatearRut, limpiarRut } from '../../utils/rutValidator';
import { API_ENDPOINTS, buildUrl, getAuthHeaders } from '../../config/api';
import Navbar from '../../pages/Navbar.jsx';

const GestionUsuarios = () => {
  const { isAdmin } = useAuth();

  // Estado
  const [personas, setPersonas] = useState([]);
  const [roles, setRoles] = useState([]); // {id, nombre, slug}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');      // guarda ID de rol o 'todos'
  const [filtroEstado, setFiltroEstado] = useState('todos');// 'activo' | 'inactivo' | 'todos'

  // Form
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [personaEditando, setPersonaEditando] = useState(null);
  const [formData, setFormData] = useState({
    rut: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '',
    email: '', telefono: '', fechaNacimiento: '', direccion: '',
    comuna: '', provincia: '', region: '', roles: []
  });
  const [erroresFormulario, setErroresFormulario] = useState({});

  // Paginación (si tu backend la usa)
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [elementosPorPagina] = useState(20);

  useEffect(() => {
    if (!isAdmin) return;
    cargarDatos();
  }, [isAdmin, paginaActual, busqueda, filtroRol, filtroEstado]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [personasResponse, rolesResponse] = await Promise.all([
        fetch(buildUrl(API_ENDPOINTS.PERSONAS.BUSCAR, {
          page: paginaActual,
          limit: elementosPorPagina,
          search: busqueda || undefined,
          // enviamos id; si el backend no filtra por esto, igual filtramos en cliente
          rol: filtroRol !== 'todos' ? filtroRol : undefined,
          estado: filtroEstado !== 'todos' ? filtroEstado : undefined,
        }), { headers: getAuthHeaders() }),
        fetch(buildUrl(API_ENDPOINTS.ROLES.BASE), { headers: getAuthHeaders() })
      ]);

      if (!personasResponse.ok || !rolesResponse.ok) throw new Error('Error cargando datos');

      const personasJson = await personasResponse.json();
      const rolesJson = await rolesResponse.json();

      setPersonas(personasJson?.data?.items || []);
      setTotalPaginas(personasJson?.data?.pages || 1);

      const rolesItems = rolesJson?.data?.items || [];
      setRoles(rolesItems.map(r => ({
        id: String(r.id),
        nombre: r.nombre_rol,
        slug: String(r.nombre_rol || '').toLowerCase()
      })));
    } catch (err) {
      setError('Error cargando datos: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (campo, valor) => {
    if (campo === 'rut') {
      const rutFormateado = formatearRut(valor);
      setFormData(prev => ({ ...prev, rut: rutFormateado }));
      const rutLimpio = limpiarRut(valor);
      setErroresFormulario(prev => ({
        ...prev,
        rut: rutLimpio && !validarRut(rutLimpio) ? 'RUT inválido' : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [campo]: valor }));
    }
  };

  const handleRolChange = (rolId, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: checked ? [...prev.roles, rolId] : prev.roles.filter(id => id !== rolId)
    }));
  };

  const validarFormulario = () => {
    const e = {};
    if (!formData.rut || !validarRut(limpiarRut(formData.rut))) e.rut = 'RUT válido es requerido';
    if (!formData.nombres.trim()) e.nombres = 'Nombres son requeridos';
    if (!formData.apellidoPaterno.trim()) e.apellidoPaterno = 'Apellido paterno es requerido';
    if (!formData.email.trim()) e.email = 'Email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email inválido';
    if (formData.roles.length === 0) e.roles = 'Debe asignar al menos un rol';
    setErroresFormulario(e);
    return Object.keys(e).length === 0;
  };

  const guardarPersona = async () => {
    if (!validarFormulario()) return;
    setLoading(true);
    setError('');
    try {
      const endpoint = personaEditando
        ? API_ENDPOINTS.PERSONAS.BY_RUT(limpiarRut(personaEditando.rut))
        : API_ENDPOINTS.PERSONAS.CREAR;
      const method = personaEditando ? 'PUT' : 'POST';

      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...formData, rut: limpiarRut(formData.rut) })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Error guardando persona');
      }

      setMostrarFormulario(false);
      setPersonaEditando(null);
      resetFormulario();
      cargarDatos();
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarPersona = async (rut) => {
    if (!confirm('¿Está seguro de eliminar esta persona?')) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.PERSONAS.BY_RUT(limpiarRut(rut))), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Error eliminando persona');
      }
      cargarDatos();
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFormulario = () => {
    setFormData({
      rut: '', nombres: '', apellidoPaterno: '', apellidoMaterno: '',
      email: '', telefono: '', fechaNacimiento: '', direccion: '',
      comuna: '', provincia: '', region: '', roles: []
    });
    setErroresFormulario({});
  };

  const editarPersona = (p) => {
    setPersonaEditando(p);
    setFormData({
      rut: formatearRut(p.rut),
      nombres: p.nombres || '',
      apellidoPaterno: p.apellidoPaterno || p.apellido_paterno || '',
      apellidoMaterno: p.apellidoMaterno || p.apellido_materno || '',
      email: p.email || '',
      telefono: p.telefono || '',
      fechaNacimiento: p.fechaNacimiento || p.fecha_nacimiento || '',
      direccion: p.direccion || '',
      comuna: p.comuna || '',
      provincia: p.provincia || '',
      region: p.region || '',
      roles: Array.isArray(p.roles) ? p.roles.map(r => String(r.id)) : []
    });
    setMostrarFormulario(true);
  };

  // ------- FILTRO EN CLIENTE: por rol y estado -------
  const selectedRoleId = useMemo(() => (filtroRol === 'todos' ? null : String(filtroRol)), [filtroRol]);
  const personasFiltradas = useMemo(() => {
    const q = (busqueda || '').toLowerCase();
    return (Array.isArray(personas) ? personas : []).filter(p => {
      // búsqueda
      const nombre = p.nombre_completo
        || `${p.nombres || ''} ${p.apellidoPaterno || p.apellido_paterno || ''} ${p.apellidoMaterno || p.apellido_materno || ''}`.trim();
      const coincideBusqueda =
        !q ||
        nombre.toLowerCase().includes(q) ||
        (p.rut || '').includes(busqueda) ||
        (p.email || '').toLowerCase().includes(q);

      // rol
      const coincideRol =
        !selectedRoleId
        || (Array.isArray(p.roles) && p.roles.some(r =>
             String(r.id) === selectedRoleId ||
             String(r.nombre || r.nombre_rol || '').toLowerCase() ===
               (roles.find(rr => rr.id === selectedRoleId)?.slug || '')
           ));

      // estado
      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activo' ? !!p.activo : !p.activo);

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }, [personas, roles, busqueda, selectedRoleId, filtroEstado]);

  const getColorRol = (rolNombre) => {
    const k = String(rolNombre || '').toLowerCase();
    switch (k) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'profesor':      return 'bg-blue-100 text-blue-800';
      case 'tesorero':      return 'bg-purple-100 text-purple-800';
      case 'apoderado':     return 'bg-green-100 text-green-800';
      case 'alumno':        return 'bg-yellow-100 text-yellow-800';
      default:              return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>No tiene permisos para acceder a esta sección.</AlertDescription></Alert>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Sistema v7.0 - RUT y roles múltiples</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => { setPersonaEditando(null); resetFormulario(); setMostrarFormulario(true); }} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" /> Nueva Persona
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input placeholder="RUT, nombre, email..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div>
                <Label>Filtrar por Rol</Label>
                <Select value={filtroRol} onValueChange={setFiltroRol}>
                  <SelectTrigger><SelectValue placeholder="Todos los roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los roles</SelectItem>
                    {roles.map(rol => (
                      <SelectItem key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado</Label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger><SelectValue placeholder="Todos los estados" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="activo">Activos</SelectItem>
                    <SelectItem value="inactivo">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end"><Button variant="outline" size="sm">Exportar</Button></div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader><CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2" /> Personas Registradas ({personasFiltradas.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personasFiltradas.map((p) => (
                    <TableRow key={p.rut}>
                      <TableCell className="font-mono">{formatearRut(p.rut)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {p.nombre_completo || `${p.nombres || ''} ${p.apellidoPaterno || p.apellido_paterno || ''} ${p.apellidoMaterno || p.apellido_materno || ''}`.trim()}
                        </div>
                        {p.telefono && <div className="text-sm text-gray-500 flex items-center"><Phone className="h-3 w-3 mr-1" />{p.telefono}</div>}
                      </TableCell>
                      <TableCell><div className="flex items-center"><Mail className="h-3 w-3 mr-1 text-gray-400" />{p.email}</div></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(p.roles)
                            ? p.roles
                            : typeof p.roles === 'string'
                              ? p.roles.split(',').map(n => ({ id: n.trim(), nombre: n.trim() }))
                              : []
                          ).map((r) => (
                            <Badge key={`${p.rut}-${r.id}`} variant="secondary" className={getColorRol(r.nombre || r.nombre_rol)}>
                              {r.nombre || r.nombre_rol}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={p.activo ? 'default' : 'secondary'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => editarPersona(p)}><Edit className="h-3 w-3" /></Button>
                          <Button variant="outline" size="sm" onClick={() => eliminarPersona(p.rut)} className="text-red-600 hover:text-red-700"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{personaEditando ? 'Editar Persona' : 'Nueva Persona'}</DialogTitle>
              <DialogDescription>Complete la información y asigne roles.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Campos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RUT *</Label>
                  <Input value={formData.rut} onChange={(e) => handleFormChange('rut', e.target.value)} placeholder="12.345.678-9" maxLength={12} className={erroresFormulario.rut ? 'border-red-300' : ''} />
                  {erroresFormulario.rut && <p className="text-xs text-red-600 mt-1">{erroresFormulario.rut}</p>}
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} placeholder="usuario@email.com" className={erroresFormulario.email ? 'border-red-300' : ''} />
                  {erroresFormulario.email && <p className="text-xs text-red-600 mt-1">{erroresFormulario.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombres *</Label>
                  <Input value={formData.nombres} onChange={(e) => handleFormChange('nombres', e.target.value)} placeholder="Juan Carlos" className={erroresFormulario.nombres ? 'border-red-300' : ''} />
                  {erroresFormulario.nombres && <p className="text-xs text-red-600 mt-1">{erroresFormulario.nombres}</p>}
                </div>
                <div>
                  <Label>Apellido Paterno *</Label>
                  <Input value={formData.apellidoPaterno} onChange={(e) => handleFormChange('apellidoPaterno', e.target.value)} placeholder="Pérez" className={erroresFormulario.apellidoPaterno ? 'border-red-300' : ''} />
                  {erroresFormulario.apellidoPaterno && <p className="text-xs text-red-600 mt-1">{erroresFormulario.apellidoPaterno}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Apellido Materno</Label>
                  <Input value={formData.apellidoMaterno} onChange={(e) => handleFormChange('apellidoMaterno', e.target.value)} placeholder="González" />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={formData.telefono} onChange={(e) => handleFormChange('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
                </div>
              </div>

              {/* Roles */}
              <div>
                <Label>Roles *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roles.map((rol) => (
                    <div key={rol.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rol-${rol.id}`}
                        checked={formData.roles.includes(rol.id)}
                        onCheckedChange={(checked) => handleRolChange(rol.id, checked)}
                      />
                      <Label htmlFor={`rol-${rol.id}`} className="text-sm">{rol.nombre}</Label>
                    </div>
                  ))}
                </div>
                {erroresFormulario.roles && <p className="text-xs text-red-600 mt-1">{erroresFormulario.roles}</p>}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setMostrarFormulario(false)}>Cancelar</Button>
                <Button onClick={guardarPersona} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

export default GestionUsuarios;
