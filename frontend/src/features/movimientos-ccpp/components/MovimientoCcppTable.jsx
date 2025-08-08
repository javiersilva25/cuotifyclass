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
  User,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  Target,
  UserCheck,
  GraduationCap,
  Home,
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

// Componente para el badge de estado
function EstadoBadge({ estado, fechaProcesamiento }) {
  const getEstadoConfig = (estado, fechaProcesamiento) => {
    const configs = {
      'Pendiente': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: 'Pendiente',
      },
      'Procesado': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        text: 'Procesado',
      },
      'Aprobado': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Check,
        text: 'Aprobado',
      },
      'Rechazado': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Ban,
        text: 'Rechazado',
      },
    };
    return configs[estado] || configs['Pendiente'];
  };

  const config = getEstadoConfig(estado, fechaProcesamiento);
  const IconComponent = config.icon;

  return (
    <Badge variant="outline" className={cn("flex items-center space-x-1", config.color)}>
      <IconComponent className="w-3 h-3" />
      <span className="text-xs font-medium">{config.text}</span>
    </Badge>
  );
}

// Componente para el badge de tipo de movimiento
function TipoMovimientoBadge({ tipo, monto }) {
  const getTipoConfig = (tipo) => {
    const configs = {
      'Ingreso': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: TrendingUp,
        text: 'Ingreso',
      },
      'Egreso': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: TrendingDown,
        text: 'Egreso',
      },
      'Transferencia': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: ArrowRightLeft,
        text: 'Transferencia',
      },
    };
    return configs[tipo] || configs['Ingreso'];
  };

  const config = getTipoConfig(tipo);
  const IconComponent = config.icon;

  return (
    <div className="space-y-1">
      <Badge variant="outline" className={cn("flex items-center space-x-1", config.color)}>
        <IconComponent className="w-3 h-3" />
        <span className="text-xs font-medium">{config.text}</span>
      </Badge>
      <p className="text-xs text-gray-500">
        {new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0,
        }).format(monto)}
      </p>
    </div>
  );
}

// Componente para mostrar información del usuario
function UsuarioCard({ 
  nombre, 
  tipo, 
  rut, 
  email, 
  telefono 
}) {
  const getTipoIcon = (tipo) => {
    return tipo === 'Padre' ? Home : GraduationCap;
  };

  const getTipoColor = (tipo) => {
    return tipo === 'Padre' ? 'text-blue-600' : 'text-purple-600';
  };

  const IconComponent = getTipoIcon(tipo);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <IconComponent className={cn("w-4 h-4", getTipoColor(tipo))} />
        <div>
          <p className="font-medium text-gray-900 text-sm">{nombre}</p>
          <p className="text-xs text-gray-500">RUT: {rut}</p>
        </div>
      </div>
      
      <div className="space-y-1 pl-6">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            tipo === 'Padre' ? "text-blue-700 border-blue-300" : "text-purple-700 border-purple-300"
          )}
        >
          {tipo}
        </Badge>
        
        {email && (
          <div className="flex items-center space-x-1">
            <Mail className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-600">{email}</p>
          </div>
        )}
        
        {telefono && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-gray-400" />
            <p className="text-xs text-gray-600">{telefono}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para mostrar información del saldo
function SaldoCard({ saldoAnterior, saldoActual, tipoMovimiento, monto }) {
  const diferencia = saldoActual - saldoAnterior;
  const cambioEsperado = tipoMovimiento === 'Ingreso' ? monto : 
                        tipoMovimiento === 'Egreso' ? -monto : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Wallet className="w-4 h-4 text-gray-500" />
        <div>
          <p className="text-xs text-gray-500">Saldo Anterior</p>
          <p className="font-medium text-gray-700 text-sm">
            {new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0,
            }).format(saldoAnterior)}
          </p>
        </div>
      </div>
      
      <div className="pl-6 space-y-1">
        <div className="flex items-center space-x-1">
          {diferencia > 0 ? (
            <TrendingUp className="w-3 h-3 text-green-600" />
          ) : diferencia < 0 ? (
            <TrendingDown className="w-3 h-3 text-red-600" />
          ) : (
            <ArrowRightLeft className="w-3 h-3 text-gray-400" />
          )}
          <p className="text-xs text-gray-500">Saldo Actual</p>
        </div>
        
        <p className={cn(
          "font-bold text-sm",
          saldoActual > saldoAnterior && "text-green-700",
          saldoActual < saldoAnterior && "text-red-700",
          saldoActual === saldoAnterior && "text-gray-700"
        )}>
          {new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
          }).format(saldoActual)}
        </p>
        
        {diferencia !== 0 && (
          <p className={cn(
            "text-xs",
            diferencia > 0 ? "text-green-600" : "text-red-600"
          )}>
            {diferencia > 0 ? '+' : ''}{new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0,
            }).format(diferencia)}
          </p>
        )}
      </div>
    </div>
  );
}

