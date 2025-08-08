import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Eye, 
  Edit, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Calendar,
  FileText,
  Building,
  Receipt,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  CreditCard,
  Download,
  Phone,
  Mail,
  Ban,
  Paperclip,
  Tag,
  User,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Checkbox } from '../../../components/ui/checkbox';
import { cn } from '../../../lib/utils';

// Categorías mock para filtros
const CATEGORIAS_MOCK = [
  { id: 1, nombre: 'Material Escolar', color: '#3B82F6' },
  { id: 2, nombre: 'Mantención', color: '#F59E0B' },
  { id: 3, nombre: 'Servicios Básicos', color: '#10B981' },
  { id: 4, nombre: 'Alimentación', color: '#EF4444' },
  { id: 5, nombre: 'Deportes', color: '#8B5CF6' },
  { id: 6, nombre: 'Limpieza', color: '#06B6D4' },
];

// Componente para el badge de estado
function EstadoBadge({ estado, fechaVencimiento }) {
  const getEstadoConfig = (estado, fechaVencimiento) => {
    const today = new Date().toISOString().split('T')[0];
    const isVencido = fechaVencimiento < today && estado !== 'Pagado';
    
    const configs = {
      'Registrado': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        text: isVencido ? 'Registrado (Vencido)' : 'Registrado',
      },
      'Aprobado': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: CheckCircle,
        text: isVencido ? 'Aprobado (Vencido)' : 'Aprobado',
      },
      'Pagado': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Check,
        text: 'Pagado',
      },
      'Rechazado': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Ban,
        text: 'Rechazado',
      },
    };
    return configs[estado] || configs['Registrado'];
  };

  const config = getEstadoConfig(estado, fechaVencimiento);
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center space-x-1", config.color)}>
      <IconComponent className="w-3 h-3" />
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
}

