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
  User,
  Users,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  Ban,
  RotateCcw,
  Handshake,
  UserCheck,
  UserX,
  TrendingUp,
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

// Componente para el badge de estado
function EstadoBadge({ estado, diasVencido = 0 }) {
  const getEstadoConfig = (estado, diasVencido) => {
    const configs = {
      'Pendiente': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: diasVencido > 0 ? `Vencida (${diasVencido}d)` : 'Pendiente',
      },
      'Pagada': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Pagada',
      },
      'Vencida': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        text: `Vencida (${diasVencido}d)`,
      },
      'Cancelada': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Ban,
        text: 'Cancelada',
      },
    };
    return configs[estado] || configs['Pendiente'];
  };

  const config = getEstadoConfig(estado, diasVencido);
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center space-x-1", config.color)}>
      <IconComponent className="w-3 h-3" />
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
}

// Componente para mostrar la relación deudor-acreedor
function RelacionCard({ deudor, acreedor, monto, tipo }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {/* Deudor */}
      <div className="flex items-center space-x-2 flex-1">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <UserX className="w-4 h-4 text-red-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {deudor.nombre}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {deudor.curso}
          </p>
        </div>
      </div>

      {/* Flecha */}
      <div className="flex flex-col items-center space-y-1">
        <ArrowRightLeft className="w-4 h-4 text-gray-400" />
        <Badge variant="outline" className="text-xs px-1 py-0">
          {tipo}
        </Badge>
      </div>

      {/* Acreedor */}
      <div className="flex items-center space-x-2 flex-1">
        <div className="min-w-0 text-right">
          <p className="text-sm font-medium text-gray-900 truncate">
            {acreedor.nombre}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {acreedor.curso}
          </p>
        </div>
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-green-600" />
        </div>
      </div>
    </div>
  );
}

