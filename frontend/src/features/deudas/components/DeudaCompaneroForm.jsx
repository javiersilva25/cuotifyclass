import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  User, 
  DollarSign, 
  Calendar,
  FileText,
  AlertCircle,
  Handshake,
  Clock,
  Users,
  Tag,
  BookOpen,
  ArrowRightLeft,
  UserCheck,
  UserX,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

// Alumnos mock para selección
const ALUMNOS_MOCK = [
  { 
    id: 1, 
    nombre: 'Juan Carlos Pérez', 
    curso: '8° Básico A',
    email: 'juan.perez@colegio.cl',
    telefono: '+56 9 8765 4321'
  },
  { 
    id: 2, 
    nombre: 'Ana María González', 
    curso: '7° Básico B',
    email: 'ana.gonzalez@colegio.cl',
    telefono: '+56 9 7654 3210'
  },
  { 
    id: 3, 
    nombre: 'Carlos Eduardo Morales', 
    curso: '1° Medio A',
    email: 'carlos.morales@colegio.cl',
    telefono: '+56 9 6543 2109'
  },
  { 
    id: 4, 
    nombre: 'Sofía Alejandra Ruiz', 
    curso: '6° Básico A',
    email: 'sofia.ruiz@colegio.cl',
    telefono: '+56 9 5432 1098'
  },
  { 
    id: 5, 
    nombre: 'Diego Andrés López', 
    curso: '2° Medio B',
    email: 'diego.lopez@colegio.cl',
    telefono: '+56 9 4321 0987'
  },
];

// Componente para campo de entrada con validación
function FormField({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  error, 
  touched,
  type = 'text', 
  placeholder, 
  icon: Icon,
  required = false,
  disabled = false,
  className,
  ...props 
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        )}
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            Icon && "pl-10",
            error && touched && "border-red-300 focus:border-red-500 focus:ring-red-200"
          )}
          {...props}
        />
      </div>
      
      {error && touched && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center space-x-1"
        >
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  );
}

