/**
 * Gestión de Usuarios v7.0
 * Sistema completo de gestión de personas con RUT y roles múltiples
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  UserPlus, 
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { validarRut, formatearRut, limpiarRut } from '../../utils/rutValidator';
import { API_ENDPOINTS, buildUrl, getAuthHeaders } from '../../config/api';

const GestionUsuarios = () => {
  const { user, isAdmin } = useAuth();
  
  // Estados principales
  const [personas, setPersonas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Estados de formulario
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [personaEditando, setPersonaEditando] = useState(null);
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    comuna: '',
    provincia: '',
    region: '',
    roles: []
  });
  const [erroresFormulario, setErroresFormulario] = useState({});
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [elementosPorPagina] = useState(20);

  // Cargar datos iniciales
  useEffect(() => {
    if (isAdmin) {
      cargarDatos();
    }
  }, [isAdmin, paginaActual, busqueda, filtroRol, filtroEstado]);

  // Cargar personas y roles
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [personasResponse, rolesResponse] = await Promise.all([
        fetch(buildUrl(API_ENDPOINTS.PERSONAS.BUSCAR, {
          page: paginaActual,
          limit: elementosPorPagina,
          search: busqueda,
          rol: filtroRol !== 'todos' ? filtroRol : undefined,
          estado: filtroEstado !== 'todos' ? filtroEstado : undefined
        }), {
          headers: getAuthHeaders()
        }),
        fetch(buildUrl(API_ENDPOINTS.ROLES.BASE), {
          headers: getAuthHeaders()
        })
      ]);

      if (personasResponse.ok && rolesResponse.ok) {
        const personasData = await personasResponse.json();
        const rolesData = await rolesResponse.json();
        
        setPersonas(personasData.data || []);
        setTotalPaginas(personasData.totalPages || 1);
        setRoles(rolesData.data || []);
      } else {
        throw new Error('Error cargando datos');
      }
    } catch (err) {
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (campo, valor) => {
    if (campo === 'rut') {
      const rutFormateado = formatearRut(valor);
      setFormData(prev => ({ ...prev, [campo]: rutFormateado }));
      
      // Validar RUT
      const rutLimpio = limpiarRut(valor);
      if (rutLimpio && !validarRut(rutLimpio)) {
        setErroresFormulario(prev => ({ ...prev, rut: 'RUT inválido' }));
      } else {
        setErroresFormulario(prev => ({ ...prev, rut: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [campo]: valor }));
    }
  };

  // Manejar cambios en roles
  const handleRolChange = (rolId, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, rolId]
        : prev.roles.filter(id => id !== rolId)
    }));
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};
    
    if (!formData.rut || !validarRut(limpiarRut(formData.rut))) {
      errores.rut = 'RUT válido es requerido';
    }
    
    if (!formData.nombres.trim()) {
      errores.nombres = 'Nombres son requeridos';
    }
    
    if (!formData.apellidoPaterno.trim()) {
      errores.apellidoPaterno = 'Apellido paterno es requerido';
    }
    
    if (!formData.email.trim()) {
      errores.email = 'Email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errores.email = 'Email inválido';
    }
    
    if (formData.roles.length === 0) {
      errores.roles = 'Debe asignar al menos un rol';
    }
    
    setErroresFormulario(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar persona
  const guardarPersona = async () => {
    if (!validarFormulario()) return;
    
    setLoading(true);
    try {
      const endpoint = personaEditando 
        ? API_ENDPOINTS.PERSONAS.BY_RUT(limpiarRut(personaEditando.rut))
        : API_ENDPOINTS.PERSONAS.CREAR;
      
      const method = personaEditando ? 'PUT' : 'POST';
      
      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          rut: limpiarRut(formData.rut)
        })
      });
      
      if (response.ok) {
        setMostrarFormulario(false);
        setPersonaEditando(null);
        resetFormulario();
        cargarDatos();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error guardando persona');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar persona
  const eliminarPersona = async (rut) => {
    if (!confirm('¿Está seguro de eliminar esta persona?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.PERSONAS.BY_RUT(rut)), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        cargarDatos();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error eliminando persona');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetFormulario = () => {
    setFormData({
      rut: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      direccion: '',
      comuna: '',
      provincia: '',
      region: '',
      roles: []
    });
    setErroresFormulario({});
  };

  // Abrir formulario para editar
  const editarPersona = (persona) => {
    setPersonaEditando(persona);
    setFormData({
      rut: formatearRut(persona.rut),
      nombres: persona.nombres || '',
      apellidoPaterno: persona.apellidoPaterno || '',
      apellidoMaterno: persona.apellidoMaterno || '',
      email: persona.email || '',
      telefono: persona.telefono || '',
      fechaNacimiento: persona.fechaNacimiento || '',
      direccion: persona.direccion || '',
      comuna: persona.comuna || '',
      provincia: persona.provincia || '',
      region: persona.region || '',
      roles: persona.roles?.map(r => r.id) || []
    });
    setMostrarFormulario(true);
  };

  // Abrir formulario para crear
  const crearPersona = () => {
    setPersonaEditando(null);
    resetFormulario();
    setMostrarFormulario(true);
  };

  // Filtrar personas
  const personasFiltradas = personas.filter(persona => {
    const coincideBusqueda = !busqueda || 
      persona.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      persona.apellidoPaterno?.toLowerCase().includes(busqueda.toLowerCase()) ||
      persona.apellidoMaterno?.toLowerCase().includes(busqueda.toLowerCase()) ||
      persona.rut?.includes(busqueda) ||
      persona.email?.toLowerCase().includes(busqueda.toLowerCase());
    
    return coincideBusqueda;
  });

  // Obtener color del badge según rol
  const getColorRol = (rol) => {
    switch (rol.toLowerCase()) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'profesor': return 'bg-blue-100 text-blue-800';
      case 'tesorero': return 'bg-purple-100 text-purple-800';
      case 'apoderado': return 'bg-green-100 text-green-800';
      case 'alumno': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tiene permisos para acceder a esta sección.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Sistema v7.0 - RUT y roles múltiples</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={crearPersona} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Nueva Persona
          </Button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="busqueda">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="busqueda"
                  placeholder="RUT, nombre, email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filtroRol">Filtrar por Rol</Label>
              <Select value={filtroRol} onValueChange={setFiltroRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {roles.map(rol => (
                    <SelectItem key={rol.id} value={rol.codigo}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filtroEstado">Estado</Label>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de personas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Personas Registradas ({personasFiltradas.length})
          </CardTitle>
        </CardHeader>
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
                {personasFiltradas.map((persona) => (
                  <TableRow key={persona.rut}>
                    <TableCell className="font-mono">
                      {formatearRut(persona.rut)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {persona.nombres} {persona.apellidoPaterno} {persona.apellidoMaterno}
                        </div>
                        {persona.telefono && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {persona.telefono}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {persona.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {persona.roles?.map((rol) => (
                          <Badge 
                            key={rol.id} 
                            variant="secondary"
                            className={getColorRol(rol.nombre)}
                          >
                            {rol.nombre}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={persona.activo ? "default" : "secondary"}>
                        {persona.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editarPersona(persona)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => eliminarPersona(persona.rut)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de formulario */}
      <Dialog open={mostrarFormulario} onOpenChange={setMostrarFormulario}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {personaEditando ? 'Editar Persona' : 'Nueva Persona'}
            </DialogTitle>
            <DialogDescription>
              Complete la información de la persona y asigne los roles correspondientes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Información personal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rut">RUT *</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleFormChange('rut', e.target.value)}
                  placeholder="12.345.678-9"
                  maxLength="12"
                  className={erroresFormulario.rut ? 'border-red-300' : ''}
                />
                {erroresFormulario.rut && (
                  <p className="text-xs text-red-600 mt-1">{erroresFormulario.rut}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="usuario@email.com"
                  className={erroresFormulario.email ? 'border-red-300' : ''}
                />
                {erroresFormulario.email && (
                  <p className="text-xs text-red-600 mt-1">{erroresFormulario.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  value={formData.nombres}
                  onChange={(e) => handleFormChange('nombres', e.target.value)}
                  placeholder="Juan Carlos"
                  className={erroresFormulario.nombres ? 'border-red-300' : ''}
                />
                {erroresFormulario.nombres && (
                  <p className="text-xs text-red-600 mt-1">{erroresFormulario.nombres}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="apellidoPaterno">Apellido Paterno *</Label>
                <Input
                  id="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={(e) => handleFormChange('apellidoPaterno', e.target.value)}
                  placeholder="Pérez"
                  className={erroresFormulario.apellidoPaterno ? 'border-red-300' : ''}
                />
                {erroresFormulario.apellidoPaterno && (
                  <p className="text-xs text-red-600 mt-1">{erroresFormulario.apellidoPaterno}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
                <Input
                  id="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={(e) => handleFormChange('apellidoMaterno', e.target.value)}
                  placeholder="González"
                />
              </div>
              
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleFormChange('telefono', e.target.value)}
                  placeholder="+56 9 1234 5678"
                />
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
                    <Label htmlFor={`rol-${rol.id}`} className="text-sm">
                      {rol.nombre}
                    </Label>
                  </div>
                ))}
              </div>
              {erroresFormulario.roles && (
                <p className="text-xs text-red-600 mt-1">{erroresFormulario.roles}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={guardarPersona}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GestionUsuarios;