// Componente principal de la tabla
export function DeudaCompaneroTable({
  deudas = [],
  alumnos = [],
  isLoading = false,
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  onCreateDeuda = () => {},
  onEditDeuda = () => {},
  onMarcarPagada = () => {},
  onCancelarDeuda = () => {},
  onReactivarDeuda = () => {},
  onDeleteDeuda = () => {},
  onRefresh = () => {},
  ESTADOS_DEUDA_COMPANERO = {},
  TIPOS_DEUDA_COMPANERO = [],
}) {
  const [selectedDeuda, setSelectedDeuda] = useState(null);
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
  const handleViewDetails = (deuda) => {
    setSelectedDeuda(deuda);
    setShowDetails(true);
  };

  // Función para manejar acciones
  const handleAction = (action, deuda) => {
    switch (action) {
      case 'edit':
        onEditDeuda(deuda);
        break;
      case 'pagar':
        onMarcarPagada(deuda.id);
        break;
      case 'cancelar':
        const motivo = prompt('Ingresa el motivo de la cancelación:');
        if (motivo) {
          onCancelarDeuda(deuda.id, motivo);
        }
        break;
      case 'reactivar':
        onReactivarDeuda(deuda.id);
        break;
      case 'delete':
        if (confirm('¿Estás seguro de que deseas eliminar esta deuda?')) {
          onDeleteDeuda(deuda.id);
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
                  <Handshake className="w-5 h-5" />
                  <span>Deudas entre Compañeros</span>
                </CardTitle>
                <CardDescription>
                  Gestión de préstamos y deudas entre estudiantes
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
                
                <Button onClick={onCreateDeuda} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Deuda
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
                          placeholder="Concepto, deudor, acreedor..."
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
                        value={filters.estado || ''}
                        onValueChange={(value) => onFilterChange('estado', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los estados</SelectItem>
                          {Object.values(ESTADOS_DEUDA_COMPANERO).map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de deuda */}
                    <div className="space-y-2">
                      <Label>Tipo de Deuda</Label>
                      <Select
                        value={filters.tipo_deuda || ''}
                        onValueChange={(value) => onFilterChange('tipo_deuda', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los tipos</SelectItem>
                          {TIPOS_DEUDA_COMPANERO.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Deudor */}
                    <div className="space-y-2">
                      <Label>Deudor</Label>
                      <Select
                        value={filters.deudor_id || ''}
                        onValueChange={(value) => onFilterChange('deudor_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los deudores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los deudores</SelectItem>
                          {alumnos.map((alumno) => (
                            <SelectItem key={alumno.id} value={alumno.id.toString()}>
                              {alumno.nombre} - {alumno.curso}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Acreedor */}
                    <div className="space-y-2">
                      <Label>Acreedor</Label>
                      <Select
                        value={filters.acreedor_id || ''}
                        onValueChange={(value) => onFilterChange('acreedor_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los acreedores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los acreedores</SelectItem>
                          {alumnos.map((alumno) => (
                            <SelectItem key={alumno.id} value={alumno.id.toString()}>
                              {alumno.nombre} - {alumno.curso}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fecha desde */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_desde">Préstamo Desde</Label>
                      <Input
                        id="fecha_desde"
                        type="date"
                        value={filters.fecha_desde || ''}
                        onChange={(e) => onFilterChange('fecha_desde', e.target.value)}
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_hasta">Préstamo Hasta</Label>
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

                    {/* Checkbox solo vencidas */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="solo_vencidas"
                          checked={filters.solo_vencidas || false}
                          onCheckedChange={(checked) => onFilterChange('solo_vencidas', checked)}
                        />
                        <Label htmlFor="solo_vencidas" className="text-sm">
                          Solo vencidas
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
                    <TableHead>Relación</TableHead>
                    
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
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('fecha_prestamo')}
                    >
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Préstamo</span>
                        {getSortIcon('fecha_prestamo')}
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
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Cargando deudas entre compañeros...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : deudas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-gray-500">
                            <Handshake className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron deudas entre compañeros</p>
                            <p className="text-sm">Intenta ajustar los filtros</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      deudas.map((deuda, index) => (
                        <motion.tr
                          key={deuda.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="w-80">
                            <RelacionCard
                              deudor={{
                                nombre: deuda.deudor_nombre,
                                curso: deuda.deudor_curso,
                              }}
                              acreedor={{
                                nombre: deuda.acreedor_nombre,
                                curso: deuda.acreedor_curso,
                              }}
                              monto={deuda.monto}
                              tipo={deuda.tipo_deuda}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {deuda.concepto}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {deuda.descripcion}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {deuda.tipo_deuda}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-gray-900">
                                {formatCurrency(deuda.monto)}
                              </p>
                              {deuda.metodo_pago && (
                                <p className="text-xs text-green-600">
                                  Pagado: {deuda.metodo_pago}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {formatDate(deuda.fecha_prestamo)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Por: {deuda.creado_por}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {formatDate(deuda.fecha_vencimiento)}
                              </p>
                              {deuda.dias_vencido > 0 && (
                                <p className="text-xs text-red-600 flex items-center">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {deuda.dias_vencido} días vencida
                                </p>
                              )}
                              {deuda.fecha_pago && (
                                <p className="text-xs text-green-600">
                                  Pagado: {formatDate(deuda.fecha_pago)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <EstadoBadge 
                              estado={deuda.estado} 
                              diasVencido={deuda.dias_vencido}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(deuda)}
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
                                  
                                  <DropdownMenuItem onClick={() => handleAction('edit', deuda)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  
                                  {(deuda.estado === 'Pendiente' || deuda.estado === 'Vencida') && (
                                    <DropdownMenuItem onClick={() => handleAction('pagar', deuda)}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Marcar como Pagada
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {(deuda.estado === 'Pendiente' || deuda.estado === 'Vencida') && (
                                    <DropdownMenuItem onClick={() => handleAction('cancelar', deuda)}>
                                      <Ban className="w-4 h-4 mr-2" />
                                      Cancelar
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {deuda.estado === 'Cancelada' && (
                                    <DropdownMenuItem onClick={() => handleAction('reactivar', deuda)}>
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Reactivar
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleAction('delete', deuda)}
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
                      ))
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Handshake className="w-5 h-5" />
              <span>Detalles de la Deuda entre Compañeros</span>
            </DialogTitle>
            <DialogDescription>
              Información completa de la deuda seleccionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeuda && (
            <div className="space-y-6">
              {/* Relación principal */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Relación de Deuda</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RelacionCard
                    deudor={{
                      nombre: selectedDeuda.deudor_nombre,
                      curso: selectedDeuda.deudor_curso,
                    }}
                    acreedor={{
                      nombre: selectedDeuda.acreedor_nombre,
                      curso: selectedDeuda.acreedor_curso,
                    }}
                    monto={selectedDeuda.monto}
                    tipo={selectedDeuda.tipo_deuda}
                  />
                </CardContent>
              </Card>

              {/* Información de la deuda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Información de la Deuda</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Concepto</p>
                      <p className="font-medium">{selectedDeuda.concepto}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Descripción</p>
                      <p className="font-medium text-sm">{selectedDeuda.descripcion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Deuda</p>
                      <Badge variant="outline">{selectedDeuda.tipo_deuda}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <EstadoBadge 
                        estado={selectedDeuda.estado} 
                        diasVencido={selectedDeuda.dias_vencido}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Información financiera y fechas */}
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
                      <p className="font-bold text-lg">{formatCurrency(selectedDeuda.monto)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Préstamo</p>
                      <p className="font-medium">{formatDate(selectedDeuda.fecha_prestamo)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                      <p className="font-medium">{formatDate(selectedDeuda.fecha_vencimiento)}</p>
                    </div>
                    {selectedDeuda.fecha_pago && (
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Pago</p>
                        <p className="font-medium text-green-600">
                          {formatDate(selectedDeuda.fecha_pago)}
                        </p>
                      </div>
                    )}
                    {selectedDeuda.metodo_pago && (
                      <div>
                        <p className="text-sm text-gray-600">Método de Pago</p>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {selectedDeuda.metodo_pago}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Observaciones */}
              {selectedDeuda.observaciones && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Observaciones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {selectedDeuda.observaciones}
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
                      <p className="font-medium">{selectedDeuda.creado_por}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha de creación</p>
                      <p className="font-medium">{formatDate(selectedDeuda.fecha_creacion)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Última actualización</p>
                      <p className="font-medium">{formatDate(selectedDeuda.fecha_actualizacion)}</p>
                    </div>
                    {selectedDeuda.dias_vencido > 0 && (
                      <div>
                        <p className="text-gray-600">Días vencida</p>
                        <p className="font-medium text-red-600">{selectedDeuda.dias_vencido} días</p>
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

export default DeudaCompaneroTable;

