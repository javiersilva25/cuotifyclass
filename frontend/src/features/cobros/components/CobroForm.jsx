import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  Receipt, 
  DollarSign, 
  Calendar,
  User,
  Users,
  FileText,
  CreditCard,
  AlertCircle,
  Hash,
  Tag,
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


// Tipos de cobro disponibles
const TIPOS_COBRO = [
  'General',
  'Alumno',
];

// Categorías disponibles
const CATEGORIAS = [
  'Matrícula',
  'Mensualidad',
  'Material',
  'Actividades',
  'Seguro',
  'Uniforme',
  'Transporte',
  'Alimentación',
  'Otros',
];

// Métodos de pago disponibles
const METODOS_PAGO = [
  'Efectivo',
  'Transferencia',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Cheque',
  'Depósito',
];

// Alumnos mock para selección
const ALUMNOS_MOCK = [
  { id: 1, nombre: 'Juan Carlos Pérez', apoderado: 'María Pérez González' },
  { id: 2, nombre: 'Ana María González', apoderado: 'Roberto González Silva' },
  { id: 3, nombre: 'Carlos Eduardo Morales', apoderado: 'Elena Morales Torres' },
  { id: 4, nombre: 'Sofía Alejandra Ruiz', apoderado: 'Carmen Ruiz Herrera' },
  { id: 5, nombre: 'Diego Andrés López', apoderado: 'Patricia López Mendoza' },
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
export function CobroForm({
  cobro = null,
  alumnos = ALUMNOS_MOCK,
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
    fecha_emision: '',
    fecha_vencimiento: '',
    tipo_cobro: 'General',
    categoria: undefined,
    alumno_id: undefined,
    numero_comprobante: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del cobro si está editando
  useEffect(() => {
    if (cobro) {
      setFormData({
        concepto: cobro.concepto || '',
        descripcion: cobro.descripcion || '',
        monto: cobro.monto?.toString() || '',
        fecha_emision: cobro.fecha_emision || '',
        fecha_vencimiento: cobro.fecha_vencimiento || '',
        tipo_cobro: cobro.tipo_cobro || 'General',
        categoria: cobro.categoria || undefined,
        alumno_id: cobro.alumno_id != null ? cobro.alumno_id.toString() : undefined,
        numero_comprobante: cobro.numero_comprobante || '',
        observaciones: cobro.observaciones || '',
      });
    } else {
      // Resetear formulario para nuevo cobro
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const vencimiento = nextMonth.toISOString().split('T')[0];
      
      setFormData({
        concepto: '',
        descripcion: '',
        monto: '',
        fecha_emision: today,
        fecha_vencimiento: vencimiento,
        tipo_cobro: 'General',
        categoria: undefined,
        alumno_id: undefined,
        numero_comprobante: '',
        observaciones: '',
      });
    }
    
    setErrors({});
    setTouched({});
  }, [cobro, isOpen]);

  // Auto-generar número de comprobante
  useEffect(() => {
    if (!cobro && formData.categoria && formData.fecha_emision) {
      const fecha = new Date(formData.fecha_emision);
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const categoriaCode = formData.categoria.substring(0, 3).toUpperCase();
      const comprobante = `${categoriaCode}-${año}${mes}${dia}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        numero_comprobante: comprobante,
      }));
    }
  }, [formData.categoria, formData.fecha_emision, cobro]);

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
    
    // Si cambia el tipo de cobro a General, limpiar alumno
    if (name === 'tipo_cobro' && value === 'General') {
      setFormData(prev => ({
        ...prev,
        alumno_id: '',
      }));
    }
    
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
        alumno_id: formData.alumno_id ? parseInt(formData.alumno_id) : null,
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

  const isEditing = !!cobro;
  const title = isEditing ? 'Editar Cobro' : 'Nuevo Cobro';
  const description = isEditing 
    ? 'Modifica la información del cobro' 
    : 'Ingresa los datos del nuevo cobro';

  const selectedAlumno = alumnos.find(a => a.id.toString() === formData.alumno_id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
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
                <FileText className="w-4 h-4" />
                <span>Información General</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Concepto del Cobro"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.concepto}
                  touched={touched.concepto}
                  placeholder="Ej: Mensualidad Marzo 2024"
                  icon={Receipt}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Número de Comprobante"
                  name="numero_comprobante"
                  value={formData.numero_comprobante}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.numero_comprobante}
                  touched={touched.numero_comprobante}
                  placeholder="Se genera automáticamente"
                  icon={Hash}
                  disabled={isSubmitting}
                />

                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                      Descripción
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      placeholder="Descripción detallada del cobro..."
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
                  label="Monto"
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
                />

                <div className="space-y-2">
                  <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">
                    Categoría
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleSelectChange('categoria', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.categoria && touched.categoria && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS
                        .filter((c) => typeof c === 'string' && c.trim() !== "")
                        .map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && touched.categoria && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.categoria}</span>
                    </motion.p>
                  )}
                </div>

                <FormField
                  label="Fecha de Emisión"
                  name="fecha_emision"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.fecha_emision}
                  touched={touched.fecha_emision}
                  icon={Calendar}
                  required
                  disabled={isSubmitting}
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
                />
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Cobro y Destinatario */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Tag className="w-4 h-4" />
                <span>Tipo de Cobro</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_cobro" className="text-sm font-medium text-gray-700">
                    Tipo de Cobro
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.tipo_cobro}
                    onValueChange={(value) => handleSelectChange('tipo_cobro', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>General (Todos los alumnos)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Alumno">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Individual (Un alumno específico)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.tipo_cobro === 'Alumno' && (
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
                        {alumnos
                          .filter((alumno) => alumno?.id !== undefined && alumno?.id !== null)
                          .map((alumno) => (
                            <SelectItem key={alumno.id} value={alumno.id.toString()}>
                              <div className="space-y-1">
                                <p className="font-medium">{alumno.nombre}</p>
                                <p className="text-xs text-gray-500">Apoderado: {alumno.apoderado}</p>
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
                )}
              </div>

              {/* Vista previa del destinatario */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Destinatario:</p>
                {formData.tipo_cobro === 'General' ? (
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Cobro General</p>
                      <p className="text-sm text-gray-500">Aplica a todos los alumnos</p>
                    </div>
                  </div>
                ) : selectedAlumno ? (
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedAlumno.nombre}</p>
                      <p className="text-sm text-gray-500">Apoderado: {selectedAlumno.apoderado}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <p className="text-gray-500">Selecciona un alumno</p>
                  </div>
                )}
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
                  Observaciones (Opcional)
                </Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Observaciones adicionales sobre el cobro..."
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

export default CobroForm;

