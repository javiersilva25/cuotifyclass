import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Building, 
  MapPin,
  User,
  CreditCard,
  Eye, 
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Percent,
  Upload,
  Download,
  Banknote,
  Target,
  Activity,
  Info,
  Calculator,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { cn } from '../../../lib/utils';
import { 
  TIPOS_MOVIMIENTO_CCAA,
  CATEGORIAS_MOVIMIENTO_CCAA,
  BANCOS_CCAA,
  TIPOS_CUENTA_CCAA,
} from '../hooks/useMovimientoCcaa';
import Navbar from "../../../pages/Navbar.jsx";


// Datos mock de sucursales por banco
const SUCURSALES_POR_BANCO = {
  'Banco de Chile': ['Sucursal Centro', 'Sucursal Providencia', 'Sucursal Las Condes'],
  'Banco Santander': ['Sucursal Principal', 'Sucursal Oriente', 'Sucursal Norte'],
  'Banco Estado': ['Sucursal Central', 'Sucursal Sur', 'Sucursal Poniente'],
  'Banco BCI': ['Sucursal Corporativa', 'Sucursal Empresas', 'Sucursal Retail'],
  'Banco Falabella': ['Sucursal Mall', 'Sucursal Centro Comercial', 'Sucursal Plaza'],
  'Banco Security': ['Sucursal Ejecutiva', 'Sucursal Premium', 'Sucursal Clásica'],
  'Banco Itaú': ['Sucursal Principal', 'Sucursal Secundaria', 'Sucursal Terciaria'],
  'Scotiabank': ['Sucursal Central', 'Sucursal Regional', 'Sucursal Local'],
};

// Ejecutivos por banco
const EJECUTIVOS_POR_BANCO = {
  'Banco de Chile': ['María Fernández', 'Carlos Mendoza', 'Ana Rodríguez'],
  'Banco Santander': ['Pedro González', 'Laura Martínez', 'Diego Silva'],
  'Banco Estado': ['Carmen López', 'Roberto Torres', 'Patricia Morales'],
  'Banco BCI': ['Andrés Herrera', 'Mónica Castro', 'Felipe Vargas'],
  'Banco Falabella': ['Claudia Rojas', 'Marcelo Fuentes', 'Valentina Soto'],
  'Banco Security': ['Rodrigo Peña', 'Francisca Muñoz', 'Sebastián Díaz'],
  'Banco Itaú': ['Alejandra Vega', 'Cristián Ramírez', 'Daniela Cortés'],
  'Scotiabank': ['Ignacio Bravo', 'Camila Espinoza', 'Matías Guerrero'],
};