// Componente para mostrar información del proveedor
function ProveedorCard({ proveedor, rutProveedor, contacto, telefono }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Building className="w-4 h-4 text-gray-500" />
        <div>
          <p className="font-medium text-gray-900 text-sm">{proveedor}</p>
          <p className="text-xs text-gray-500">RUT: {rutProveedor}</p>
        </div>
      </div>
      
      {(contacto || telefono) && (
        <div className="space-y-1 pl-6">
          {contacto && (
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-600">{contacto}</p>
            </div>
          )}
          {telefono && (
            <div className="flex items-center space-x-1">
              <Phone className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-600">{telefono}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar información del documento
function DocumentoCard({ tipoDocumento, numeroDocumento, archivoAdjunto }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Receipt className="w-4 h-4 text-gray-500" />
        <div>
          <p className="font-medium text-gray-900 text-sm">{tipoDocumento}</p>
          <p className="text-xs text-gray-500">N° {numeroDocumento}</p>
        </div>
      </div>
      
      {archivoAdjunto && (
        <div className="pl-6">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
            onClick={() => window.open(archivoAdjunto, '_blank')}
          >
            <Paperclip className="w-3 h-3 mr-1" />
            Ver Archivo
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente principal de la tabla
export function GastosTable({
  gastos = [],
  categorias = CATEGORIAS_MOCK,
  isLoading = false,
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  onCreateGasto = () => {},
  onEditGasto = () => {},
  onAprobarGasto = () => {},
  onRechazarGasto = () => {},
  onMarcarPagado = () => {},
  onDeleteGasto = () => {},
  onRefresh = () => {},
  ESTADOS_GASTO = {},
  TIPOS_DOCUMENTO = [],
}) {
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  // Función para calcular días hasta vencimiento
  const getDiasVencimiento = (fechaVencimiento) => {
    const today = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (column) => {
    if (filters.orderBy !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return filters.orderDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  // Función para manejar ordenamiento
  const handleSort = (column) => {
    if (filters.orderBy === column) {
      onFilterChange('orderDirection', filters.orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onFilterChange('orderBy', column);
      onFilterChange('orderDirection', 'desc');
    }
  };

  // Función para ver detalles
  const handleViewDetails = (gasto) => {
    setSelectedGasto(gasto);
    setShowDetails(true);
  };

  // Función para manejar acciones
  const handleAction = (action, gasto) => {
    switch (action) {
      case 'edit':
        onEditGasto(gasto);
        break;
      case 'aprobar':
        const aprobadoPor = prompt('Ingresa tu nombre para aprobar:');
        if (aprobadoPor) {
          onAprobarGasto(gasto.id, aprobadoPor);
        }
        break;
      case 'rechazar':
        const motivo = prompt('Ingresa el motivo del rechazo:');
        if (motivo) {
          onRechazarGasto(gasto.id, motivo);
        }
        break;
      case 'pagar':
        const metodoPago = prompt('¿Cómo se realizó el pago?', 'Transferencia Bancaria');
        if (metodoPago) {
          onMarcarPagado(gasto.id, metodoPago);
        }
        break;
      case 'delete':
        if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
          onDeleteGasto(gasto.id);
        }
        break;
      default:
        break;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header con controles */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Gastos Operacionales</span>
                </CardTitle>
                <CardDescription>
                  Gestión de gastos, proveedores y documentos
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(showFilters && "bg-blue-50 border-blue-200")}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                  Actualizar
                </Button>
                
                <Button onClick={onCreateGasto} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Panel de filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Búsqueda */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Concepto, proveedor, documento..."
                          value={filters.search || ''}
                          onChange={(e) => onFilterChange('search', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={filters.estado || '__all__'}
                        onValueChange={(value) => onFilterChange('estado', value === '__all__' ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todos los estados</SelectItem> {/* ✅ corregido */}
                          {Object.values(ESTADOS_GASTO).map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select
                        value={filters.categoria_id || '__all__'}
                        onValueChange={(value) => onFilterChange('categoria_id', value === '__all__' ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todas las categorías</SelectItem>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: categoria.color }}
                                />
                                <span>{categoria.nombre}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de documento */}
                    <div className="space-y-2">
                      <Label>Tipo de Documento</Label>
                      <Select
                        value={filters.tipo_documento || '__all__'}
                        onValueChange={(value) => onFilterChange('tipo_documento', value === '__all__' ? null : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todos los tipos</SelectItem>
                          {TIPOS_DOCUMENTO.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Proveedor */}
                    <div className="space-y-2">
                      <Label htmlFor="proveedor">Proveedor</Label>
                      <Input
                        id="proveedor"
                        placeholder="Nombre del proveedor"
                        value={filters.proveedor || ''}
                        onChange={(e) => onFilterChange('proveedor', e.target.value)}
                      />
                    </div>

                    {/* Fecha desde */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_desde">Fecha Desde</Label>
                      <Input
                        id="fecha_desde"
                        type="date"
                        value={filters.fecha_desde || ''}
                        onChange={(e) => onFilterChange('fecha_desde', e.target.value)}
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
                      <Input
                        id="fecha_hasta"
                        type="date"
                        value={filters.fecha_hasta || ''}
                        onChange={(e) => onFilterChange('fecha_hasta', e.target.value)}
                      />
                    </div>

                    {/* Monto mínimo */}
                    <div className="space-y-2">
                      <Label htmlFor="monto_min">Monto Mínimo</Label>
                      <Input
                        id="monto_min"
                        type="number"
                        placeholder="0"
                        value={filters.monto_min || ''}
                        onChange={(e) => onFilterChange('monto_min', e.target.value)}
                      />
                    </div>

                    {/* Monto máximo */}
                    <div className="space-y-2">
                      <Label htmlFor="monto_max">Monto Máximo</Label>
                      <Input
                        id="monto_max"
                        type="number"
                        placeholder="Sin límite"
                        value={filters.monto_max || ''}
                        onChange={(e) => onFilterChange('monto_max', e.target.value)}
                      />
                    </div>

                    {/* Checkbox solo vencidos */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="solo_vencidos"
                          checked={filters.solo_vencidos || false}
                          onCheckedChange={(checked) => onFilterChange('solo_vencidos', checked)}
                        />
                        <Label htmlFor="solo_vencidos" className="text-sm">
                          Solo vencidos
                        </Label>
                      </div>
                    </div>

                    {/* Checkbox solo sin aprobar */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="solo_sin_aprobar"
                          checked={filters.solo_sin_aprobar || false}
                          onCheckedChange={(checked) => onFilterChange('solo_sin_aprobar', checked)}
                        />
                        <Label htmlFor="solo_sin_aprobar" className="text-sm">
                          Solo sin aprobar
                        </Label>
                      </div>
                    </div>

                    {/* Botón reset */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={onResetFilters}
                        className="w-full"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Tabla */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('concepto')}
                    >
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>Concepto</span>
                        {getSortIcon('concepto')}
                      </div>
                    </TableHead>
                    
                    <TableHead>Proveedor</TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('monto')}
                    >
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Monto</span>
                        {getSortIcon('monto')}
                      </div>
                    </TableHead>
                    
                    <TableHead>Documento</TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('fecha_gasto')}
                    >
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Fecha Gasto</span>
                        {getSortIcon('fecha_gasto')}
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('fecha_vencimiento')}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Vencimiento</span>
                        {getSortIcon('fecha_vencimiento')}
                      </div>
                    </TableHead>
                    
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  <AnimatePresence>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Cargando gastos...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : gastos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-gray-500">
                            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron gastos</p>
                            <p className="text-sm">Intenta ajustar los filtros</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      gastos.map((gasto, index) => {
                        const diasVencimiento = getDiasVencimiento(gasto.fecha_vencimiento);
                        const isVencido = diasVencimiento < 0 && gasto.estado !== 'Pagado';
                        const categoria = categorias.find(c => c.id === gasto.categoria_id);
                        
                        return (
                          <motion.tr
                            key={gasto.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "hover:bg-gray-50",
                              isVencido && "bg-red-50"
                            )}
                          >
                            <TableCell className="w-80">
                              <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                  {categoria && (
                                    <div 
                                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                                      style={{ backgroundColor: categoria.color }}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 line-clamp-1">
                                      {gasto.concepto}
                                    </p>
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                      {gasto.descripcion}
                                    </p>
                                    {categoria && (
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {categoria.nombre}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="w-64">
                              <ProveedorCard
                                proveedor={gasto.proveedor}
                                rutProveedor={gasto.rut_proveedor}
                                contacto={gasto.contacto_proveedor}
                                telefono={gasto.telefono_proveedor}
                              />
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-bold text-gray-900">
                                  {formatCurrency(gasto.monto)}
                                </p>
                                {gasto.metodo_pago && (
                                  <div className="flex items-center space-x-1">
                                    <CreditCard className="w-3 h-3 text-green-600" />
                                    <p className="text-xs text-green-600">
                                      {gasto.metodo_pago}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell className="w-48">
                              <DocumentoCard
                                tipoDocumento={gasto.tipo_documento}
                                numeroDocumento={gasto.numero_documento}
                                archivoAdjunto={gasto.archivo_adjunto}
                              />
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {formatDate(gasto.fecha_gasto)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Por: {gasto.creado_por}
                                </p>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">
                                  {formatDate(gasto.fecha_vencimiento)}
                                </p>
                                {isVencido ? (
                                  <p className="text-xs text-red-600 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {Math.abs(diasVencimiento)} días vencido
                                  </p>
                                ) : diasVencimiento <= 7 && gasto.estado !== 'Pagado' ? (
                                  <p className="text-xs text-orange-600 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Vence en {diasVencimiento} días
                                  </p>
                                ) : null}
                                {gasto.fecha_pago && (
                                  <p className="text-xs text-green-600">
                                    Pagado: {formatDate(gasto.fecha_pago)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <EstadoBadge 
                                estado={gasto.estado} 
                                fechaVencimiento={gasto.fecha_vencimiento}
                              />
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(gasto)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem onClick={() => handleAction('edit', gasto)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    
                                    {gasto.estado === 'Registrado' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleAction('aprobar', gasto)}>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Aprobar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAction('rechazar', gasto)}>
                                          <Ban className="w-4 h-4 mr-2" />
                                          Rechazar
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    
                                    {gasto.estado === 'Aprobado' && (
                                      <DropdownMenuItem onClick={() => handleAction('pagar', gasto)}>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Marcar como Pagado
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {gasto.archivo_adjunto && (
                                      <DropdownMenuItem onClick={() => window.open(gasto.archivo_adjunto, '_blank')}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar Archivo
                                      </DropdownMenuItem>
                                    )}
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleAction('delete', gasto)}
                                      className="text-red-600"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Detalles del Gasto</span>
            </DialogTitle>
            <DialogDescription>
              Información completa del gasto seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedGasto && (
            <div className="space-y-6">
              {/* Información principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Información del Gasto</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Concepto</p>
                      <p className="font-medium">{selectedGasto.concepto}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Descripción</p>
                      <p className="font-medium text-sm">{selectedGasto.descripcion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Categoría</p>
                      <div className="flex items-center space-x-2">
                        {categorias.find(c => c.id === selectedGasto.categoria_id) && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categorias.find(c => c.id === selectedGasto.categoria_id).color }}
                          />
                        )}
                        <Badge variant="outline">{selectedGasto.categoria_nombre}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <EstadoBadge 
                        estado={selectedGasto.estado} 
                        fechaVencimiento={selectedGasto.fecha_vencimiento}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Información financiera */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Información Financiera</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Monto</p>
                      <p className="font-bold text-lg">{formatCurrency(selectedGasto.monto)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Gasto</p>
                      <p className="font-medium">{formatDate(selectedGasto.fecha_gasto)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                      <p className="font-medium">{formatDate(selectedGasto.fecha_vencimiento)}</p>
                    </div>
                    {selectedGasto.fecha_pago && (
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Pago</p>
                        <p className="font-medium text-green-600">
                          {formatDate(selectedGasto.fecha_pago)}
                        </p>
                      </div>
                    )}
                    {selectedGasto.metodo_pago && (
                      <div>
                        <p className="text-sm text-gray-600">Método de Pago</p>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {selectedGasto.metodo_pago}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Información del proveedor */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Información del Proveedor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProveedorCard
                    proveedor={selectedGasto.proveedor}
                    rutProveedor={selectedGasto.rut_proveedor}
                    contacto={selectedGasto.contacto_proveedor}
                    telefono={selectedGasto.telefono_proveedor}
                  />
                </CardContent>
              </Card>

              {/* Información del documento */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Receipt className="w-4 h-4" />
                    <span>Información del Documento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentoCard
                    tipoDocumento={selectedGasto.tipo_documento}
                    numeroDocumento={selectedGasto.numero_documento}
                    archivoAdjunto={selectedGasto.archivo_adjunto}
                  />
                </CardContent>
              </Card>

              {/* Observaciones */}
              {selectedGasto.observaciones && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Observaciones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {selectedGasto.observaciones}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Información de auditoría */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Información de Auditoría</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Creado por</p>
                      <p className="font-medium">{selectedGasto.creado_por}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha de creación</p>
                      <p className="font-medium">{formatDate(selectedGasto.fecha_creacion)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Última actualización</p>
                      <p className="font-medium">{formatDate(selectedGasto.fecha_actualizacion)}</p>
                    </div>
                    {selectedGasto.aprobado_por && (
                      <div>
                        <p className="text-gray-600">Aprobado por</p>
                        <p className="font-medium text-green-600">{selectedGasto.aprobado_por}</p>
                      </div>
                    )}
                    {selectedGasto.fecha_aprobacion && (
                      <div>
                        <p className="text-gray-600">Fecha de aprobación</p>
                        <p className="font-medium text-green-600">
                          {formatDate(selectedGasto.fecha_aprobacion)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default GastosTable;

