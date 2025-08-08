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
  CreditCard,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  TrendingUp,
  Ban,
  RotateCcw,
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
import { Progress } from '../../../components/ui/progress';
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
      'Condonada': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Ban,
        text: 'Condonada',
      },
      'Refinanciada': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: RotateCcw,
        text: 'Refinanciada',
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

// Componente para mostrar el progreso de pago
function ProgresoPago({ montoOriginal, montoPagado, montoPendiente }) {
  const porcentajePagado = montoOriginal > 0 ? (montoPagado / montoOriginal) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>Pagado: ${montoPagado.toLocaleString()}</span>
        <span>Pendiente: ${montoPendiente.toLocaleString()}</span>
      </div>
      <Progress value={porcentajePagado} className="h-2" />
      <div className="text-xs text-center text-gray-500">
        {porcentajePagado.toFixed(1)}% pagado
      </div>
    </div>
  );
}

// Componente principal de la tabla
export function DeudaAlumnoTable({
  deudas = [],
  isLoading = false,
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  onCreateDeuda = () => {},
  onEditDeuda = () => {},
  onRegistrarPago = () => {},
  onCondonarDeuda = () => {},
  onRefinanciarDeuda = () => {},
  onDeleteDeuda = () => {},
  onRefresh = () => {},
  ESTADOS_DEUDA = {},
  TIPOS_DEUDA = [],
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
      case 'pago':
        onRegistrarPago(deuda);
        break;
      case 'condonar':
        onCondonarDeuda(deuda.id);
        break;
      case 'refinanciar':
        onRefinanciarDeuda(deuda);
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
                  <Users className="w-5 h-5" />
                  <span>Deudas de Alumnos</span>
                </CardTitle>
                <CardDescription>
                  Gestión completa de deudas pendientes por alumno
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
                          placeholder="Concepto, alumno, apoderado..."
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
                          {Object.values(ESTADOS_DEUDA).map((estado) => (
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
                          {TIPOS_DEUDA.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                    {/* Fecha desde */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_desde">Vencimiento Desde</Label>
                      <Input
                        id="fecha_desde"
                        type="date"
                        value={filters.fecha_desde || ''}
                        onChange={(e) => onFilterChange('fecha_desde', e.target.value)}
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div className="space-y-2">
                      <Label htmlFor="fecha_hasta">Vencimiento Hasta</Label>
                      <Input
                        id="fecha_hasta"
                        type="date"
                        value={filters.fecha_hasta || ''}
                        onChange={(e) => onFilterChange('fecha_hasta', e.target.value)}
                      />
                    </div>

                    {/* Checkboxes */}
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
                      
                      <div className="space-y-2">
                        <Label>Plan de Pago</Label>
                        <Select
                          value={filters.con_plan_pago || ''}
                          onValueChange={(value) => onFilterChange('con_plan_pago', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Cualquiera" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Cualquiera</SelectItem>
                            <SelectItem value="true">Con plan de pago</SelectItem>
                            <SelectItem value="false">Sin plan de pago</SelectItem>
                          </SelectContent>
                        </Select>
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
                      onClick={() => handleSort('alumno_nombre')}
                    >
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Alumno</span>
                        {getSortIcon('alumno_nombre')}
                      </div>
                    </TableHead>
                    
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
                      onClick={() => handleSort('monto_original')}
                    >
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Monto</span>
                        {getSortIcon('monto_original')}
                      </div>
                    </TableHead>
                    
                    <TableHead>Progreso de Pago</TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('fecha_vencimiento')}
                    >
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
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
                            <span>Cargando deudas...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : deudas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="text-gray-500">
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron deudas</p>
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
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {deuda.alumno_nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                {deuda.alumno_curso}
                              </p>
                              <p className="text-xs text-gray-400">
                                Apoderado: {deuda.apoderado}
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">
                                {deuda.concepto}
                              </p>
                              <p className="text-sm text-gray-500">
                                {deuda.tipo_deuda}
                              </p>
                              {deuda.tiene_plan_pago && (
                                <Badge variant="outline" className="text-xs">
                                  <CreditCard className="w-3 h-3 mr-1" />
                                  Plan de Pago
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-bold text-gray-900">
                                {formatCurrency(deuda.monto_original)}
                              </p>
                              {deuda.monto_pendiente > 0 && (
                                <p className="text-sm text-red-600">
                                  Pendiente: {formatCurrency(deuda.monto_pendiente)}
                                </p>
                              )}
                              {deuda.monto_pagado > 0 && (
                                <p className="text-sm text-green-600">
                                  Pagado: {formatCurrency(deuda.monto_pagado)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="w-32">
                              <ProgresoPago
                                montoOriginal={deuda.monto_original}
                                montoPagado={deuda.monto_pagado}
                                montoPendiente={deuda.monto_pendiente}
                              />
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
                              {deuda.fecha_ultimo_pago && (
                                <p className="text-xs text-gray-500">
                                  Último pago: {formatDate(deuda.fecha_ultimo_pago)}
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
                                  
                                  {(deuda.estado === 'Pendiente' || deuda.estado === 'Vencida' || deuda.estado === 'Refinanciada') && (
                                    <DropdownMenuItem onClick={() => handleAction('pago', deuda)}>
                                      <DollarSign className="w-4 h-4 mr-2" />
                                      Registrar Pago
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {(deuda.estado === 'Pendiente' || deuda.estado === 'Vencida') && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleAction('condonar', deuda)}>
                                        <Ban className="w-4 h-4 mr-2" />
                                        Condonar
                                      </DropdownMenuItem>
                                      
                                      <DropdownMenuItem onClick={() => handleAction('refinanciar', deuda)}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Refinanciar
                                      </DropdownMenuItem>
                                    </>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Detalles de la Deuda</span>
            </DialogTitle>
            <DialogDescription>
              Información completa de la deuda seleccionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeuda && (
            <div className="space-y-6">
              {/* Información del alumno */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Información del Alumno</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium">{selectedDeuda.alumno_nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Curso</p>
                      <p className="font-medium">{selectedDeuda.alumno_curso}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Apoderado</p>
                      <p className="font-medium">{selectedDeuda.apoderado}</p>
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
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Monto Original</p>
                      <p className="font-bold text-lg">{formatCurrency(selectedDeuda.monto_original)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monto Pagado</p>
                      <p className="font-medium text-green-600">{formatCurrency(selectedDeuda.monto_pagado)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monto Pendiente</p>
                      <p className="font-medium text-red-600">{formatCurrency(selectedDeuda.monto_pendiente)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalles de la deuda */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Detalles de la Deuda</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Concepto</p>
                      <p className="font-medium">{selectedDeuda.concepto}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Deuda</p>
                      <p className="font-medium">{selectedDeuda.tipo_deuda}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                      <p className="font-medium">{formatDate(selectedDeuda.fecha_vencimiento)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <EstadoBadge 
                        estado={selectedDeuda.estado} 
                        diasVencido={selectedDeuda.dias_vencido}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Descripción</p>
                    <p className="font-medium">{selectedDeuda.descripcion}</p>
                  </div>
                  
                  {selectedDeuda.observaciones && (
                    <div>
                      <p className="text-sm text-gray-600">Observaciones</p>
                      <p className="font-medium text-sm bg-gray-50 p-2 rounded">
                        {selectedDeuda.observaciones}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progreso de pago */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Progreso de Pago</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgresoPago
                    montoOriginal={selectedDeuda.monto_original}
                    montoPagado={selectedDeuda.monto_pagado}
                    montoPendiente={selectedDeuda.monto_pendiente}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default DeudaAlumnoTable;

