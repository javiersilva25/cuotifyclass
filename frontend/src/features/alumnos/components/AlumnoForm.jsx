import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap,
  Users,
  AlertCircle,
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
import { cn } from '../../../lib/utils';

// Datos mock para cursos
const CURSOS_MOCK = [
  { id: 1, nombre: 'Pre-Kinder', nivel: 'Preescolar' },
  { id: 2, nombre: 'Kinder', nivel: 'Preescolar' },
  { id: 3, nombre: '1°A', nivel: 'Básica' },
  { id: 4, nombre: '1°B', nivel: 'Básica' },
  { id: 5, nombre: '2°A', nivel: 'Básica' },
  { id: 6, nombre: '2°B', nivel: 'Básica' },
  { id: 7, nombre: '3°A', nivel: 'Básica' },
  { id: 8, nombre: '3°B', nivel: 'Básica' },
  { id: 9, nombre: '4°A', nivel: 'Básica' },
  { id: 10, nombre: '4°B', nivel: 'Básica' },
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
export function AlumnoForm({
  alumno = null,
  isOpen = false,
  onClose,
  onSubmit,
  isLoading = false,
  validateForm,
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    curso_id: undefined,
    apoderado_nombre: '',
    apoderado_telefono: '',
    apoderado_email: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del alumno si está editando
  useEffect(() => {
    if (alumno) {
      setFormData({
        nombre: alumno.nombre || '',
        apellido: alumno.apellido || '',
        rut: alumno.rut || '',
        email: alumno.email || '',
        telefono: alumno.telefono || '',
        fecha_nacimiento: alumno.fecha_nacimiento || '',
        direccion: alumno.direccion || '',
        curso_id: alumno.curso_id != null ? alumno.curso_id.toString() : undefined,
        apoderado_nombre: alumno.apoderado_nombre || '',
        apoderado_telefono: alumno.apoderado_telefono || '',
        apoderado_email: alumno.apoderado_email || '',
        observaciones: alumno.observaciones || '',
      });
    } else {
      // Resetear formulario para nuevo alumno
      setFormData({
        nombre: '',
        apellido: '',
        rut: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        direccion: '',
        curso_id: undefined,
        apoderado_nombre: '',
        apoderado_telefono: '',
        apoderado_email: '',
        observaciones: '',
      });
    }
    
    setErrors({});
    setTouched({});
  }, [alumno, isOpen]);

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
      // Convertir curso_id a número
      const submitData = {
        ...formData,
        curso_id: parseInt(formData.curso_id),
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

  const isEditing = !!alumno;
  const title = isEditing ? 'Editar Alumno' : 'Nuevo Alumno';
  const description = isEditing 
    ? 'Modifica la información del alumno' 
    : 'Ingresa los datos del nuevo alumno';

  console.log('curso_id actual:', formData.curso_id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.nombre}
                  touched={touched.nombre}
                  placeholder="Ingresa el nombre"
                  icon={User}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.apellido}
                  touched={touched.apellido}
                  placeholder="Ingresa el apellido"
                  icon={User}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="RUT"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.rut}
                  touched={touched.rut}
                  placeholder="12345678-9"
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Fecha de Nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.fecha_nacimiento}
                  touched={touched.fecha_nacimiento}
                  icon={Calendar}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.email}
                  touched={touched.email}
                  placeholder="alumno@email.com"
                  icon={Mail}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.telefono}
                  touched={touched.telefono}
                  placeholder="+56912345678"
                  icon={Phone}
                  required
                  disabled={isSubmitting}
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.direccion}
                    touched={touched.direccion}
                    placeholder="Ingresa la dirección completa"
                    icon={MapPin}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Académica */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Información Académica</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="curso_id" className="text-sm font-medium text-gray-700">
                  Curso
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.curso_id || undefined}
                  onValueChange={(value) => handleSelectChange('curso_id', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={cn(
                    errors.curso_id && touched.curso_id && "border-red-300 focus:border-red-500"
                  )}>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURSOS_MOCK.map((curso) => (
                      <SelectItem key={curso.id} value={curso.id.toString()}>
                        {curso.nombre} - {curso.nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.curso_id && touched.curso_id && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.curso_id}</span>
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del Apoderado */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Información del Apoderado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    label="Nombre del Apoderado"
                    name="apoderado_nombre"
                    value={formData.apoderado_nombre}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.apoderado_nombre}
                    touched={touched.apoderado_nombre}
                    placeholder="Nombre completo del apoderado"
                    icon={User}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <FormField
                  label="Teléfono del Apoderado"
                  name="apoderado_telefono"
                  value={formData.apoderado_telefono}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.apoderado_telefono}
                  touched={touched.apoderado_telefono}
                  placeholder="+56912345678"
                  icon={Phone}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Email del Apoderado"
                  name="apoderado_email"
                  type="email"
                  value={formData.apoderado_email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.apoderado_email}
                  touched={touched.apoderado_email}
                  placeholder="apoderado@email.com"
                  icon={Mail}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
                  Observaciones adicionales
                </Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Información adicional sobre el alumno..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

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
                {isEditing ? 'Actualizar' : 'Guardar'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AlumnoForm;