// Componente para mostrar información del comprobante
function ComprobanteCard({ metodo, numero, fechaProcesamiento }) {
  const getMetodoIcon = (metodo) => {
    switch (metodo) {
      case 'Efectivo':
        return DollarSign;
      case 'Transferencia Bancaria':
      case 'Transferencia Interna':
        return ArrowRightLeft;
      case 'Cheque':
        return Receipt;
      case 'Tarjeta de Débito':
      case 'Tarjeta de Crédito':
        return CreditCard;
      default:
        return FileText;
    }
  };

  const IconComponent = getMetodoIcon(metodo);

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <IconComponent className="w-4 h-4 text-gray-500" />
        <div>
          <p className="font-medium text-gray-900 text-sm">{metodo}</p>
          <p className="text-xs text-gray-500">N° {numero}</p>
        </div>
      </div>
      
      {fechaProcesamiento && (
        <div className="pl-6">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-green-600" />
            <p className="text-xs text-green-600">
              Procesado: {new Date(fechaProcesamiento).toLocaleDateString('es-CL')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principal de la tabla
export function MovimientoCcppTable({
  movimientos = [],
  isLoading = false,
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  onCreateMovimiento = () => {},
  onEditMovimiento = () => {},
  onProcesarMovimiento = () => {},
  onAprobarMovimiento = () => {},
  onRechazarMovimiento = () => {},
  onDeleteMovimiento = () => {},
  onRefresh = () => {},
  ESTADOS_MOVIMIENTO = {},
  TIPOS_MOVIMIENTO = {},
  CATEGORIAS_MOVIMIENTO = [],
  TIPOS_USUARIO = {},
  METODOS_PAGO = [],
}) {
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
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
    if (!dateString) return 'No especificada';
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
  const handleViewDetails = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setShowDetails(true);
  };

  // Función para manejar acciones
  const handleAction = (action, movimiento) => {
    switch (action) {
      case 'edit':
        onEditMovimiento(movimiento);
        break;
      case 'procesar':
        const procesadoPor = prompt('Ingresa tu nombre para procesar:');
        if (procesadoPor) {
          onProcesarMovimiento(movimiento.id, procesadoPor);
        }
        break;
      case 'aprobar':
        const aprobadoPor = prompt('Ingresa tu nombre para aprobar:');
        if (aprobadoPor) {
          onAprobarMovimiento(movimiento.id, aprobadoPor);
        }
        break;
      case 'rechazar':
        const motivo = prompt('Ingresa el motivo del rechazo:');
        if (motivo) {
          onRechazarMovimiento(movimiento.id, motivo);
        }
        break;
      case 'delete':
        if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
          onDeleteMovimiento(movimiento.id);
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
                  <span>Movimientos CCPP</span>
                </CardTitle>
                <CardDescription>
                  Gestión de cuentas corrientes de padres y profesores
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
                
                <Button onClick={onCreateMovimiento} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Movimiento
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
                          placeholder="Concepto, usuario, comprobante..."
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
                          {Object.values(ESTADOS_MOVIMIENTO).map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de movimiento */}
                    <div className="space-y-2">
                      <Label>Tipo de Movimiento</Label>
                      <Select
                        value={filters.tipo_movimiento || ''}
                        onValueChange={(value) => onFilterChange('tipo_movimiento', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los tipos</SelectItem>
                          {Object.values(TIPOS_MOVIMIENTO).map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select
                        value={filters.categoria || ''}
                        onValueChange={(value) => onFilterChange('categoria', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas las categorías</SelectItem>
                          {CATEGORIAS_MOVIMIENTO.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de usuario */}
                    <div className="space-y-2">
                      <Label>Tipo de Usuario</Label>
                      <Select
                        value={filters.usuario_tipo || ''}
                        onValueChange={(value) => onFilterChange('usuario_tipo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los tipos</SelectItem>
                          {Object.values(TIPOS_USUARIO).map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              <div className="flex items-center space-x-2">
                                {tipo === 'Padre' ? (
                                  <Home className="w-4 h-4" />
                                ) : (
                                  <GraduationCap className="w-4 h-4" />
                                )}
                                <span>{tipo}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Usuario */}
                    <div className="space-y-2">
                      <Label htmlFor="usuario_nombre">Usuario</Label>
                      <Input
                        id="usuario_nombre"
                        placeholder="Nombre del usuario"
                        value={filters.usuario_nombre || ''}
                        onChange={(e) => onFilterChange('usuario_nombre', e.target.value)}
                      />
                    </div>

                    {/* Método de pago */}
                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select
                        value={filters.metodo_pago || ''}
                        onValueChange={(value) => onFilterChange('metodo_pago', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los métodos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los métodos</SelectItem>
                          {METODOS_PAGO.map((metodo) => (
                            <SelectItem key={metodo} value={metodo}>
                              {metodo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

                    {/* Checkbox solo pendientes */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="solo_pendientes"
                          checked={filters.solo_pendientes || false}
                          onCheckedChange={(checked) => onFilterChange('solo_pendientes', checked)}
                        />
                        <Label htmlFor="solo_pendientes" className="text-sm">
                          Solo pendientes
                        </Label>
                      </div>
                    </div>

                    {/* Checkbox solo procesados */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="solo_procesados"
                          checked={filters.solo_procesados || false}
                          onCheckedChange={(checked) => onFilterChange('solo_procesados', checked)}
                        />
                        <Label htmlFor="solo_procesados" className="text-sm">
                          Solo procesados
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
                    
                    <TableHead>Usuario</TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('tipo_movimiento')}
                    >
                      <div className="flex items-center space-x-1">
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Tipo/Monto</span>
                        {getSortIcon('tipo_movimiento')}
                      </div>
                    </TableHead>
                    
                    <TableHead>Saldos</TableHead>
                    
                    <TableHead>Comprobante</TableHead>
                    
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('fecha_movimiento')}
                    >
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Fecha</span>
                        {getSortIcon('fecha_movimiento')}
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
                            <span>Cargando movimientos...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : movimientos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-gray-500">
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron movimientos</p>
                            <p className="text-sm">Intenta ajustar los filtros</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      movimientos.map((movimiento, index) => (
                        <motion.tr
                          key={movimiento.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="w-80">
                            <div className="space-y-2">
                              <div>
                                <p className="font-medium text-gray-900 line-clamp-1">
                                  {movimiento.concepto}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {movimiento.descripcion}
                                </p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {movimiento.categoria}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="w-64">
                            <UsuarioCard
                              nombre={movimiento.usuario_nombre}
                              tipo={movimiento.usuario_tipo}
                              rut={movimiento.usuario_rut}
                              email={movimiento.usuario_email}
                              telefono={movimiento.usuario_telefono}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <TipoMovimientoBadge
                              tipo={movimiento.tipo_movimiento}
                              monto={movimiento.monto}
                            />
                          </TableCell>
                          
                          <TableCell className="w-48">
                            <SaldoCard
                              saldoAnterior={movimiento.saldo_anterior}
                              saldoActual={movimiento.saldo_actual}
                              tipoMovimiento={movimiento.tipo_movimiento}
                              monto={movimiento.monto}
                            />
                          </TableCell>
                          
                          <TableCell className="w-48">
                            <ComprobanteCard
                              metodo={movimiento.metodo_pago}
                              numero={movimiento.numero_comprobante}
                              fechaProcesamiento={movimiento.fecha_procesamiento}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {formatDate(movimiento.fecha_movimiento)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Por: {movimiento.creado_por}
                              </p>
                              {movimiento.aprobado_por && (
                                <p className="text-xs text-green-600">
                                  Aprobado: {movimiento.aprobado_por}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <EstadoBadge 
                              estado={movimiento.estado} 
                              fechaProcesamiento={movimiento.fecha_procesamiento}
                            />
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(movimiento)}
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
                                  
                                  <DropdownMenuItem onClick={() => handleAction('edit', movimiento)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  
                                  {movimiento.estado === 'Pendiente' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleAction('procesar', movimiento)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Procesar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleAction('rechazar', movimiento)}>
                                        <Ban className="w-4 h-4 mr-2" />
                                        Rechazar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  
                                  {movimiento.estado === 'Procesado' && (
                                    <DropdownMenuItem onClick={() => handleAction('aprobar', movimiento)}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Aprobar
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleAction('delete', movimiento)}
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Detalles del Movimiento CCPP</span>
            </DialogTitle>
            <DialogDescription>
              Información completa del movimiento seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedMovimiento && (
            <div className="space-y-6">
              {/* Información principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Información del Movimiento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Concepto</p>
                      <p className="font-medium">{selectedMovimiento.concepto}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Descripción</p>
                      <p className="font-medium text-sm">{selectedMovimiento.descripcion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Categoría</p>
                      <Badge variant="outline">{selectedMovimiento.categoria}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <EstadoBadge 
                        estado={selectedMovimiento.estado} 
                        fechaProcesamiento={selectedMovimiento.fecha_procesamiento}
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
                      <p className="text-sm text-gray-600">Tipo de Movimiento</p>
                      <TipoMovimientoBadge
                        tipo={selectedMovimiento.tipo_movimiento}
                        monto={selectedMovimiento.monto}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Saldos</p>
                      <SaldoCard
                        saldoAnterior={selectedMovimiento.saldo_anterior}
                        saldoActual={selectedMovimiento.saldo_actual}
                        tipoMovimiento={selectedMovimiento.tipo_movimiento}
                        monto={selectedMovimiento.monto}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Movimiento</p>
                      <p className="font-medium">{formatDate(selectedMovimiento.fecha_movimiento)}</p>
                    </div>
                    {selectedMovimiento.fecha_procesamiento && (
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Procesamiento</p>
                        <p className="font-medium text-green-600">
                          {formatDate(selectedMovimiento.fecha_procesamiento)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Información del usuario */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Información del Usuario</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UsuarioCard
                    nombre={selectedMovimiento.usuario_nombre}
                    tipo={selectedMovimiento.usuario_tipo}
                    rut={selectedMovimiento.usuario_rut}
                    email={selectedMovimiento.usuario_email}
                    telefono={selectedMovimiento.usuario_telefono}
                  />
                </CardContent>
              </Card>

              {/* Información del comprobante */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Receipt className="w-4 h-4" />
                    <span>Información del Comprobante</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ComprobanteCard
                    metodo={selectedMovimiento.metodo_pago}
                    numero={selectedMovimiento.numero_comprobante}
                    fechaProcesamiento={selectedMovimiento.fecha_procesamiento}
                  />
                </CardContent>
              </Card>

              {/* Observaciones */}
              {selectedMovimiento.observaciones && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Observaciones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                      {selectedMovimiento.observaciones}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Información de auditoría */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Información de Auditoría</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Creado por</p>
                      <p className="font-medium">{selectedMovimiento.creado_por}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fecha de creación</p>
                      <p className="font-medium">{formatDate(selectedMovimiento.fecha_creacion)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Última actualización</p>
                      <p className="font-medium">{formatDate(selectedMovimiento.fecha_actualizacion)}</p>
                    </div>
                    {selectedMovimiento.aprobado_por && (
                      <div>
                        <p className="text-gray-600">Aprobado por</p>
                        <p className="font-medium text-green-600">{selectedMovimiento.aprobado_por}</p>
                      </div>
                    )}
                    {selectedMovimiento.fecha_aprobacion && (
                      <div>
                        <p className="text-gray-600">Fecha de aprobación</p>
                        <p className="font-medium text-green-600">
                          {formatDate(selectedMovimiento.fecha_aprobacion)}
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

export default MovimientoCcppTable;

