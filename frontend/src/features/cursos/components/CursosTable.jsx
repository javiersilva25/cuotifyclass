// src/features/cursos/components/CursosTable.jsx
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye,
  RefreshCw, SortAsc, SortDesc, GraduationCap, Calendar, User, BadgeIcon as _Badge
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { cn } from '../../../lib/utils';

// ---------- Helpers ----------
const nivelChipClass = (nombre) => {
  const map = {
    'Preescolar': 'bg-pink-100 text-pink-700 border-pink-200',
    'Básica': 'bg-blue-100 text-blue-700 border-blue-200',
    'Media': 'bg-green-100 text-green-700 border-green-200',
    'Especial': 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return map[nombre] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// ---------- Filtros ----------
function CursosFilters({ filters, onFilterChange, onReset, niveles = [], anios = [] }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Nombre del curso..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nivel</label>
            <Select
              value={filters.nivelId ?? '__all__'}
              onValueChange={(v) => onFilterChange('nivelId', v === '__all__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los niveles</SelectItem>
                {niveles.map(n => (
                  <SelectItem key={n.id} value={String(n.id)}>
                    {n.nombre_nivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Año escolar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Año escolar</label>
            <Select
              value={filters.anio ?? '__all__'}
              onValueChange={(v) => onFilterChange('anio', v === '__all__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los años" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                {anios.map(a => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={onReset}>Limpiar filtros</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Detalle ----------
function CursoDetails({ curso, isOpen, onClose }) {
  if (!curso) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{curso.nombre_curso}</h3>
              <p className="text-gray-600">
                {curso.nivel_nombre ?? `Nivel ID ${curso.nivel_id}`}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Año escolar: {curso.ano_escolar}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Profesor</p>
              <p className="font-medium">{curso.profesor_nombre ?? (curso.profesor_id ? `ID ${curso.profesor_id}` : '—')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Tabla principal ----------
export function CursosTable({
  cursos = [],
  isLoading = false,
  nivelesCatalogo = [],            // [{id, nombre_nivel}]
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

  // Niveles y años disponibles (para filtros)
  const niveles = useMemo(() => {
    if (nivelesCatalogo?.length) return nivelesCatalogo;
    // Derivar desde datos si no viene catálogo
    const map = new Map();
    cursos.forEach(c => {
      if (c.nivel_id && (c.nivel_nombre || c.nombre_nivel)) {
        map.set(c.nivel_id, { id: c.nivel_id, nombre_nivel: c.nivel_nombre || c.nombre_nivel });
      }
    });
    return Array.from(map.values());
  }, [nivelesCatalogo, cursos]);

  const anios = useMemo(() => {
    const s = new Set(cursos.map(c => c.ano_escolar).filter(Boolean));
    return Array.from(s).sort((a,b) => Number(b) - Number(a));
  }, [cursos]);

  const handleViewDetails = (curso) => {
    setSelectedCurso(curso);
    setShowDetails(true);
  };

  const tableVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const rowVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      <CursosFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        niveles={niveles}
        anios={anios}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestión de Cursos</CardTitle>
              <CardDescription>Administra los cursos del establecimiento</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
              </Button>
              <Button onClick={onCreateCurso}>
                <Plus className="w-4 h-4 mr-2" /> Nuevo Curso
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos registrados</h3>
              <p className="text-gray-600 mb-4">Agrega el primer curso para comenzar</p>
              <Button onClick={onCreateCurso}><Plus className="w-4 h-4 mr-2" /> Agregar Curso</Button>
            </div>
          ) : (
            <motion.div variants={tableVariants} initial="hidden" animate="visible">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {cursos.map((c) => (
                      <motion.tr key={c.id} variants={rowVariants} initial="hidden" animate="visible" exit="hidden" className="group hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-medium text-gray-900">{c.nombre_curso}</p>
                              <p className="text-xs text-gray-500">ID: {c.id}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className={nivelChipClass(c.nivel_nombre)}>
                            {c.nivel_nombre ?? `Nivel ID ${c.nivel_id}`}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {c.ano_escolar}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-sm">{c.profesor_nombre ?? (c.profesor_id ? `ID ${c.profesor_id}` : '—')}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(c)}>
                                <Eye className="w-4 h-4 mr-2" /> Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditCurso(c)}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {c.activo ? (
                                <DropdownMenuItem onClick={() => onDeleteCurso(c.id)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Desactivar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => onRestoreCurso(c.id)} className="text-green-600">
                                  <RefreshCw className="w-4 h-4 mr-2" /> Reactivar
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

      <CursoDetails curso={selectedCurso} isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </div>
  );
}

export default CursosTable;
