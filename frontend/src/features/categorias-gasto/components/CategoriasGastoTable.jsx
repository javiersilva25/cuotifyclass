import { useState } from 'react';
import React, { useMemo } from 'react';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  BarChart3,
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
import { BookOpen } from 'lucide-react';
import { Zap, Users, Wrench, UtensilsCrossed } from 'lucide-react';

// Función para formatear montos
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para obtener el color del tipo
const getTipoColor = (tipo) => {
  const colors = {
    'Educativo': 'bg-blue-100 text-blue-700 border-blue-200',
    'Operacional': 'bg-green-100 text-green-700 border-green-200',
    'Personal': 'bg-purple-100 text-purple-700 border-purple-200',
    'Mantenimiento': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Bienestar': 'bg-red-100 text-red-700 border-red-200',
    'Transporte': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Función para calcular porcentaje de ejecución
const getEjecucionPercentage = (gasto, presupuesto) => {
  return presupuesto > 0 ? (gasto / presupuesto) * 100 : 0;
};

// Función para obtener color de ejecución
const getEjecucionColor = (percentage) => {
  if (percentage > 100) return 'text-red-600';
  if (percentage > 90) return 'text-yellow-600';
  if (percentage > 75) return 'text-blue-600';
  return 'text-green-600';
};

// Función para obtener ícono dinámico
const getIconComponent = (iconName) => {
  const icons = {
    BookOpen: () => <BookOpen className="w-4 h-4" />,
    Book: () => <Book className="w-4 h-4" />,
    Palette: () => <Palette className="w-4 h-4" />,
    Zap: () => <Zap className="w-4 h-4" />,
    Droplets: () => <Droplets className="w-4 h-4" />,
    Wifi: () => <Wifi className="w-4 h-4" />,
    Users: () => <Users className="w-4 h-4" />,
    GraduationCap: () => <GraduationCap className="w-4 h-4" />,
    Briefcase: () => <Briefcase className="w-4 h-4" />,
    Wrench: () => <Wrench className="w-4 h-4" />,
    UtensilsCrossed: () => <UtensilsCrossed className="w-4 h-4" />,
    Bus: () => <Bus className="w-4 h-4" />,
    Tag: () => <Tag className="w-4 h-4" />,
  };
  
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent /> : <Tag className="w-4 h-4" />;
};

// Componente para filtros avanzados
function CategoriasGastoFilters({ filters, onFilterChange, onReset, tipos = [] }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Nombre, código, tipo..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo
            </label>
            <Select
              value={filters.tipo}
              onValueChange={(value) => onFilterChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
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
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nivel */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nivel
            </label>
            <Select
              value={filters.nivel}
              onValueChange={(value) => onFilterChange('nivel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="padre">Categorías Padre</SelectItem>
                <SelectItem value="hijo">Subcategorías</SelectItem>
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
                  <SelectItem value="tipo">Tipo</SelectItem>
                  <SelectItem value="presupuesto_mensual">Presupuesto</SelectItem>
                  <SelectItem value="gasto_actual">Gasto Actual</SelectItem>
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

// Componente para detalles de la categoría
function CategoriaDetails({ categoria, isOpen, onClose }) {
  if (!categoria) return null;

  const ejecucionPercentage = getEjecucionPercentage(categoria.gasto_actual, categoria.presupuesto_mensual);
  const disponible = categoria.presupuesto_mensual - categoria.gasto_actual;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: categoria.color + '20', color: categoria.color }}
            >
              {getIconComponent(categoria.icono)}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{categoria.nombre}</h3>
              <p className="text-gray-600">{categoria.codigo}</p>
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
              <div>
                <p className="text-sm text-gray-600">Descripción</p>
                <p className="font-medium">{categoria.descripcion}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <Badge variant="outline" className={getTipoColor(categoria.tipo)}>
                  {categoria.tipo}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Nivel</p>
                <div className="flex items-center space-x-2">
                  {categoria.nivel === 0 ? (
                    <>
                      <Folder className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Categoría Principal</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Subcategoría</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <Badge variant={categoria.activo ? "default" : "secondary"}>
                  {categoria.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Información Financiera */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 border-b pb-2">
              Información Financiera
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Presupuesto Mensual</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(categoria.presupuesto_mensual)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Gasto Actual</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(categoria.gasto_actual)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Ejecución Presupuestaria</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ejecutado</span>
                    <span className={getEjecucionColor(ejecucionPercentage)}>
                      {ejecucionPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(ejecucionPercentage, 100)} 
                    className="h-2"
                  />
                  {ejecucionPercentage > 100 && (
                    <div className="flex items-center space-x-1 text-red-600 text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Presupuesto excedido</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={cn(
                "p-3 rounded-lg",
                disponible >= 0 ? "bg-green-50" : "bg-red-50"
              )}>
                <p className={cn(
                  "text-sm font-medium",
                  disponible >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {disponible >= 0 ? 'Disponible' : 'Excedido'}
                </p>
                <p className={cn(
                  "text-lg font-bold",
                  disponible >= 0 ? "text-green-700" : "text-red-700"
                )}>
                  {formatCurrency(Math.abs(disponible))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para fila de categoría con jerarquía
function CategoriaRow({ 
  categoria, 
  nivel = 0, 
  isExpanded, 
  onToggleExpand, 
  hasChildren,
  onViewDetails,
  onEdit,
  onDelete,
  onRestore,
}) {
  const ejecucionPercentage = getEjecucionPercentage(categoria.gasto_actual, categoria.presupuesto_mensual);
  const disponible = categoria.presupuesto_mensual - categoria.gasto_actual;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group hover:bg-gray-50"
    >
      <TableCell>
        <div className="flex items-center space-x-2" style={{ paddingLeft: `${nivel * 20}px` }}>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(categoria.id)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          
          <div 
            className="p-1.5 rounded flex items-center justify-center"
            style={{ backgroundColor: categoria.color + '20', color: categoria.color }}
          >
            {getIconComponent(categoria.icono)}
          </div>
          
          <div>
            <p className="font-medium text-gray-900">
              {categoria.nombre}
            </p>
            <p className="text-sm text-gray-500">
              {categoria.codigo}
            </p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className={getTipoColor(categoria.tipo)}>
          {categoria.tipo}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(categoria.presupuesto_mensual)}
          </p>
          <p className="text-xs text-gray-500">
            Presupuesto
          </p>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(categoria.gasto_actual)}
          </p>
          <p className="text-xs text-gray-500">
            Ejecutado
          </p>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-medium", getEjecucionColor(ejecucionPercentage))}>
              {ejecucionPercentage.toFixed(1)}%
            </span>
            {ejecucionPercentage > 100 && (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>
          <Progress 
            value={Math.min(ejecucionPercentage, 100)} 
            className="h-1"
          />
        </div>
      </TableCell>
      
      <TableCell>
        <div className={cn(
          "text-sm font-medium",
          disponible >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {disponible >= 0 ? '+' : ''}{formatCurrency(disponible)}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant={categoria.activo ? "default" : "secondary"}>
          {categoria.activo ? 'Activo' : 'Inactivo'}
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
            <DropdownMenuItem onClick={() => onViewDetails(categoria)}>
              <Eye className="w-4 h-4 mr-2" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(categoria)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categoria.activo ? (
              <DropdownMenuItem 
                onClick={() => onDelete(categoria.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Desactivar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onRestore(categoria.id)}
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
}

// Componente principal de la tabla
export function CategoriasGastoTable({
  categorias = [],
  isLoading = false,
  filters,
  onFilterChange,
  onResetFilters,
  onCreateCategoria,
  onEditCategoria,
  onDeleteCategoria,
  onRestoreCategoria,
  onRefresh,
  className,
  ...props
}) {
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Obtener tipos únicos para el filtro
  const tipos = [...new Set(categorias.map(c => c.tipo))].sort();

  // Organizar categorías jerárquicamente
  const hierarchicalCategorias = useMemo(() => {
    const categoriasPadre = categorias.filter(c => c.nivel === 0);
    
    return categoriasPadre.map(padre => ({
      ...padre,
      hijos: categorias
        .filter(c => c.categoria_padre_id === padre.id)
        .sort((a, b) => a.orden - b.orden),
    })).sort((a, b) => a.orden - b.orden);
  }, [categorias]);

  const handleViewDetails = (categoria) => {
    setSelectedCategoria(categoria);
    setShowDetails(true);
  };

  const handleToggleExpand = (categoriaId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoriaId)) {
        newSet.delete(categoriaId);
      } else {
        newSet.add(categoriaId);
      }
      return newSet;
    });
  };

  const renderCategoriaRows = (categoria, nivel = 0) => {
    const isExpanded = expandedCategories.has(categoria.id);
    const hasChildren = categoria.hijos && categoria.hijos.length > 0;
    
    const rows = [
      <CategoriaRow
        key={categoria.id}
        categoria={categoria}
        nivel={nivel}
        isExpanded={isExpanded}
        onToggleExpand={handleToggleExpand}
        hasChildren={hasChildren}
        onViewDetails={handleViewDetails}
        onEdit={onEditCategoria}
        onDelete={onDeleteCategoria}
        onRestore={onRestoreCategoria}
      />
    ];

    if (isExpanded && hasChildren) {
      categoria.hijos.forEach(hijo => {
        rows.push(
          <CategoriaRow
            key={hijo.id}
            categoria={hijo}
            nivel={nivel + 1}
            isExpanded={false}
            onToggleExpand={handleToggleExpand}
            hasChildren={false}
            onViewDetails={handleViewDetails}
            onEdit={onEditCategoria}
            onDelete={onDeleteCategoria}
            onRestore={onRestoreCategoria}
          />
        );
      });
    }

    return rows;
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

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Filtros */}
      <CategoriasGastoFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        tipos={tipos}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestión de Categorías de Gasto</CardTitle>
              <CardDescription>
                Administra las categorías y subcategorías de gastos
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
              
              <Button onClick={onCreateCategoria}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando categorías...</span>
            </div>
          ) : categorias.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay categorías registradas
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando la primera categoría de gasto
              </p>
              <Button onClick={onCreateCategoria}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Categoría
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
                    <TableHead>Categoría</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Gasto Actual</TableHead>
                    <TableHead>Ejecución</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {hierarchicalCategorias.map((categoria) => 
                      renderCategoriaRows(categoria)
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <CategoriaDetails
        categoria={selectedCategoria}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}

export default CategoriasGastoTable;

