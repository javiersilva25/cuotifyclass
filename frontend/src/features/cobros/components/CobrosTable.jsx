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
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Users,
  Receipt,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
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
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('es-CL');
};

// Función para obtener el color del estado
const getEstadoColor = (estado) => {
  const colors = {
    'Pendiente': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Pagado': 'bg-green-100 text-green-700 border-green-200',
    'Vencido': 'bg-red-100 text-red-700 border-red-200',
    'Por Vencer': 'bg-blue-100 text-blue-700 border-blue-200',
    'Cancelado': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Función para obtener el ícono del estado
const getEstadoIcon = (estado) => {
  const icons = {
    'Pendiente': Clock,
    'Pagado': CheckCircle,
    'Vencido': AlertTriangle,
    'Por Vencer': Calendar,
    'Cancelado': XCircle,
  };
  return icons[estado] || Clock;
};

// Función para obtener el color del tipo de cobro
const getTipoColor = (tipo) => {
  const colors = {
    'General': 'bg-purple-100 text-purple-700 border-purple-200',
    'Alumno': 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// Función para calcular días hasta vencimiento
const getDiasVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Componente para filtros avanzados
function CobrosFilters({ filters, onFilterChange, onReset, categorias = [], metodosPago = [] }) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Concepto, alumno, comprobante..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Estado
            </label>
            <Select
              value={filters.estado}
              onValueChange={(value) =>
                onFilterChange('estado', value === '__todos__' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__todos__">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Pagado">Pagado</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
                <SelectItem value="Por Vencer">Por Vencer</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Cobro */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo
            </label>
            <Select
              value={filters.tipo_cobro}
              onValueChange={(value) =>
                onFilterChange('tipo_cobro', value === '__todos__' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__todos__">Todos los tipos</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Alumno">Por Alumno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Categoría
            </label>
            <Select
              value={filters.categoria}
              onValueChange={(value) =>
                onFilterChange('categoria', value === '__todos__' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__todas__">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Método de Pago */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Método de Pago
            </label>
            <Select
              value={filters.metodo_pago}
              onValueChange={(value) =>
                onFilterChange('metodo_pago', value === '__todos__' ? undefined : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los métodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__todos__">Todos los métodos</SelectItem>
                {metodosPago.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha Desde
            </label>
            <Input
              type="date"
              value={filters.fecha_desde}
              onChange={(e) => onFilterChange('fecha_desde', e.target.value)}
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha Hasta
            </label>
            <Input
              type="date"
              value={filters.fecha_hasta}
              onChange={(e) => onFilterChange('fecha_hasta', e.target.value)}
            />
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
                  <SelectItem value="fecha_emision">Fecha Emisión</SelectItem>
                  <SelectItem value="fecha_vencimiento">Fecha Vencimiento</SelectItem>
                  <SelectItem value="concepto">Concepto</SelectItem>
                  <SelectItem value="monto">Monto</SelectItem>
                  <SelectItem value="estado">Estado</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monto Mínimo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Monto Mínimo
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                placeholder="0"
                value={filters.monto_min}
                onChange={(e) => onFilterChange('monto_min', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Monto Máximo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Monto Máximo
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="number"
                placeholder="999999999"
                value={filters.monto_max}
                onChange={(e) => onFilterChange('monto_max', e.target.value)}
                className="pl-10"
              />
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

// Componente para detalles del cobro
function CobroDetails({ cobro, isOpen, onClose }) {
  if (!cobro) return null;

  const diasVencimiento = getDiasVencimiento(cobro.fecha_vencimiento);
  const EstadoIcon = getEstadoIcon(cobro.estado);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg flex items-center justify-center",
              getEstadoColor(cobro.estado)
            )}>
              <EstadoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{cobro.concepto}</h3>
              <p className="text-gray-600">{cobro.numero_comprobante}</p>
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
                <p className="font-medium">{cobro.descripcion}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tipo de Cobro</p>
                <Badge variant="outline" className={getTipoColor(cobro.tipo_cobro)}>
                  {cobro.tipo_cobro === 'Alumno' ? (
                    <><User className="w-3 h-3 mr-1" /> Por Alumno</>
                  ) : (
                    <><Users className="w-3 h-3 mr-1" /> General</>
                  )}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600">Categoría</p>
                <p className="font-medium">{cobro.categoria}</p>
              </div>

              {cobro.alumno_nombre && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Alumno</p>
                    <p className="font-medium">{cobro.alumno_nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Apoderado</p>
                    <p className="font-medium">{cobro.apoderado_nombre}</p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Estado</p>
                <Badge variant="outline" className={getEstadoColor(cobro.estado)}>
                  <EstadoIcon className="w-3 h-3 mr-1" />
                  {cobro.estado}
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
                <p className="text-sm text-gray-600">Monto Original</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(cobro.monto)}
                </p>
              </div>

              {cobro.descuento > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Descuento</p>
                  <p className="text-lg font-bold text-green-600">
                    -{formatCurrency(cobro.descuento)}
                  </p>
                </div>
              )}

              {cobro.recargo > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Recargo</p>
                  <p className="text-lg font-bold text-red-600">
                    +{formatCurrency(cobro.recargo)}
                  </p>
                </div>
              )}

              {cobro.estado === 'Pagado' && (
                <div>
                  <p className="text-sm text-gray-600">Monto Pagado</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(cobro.monto_pagado)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Fecha de Emisión</p>
                <p className="font-medium">{formatDate(cobro.fecha_emision)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{formatDate(cobro.fecha_vencimiento)}</p>
                  {diasVencimiento !== null && cobro.estado !== 'Pagado' && cobro.estado !== 'Cancelado' && (
                    <Badge variant={diasVencimiento < 0 ? "destructive" : diasVencimiento <= 3 ? "secondary" : "outline"}>
                      {diasVencimiento < 0 ? `${Math.abs(diasVencimiento)} días vencido` : 
                       diasVencimiento === 0 ? 'Vence hoy' :
                       `${diasVencimiento} días restantes`}
                    </Badge>
                  )}
                </div>
              </div>

              {cobro.fecha_pago && (
                <div>
                  <p className="text-sm text-gray-600">Fecha de Pago</p>
                  <p className="font-medium">{formatDate(cobro.fecha_pago)}</p>
                </div>
              )}

              {cobro.metodo_pago && (
                <div>
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <p className="font-medium">{cobro.metodo_pago}</p>
                  </div>
                </div>
              )}

              {cobro.observaciones && (
                <div>
                  <p className="text-sm text-gray-600">Observaciones</p>
                  <p className="font-medium text-gray-800">{cobro.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente principal de la tabla
export function CobrosTable({
  cobros = [],
  isLoading = false,
  filters,
  onFilterChange,
  onResetFilters,
  onCreateCobro,
  onEditCobro,
  onMarcarPagado,
  onCancelarCobro,
  onReactivarCobro,
  onRefresh,
  className,
  ...props
}) {
  const [selectedCobro, setSelectedCobro] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Obtener valores únicos para filtros
  const categorias = [...new Set(cobros.map(c => c.categoria))].sort();
  const metodosPago = [...new Set(cobros.filter(c => c.metodo_pago).map(c => c.metodo_pago))].sort();

  const handleViewDetails = (cobro) => {
    setSelectedCobro(cobro);
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

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Filtros */}
      <CobrosFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        categorias={categorias}
        metodosPago={metodosPago}
      />

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Gestión de Cobros</CardTitle>
              <CardDescription>
                Administra todos los cobros generales y por alumno
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
              
              <Button onClick={onCreateCobro}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cobro
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando cobros...</span>
            </div>
          ) : cobros.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay cobros registrados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando el primer cobro
              </p>
              <Button onClick={onCreateCobro}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cobro
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
                    <TableHead>Concepto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Alumno/General</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Método Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {cobros.map((cobro) => {
                      const diasVencimiento = getDiasVencimiento(cobro.fecha_vencimiento);
                      const EstadoIcon = getEstadoIcon(cobro.estado);
                      
                      return (
                        <motion.tr
                          key={cobro.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="group hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {cobro.concepto}
                              </p>
                              <p className="text-sm text-gray-500">
                                {cobro.numero_comprobante}
                              </p>
                              <p className="text-xs text-gray-400">
                                {cobro.categoria}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline" className={getTipoColor(cobro.tipo_cobro)}>
                              {cobro.tipo_cobro === 'Alumno' ? (
                                <><User className="w-3 h-3 mr-1" /> Alumno</>
                              ) : (
                                <><Users className="w-3 h-3 mr-1" /> General</>
                              )}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            {cobro.alumno_nombre ? (
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {cobro.alumno_nombre}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {cobro.apoderado_nombre}
                                </p>
                              </div>
                            ) : (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                Cobro General
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-gray-900">
                                {formatCurrency(cobro.monto)}
                              </p>
                              {cobro.estado === 'Pagado' && (
                                <p className="text-xs text-green-600">
                                  Pagado: {formatCurrency(cobro.monto_pagado)}
                                </p>
                              )}
                              {(cobro.descuento > 0 || cobro.recargo > 0) && (
                                <div className="text-xs">
                                  {cobro.descuento > 0 && (
                                    <span className="text-green-600">
                                      -{formatCurrency(cobro.descuento)}
                                    </span>
                                  )}
                                  {cobro.recargo > 0 && (
                                    <span className="text-red-600">
                                      +{formatCurrency(cobro.recargo)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline" className={getEstadoColor(cobro.estado)}>
                              <EstadoIcon className="w-3 h-3 mr-1" />
                              {cobro.estado}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {formatDate(cobro.fecha_vencimiento)}
                              </p>
                              {diasVencimiento !== null && cobro.estado !== 'Pagado' && cobro.estado !== 'Cancelado' && (
                                <Badge 
                                  variant={diasVencimiento < 0 ? "destructive" : diasVencimiento <= 3 ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  {diasVencimiento < 0 ? `${Math.abs(diasVencimiento)}d vencido` : 
                                   diasVencimiento === 0 ? 'Vence hoy' :
                                   `${diasVencimiento}d restantes`}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            {cobro.metodo_pago ? (
                              <div className="flex items-center space-x-1">
                                <CreditCard className="w-3 h-3 text-gray-500" />
                                <span className="text-sm">{cobro.metodo_pago}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
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
                                <DropdownMenuItem onClick={() => handleViewDetails(cobro)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onEditCobro(cobro)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {cobro.estado === 'Pendiente' || cobro.estado === 'Vencido' || cobro.estado === 'Por Vencer' ? (
                                  <DropdownMenuItem 
                                    onClick={() => onMarcarPagado(cobro)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Marcar como Pagado
                                  </DropdownMenuItem>
                                ) : null}
                                {cobro.estado !== 'Cancelado' && cobro.estado !== 'Pagado' ? (
                                  <DropdownMenuItem 
                                    onClick={() => onCancelarCobro(cobro.id)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                ) : null}
                                {cobro.estado === 'Cancelado' ? (
                                  <DropdownMenuItem 
                                    onClick={() => onReactivarCobro(cobro.id)}
                                    className="text-blue-600"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reactivar
                                  </DropdownMenuItem>
                                ) : null}
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
      <CobroDetails
        cobro={selectedCobro}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}

export default CobrosTable;