// Componente para mostrar la relación seleccionada
function RelacionPreview({ deudor, acreedor, monto, tipo }) {
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!deudor || !acreedor) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <Handshake className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Selecciona deudor y acreedor para ver la relación</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-4">
        {/* Deudor */}
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {deudor.nombre}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {deudor.curso}
            </p>
            <Badge variant="outline" className="text-xs mt-1 text-red-700 border-red-300">
              Deudor
            </Badge>
          </div>
        </div>

        {/* Flecha y monto */}
        <div className="flex flex-col items-center space-y-2">
          <ArrowRightLeft className="w-6 h-6 text-blue-600" />
          {monto && (
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(parseInt(monto))}
              </p>
              {tipo && (
                <Badge variant="outline" className="text-xs text-blue-700 border-blue-300">
                  {tipo}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Acreedor */}
        <div className="flex items-center space-x-3 flex-1">
          <div className="min-w-0 text-right">
            <p className="font-medium text-gray-900 truncate">
              {acreedor.nombre}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {acreedor.curso}
            </p>
            <Badge variant="outline" className="text-xs mt-1 text-green-700 border-green-300">
              Acreedor
            </Badge>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal del formulario
export function DeudaCompaneroForm({
  deuda = null,
  alumnos = ALUMNOS_MOCK,
  tiposDeuda = [],
  isOpen = false,
  onClose,
  onSubmit,
  isLoading = false,
  validateForm,
}) {
  const [formData, setFormData] = useState({
    concepto: '',
    descripcion: '',
    monto: '',
    fecha_vencimiento: '',
    tipo_deuda: '',
    deudor_id: '',
    acreedor_id: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos de la deuda si está editando
  useEffect(() => {
    if (deuda) {
      setFormData({
        concepto: deuda.concepto || '',
        descripcion: deuda.descripcion || '',
        monto: deuda.monto?.toString() || '',
        fecha_vencimiento: deuda.fecha_vencimiento || '',
        tipo_deuda: deuda.tipo_deuda || '',
        deudor_id: deuda.deudor_id?.toString() || '',
        acreedor_id: deuda.acreedor_id?.toString() || '',
        observaciones: deuda.observaciones || '',
      });
    } else {
      // Resetear formulario para nueva deuda
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const vencimiento = nextWeek.toISOString().split('T')[0];
      
      setFormData({
        concepto: '',
        descripcion: '',
        monto: '',
        fecha_vencimiento: vencimiento,
        tipo_deuda: '',
        deudor_id: '',
        acreedor_id: '',
        observaciones: '',
      });
    }
    
    setErrors({});
    setTouched({});
  }, [deuda, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validar campo individual si hay función de validación
    if (validateForm) {
      const validation = validateForm(formData);
      if (validation.errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validation.errors[name],
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    // Validar formulario
    if (validateForm) {
      const validation = validateForm(formData);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Convertir campos numéricos
      const submitData = {
        ...formData,
        monto: parseInt(formData.monto),
        deudor_id: parseInt(formData.deudor_id),
        acreedor_id: parseInt(formData.acreedor_id),
      };
      
      await onSubmit(submitData);
      
      // Si llegamos aquí, el submit fue exitoso
      onClose();
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const isEditing = !!deuda;
  const title = isEditing ? 'Editar Deuda entre Compañeros' : 'Nueva Deuda entre Compañeros';
  const description = isEditing 
    ? 'Modifica la información de la deuda entre compañeros' 
    : 'Registra una nueva deuda o préstamo entre estudiantes';

  const selectedDeudor = alumnos.find(a => a.id.toString() === formData.deudor_id);
  const selectedAcreedor = alumnos.find(a => a.id.toString() === formData.acreedor_id);

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Handshake className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vista previa de la relación */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2 text-blue-800">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Vista Previa de la Relación</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RelacionPreview
                deudor={selectedDeudor}
                acreedor={selectedAcreedor}
                monto={formData.monto}
                tipo={formData.tipo_deuda}
              />
            </CardContent>
          </Card>

          {/* Selección de participantes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Participantes de la Deuda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deudor */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deudor_id" className="text-sm font-medium text-gray-700">
                      Deudor (Quien debe)
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={formData.deudor_id}
                      onValueChange={(value) => handleSelectChange('deudor_id', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={cn(
                        errors.deudor_id && touched.deudor_id && "border-red-300 focus:border-red-500"
                      )}>
                        <SelectValue placeholder="Selecciona el deudor" />
                      </SelectTrigger>
                      <SelectContent>
                        {alumnos
                          .filter(alumno => alumno.id.toString() !== formData.acreedor_id)
                          .map((alumno) => (
                          <SelectItem key={alumno.id} value={alumno.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <UserX className="w-4 h-4 text-red-600" />
                              <div>
                                <p className="font-medium">{alumno.nombre}</p>
                                <p className="text-xs text-gray-500">{alumno.curso}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.deudor_id && touched.deudor_id && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center space-x-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.deudor_id}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Vista previa del deudor */}
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-600 font-medium mb-2">Información del Deudor:</p>
                    {selectedDeudor ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <UserX className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">{selectedDeudor.nombre}</p>
                            <p className="text-sm text-red-600">{selectedDeudor.curso}</p>
                          </div>
                        </div>
                        <div className="text-xs text-red-600 mt-2">
                          <p><strong>Email:</strong> {selectedDeudor.email}</p>
                          <p><strong>Teléfono:</strong> {selectedDeudor.telefono}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-500">
                        <UserX className="w-4 h-4" />
                        <p className="text-sm">Selecciona un deudor</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acreedor */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="acreedor_id" className="text-sm font-medium text-gray-700">
                      Acreedor (Quien presta)
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={formData.acreedor_id}
                      onValueChange={(value) => handleSelectChange('acreedor_id', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={cn(
                        errors.acreedor_id && touched.acreedor_id && "border-red-300 focus:border-red-500"
                      )}>
                        <SelectValue placeholder="Selecciona el acreedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {alumnos
                          .filter(alumno => alumno.id.toString() !== formData.deudor_id)
                          .map((alumno) => (
                          <SelectItem key={alumno.id} value={alumno.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <UserCheck className="w-4 h-4 text-green-600" />
                              <div>
                                <p className="font-medium">{alumno.nombre}</p>
                                <p className="text-xs text-gray-500">{alumno.curso}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.acreedor_id && touched.acreedor_id && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center space-x-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.acreedor_id}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Vista previa del acreedor */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium mb-2">Información del Acreedor:</p>
                    {selectedAcreedor ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{selectedAcreedor.nombre}</p>
                            <p className="text-sm text-green-600">{selectedAcreedor.curso}</p>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          <p><strong>Email:</strong> {selectedAcreedor.email}</p>
                          <p><strong>Teléfono:</strong> {selectedAcreedor.telefono}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-500">
                        <UserCheck className="w-4 h-4" />
                        <p className="text-sm">Selecciona un acreedor</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la deuda */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Información de la Deuda</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Concepto del Préstamo"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.concepto}
                  touched={touched.concepto}
                  placeholder="Ej: Préstamo para almuerzo"
                  icon={BookOpen}
                  required
                  disabled={isSubmitting}
                />

                <div className="space-y-2">
                  <Label htmlFor="tipo_deuda" className="text-sm font-medium text-gray-700">
                    Tipo de Préstamo
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.tipo_deuda}
                    onValueChange={(value) => handleSelectChange('tipo_deuda', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.tipo_deuda && touched.tipo_deuda && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDeuda.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4" />
                            <span>{tipo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo_deuda && touched.tipo_deuda && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.tipo_deuda}</span>
                    </motion.p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                      Descripción Detallada
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Describe los detalles del préstamo, condiciones, etc..."
                      rows={3}
                      disabled={isSubmitting}
                      className={cn(
                        errors.descripcion && touched.descripcion && "border-red-300 focus:border-red-500"
                      )}
                    />
                    {errors.descripcion && touched.descripcion && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-600 flex items-center space-x-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.descripcion}</span>
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información financiera */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Información Financiera</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Monto del Préstamo"
                  name="monto"
                  type="number"
                  value={formData.monto}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.monto}
                  touched={touched.monto}
                  placeholder="Monto en pesos chilenos"
                  icon={DollarSign}
                  required
                  disabled={isSubmitting}
                  min="1"
                  max="1000000"
                />

                <FormField
                  label="Fecha de Devolución"
                  name="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.fecha_vencimiento}
                  touched={touched.fecha_vencimiento}
                  icon={Calendar}
                  required
                  disabled={isSubmitting}
                  min={today}
                />
              </div>

              {/* Vista previa del monto */}
              {formData.monto && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Monto del Préstamo: {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(parseInt(formData.monto) || 0)}
                      </p>
                      <p className="text-sm text-blue-600">
                        {selectedDeudor && selectedAcreedor && (
                          <>
                            {selectedAcreedor.nombre} le presta a {selectedDeudor.nombre}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Observaciones Adicionales</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
                  Observaciones (Opcional)
                </Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Condiciones especiales, acuerdos adicionales, etc..."
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Puedes incluir condiciones especiales del préstamo, 
                  acuerdos entre las partes, o cualquier detalle relevante.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen final */}
          {formData.deudor_id && formData.acreedor_id && formData.concepto && formData.monto && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resumen del Préstamo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RelacionPreview
                    deudor={selectedDeudor}
                    acreedor={selectedAcreedor}
                    monto={formData.monto}
                    tipo={formData.tipo_deuda}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-600 font-medium">Concepto</p>
                      <p className="text-green-800">{formData.concepto}</p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Fecha de Devolución</p>
                      <p className="text-green-800">
                        {formData.fecha_vencimiento ? 
                          new Date(formData.fecha_vencimiento).toLocaleDateString('es-CL') : 
                          'No especificada'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje de error general */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Por favor, corrige los errores en el formulario antes de continuar.
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting || isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Save className="w-4 h-4" />
                </motion.div>
                {isEditing ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Actualizar Deuda' : 'Crear Deuda'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeudaCompaneroForm;

