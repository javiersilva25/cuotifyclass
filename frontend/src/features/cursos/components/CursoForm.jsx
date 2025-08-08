import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  GraduationCap, 
  User, 
  Clock, 
  MapPin, 
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
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

// Datos mock para profesores
const PROFESORES_MOCK = [
  { id: 1, nombre: 'María Elena Rodríguez', especialidad: 'Educación Preescolar' },
  { id: 2, nombre: 'Carmen Silva Torres', especialidad: 'Educación Preescolar' },
  { id: 3, nombre: 'Pedro Martínez López', especialidad: 'Educación Básica' },
  { id: 4, nombre: 'Ana Torres Vargas', especialidad: 'Educación Básica' },
  { id: 5, nombre: 'Luis Hernández Castro', especialidad: 'Matemáticas' },
  { id: 6, nombre: 'Patricia González Ruiz', especialidad: 'Lenguaje' },
  { id: 7, nombre: 'Roberto Silva Mendoza', especialidad: 'Educación Física' },
  { id: 8, nombre: 'Carolina Morales Díaz', especialidad: 'Ciencias Naturales' },
  { id: 9, nombre: 'Fernando López Soto', especialidad: 'Historia y Geografía' },
  { id: 10, nombre: 'Mónica Herrera Vega', especialidad: 'Inglés' },
];

// Niveles disponibles
const NIVELES = [
  'Preescolar',
  'Básica',
  'Media',
  'Especial',
];

// Días de la semana
const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
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

