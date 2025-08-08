import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Receipt, 
  Eye, 
  EyeOff,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Home,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Wallet,
  CreditCard,
  Phone,
  Mail,
  Building,
  Target,
  Users,
  Info,
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
import Navbar from "../../../pages/Navbar.jsx";

// Datos mock de usuarios (padres y profesores)
const USUARIOS_MOCK = [
  // Padres
  {
    id: 1,
    nombre: 'María González',
    tipo: 'Padre',
    rut: '12.345.678-9',
    email: 'maria.gonzalez@email.com',
    telefono: '+56 9 8765 4321',
    saldo_actual: 45000,
  },
  {
    id: 2,
    nombre: 'Ana Martínez',
    tipo: 'Padre',
    rut: '11.222.333-4',
    email: 'ana.martinez@email.com',
    telefono: '+56 9 9876 5432',
    saldo_actual: 75000,
  },
  {
    id: 3,
    nombre: 'Roberto Silva',
    tipo: 'Padre',
    rut: '22.333.444-5',
    email: 'roberto.silva@email.com',
    telefono: '+56 9 5555 6666',
    saldo_actual: 120000,
  },
  // Profesores
  {
    id: 4,
    nombre: 'Carlos Rodríguez',
    tipo: 'Profesor',
    rut: '98.765.432-1',
    email: 'carlos.rodriguez@colegio.cl',
    telefono: '+56 9 1234 5678',
    saldo_actual: 80000,
  },
  {
    id: 5,
    nombre: 'Patricia López',
    tipo: 'Profesor',
    rut: '33.444.555-6',
    email: 'patricia.lopez@colegio.cl',
    telefono: '+56 9 7777 8888',
    saldo_actual: 90000,
  },
  {
    id: 6,
    nombre: 'Miguel Torres',
    tipo: 'Profesor',
    rut: '44.555.666-7',
    email: 'miguel.torres@colegio.cl',
    telefono: '+56 9 3333 4444',
    saldo_actual: 65000,
  },
];

