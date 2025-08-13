// src/features/alumnos/components/AlumnosTable.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye, RefreshCw, SortAsc, SortDesc, User, Calendar, GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { cn } from '../../../lib/utils';

// util
const getInitials = (nombreCompleto = '') =>
  nombreCompleto.split(' ').slice(0, 2).map(p => p[0] || '').join('').toUpperCase();

const formatDate = (s) => (s ? new Date(s).toLocaleDateString('es-CL') : '—');

function AlumnosFilters({ filters, onFilterChange, onReset, cursos = [] }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" /> Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Nombre del alumno..."
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Curso</label>
            <Select
              value={String(filters.curso_id ?? '__all__')}
              onValueChange={(v) => onFilterChange('curso_id', v === '__all__' ? null : Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los cursos</SelectItem>
                {cursos.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre_curso || `Curso ${c.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ordenar por</label>
            <div className="flex gap-2">
              <Select
                value={filters.sortBy || 'nombre_completo'}
                onValueChange={(v) => onFilterChange('sortBy', v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre_completo">Nombre</SelectItem>
                  <SelectItem value="fecha_nacimiento">Fecha Nacimiento</SelectItem>
                  <SelectItem value="curso_id">Curso</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange('sortOrder', (filters.sortOrder || 'asc') === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {(filters.sortOrder || 'asc') === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onReset} size="sm">Limpiar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AlumnoDetails({ alumno, isOpen, onClose, cursoById }) {
  if (!alumno) return null;
  const curso = cursoById?.[alumno.curso_id];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(alumno.nombre_completo)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{alumno.nombre_completo}</h3>
              <p className="text-gray-600">
                {curso?.nombre_curso || `Curso ${alumno.curso_id}`}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>Detalle del alumno</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Fecha de nacimiento</p>
              <p className="font-medium">{formatDate(alumno.fecha_nacimiento)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Curso</p>
              <p className="font-medium">{curso?.nombre_curso || `ID ${alumno.curso_id}`}</p>
            </div>
          </div>

          <Alert className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              apoderado_id: <b>{alumno.apoderado_id ?? '—'}</b> · usuario_id: <b>{alumno.usuario_id ?? '—'}</b>
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AlumnosTable({
  alumnos = [],
  cursos = [],                 // [{id, nombre_curso}]
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

  const cursoById = Object.fromEntries((cursos || []).map(c => [c.id, c]));

  const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const rowVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      <AlumnosFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        cursos={cursos}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestión de Alumnos</CardTitle>
              <CardDescription>Administra los alumnos del curso</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
              </Button>
              <Button onClick={onCreateAlumno}>
                <Plus className="w-4 h-4 mr-2" /> Nuevo Alumno
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alumnos registrados</h3>
              <p className="text-gray-600 mb-4">Agrega el primer alumno al sistema</p>
              <Button onClick={onCreateAlumno}><Plus className="w-4 h-4 mr-2" /> Agregar Alumno</Button>
            </div>
          ) : (
            <motion.div variants={tableVariants} initial="hidden" animate="visible">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Fecha Nacimiento</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Apoderado ID</TableHead>
                    <TableHead>Usuario ID</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {alumnos.map(a => (
                      <motion.tr
                        key={a.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="group hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {getInitials(a.nombre_completo)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{a.nombre_completo}</span>
                              <span className="text-xs text-gray-500">ID: {a.id}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{formatDate(a.fecha_nacimiento)}</TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {cursoById[a.curso_id]?.nombre_curso || `Curso ${a.curso_id}`}
                          </Badge>
                        </TableCell>

                        <TableCell>{a.apoderado_id ?? '—'}</TableCell>
                        <TableCell>{a.usuario_id ?? '—'}</TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelectedAlumno(a); setShowDetails(true); }}>
                                <Eye className="w-4 h-4 mr-2" /> Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditAlumno?.(a)}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onDeleteAlumno?.(a.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
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

      <AlumnoDetails
        alumno={selectedAlumno}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        cursoById={cursoById}
      />
    </div>
  );
}
