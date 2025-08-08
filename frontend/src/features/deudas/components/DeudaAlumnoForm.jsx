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
  CreditCard,
  Clock,
  Users,
  Tag,
  BookOpen,
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
    apoderado: 'María Pérez González',
    email_apoderado: 'maria.perez@email.com',
    telefono_apoderado: '+56 9 8765 4321'
  },
  { 
    id: 2, 
    nombre: 'Ana María González', 
    curso: '7° Básico B',
    apoderado: 'Roberto González Silva',
    email_apoderado: 'roberto.gonzalez@email.com',
    telefono_apoderado: '+56 9 7654 3210'
  },
  { 
    id: 3, 
    nombre: 'Carlos Eduardo Morales', 
    curso: '1° Medio A',
    apoderado: 'Elena Morales Torres',
    email_apoderado: 'elena.morales@email.com',
    telefono_apoderado: '+56 9 6543 2109'
  },
  { 
    id: 4, 
    nombre: 'Sofía Alejandra Ruiz', 
    curso: '6° Básico A',
    apoderado: 'Carmen Ruiz Herrera',
    email_apoderado: 'carmen.ruiz@email.com',
    telefono_apoderado: '+56 9 5432 1098'
  },
  { 
    id: 5, 
    nombre: 'Diego Andrés López', 
    curso: '2° Medio B',
    apoderado: 'Patricia López Mendoza',
    email_apoderado: 'patricia.lopez@email.com',
    telefono_apoderado: '+56 9 4321 0987'
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

// Componente principal del formulario
export function DeudaAlumnoForm({
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
    monto_original: '',
    fecha_vencimiento: '',
    tipo_deuda: '',
    alumno_id: '',
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
        monto_original: deuda.monto_original?.toString() || '',
        fecha_vencimiento: deuda.fecha_vencimiento || '',
        tipo_deuda: deuda.tipo_deuda || '',
        alumno_id: deuda.alumno_id?.toString() || '',
        observaciones: deuda.observaciones || '',
      });
    } else {
      // Resetear formulario para nueva deuda
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const vencimiento = nextMonth.toISOString().split('T')[0];
      
      setFormData({
        concepto: '',
        descripcion: '',
        monto_original: '',
        fecha_vencimiento: vencimiento,
        tipo_deuda: '',
        alumno_id: '',
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
        monto_original: parseInt(formData.monto_original),
        alumno_id: parseInt(formData.alumno_id),
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
  const title = isEditing ? 'Editar Deuda' : 'Nueva Deuda de Alumno';
  const description = isEditing 
    ? 'Modifica la información de la deuda' 
    : 'Registra una nueva deuda para un alumno';

  const selectedAlumno = alumnos.find(a => a.id.toString() === formData.alumno_id);

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Alumno */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Información del Alumno</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alumno_id" className="text-sm font-medium text-gray-700">
                    Alumno
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.alumno_id}
                    onValueChange={(value) => handleSelectChange('alumno_id', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.alumno_id && touched.alumno_id && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona un alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alumnos.map((alumno) => (
                        <SelectItem key={alumno.id} value={alumno.id.toString()}>
                          <div className="space-y-1">
                            <p className="font-medium">{alumno.nombre}</p>
                            <p className="text-xs text-gray-500">{alumno.curso}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.alumno_id && touched.alumno_id && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.alumno_id}</span>
                    </motion.p>
                  )}
                </div>

                {/* Vista previa del alumno seleccionado */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Información del Alumno:</p>
                  {selectedAlumno ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{selectedAlumno.nombre}</p>
                          <p className="text-sm text-gray-500">{selectedAlumno.curso}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Apoderado:</strong> {selectedAlumno.apoderado}</p>
                        <p><strong>Email:</strong> {selectedAlumno.email_apoderado}</p>
                        <p><strong>Teléfono:</strong> {selectedAlumno.telefono_apoderado}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <User className="w-4 h-4" />
                      <p>Selecciona un alumno para ver su información</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Deuda */}
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
                  label="Concepto de la Deuda"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.concepto}
                  touched={touched.concepto}
                  placeholder="Ej: Mensualidad Marzo 2024"
                  icon={BookOpen}
                  required
                  disabled={isSubmitting}
                />

                <div className="space-y-2">
                  <Label htmlFor="tipo_deuda" className="text-sm font-medium text-gray-700">
                    Tipo de Deuda
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
                      placeholder="Descripción detallada de la deuda, incluyendo conceptos específicos..."
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

          {/* Información Financiera */}
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
                  label="Monto de la Deuda"
                  name="monto_original"
                  type="number"
                  value={formData.monto_original}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.monto_original}
                  touched={touched.monto_original}
                  placeholder="Monto en pesos chilenos"
                  icon={DollarSign}
                  required
                  disabled={isSubmitting}
                  min="1"
                  max="10000000"
                />

                <FormField
                  label="Fecha de Vencimiento"
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
              {formData.monto_original && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Monto de la Deuda: {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(parseInt(formData.monto_original) || 0)}
                      </p>
                      <p className="text-sm text-blue-600">
                        Este será el monto inicial de la deuda
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
                  placeholder="Observaciones adicionales sobre la deuda, condiciones especiales, etc..."
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Puedes incluir información adicional como condiciones especiales, 
                  acuerdos de pago, o cualquier detalle relevante.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de la deuda */}
          {formData.alumno_id && formData.concepto && formData.monto_original && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Resumen de la Deuda</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Alumno</p>
                    <p className="text-green-800">{selectedAlumno?.nombre}</p>
                    <p className="text-sm text-green-600">{selectedAlumno?.curso}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Concepto</p>
                    <p className="text-green-800">{formData.concepto}</p>
                    {formData.tipo_deuda && (
                      <Badge variant="outline" className="mt-1 text-green-700 border-green-300">
                        {formData.tipo_deuda}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Monto</p>
                    <p className="text-lg font-bold text-green-800">
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(parseInt(formData.monto_original) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Vencimiento</p>
                    <p className="text-green-800">
                      {formData.fecha_vencimiento ? 
                        new Date(formData.fecha_vencimiento).toLocaleDateString('es-CL') : 
                        'No especificado'
                      }
                    </p>
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

export default DeudaAlumnoForm;

