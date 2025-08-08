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
  GraduationCap,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
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

// Función para formatear montos
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para formatear fechas
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-CL');
};

// Función para obtener el color del nivel
const getNivelColor = (nivel) => {
  const colors = {
    'Preescolar': 'bg-pink-100 text-pink-700 border-pink-200',
    'Básica': 'bg-blue-100 text-blue-700 border-blue-200',
    'Media': 'bg-green-100 text-green-700 border-green-200',
    'Especial': 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[nivel] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Función para calcular porcentaje de ocupación
const getOcupacionPercentage = (matriculados, capacidad) => {
  return capacidad > 0 ? (matriculados / capacidad) * 100 : 0;
};

// Función para obtener color de ocupación
const getOcupacionColor = (percentage) => {
  if (percentage >= 90) return 'text-red-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-green-600';
};

// Componente para filtros avanzados
function CursosFilters({ filters, onFilterChange, onReset, niveles = [] }) {
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
                placeholder="Nombre, profesor, aula..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nivel
            </label>
            <Select
              value={filters.nivel || '__all__'}
              onValueChange={(value) => onFilterChange('nivel', value === '__all__' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los niveles</SelectItem> {/* ✅ corregido */}
                {niveles.map((nivel) => (
                  <SelectItem key={nivel} value={nivel}>
                    {nivel}
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
                  <SelectItem value="nivel">Nivel</SelectItem>
                  <SelectItem value="capacidad_maxima">Capacidad</SelectItem>
                  <SelectItem value="alumnos_matriculados">Matriculados</SelectItem>
                  <SelectItem value="fecha_inicio">Fecha Inicio</SelectItem>
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

// Componente para detalles del curso
function CursoDetails({ curso, isOpen, onClose }) {
  if (!curso) return null;

  const ocupacionPercentage = getOcupacionPercentage(curso.alumnos_matriculados, curso.capacidad_maxima);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{curso.nombre}</h3>
              <p className="text-gray-600">{curso.nivel}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Información General */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">
              Información General
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Descripción</p>
                  <p className="font-medium">{curso.descripcion}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Profesor Principal</p>
                  <p className="font-medium">{curso.profesor_principal}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Aula</p>
                  <p className="font-medium">{curso.aula}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Período</p>
                  <p className="font-medium">
                    {formatDate(curso.fecha_inicio)} - {formatDate(curso.fecha_fin)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <Badge variant={curso.activo ? "default" : "secondary"}>
                  {curso.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información Académica y Horarios */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">
              Información Académica
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Capacidad</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">
                      {curso.alumnos_matriculados} / {curso.capacidad_maxima} alumnos
                    </p>
                  </div>
                  <Progress 
                    value={ocupacionPercentage} 
                    className="mt-1 h-2"
                  />
                  <p className={cn("text-xs mt-1", getOcupacionColor(ocupacionPercentage))}>
                    {ocupacionPercentage.toFixed(1)}% ocupado
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Horario</p>
                  <p className="font-medium">
                    {curso.horario_inicio} - {curso.horario_fin}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Días de Clase</p>
                <div className="flex flex-wrap gap-1">
                  {curso.dias_semana.map((dia) => (
                    <Badge key={dia} variant="outline" className="text-xs">
                      {dia}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 border-b pb-2 mt-6">
              Información Financiera
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Costo de Matrícula</p>
                  <p className="font-medium">{formatCurrency(curso.costo_matricula)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Costo Mensual</p>
                  <p className="font-medium">{formatCurrency(curso.costo_mensual)}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">
                  Ingresos Mensuales Estimados
                </p>
                <p className="text-lg font-bold text-blue-700">
                  {formatCurrency(curso.alumnos_matriculados * curso.costo_mensual)}
                </p>
              </div>
            </div>

            {curso.observaciones && (
              <>
                <h4 className="font-semibold text-gray-900 border-b pb-2 mt-6">
                  Observaciones
                </h4>
                <p className="text-gray-700">{curso.observaciones}</p>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente principal de la tabla
export function CursosTable({
  cursos = [],
  isLoading = false,
  filters,
  onFilterChange,
  onResetFilters,
  onCreateCurso,
  onEditCurso,
  onDeleteCurso,
  onRestoreCurso,
  onRefresh,
  className,
  ...props
}) {
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Obtener niveles únicos para el filtro
  const niveles = [...new Set(cursos.map(c => c.nivel))].sort();

  const handleViewDetails = (curso) => {
    setSelectedCurso(curso);
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
      <CursosFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        niveles={niveles}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestión de Cursos</CardTitle>
              <CardDescription>
                Administra los cursos y programas académicos
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
              
              <Button onClick={onCreateCurso}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Curso
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando cursos...</span>
            </div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay cursos registrados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando el primer curso al sistema
              </p>
              <Button onClick={onCreateCurso}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Curso
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
                    <TableHead>Curso</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Costos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {cursos.map((curso) => {
                      const ocupacionPercentage = getOcupacionPercentage(
                        curso.alumnos_matriculados, 
                        curso.capacidad_maxima
                      );
                      
                      return (
                        <motion.tr
                          key={curso.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="group hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {curso.nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                {curso.aula}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getNivelColor(curso.nivel)}
                            >
                              {curso.nivel}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {curso.profesor_principal}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-sm font-medium">
                                  {curso.alumnos_matriculados}/{curso.capacidad_maxima}
                                </span>
                              </div>
                              <Progress 
                                value={ocupacionPercentage} 
                                className="h-1"
                              />
                              <p className={cn(
                                "text-xs",
                                getOcupacionColor(ocupacionPercentage)
                              )}>
                                {ocupacionPercentage.toFixed(0)}%
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-600">
                                  {curso.horario_inicio} - {curso.horario_fin}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {curso.dias_semana.length} días/semana
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(curso.costo_mensual)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Matrícula: {formatCurrency(curso.costo_matricula)}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant={curso.activo ? "default" : "secondary"}>
                              {curso.activo ? 'Activo' : 'Inactivo'}
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
                                <DropdownMenuItem onClick={() => handleViewDetails(curso)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEditCurso(curso)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {curso.activo ? (
                                  <DropdownMenuItem 
                                    onClick={() => onDeleteCurso(curso.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Desactivar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => onRestoreCurso(curso.id)}
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
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <CursoDetails
        curso={selectedCurso}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}

export default CursosTable;