// Componente para selección de días
function DiasSelector({ value = [], onChange, error, touched }) {
  const handleDayToggle = (dia) => {
    const newDias = value.includes(dia)
      ? value.filter(d => d !== dia)
      : [...value, dia];
    onChange(newDias);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        Días de Clase
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <div className="grid grid-cols-3 gap-2">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="flex items-center space-x-2">
            <Checkbox
              id={dia}
              checked={value.includes(dia)}
              onCheckedChange={() => handleDayToggle(dia)}
            />
            <Label htmlFor={dia} className="text-sm">
              {dia}
            </Label>
          </div>
        ))}
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
export function CursoForm({
  curso = null,
  isOpen = false,
  onClose,
  onSubmit,
  isLoading = false,
  validateForm,
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    nivel: '',
    descripcion: '',
    capacidad_maxima: '',
    profesor_principal: '',
    profesor_id: '',
    aula: '',
    horario_inicio: '',
    horario_fin: '',
    dias_semana: [],
    costo_matricula: '',
    costo_mensual: '',
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del curso si está editando
  useEffect(() => {
    if (curso) {
      setFormData({
        nombre: curso.nombre || '',
        nivel: curso.nivel || '',
        descripcion: curso.descripcion || '',
        capacidad_maxima: curso.capacidad_maxima?.toString() || '',
        profesor_principal: curso.profesor_principal || '',
        profesor_id: curso.profesor_id?.toString() || '',
        aula: curso.aula || '',
        horario_inicio: curso.horario_inicio || '',
        horario_fin: curso.horario_fin || '',
        dias_semana: curso.dias_semana || [],
        costo_matricula: curso.costo_matricula?.toString() || '',
        costo_mensual: curso.costo_mensual?.toString() || '',
        fecha_inicio: curso.fecha_inicio || '',
        fecha_fin: curso.fecha_fin || '',
        observaciones: curso.observaciones || '',
      });
    } else {
      // Resetear formulario para nuevo curso
      setFormData({
        nombre: '',
        nivel: '',
        descripcion: '',
        capacidad_maxima: '',
        profesor_principal: '',
        profesor_id: '',
        aula: '',
        horario_inicio: '',
        horario_fin: '',
        dias_semana: [],
        costo_matricula: '',
        costo_mensual: '',
        fecha_inicio: '',
        fecha_fin: '',
        observaciones: '',
      });
    }
    
    setErrors({});
    setTouched({});
  }, [curso, isOpen]);

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
    
    // Si es profesor, también actualizar el nombre
    if (name === 'profesor_id') {
      const profesor = PROFESORES_MOCK.find(p => p.id.toString() === value);
      if (profesor) {
        setFormData(prev => ({
          ...prev,
          profesor_principal: profesor.nombre,
        }));
      }
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDiasChange = (dias) => {
    setFormData(prev => ({
      ...prev,
      dias_semana: dias,
    }));
    
    if (errors.dias_semana) {
      setErrors(prev => ({
        ...prev,
        dias_semana: '',
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
        capacidad_maxima: parseInt(formData.capacidad_maxima),
        profesor_id: parseInt(formData.profesor_id),
        costo_matricula: parseInt(formData.costo_matricula),
        costo_mensual: parseInt(formData.costo_mensual),
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

  const isEditing = !!curso;
  const title = isEditing ? 'Editar Curso' : 'Nuevo Curso';
  const description = isEditing 
    ? 'Modifica la información del curso' 
    : 'Ingresa los datos del nuevo curso';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Información General</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nombre del Curso"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.nombre}
                  touched={touched.nombre}
                  placeholder="Ej: 3°A, Pre-Kinder, etc."
                  icon={GraduationCap}
                  required
                  disabled={isSubmitting}
                />

                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-sm font-medium text-gray-700">
                    Nivel
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.nivel}
                    onValueChange={(value) => handleSelectChange('nivel', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.nivel && touched.nivel && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona un nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVELES.map((nivel) => (
                        <SelectItem key={nivel} value={nivel}>
                          {nivel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.nivel && touched.nivel && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.nivel}</span>
                    </motion.p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                      Descripción
                    </Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Descripción del curso y sus objetivos..."
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <FormField
                  label="Capacidad Máxima"
                  name="capacidad_maxima"
                  type="number"
                  value={formData.capacidad_maxima}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.capacidad_maxima}
                  touched={touched.capacidad_maxima}
                  placeholder="Número máximo de alumnos"
                  icon={Users}
                  required
                  disabled={isSubmitting}
                  min="1"
                  max="50"
                />

                <FormField
                  label="Aula"
                  name="aula"
                  value={formData.aula}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.aula}
                  touched={touched.aula}
                  placeholder="Ej: Aula 101, Sala Verde, etc."
                  icon={MapPin}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información del Profesor */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Profesor Principal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="profesor_id" className="text-sm font-medium text-gray-700">
                  Profesor
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  value={formData.profesor_id}
                  onValueChange={(value) => handleSelectChange('profesor_id', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={cn(
                    errors.profesor_principal && touched.profesor_principal && "border-red-300 focus:border-red-500"
                  )}>
                    <SelectValue placeholder="Selecciona un profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESORES_MOCK.map((profesor) => (
                      <SelectItem key={profesor.id} value={profesor.id.toString()}>
                        <div>
                          <p className="font-medium">{profesor.nombre}</p>
                          <p className="text-sm text-gray-500">{profesor.especialidad}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.profesor_principal && touched.profesor_principal && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center space-x-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.profesor_principal}</span>
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Horarios</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField
                  label="Hora de Inicio"
                  name="horario_inicio"
                  type="time"
                  value={formData.horario_inicio}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.horario_inicio}
                  touched={touched.horario_inicio}
                  icon={Clock}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Hora de Fin"
                  name="horario_fin"
                  type="time"
                  value={formData.horario_fin}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.horario_fin}
                  touched={touched.horario_fin}
                  icon={Clock}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <DiasSelector
                value={formData.dias_semana}
                onChange={handleDiasChange}
                error={errors.dias_semana}
                touched={touched.dias_semana}
              />
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
                  label="Costo de Matrícula"
                  name="costo_matricula"
                  type="number"
                  value={formData.costo_matricula}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.costo_matricula}
                  touched={touched.costo_matricula}
                  placeholder="Monto en pesos chilenos"
                  icon={DollarSign}
                  required
                  disabled={isSubmitting}
                  min="0"
                />

                <FormField
                  label="Costo Mensual"
                  name="costo_mensual"
                  type="number"
                  value={formData.costo_mensual}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.costo_mensual}
                  touched={touched.costo_mensual}
                  placeholder="Monto en pesos chilenos"
                  icon={DollarSign}
                  required
                  disabled={isSubmitting}
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Período Académico */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Período Académico</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Fecha de Inicio"
                  name="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.fecha_inicio}
                  touched={touched.fecha_inicio}
                  icon={Calendar}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Fecha de Fin"
                  name="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.fecha_fin}
                  touched={touched.fecha_fin}
                  icon={Calendar}
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
                  placeholder="Información adicional sobre el curso..."
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

export default CursoForm;

