import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { cn } from '../../../lib/utils';

// Función para obtener iniciales
const getInitials = (nombre, apellido) => {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
};

// Función para formatear fecha
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-CL');
};

// Función para calcular edad
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Componente para filtros avanzados
function AlumnosFilters({ filters, onFilterChange, onReset, cursos = [] }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Nombre, RUT, email..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Curso
            </label>
            <Select
              value={filters.curso || '__all__'}
              onValueChange={(value) => onFilterChange('curso', value === '__all__' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso} value={curso}>
                    {curso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Estado
            </label>
            <Select
              value={filters.estado}
              onValueChange={(value) => onFilterChange('estado', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenamiento */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Ordenar por
            </label>
            <div className="flex space-x-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => onFilterChange('sortBy', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Nombre</SelectItem>
                  <SelectItem value="apellido">Apellido</SelectItem>
                  <SelectItem value="curso">Curso</SelectItem>
                  <SelectItem value="fecha_matricula">Fecha Matrícula</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onReset} size="sm">
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para detalles del alumno
function AlumnoDetails({ alumno, isOpen, onClose }) {
  if (!alumno) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={alumno.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(alumno.nombre, alumno.apellido)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">
                {alumno.nombre} {alumno.apellido}
              </h3>
              <p className="text-gray-600">{alumno.curso}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">
              Información Personal
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">RUT</p>
                  <p className="font-medium">{alumno.rut}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {formatDate(alumno.fecha_nacimiento)} ({calculateAge(alumno.fecha_nacimiento)} años)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{alumno.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{alumno.telefono}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">{alumno.direccion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Académica y Apoderado */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">
              Información Académica
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Curso</p>
                  <p className="font-medium">{alumno.curso}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Matrícula</p>
                  <p className="font-medium">{formatDate(alumno.fecha_matricula)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <Badge variant={alumno.activo ? "default" : "secondary"}>
                  {alumno.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 border-b pb-2 mt-6">
              Información del Apoderado
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium">{alumno.apoderado_nombre}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{alumno.apoderado_telefono}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{alumno.apoderado_email}</p>
              </div>
            </div>

            {alumno.observaciones && (
              <>
                <h4 className="font-semibold text-gray-900 border-b pb-2 mt-6">
                  Observaciones
                </h4>
                <p className="text-gray-700">{alumno.observaciones}</p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente principal de la tabla
export function AlumnosTable({
  alumnos = [],
  isLoading = false,
  filters,
  onFilterChange,
  onResetFilters,
  onCreateAlumno,
  onEditAlumno,
  onDeleteAlumno,
  onRestoreAlumno,
  onRefresh,
  className,
  ...props
}) {
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Obtener cursos únicos para el filtro
  const cursos = [...new Set(alumnos.map(a => a.curso))].sort();

  const handleViewDetails = (alumno) => {
    setSelectedAlumno(alumno);
    setShowDetails(true);
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Filtros */}
      <AlumnosFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        cursos={cursos}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestión de Alumnos</CardTitle>
              <CardDescription>
                Administra la información de los estudiantes
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              
              <Button onClick={onCreateAlumno}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Alumno
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando alumnos...</span>
            </div>
          ) : alumnos.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay alumnos registrados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando el primer alumno al sistema
              </p>
              <Button onClick={onCreateAlumno}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Alumno
              </Button>
            </div>
          ) : (
            <motion.div
              variants={tableVariants}
              initial="hidden"
              animate="visible"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Apoderado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {alumnos.map((alumno) => (
                      <motion.tr
                        key={alumno.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="group hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={alumno.avatar} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(alumno.nombre, alumno.apellido)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">
                                {alumno.nombre} {alumno.apellido}
                              </p>
                              <p className="text-sm text-gray-500">
                                {calculateAge(alumno.fecha_nacimiento)} años
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-mono text-sm">
                            {alumno.rut}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline">
                            {alumno.curso}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600 truncate max-w-32">
                                {alumno.email}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">
                                {alumno.telefono}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {alumno.apoderado_nombre}
                            </p>
                            <p className="text-xs text-gray-500">
                              {alumno.apoderado_telefono}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={alumno.activo ? "default" : "secondary"}>
                            {alumno.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(alumno)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditAlumno(alumno)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {alumno.activo ? (
                                <DropdownMenuItem 
                                  onClick={() => onDeleteAlumno(alumno.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Desactivar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => onRestoreAlumno(alumno.id)}
                                  className="text-green-600"
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Reactivar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <AlumnoDetails
        alumno={selectedAlumno}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}

export default AlumnosTable;