// Componente para vista previa del movimiento
function MovimientoPreview({ 
  formData, 
  showPreview, 
  onTogglePreview 
}) {
  if (!showPreview) return null;

  const calcularNuevoSaldo = () => {
    if (!formData.saldo_anterior || !formData.monto) return parseInt(formData.saldo_anterior) || 0;
    
    const saldoAnterior = parseInt(formData.saldo_anterior) || 0;
    const monto = parseInt(formData.monto) || 0;
    const comision = parseInt(formData.comision) || 0;
    const interes = parseInt(formData.interes) || 0;
    
    switch (formData.tipo_movimiento) {
      case 'Depósito':
        return saldoAnterior + monto;
      case 'Retiro':
        return saldoAnterior - monto - comision;
      case 'Transferencia':
        return saldoAnterior - monto - comision;
      case 'Interés':
        return saldoAnterior + interes;
      case 'Comisión':
        return saldoAnterior - monto;
      default:
        return saldoAnterior;
    }
  };

  const nuevoSaldo = calcularNuevoSaldo();
  const saldoAnterior = parseInt(formData.saldo_anterior) || 0;
  const diferencia = nuevoSaldo - saldoAnterior;

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

  const TipoIcon = getTipoIcon(formData.tipo_movimiento);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6"
    >
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Vista Previa del Movimiento CCAA</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePreview}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Concepto</p>
                <p className="font-medium text-gray-900">
                  {formData.concepto || 'Sin especificar'}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Categoría</p>
                <Badge variant="outline" className="text-xs">
                  {formData.categoria || 'Sin categoría'}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Movimiento</p>
                <Badge className={cn("flex items-center space-x-1 w-fit", getTipoColor(formData.tipo_movimiento))}>
                  <TipoIcon className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {formData.tipo_movimiento || 'Sin especificar'}
                  </span>
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Monto Principal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formData.monto ? new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0,
                  }).format(parseInt(formData.monto)) : '$0'}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha</p>
                <p className="font-medium text-gray-900">
                  {formData.fecha_movimiento 
                    ? new Date(formData.fecha_movimiento).toLocaleDateString('es-CL')
                    : 'Sin especificar'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Información bancaria */}
          {(formData.banco || formData.sucursal || formData.ejecutivo_responsable) && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Información Bancaria</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.banco && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{formData.banco}</span>
                  </div>
                )}
                
                {formData.sucursal && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formData.sucursal}</span>
                  </div>
                )}
                
                {formData.ejecutivo_responsable && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formData.ejecutivo_responsable}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cuentas */}
          {(formData.cuenta_origen || formData.cuenta_destino) && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Cuentas Involucradas</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.cuenta_origen && (
                  <div className="flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Origen</p>
                      <p className="text-sm font-medium text-gray-900">{formData.cuenta_origen}</p>
                    </div>
                  </div>
                )}
                
                {formData.cuenta_destino && (
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Destino</p>
                      <p className="text-sm font-medium text-gray-900">{formData.cuenta_destino}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Impacto financiero */}
          {formData.saldo_anterior && formData.monto && formData.tipo_movimiento && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Impacto Financiero</p>
              
              {/* Costos adicionales */}
              {(formData.comision > 0 || formData.interes > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {formData.comision > 0 && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Comisión</p>
                      <p className="font-bold text-red-600">
                        -{new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(parseInt(formData.comision))}
                      </p>
                    </div>
                  )}
                  
                  {formData.interes > 0 && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Interés</p>
                      <p className="font-bold text-green-600">
                        +{new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(parseInt(formData.interes))}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Evolución de saldos */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Saldo Anterior</p>
                  <p className="font-bold text-gray-700">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(saldoAnterior)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Cambio</p>
                  <p className={cn(
                    "font-bold flex items-center justify-center space-x-1",
                    diferencia > 0 && "text-green-600",
                    diferencia < 0 && "text-red-600",
                    diferencia === 0 && "text-gray-600"
                  )}>
                    {diferencia > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : diferencia < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <ArrowRightLeft className="w-3 h-3" />
                    )}
                    <span>
                      {diferencia > 0 ? '+' : ''}{new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(diferencia)}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Nuevo Saldo</p>
                  <p className={cn(
                    "font-bold",
                    nuevoSaldo > saldoAnterior && "text-green-600",
                    nuevoSaldo < saldoAnterior && "text-red-600",
                    nuevoSaldo === saldoAnterior && "text-gray-600"
                  )}>
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(nuevoSaldo)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Número de operación */}
          {formData.numero_operacion && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Operación</p>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-sm font-medium">{formData.numero_operacion}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente principal del formulario
export function MovimientoCcaaForm({
  initialData = {},
  isEditing = false,
  isLoading = false,
  onSubmit = () => {},
  onCancel = () => {},
  validation = {},
}) {
  const [formData, setFormData] = useState({
    concepto: '',
    descripcion: '',
    monto: '',
    tipo_movimiento: '',
    categoria: '',
    fecha_movimiento: new Date().toISOString().split('T')[0],
    banco: '',
    sucursal: '',
    ejecutivo_responsable: '',
    cuenta_origen: '',
    cuenta_destino: '',
    numero_operacion: '',
    saldo_anterior: '',
    comision: '',
    interes: '',
    observaciones: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Opciones dependientes del banco seleccionado
  const sucursalesDisponibles = formData.banco ? SUCURSALES_POR_BANCO[formData.banco] || [] : [];
  const ejecutivosDisponibles = formData.banco ? EJECUTIVOS_POR_BANCO[formData.banco] || [] : [];

  // Limpiar sucursal y ejecutivo cuando cambia el banco
  useEffect(() => {
    if (formData.banco) {
      if (!sucursalesDisponibles.includes(formData.sucursal)) {
        setFormData(prev => ({ ...prev, sucursal: '' }));
      }
      if (!ejecutivosDisponibles.includes(formData.ejecutivo_responsable)) {
        setFormData(prev => ({ ...prev, ejecutivo_responsable: '' }));
      }
    }
  }, [formData.banco, sucursalesDisponibles, ejecutivosDisponibles]);

  // Auto-generar número de operación
  useEffect(() => {
    if (formData.tipo_movimiento && formData.fecha_movimiento && !formData.numero_operacion) {
      const fecha = formData.fecha_movimiento.replace(/-/g, '').slice(2); // YYMMDD
      const tipo = formData.tipo_movimiento.slice(0, 3).toUpperCase(); // Primeras 3 letras
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const numeroOperacion = `${tipo}-${fecha}-${random}`;
      
      setFormData(prev => ({
        ...prev,
        numero_operacion: numeroOperacion,
      }));
    }
  }, [formData.tipo_movimiento, formData.fecha_movimiento]);

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.concepto.trim()) {
      newErrors.concepto = 'El concepto es obligatorio';
    } else if (formData.concepto.length < 5) {
      newErrors.concepto = 'El concepto debe tener al menos 5 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.monto || parseInt(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    } else if (parseInt(formData.monto) > 100000000) {
      newErrors.monto = 'El monto no puede exceder $100.000.000';
    }

    if (!formData.tipo_movimiento) {
      newErrors.tipo_movimiento = 'El tipo de movimiento es obligatorio';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    if (!formData.fecha_movimiento) {
      newErrors.fecha_movimiento = 'La fecha es obligatoria';
    }

    if (!formData.banco) {
      newErrors.banco = 'El banco es obligatorio';
    }

    if (!formData.sucursal) {
      newErrors.sucursal = 'La sucursal es obligatoria';
    }

    if (!formData.ejecutivo_responsable) {
      newErrors.ejecutivo_responsable = 'El ejecutivo responsable es obligatorio';
    }

    if (!formData.cuenta_origen.trim()) {
      newErrors.cuenta_origen = 'La cuenta origen es obligatoria';
    }

    if (!formData.cuenta_destino.trim()) {
      newErrors.cuenta_destino = 'La cuenta destino es obligatoria';
    }

    if (formData.cuenta_origen === formData.cuenta_destino) {
      newErrors.cuenta_destino = 'La cuenta destino debe ser diferente a la cuenta origen';
    }

    if (!formData.numero_operacion.trim()) {
      newErrors.numero_operacion = 'El número de operación es obligatorio';
    }

    if (formData.saldo_anterior === '' || parseInt(formData.saldo_anterior) < 0) {
      newErrors.saldo_anterior = 'El saldo anterior debe ser un número no negativo';
    }

    // Validaciones específicas por tipo de movimiento
    if (formData.tipo_movimiento === 'Comisión' && (!formData.comision || parseInt(formData.comision) <= 0)) {
      newErrors.comision = 'La comisión es obligatoria para movimientos de tipo Comisión';
    }

    if (formData.tipo_movimiento === 'Interés' && (!formData.interes || parseInt(formData.interes) <= 0)) {
      newErrors.interes = 'El interés es obligatorio para movimientos de tipo Interés';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
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
    <>
          <Navbar />
    
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 p-4 max-w-7xl mx-auto"
          >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>
                      {isEditing ? 'Editar Movimiento CCAA' : 'Nuevo Movimiento CCAA'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    <div className="max-w-7xl mx-auto px-4">
                      {isEditing 
                        ? 'Modifica la información del movimiento de cuenta corriente de ahorro y aporte'
                        : 'Registra un nuevo movimiento bancario institucional'
                      }
                    </div>
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Ocultar Vista Previa
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Vista Previa
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Información del Movimiento */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Información del Movimiento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Concepto */}
                <div className="space-y-2">
                  <Label htmlFor="concepto">
                    Concepto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="concepto"
                    placeholder="Ej: Depósito mensualidades enero"
                    value={formData.concepto}
                    onChange={(e) => handleInputChange('concepto', e.target.value)}
                    className={errors.concepto ? 'border-red-500' : ''}
                  />
                  {errors.concepto && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.concepto}</span>
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">
                    Categoría <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleInputChange('categoria', value)}
                  >
                    <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_MOVIMIENTO_CCAA.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.categoria}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe detalladamente el movimiento bancario..."
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  className={errors.descripcion ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.descripcion}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Información Financiera */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Información Financiera</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tipo de movimiento */}
                <div className="space-y-2">
                  <Label htmlFor="tipo_movimiento">
                    Tipo de Movimiento <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.tipo_movimiento}
                    onValueChange={(value) => handleInputChange('tipo_movimiento', value)}
                  >
                    <SelectTrigger className={errors.tipo_movimiento ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TIPOS_MOVIMIENTO_CCAA).map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          <div className="flex items-center space-x-2">
                            {tipo === 'Depósito' && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {tipo === 'Retiro' && <TrendingDown className="w-4 h-4 text-red-600" />}
                            {tipo === 'Transferencia' && <ArrowRightLeft className="w-4 h-4 text-blue-600" />}
                            {tipo === 'Interés' && <Percent className="w-4 h-4 text-purple-600" />}
                            {tipo === 'Comisión' && <CreditCard className="w-4 h-4 text-orange-600" />}
                            <span>{tipo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo_movimiento && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.tipo_movimiento}</span>
                    </p>
                  )}
                </div>

                {/* Monto */}
                <div className="space-y-2">
                  <Label htmlFor="monto">
                    Monto <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="monto"
                      type="number"
                      placeholder="0"
                      value={formData.monto}
                      onChange={(e) => handleInputChange('monto', e.target.value)}
                      className={cn("pl-10", errors.monto ? 'border-red-500' : '')}
                    />
                  </div>
                  {formData.monto && (
                    <p className="text-sm text-gray-600">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(parseInt(formData.monto))}
                    </p>
                  )}
                  {errors.monto && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.monto}</span>
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_movimiento">
                    Fecha de Movimiento <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="fecha_movimiento"
                      type="date"
                      value={formData.fecha_movimiento}
                      onChange={(e) => handleInputChange('fecha_movimiento', e.target.value)}
                      className={cn("pl-10", errors.fecha_movimiento ? 'border-red-500' : '')}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.fecha_movimiento && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.fecha_movimiento}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Saldo anterior */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saldo_anterior">
                    Saldo Anterior <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="saldo_anterior"
                      type="number"
                      placeholder="0"
                      value={formData.saldo_anterior}
                      onChange={(e) => handleInputChange('saldo_anterior', e.target.value)}
                      className={cn("pl-10", errors.saldo_anterior ? 'border-red-500' : '')}
                    />
                  </div>
                  {formData.saldo_anterior && (
                    <p className="text-sm text-gray-600">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(parseInt(formData.saldo_anterior))}
                    </p>
                  )}
                  {errors.saldo_anterior && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.saldo_anterior}</span>
                    </p>
                  )}
                </div>

                {/* Comisión */}
                <div className="space-y-2">
                  <Label htmlFor="comision">
                    Comisión {formData.tipo_movimiento === 'Comisión' && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="comision"
                      type="number"
                      placeholder="0"
                      value={formData.comision}
                      onChange={(e) => handleInputChange('comision', e.target.value)}
                      className={cn("pl-10", errors.comision ? 'border-red-500' : '')}
                    />
                  </div>
                  {formData.comision && parseInt(formData.comision) > 0 && (
                    <p className="text-sm text-red-600">
                      -{new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(parseInt(formData.comision))}
                    </p>
                  )}
                  {errors.comision && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.comision}</span>
                    </p>
                  )}
                </div>

                {/* Interés */}
                <div className="space-y-2">
                  <Label htmlFor="interes">
                    Interés {formData.tipo_movimiento === 'Interés' && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="interes"
                      type="number"
                      placeholder="0"
                      value={formData.interes}
                      onChange={(e) => handleInputChange('interes', e.target.value)}
                      className={cn("pl-10", errors.interes ? 'border-red-500' : '')}
                    />
                  </div>
                  {formData.interes && parseInt(formData.interes) > 0 && (
                    <p className="text-sm text-green-600">
                      +{new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(parseInt(formData.interes))}
                    </p>
                  )}
                  {errors.interes && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.interes}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Información Bancaria */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Información Bancaria</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Banco */}
                <div className="space-y-2">
                  <Label htmlFor="banco">
                    Banco <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.banco}
                    onValueChange={(value) => handleInputChange('banco', value)}
                  >
                    <SelectTrigger className={errors.banco ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona el banco" />
                    </SelectTrigger>
                    <SelectContent>
                      {BANCOS_CCAA.map((banco) => (
                        <SelectItem key={banco} value={banco}>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>{banco}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.banco && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.banco}</span>
                    </p>
                  )}
                </div>

                {/* Sucursal */}
                <div className="space-y-2">
                  <Label htmlFor="sucursal">
                    Sucursal <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.sucursal}
                    onValueChange={(value) => handleInputChange('sucursal', value)}
                    disabled={!formData.banco}
                  >
                    <SelectTrigger className={errors.sucursal ? 'border-red-500' : ''}>
                      <SelectValue placeholder={formData.banco ? "Selecciona la sucursal" : "Primero selecciona un banco"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sucursalesDisponibles.map((sucursal) => (
                        <SelectItem key={sucursal} value={sucursal}>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{sucursal}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sucursal && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.sucursal}</span>
                    </p>
                  )}
                </div>

                {/* Ejecutivo responsable */}
                <div className="space-y-2">
                  <Label htmlFor="ejecutivo_responsable">
                    Ejecutivo Responsable <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.ejecutivo_responsable}
                    onValueChange={(value) => handleInputChange('ejecutivo_responsable', value)}
                    disabled={!formData.banco}
                  >
                    <SelectTrigger className={errors.ejecutivo_responsable ? 'border-red-500' : ''}>
                      <SelectValue placeholder={formData.banco ? "Selecciona el ejecutivo" : "Primero selecciona un banco"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ejecutivosDisponibles.map((ejecutivo) => (
                        <SelectItem key={ejecutivo} value={ejecutivo}>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{ejecutivo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ejecutivo_responsable && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.ejecutivo_responsable}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cuentas */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Cuentas Involucradas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cuenta origen */}
                <div className="space-y-2">
                  <Label htmlFor="cuenta_origen">
                    Cuenta Origen <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.cuenta_origen}
                    onValueChange={(value) => handleInputChange('cuenta_origen', value)}
                  >
                    <SelectTrigger className={errors.cuenta_origen ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona cuenta origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_CUENTA_CCAA.map((cuenta) => (
                        <SelectItem key={cuenta} value={cuenta}>
                          <div className="flex items-center space-x-2">
                            <Upload className="w-4 h-4 text-red-500" />
                            <span>{cuenta}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cuenta_origen && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.cuenta_origen}</span>
                    </p>
                  )}
                </div>

                {/* Cuenta destino */}
                <div className="space-y-2">
                  <Label htmlFor="cuenta_destino">
                    Cuenta Destino <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.cuenta_destino}
                    onValueChange={(value) => handleInputChange('cuenta_destino', value)}
                  >
                    <SelectTrigger className={errors.cuenta_destino ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona cuenta destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_CUENTA_CCAA.map((cuenta) => (
                        <SelectItem key={cuenta} value={cuenta}>
                          <div className="flex items-center space-x-2">
                            <Download className="w-4 h-4 text-green-500" />
                            <span>{cuenta}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cuenta_destino && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.cuenta_destino}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Número de operación */}
              <div className="space-y-2">
                <Label htmlFor="numero_operacion">
                  Número de Operación <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="numero_operacion"
                    placeholder="Se genera automáticamente"
                    value={formData.numero_operacion}
                    onChange={(e) => handleInputChange('numero_operacion', e.target.value)}
                    className={cn("pl-10 font-mono", errors.numero_operacion ? 'border-red-500' : '')}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  El número se genera automáticamente basado en el tipo y fecha, pero puedes modificarlo si es necesario.
                </p>
                {errors.numero_operacion && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.numero_operacion}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Observaciones */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Observaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Información adicional sobre el movimiento bancario (opcional)..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Puedes agregar cualquier información relevante sobre este movimiento bancario.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vista previa */}
        <MovimientoPreview
          formData={formData}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
        />

        {/* Botones de acción */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-gray-600">
                    Los campos marcados con <span className="text-red-500">*</span> son obligatorios
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[120px]"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditing ? 'Actualizar' : 'Crear'} Movimiento
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </form>
    </motion.div>
    </>
  );
}

export default MovimientoCcaaForm;