// Componente para vista previa del movimiento
function MovimientoPreview({ 
  formData, 
  selectedUser, 
  showPreview, 
  onTogglePreview 
}) {
  if (!showPreview) return null;

  const calcularNuevoSaldo = () => {
    if (!selectedUser || !formData.monto) return selectedUser?.saldo_actual || 0;
    
    const monto = parseInt(formData.monto) || 0;
    const saldoActual = selectedUser.saldo_actual;
    
    switch (formData.tipo_movimiento) {
      case 'Ingreso':
        return saldoActual + monto;
      case 'Egreso':
        return saldoActual - monto;
      case 'Transferencia':
        return saldoActual; // Las transferencias requieren lógica especial
      default:
        return saldoActual;
    }
  };

  const nuevoSaldo = calcularNuevoSaldo();
  const diferencia = nuevoSaldo - (selectedUser?.saldo_actual || 0);

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Ingreso': return TrendingUp;
      case 'Egreso': return TrendingDown;
      case 'Transferencia': return ArrowRightLeft;
      default: return DollarSign;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Ingreso': return 'text-green-600 bg-green-50 border-green-200';
      case 'Egreso': return 'text-red-600 bg-red-50 border-red-200';
      case 'Transferencia': return 'text-blue-600 bg-blue-50 border-blue-200';
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
              <span>Vista Previa del Movimiento</span>
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">Monto</p>
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

          {/* Información del usuario */}
          {selectedUser && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Usuario</p>
              <div className="flex items-center space-x-3">
                {selectedUser.tipo === 'Padre' ? (
                  <Home className="w-5 h-5 text-blue-600" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {selectedUser.tipo} • RUT: {selectedUser.rut}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Impacto en saldo */}
          {selectedUser && formData.monto && formData.tipo_movimiento && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Impacto en Saldo</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Saldo Actual</p>
                  <p className="font-bold text-gray-700">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(selectedUser.saldo_actual)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Cambio</p>
                  <p className={cn(
                    "font-bold",
                    diferencia > 0 && "text-green-600",
                    diferencia < 0 && "text-red-600",
                    diferencia === 0 && "text-gray-600"
                  )}>
                    {diferencia > 0 ? '+' : ''}{new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(diferencia)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Nuevo Saldo</p>
                  <p className={cn(
                    "font-bold",
                    nuevoSaldo > selectedUser.saldo_actual && "text-green-600",
                    nuevoSaldo < selectedUser.saldo_actual && "text-red-600",
                    nuevoSaldo === selectedUser.saldo_actual && "text-gray-600"
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

          {/* Método de pago y comprobante */}
          {(formData.metodo_pago || formData.numero_comprobante) && (
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Comprobante</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {formData.metodo_pago || 'Sin especificar'}
                  </span>
                </div>
                {formData.numero_comprobante && (
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      N° {formData.numero_comprobante}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente principal del formulario
export function MovimientoCcppForm({
  initialData = {},
  isEditing = false,
  isLoading = false,
  onSubmit = () => {},
  onCancel = () => {},
  TIPOS_MOVIMIENTO = {},
  CATEGORIAS_MOVIMIENTO = [],
  METODOS_PAGO = [],
  validation = {},
}) {
  const [formData, setFormData] = useState({
    concepto: '',
    descripcion: '',
    monto: '',
    tipo_movimiento: '',
    categoria: '',
    fecha_movimiento: new Date().toISOString().split('T')[0],
    usuario_id: '',
    usuario_tipo: '',
    usuario_nombre: '',
    usuario_rut: '',
    usuario_email: '',
    usuario_telefono: '',
    metodo_pago: '',
    numero_comprobante: '',
    saldo_anterior: '',
    observaciones: '',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (isEditing && initialData.usuario_id) {
      const user = USUARIOS_MOCK.find(u => u.id === initialData.usuario_id);
      if (user) {
        setSelectedUser(user);
        setFormData(prev => ({
          ...prev,
          usuario_tipo: user.tipo,
          usuario_nombre: user.nombre,
          usuario_rut: user.rut,
          usuario_email: user.email,
          usuario_telefono: user.telefono,
          saldo_anterior: user.saldo_actual,
        }));
      }
    }
  }, [isEditing, initialData]);

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

  // Manejar selección de usuario
  const handleUserSelect = (userId) => {
    const user = USUARIOS_MOCK.find(u => u.id === parseInt(userId));
    if (user) {
      setSelectedUser(user);
      setFormData(prev => ({
        ...prev,
        usuario_id: user.id,
        usuario_tipo: user.tipo,
        usuario_nombre: user.nombre,
        usuario_rut: user.rut,
        usuario_email: user.email,
        usuario_telefono: user.telefono,
        saldo_anterior: user.saldo_actual,
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.concepto.trim()) {
      newErrors.concepto = 'El concepto es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (!formData.monto || parseInt(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
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

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'Debe seleccionar un usuario';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'El método de pago es obligatorio';
    }

    if (!formData.numero_comprobante.trim()) {
      newErrors.numero_comprobante = 'El número de comprobante es obligatorio';
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

  // Obtener usuarios filtrados por tipo
  const getUsuariosByTipo = (tipo) => {
    return USUARIOS_MOCK.filter(u => u.tipo === tipo);
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
                    <Users className="w-5 h-5" />
                    <span>
                      {isEditing ? 'Editar Movimiento CCPP' : 'Nuevo Movimiento CCPP'}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? 'Modifica la información del movimiento de cuenta corriente'
                      : 'Registra un nuevo movimiento para cuentas de padres y profesores'
                    }
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
                    placeholder="Ej: Aporte mensual centro de padres"
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
                      {CATEGORIAS_MOVIMIENTO.map((categoria) => (
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
                  placeholder="Describe detalladamente el movimiento..."
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
                      {Object.values(TIPOS_MOVIMIENTO).map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          <div className="flex items-center space-x-2">
                            {tipo === 'Ingreso' && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {tipo === 'Egreso' && <TrendingDown className="w-4 h-4 text-red-600" />}
                            {tipo === 'Transferencia' && <ArrowRightLeft className="w-4 h-4 text-blue-600" />}
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Información del Usuario */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Información del Usuario</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de usuario */}
              <div className="space-y-2">
                <Label htmlFor="usuario_id">
                  Usuario <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.usuario_id?.toString() || ''}
                  onValueChange={handleUserSelect}
                >
                  <SelectTrigger className={errors.usuario_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <p className="text-xs font-medium text-blue-600 mb-2 flex items-center space-x-1">
                        <Home className="w-3 h-3" />
                        <span>PADRES</span>
                      </p>
                      {getUsuariosByTipo('Padre').map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <Home className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{usuario.nombre}</p>
                              <p className="text-xs text-gray-500">
                                RUT: {usuario.rut} • Saldo: {new Intl.NumberFormat('es-CL', {
                                  style: 'currency',
                                  currency: 'CLP',
                                  minimumFractionDigits: 0,
                                }).format(usuario.saldo_actual)}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <div className="border-t my-2"></div>
                      
                      <p className="text-xs font-medium text-purple-600 mb-2 flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>PROFESORES</span>
                      </p>
                      {getUsuariosByTipo('Profesor').map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            <div>
                              <p className="font-medium">{usuario.nombre}</p>
                              <p className="text-xs text-gray-500">
                                RUT: {usuario.rut} • Saldo: {new Intl.NumberFormat('es-CL', {
                                  style: 'currency',
                                  currency: 'CLP',
                                  minimumFractionDigits: 0,
                                }).format(usuario.saldo_actual)}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                {errors.usuario_id && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.usuario_id}</span>
                  </p>
                )}
              </div>

              {/* Vista previa del usuario seleccionado */}
              {selectedUser && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {selectedUser.tipo === 'Padre' ? (
                      <Home className="w-6 h-6 text-blue-600" />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{selectedUser.nombre}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            selectedUser.tipo === 'Padre' 
                              ? "text-blue-700 border-blue-300" 
                              : "text-purple-700 border-purple-300"
                          )}
                        >
                          {selectedUser.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">RUT: {selectedUser.rut}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{selectedUser.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">{selectedUser.telefono}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wallet className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">
                            Saldo: {new Intl.NumberFormat('es-CL', {
                              style: 'currency',
                              currency: 'CLP',
                              minimumFractionDigits: 0,
                            }).format(selectedUser.saldo_actual)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Información del Comprobante */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Información del Comprobante</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Método de pago */}
                <div className="space-y-2">
                  <Label htmlFor="metodo_pago">
                    Método de Pago <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.metodo_pago}
                    onValueChange={(value) => handleInputChange('metodo_pago', value)}
                  >
                    <SelectTrigger className={errors.metodo_pago ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona el método" />
                    </SelectTrigger>
                    <SelectContent>
                      {METODOS_PAGO.map((metodo) => (
                        <SelectItem key={metodo} value={metodo}>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>{metodo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.metodo_pago && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.metodo_pago}</span>
                    </p>
                  )}
                </div>

                {/* Número de comprobante */}
                <div className="space-y-2">
                  <Label htmlFor="numero_comprobante">
                    Número de Comprobante <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="numero_comprobante"
                      placeholder="Ej: TRF-001234"
                      value={formData.numero_comprobante}
                      onChange={(e) => handleInputChange('numero_comprobante', e.target.value)}
                      className={cn("pl-10", errors.numero_comprobante ? 'border-red-500' : '')}
                    />
                  </div>
                  {errors.numero_comprobante && (
                    <p className="text-sm text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.numero_comprobante}</span>
                    </p>
                  )}
                </div>
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
                  placeholder="Información adicional sobre el movimiento (opcional)..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Puedes agregar cualquier información relevante sobre este movimiento.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vista previa */}
        <MovimientoPreview
          formData={formData}
          selectedUser={selectedUser}
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

export default MovimientoCcppForm;

