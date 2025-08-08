import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Ban, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Percent,
  DollarSign,
  Building,
  MapPin,
  User,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Target,
  Activity,
  Zap,
  Shield,
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
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { cn } from '../../../lib/utils';
import { 
  useMovimientoCcaa, 
  useMovimientoCcaaFilter,
  ESTADOS_MOVIMIENTO_CCAA,
  TIPOS_MOVIMIENTO_CCAA,
  CATEGORIAS_MOVIMIENTO_CCAA,
  BANCOS_CCAA,
  TIPOS_CUENTA_CCAA,
} from '../hooks/useMovimientoCcaa';

// Componente para mostrar información bancaria
function BancoCard({ banco, sucursal, ejecutivo }) {
  return (
    <div className="flex items-center space-x-2">
      <Building className="w-4 h-4 text-blue-600" />
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">{banco}</p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{sucursal}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <User className="w-3 h-3" />
          <span className="truncate">{ejecutivo}</span>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar información de cuentas
function CuentasCard({ cuentaOrigen, cuentaDestino }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Upload className="w-3 h-3 text-red-500" />
        <span className="text-xs text-gray-600">Origen:</span>
        <span className="text-xs font-medium text-gray-900">{cuentaOrigen}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Download className="w-3 h-3 text-green-500" />
        <span className="text-xs text-gray-600">Destino:</span>
        <span className="text-xs font-medium text-gray-900">{cuentaDestino}</span>
      </div>
    </div>
  );
}

// Componente para mostrar información de saldos
function SaldoCard({ saldoAnterior, saldoActual, monto, tipo }) {
  const diferencia = saldoActual - saldoAnterior;
  const impactoEsperado = tipo === 'Depósito' || tipo === 'Interés' ? monto : -monto;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Anterior:</span>
        <span className="text-xs font-medium">
          {new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
          }).format(saldoAnterior)}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Actual:</span>
        <span className="text-xs font-bold text-gray-900">
          {new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
          }).format(saldoActual)}
        </span>
      </div>
      
      {diferencia !== 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Cambio:</span>
          <div className="flex items-center space-x-1">
            {diferencia > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={cn(
              "text-xs font-medium",
              diferencia > 0 ? "text-green-600" : "text-red-600"
            )}>
              {diferencia > 0 ? '+' : ''}{new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
              }).format(diferencia)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar información de operación
function OperacionCard({ numeroOperacion, fechaMovimiento, fechaProcesamiento, comision, interes }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <FileText className="w-3 h-3 text-gray-500" />
        <span className="text-xs font-medium text-gray-900">{numeroOperacion}</span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Calendar className="w-3 h-3 text-gray-500" />
        <span className="text-xs text-gray-600">
          {new Date(fechaMovimiento).toLocaleDateString('es-CL')}
        </span>
      </div>
      
      {fechaProcesamiento && (
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span className="text-xs text-gray-600">
            Proc: {new Date(fechaProcesamiento).toLocaleDateString('es-CL')}
          </span>
        </div>
      )}
      
      {(comision > 0 || interes > 0) && (
        <div className="flex items-center space-x-4">
          {comision > 0 && (
            <div className="flex items-center space-x-1">
              <CreditCard className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600">
                -{new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0,
                }).format(comision)}
              </span>
            </div>
          )}
          
          {interes > 0 && (
            <div className="flex items-center space-x-1">
              <Percent className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">
                +{new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0,
                }).format(interes)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Modal de detalles del movimiento
function MovimientoDetailsModal({ movimiento, isOpen, onClose }) {
  if (!movimiento) return null;

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pendiente': return Clock;
      case 'Procesado': return CheckCircle;
      case 'Conciliado': return Shield;
      case 'Rechazado': return Ban;
      default: return AlertTriangle;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Procesado': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Conciliado': return 'text-green-600 bg-green-50 border-green-200';
      case 'Rechazado': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Depósito': return TrendingUp;
      case 'Retiro': return TrendingDown;
      case 'Transferencia': return ArrowRightLeft;
      case 'Interés': return Percent;
      case 'Comisión': return CreditCard;
      default: return DollarSign;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Depósito': return 'text-green-600 bg-green-50 border-green-200';
      case 'Retiro': return 'text-red-600 bg-red-50 border-red-200';
      case 'Transferencia': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Interés': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Comisión': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const EstadoIcon = getEstadoIcon(movimiento.estado);
  const TipoIcon = getTipoIcon(movimiento.tipo_movimiento);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Detalles del Movimiento CCAA</span>
          </DialogTitle>
          <DialogDescription>
            Información completa del movimiento bancario institucional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información principal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Movimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Concepto</Label>
                  <p className="text-base font-medium text-gray-900">{movimiento.concepto}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Categoría</Label>
                  <Badge variant="outline" className="mt-1">
                    {movimiento.categoria}
                  </Badge>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                  <p className="text-sm text-gray-700 mt-1">{movimiento.descripcion}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <Badge className={cn("flex items-center space-x-1 w-fit mt-1", getEstadoColor(movimiento.estado))}>
                    <EstadoIcon className="w-3 h-3" />
                    <span>{movimiento.estado}</span>
                  </Badge>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tipo de Movimiento</Label>
                  <Badge className={cn("flex items-center space-x-1 w-fit mt-1", getTipoColor(movimiento.tipo_movimiento))}>
                    <TipoIcon className="w-3 h-3" />
                    <span>{movimiento.tipo_movimiento}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Financiera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Monto Principal</Label>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(movimiento.monto)}
                  </p>
                </div>
                
                {movimiento.comision > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Comisión</Label>
                    <p className="text-lg font-semibold text-red-600">
                      -{new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(movimiento.comision)}
                    </p>
                  </div>
                )}
                
                {movimiento.interes > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Interés</Label>
                    <p className="text-lg font-semibold text-green-600">
                      +{new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(movimiento.interes)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-500">Impacto en Saldos</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Saldo Anterior</p>
                    <p className="font-bold text-gray-700">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(movimiento.saldo_anterior)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Cambio</p>
                    <p className={cn(
                      "font-bold",
                      movimiento.saldo_actual > movimiento.saldo_anterior && "text-green-600",
                      movimiento.saldo_actual < movimiento.saldo_anterior && "text-red-600",
                      movimiento.saldo_actual === movimiento.saldo_anterior && "text-gray-600"
                    )}>
                      {movimiento.saldo_actual > movimiento.saldo_anterior ? '+' : ''}
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(movimiento.saldo_actual - movimiento.saldo_anterior)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Saldo Actual</p>
                    <p className="font-bold text-gray-900">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(movimiento.saldo_actual)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información bancaria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Bancaria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Banco</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{movimiento.banco}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Sucursal</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{movimiento.sucursal}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ejecutivo Responsable</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{movimiento.ejecutivo_responsable}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Número de Operación</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm">{movimiento.numero_operacion}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-500">Cuentas Involucradas</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Cuenta Origen</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{movimiento.cuenta_origen}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Cuenta Destino</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{movimiento.cuenta_destino}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas y conciliación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fechas y Conciliación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Movimiento</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{new Date(movimiento.fecha_movimiento).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
                
                {movimiento.fecha_procesamiento && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fecha de Procesamiento</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>{new Date(movimiento.fecha_procesamiento).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                )}
                
                {movimiento.fecha_conciliacion && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Fecha de Conciliación</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>{new Date(movimiento.fecha_conciliacion).toLocaleDateString('es-CL')}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-500">Estado de Conciliación</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {movimiento.conciliado ? (
                    <>
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 font-medium">Conciliado</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-600 font-medium">Pendiente de Conciliación</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {movimiento.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {movimiento.observaciones}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Información de auditoría */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Auditoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Creado por</Label>
                  <p className="text-sm text-gray-900">{movimiento.creado_por}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(movimiento.fecha_creacion).toLocaleDateString('es-CL')}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Última Actualización</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(movimiento.fecha_actualizacion).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente principal de la tabla
export function MovimientoCcaaTable({
  onEdit = () => {},
  onDelete = () => {},
  onProcesar = () => {},
  onConciliar = () => {},
  onRechazar = () => {},
}) {
  const { movimientos, isLoading, procesarMovimiento, conciliarMovimiento, rechazarMovimiento } = useMovimientoCcaa();
  const { filters, filteredMovimientos, updateFilter, resetFilters } = useMovimientoCcaaFilter(movimientos);
  
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Obtener opciones únicas para filtros
  const uniqueValues = useMemo(() => {
    return {
      bancos: [...new Set(movimientos.map(m => m.banco))].sort(),
      cuentasOrigen: [...new Set(movimientos.map(m => m.cuenta_origen))].sort(),
      cuentasDestino: [...new Set(movimientos.map(m => m.cuenta_destino))].sort(),
    };
  }, [movimientos]);

  // Manejar acciones
  const handleViewDetails = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setShowDetailsModal(true);
  };

  const handleProcesar = async (movimiento) => {
    await procesarMovimiento(movimiento.id, 'Usuario Actual');
    onProcesar(movimiento);
  };

  const handleConciliar = async (movimiento) => {
    await conciliarMovimiento(movimiento.id, 'Usuario Actual');
    onConciliar(movimiento);
  };

  const handleRechazar = async (movimiento) => {
    await rechazarMovimiento(movimiento.id, 'Rechazado por usuario');
    onRechazar(movimiento);
  };

  // Obtener icono y color del estado
  const getEstadoBadge = (estado) => {
    const configs = {
      'Pendiente': { icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
      'Procesado': { icon: CheckCircle, color: 'text-blue-600 bg-blue-50 border-blue-200' },
      'Conciliado': { icon: Shield, color: 'text-green-600 bg-green-50 border-green-200' },
      'Rechazado': { icon: Ban, color: 'text-red-600 bg-red-50 border-red-200' },
    };
    
    const config = configs[estado] || { icon: AlertTriangle, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    const Icon = config.icon;
    
    return (
      <Badge className={cn("flex items-center space-x-1", config.color)}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">{estado}</span>
      </Badge>
    );
  };

  // Obtener icono y color del tipo
  const getTipoBadge = (tipo) => {
    const configs = {
      'Depósito': { icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-200' },
      'Retiro': { icon: TrendingDown, color: 'text-red-600 bg-red-50 border-red-200' },
      'Transferencia': { icon: ArrowRightLeft, color: 'text-blue-600 bg-blue-50 border-blue-200' },
      'Interés': { icon: Percent, color: 'text-purple-600 bg-purple-50 border-purple-200' },
      'Comisión': { icon: CreditCard, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    };
    
    const config = configs[tipo] || { icon: DollarSign, color: 'text-gray-600 bg-gray-50 border-gray-200' };
    const Icon = config.icon;
    
    return (
      <Badge className={cn("flex items-center space-x-1", config.color)}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">{tipo}</span>
      </Badge>
    );
  };

  // Obtener acciones disponibles según el estado
  const getAvailableActions = (movimiento) => {
    const actions = [];
    
    // Ver detalles siempre disponible
    actions.push({
      label: 'Ver Detalles',
      icon: Eye,
      onClick: () => handleViewDetails(movimiento),
      variant: 'ghost',
    });

    // Acciones según estado
    switch (movimiento.estado) {
      case 'Pendiente':
        actions.push(
          {
            label: 'Editar',
            icon: Edit,
            onClick: () => onEdit(movimiento),
            variant: 'ghost',
          },
          {
            label: 'Procesar',
            icon: CheckCircle,
            onClick: () => handleProcesar(movimiento),
            variant: 'ghost',
          },
          {
            label: 'Rechazar',
            icon: Ban,
            onClick: () => handleRechazar(movimiento),
            variant: 'ghost',
          }
        );
        break;
        
      case 'Procesado':
        actions.push(
          {
            label: 'Editar',
            icon: Edit,
            onClick: () => onEdit(movimiento),
            variant: 'ghost',
          },
          {
            label: 'Conciliar',
            icon: Shield,
            onClick: () => handleConciliar(movimiento),
            variant: 'ghost',
          }
        );
        break;
        
      case 'Conciliado':
        // Solo ver detalles para movimientos conciliados
        break;
        
      case 'Rechazado':
        actions.push({
          label: 'Editar',
          icon: Edit,
          onClick: () => onEdit(movimiento),
          variant: 'ghost',
        });
        break;
    }

    // Eliminar siempre disponible (excepto conciliados)
    if (movimiento.estado !== 'Conciliado') {
      actions.push({
        label: 'Eliminar',
        icon: Trash2,
        onClick: () => onDelete(movimiento),
        variant: 'ghost',
        destructive: true,
      });
    }

    return actions;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Cargando movimientos CCAA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por concepto, operación, ejecutivo..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {Object.values(filters).some(value => 
                value !== '' && value !== false && value !== 'fecha_movimiento' && value !== 'desc'
              ) && (
                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>{filteredMovimientos.length} movimientos</span>
              </Badge>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={filters.estado}
                      onValueChange={(value) => updateFilter('estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los estados</SelectItem>
                        {Object.values(ESTADOS_MOVIMIENTO_CCAA).map((estado) => (
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
                      value={filters.tipo_movimiento}
                      onValueChange={(value) => updateFilter('tipo_movimiento', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        {Object.values(TIPOS_MOVIMIENTO_CCAA).map((tipo) => (
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
                      value={filters.categoria}
                      onValueChange={(value) => updateFilter('categoria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todas las categorías</SelectItem>
                        {CATEGORIAS_MOVIMIENTO_CCAA.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Banco */}
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Select
                      value={filters.banco}
                      onValueChange={(value) => updateFilter('banco', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los bancos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los bancos</SelectItem>
                        {uniqueValues.bancos.map((banco) => (
                          <SelectItem key={banco} value={banco}>
                            {banco}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fecha desde */}
                  <div className="space-y-2">
                    <Label>Fecha Desde</Label>
                    <Input
                      type="date"
                      value={filters.fecha_desde}
                      onChange={(e) => updateFilter('fecha_desde', e.target.value)}
                    />
                  </div>

                  {/* Fecha hasta */}
                  <div className="space-y-2">
                    <Label>Fecha Hasta</Label>
                    <Input
                      type="date"
                      value={filters.fecha_hasta}
                      onChange={(e) => updateFilter('fecha_hasta', e.target.value)}
                    />
                  </div>

                  {/* Monto mínimo */}
                  <div className="space-y-2">
                    <Label>Monto Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.monto_min}
                      onChange={(e) => updateFilter('monto_min', e.target.value)}
                    />
                  </div>

                  {/* Monto máximo */}
                  <div className="space-y-2">
                    <Label>Monto Máximo</Label>
                    <Input
                      type="number"
                      placeholder="Sin límite"
                      value={filters.monto_max}
                      onChange={(e) => updateFilter('monto_max', e.target.value)}
                    />
                  </div>
                </div>

                {/* Filtros especiales */}
                <div className="flex items-center space-x-6 mt-4 pt-4 border-t">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.solo_conciliados}
                      onChange={(e) => updateFilter('solo_conciliados', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Solo Conciliados</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.solo_pendientes}
                      onChange={(e) => updateFilter('solo_pendientes', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Solo Pendientes</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.con_comision}
                      onChange={(e) => updateFilter('con_comision', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Con Comisión</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.con_interes}
                      onChange={(e) => updateFilter('con_interes', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Con Interés</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Movimientos CCAA</span>
          </CardTitle>
          <CardDescription>
            Gestión de movimientos de cuentas corrientes de ahorro y aporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMovimientos.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay movimientos
              </h3>
              <p className="text-gray-500">
                {filters.search || Object.values(filters).some(v => v !== '' && v !== false && v !== 'fecha_movimiento' && v !== 'desc')
                  ? 'No se encontraron movimientos con los filtros aplicados.'
                  : 'No hay movimientos registrados aún.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Concepto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Banco</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cuentas</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Saldos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Operación</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredMovimientos.map((movimiento, index) => (
                      <motion.tr
                        key={movimiento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        {/* Concepto */}
                        <td className="py-4 px-4">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {movimiento.concepto}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {movimiento.categoria}
                            </p>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="py-4 px-4">
                          {getTipoBadge(movimiento.tipo_movimiento)}
                        </td>

                        {/* Monto */}
                        <td className="py-4 px-4">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {new Intl.NumberFormat('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                                minimumFractionDigits: 0,
                              }).format(movimiento.monto)}
                            </p>
                            {(movimiento.comision > 0 || movimiento.interes > 0) && (
                              <div className="flex items-center justify-end space-x-2 text-xs">
                                {movimiento.comision > 0 && (
                                  <span className="text-red-600">
                                    -${movimiento.comision.toLocaleString()}
                                  </span>
                                )}
                                {movimiento.interes > 0 && (
                                  <span className="text-green-600">
                                    +${movimiento.interes.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4">
                          {getEstadoBadge(movimiento.estado)}
                        </td>

                        {/* Banco */}
                        <td className="py-4 px-4">
                          <BancoCard
                            banco={movimiento.banco}
                            sucursal={movimiento.sucursal}
                            ejecutivo={movimiento.ejecutivo_responsable}
                          />
                        </td>

                        {/* Cuentas */}
                        <td className="py-4 px-4">
                          <CuentasCard
                            cuentaOrigen={movimiento.cuenta_origen}
                            cuentaDestino={movimiento.cuenta_destino}
                          />
                        </td>

                        {/* Saldos */}
                        <td className="py-4 px-4">
                          <SaldoCard
                            saldoAnterior={movimiento.saldo_anterior}
                            saldoActual={movimiento.saldo_actual}
                            monto={movimiento.monto}
                            tipo={movimiento.tipo_movimiento}
                          />
                        </td>

                        {/* Operación */}
                        <td className="py-4 px-4">
                          <OperacionCard
                            numeroOperacion={movimiento.numero_operacion}
                            fechaMovimiento={movimiento.fecha_movimiento}
                            fechaProcesamiento={movimiento.fecha_procesamiento}
                            comision={movimiento.comision}
                            interes={movimiento.interes}
                          />
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {getAvailableActions(movimiento).map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={action.onClick}
                                    className={cn(
                                      "flex items-center space-x-2",
                                      action.destructive && "text-red-600 focus:text-red-600"
                                    )}
                                  >
                                    <action.icon className="w-4 h-4" />
                                    <span>{action.label}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <MovimientoDetailsModal
        movimiento={selectedMovimiento}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
}

export default MovimientoCcaaTable;

