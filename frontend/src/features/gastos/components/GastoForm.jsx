import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  DollarSign, 
  Calendar,
  FileText,
  AlertCircle,
  ShoppingCart,
  Building,
  Receipt,
  Upload,
  Paperclip,
  Tag,
  Phone,
  Mail,
  CheckCircle,
  User,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
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

// Categorías mock para selección
const CATEGORIAS_MOCK = [
  { id: 1, nombre: 'Material Escolar', color: '#3B82F6', presupuesto: 500000 },
  { id: 2, nombre: 'Mantención', color: '#F59E0B', presupuesto: 800000 },
  { id: 3, nombre: 'Servicios Básicos', color: '#10B981', presupuesto: 1200000 },
  { id: 4, nombre: 'Alimentación', color: '#EF4444', presupuesto: 2000000 },
  { id: 5, nombre: 'Deportes', color: '#8B5CF6', presupuesto: 300000 },
  { id: 6, nombre: 'Limpieza', color: '#06B6D4', presupuesto: 400000 },
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

// Componente para subida de archivos
function FileUpload({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  touched, 
  accept = ".pdf,.jpg,.jpeg,.png",
  disabled = false 
}) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (value && value.name) {
      setFileName(value.name);
    } else if (typeof value === 'string' && value) {
      setFileName(value.split('/').pop());
    } else {
      setFileName('');
    }
  }, [value]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onChange({ target: { name, files } });
    }
  };

  const handleFileChange = (e) => {
    onChange(e);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
          error && touched && "border-red-300 bg-red-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
        
        {fileName ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Paperclip className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">{fileName}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(name).click()}
              disabled={disabled}
            >
              <Upload className="w-4 h-4 mr-2" />
              Cambiar Archivo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(name).click()}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar Archivo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                O arrastra y suelta aquí
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Formatos: PDF, JPG, PNG (máx. 10MB)
            </p>
          </div>
        )}
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

// Componente para vista previa del gasto
function GastoPreview({ formData, categoria, showPreview, onTogglePreview }) {
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (!showPreview) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onTogglePreview}
            className="w-full text-blue-700 hover:text-blue-800"
          >
            <Eye className="w-4 h-4 mr-2" />
            Mostrar Vista Previa del Gasto
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span>Vista Previa del Gasto</span>
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTogglePreview}
            className="text-green-700 hover:text-green-800"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 font-medium">Concepto</p>
              <p className="text-green-800 font-semibold">
                {formData.concepto || 'Sin especificar'}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Monto</p>
              <p className="text-green-800 font-bold text-lg">
                {formatCurrency(parseInt(formData.monto) || 0)}
              </p>
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <p className="text-sm text-green-600 font-medium">Proveedor</p>
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-green-800 font-semibold">
                  {formData.proveedor || 'Sin especificar'}
                </p>
                {formData.rut_proveedor && (
                  <p className="text-sm text-green-600">
                    RUT: {formData.rut_proveedor}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Categoría */}
          {categoria && (
            <div>
              <p className="text-sm text-green-600 font-medium">Categoría</p>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: categoria.color }}
                />
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {categoria.nombre}
                </Badge>
              </div>
            </div>
          )}

          {/* Documento */}
          <div>
            <p className="text-sm text-green-600 font-medium">Documento</p>
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-green-800 font-semibold">
                  {formData.tipo_documento || 'Sin especificar'}
                </p>
                {formData.numero_documento && (
                  <p className="text-sm text-green-600">
                    N° {formData.numero_documento}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600 font-medium">Fecha de Gasto</p>
              <p className="text-green-800">{formatDate(formData.fecha_gasto)}</p>
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Fecha de Vencimiento</p>
              <p className="text-green-800">{formatDate(formData.fecha_vencimiento)}</p>
            </div>
          </div>

          {/* Descripción */}
          {formData.descripcion && (
            <div>
              <p className="text-sm text-green-600 font-medium">Descripción</p>
              <p className="text-green-800 text-sm bg-green-100 p-2 rounded">
                {formData.descripcion}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal del formulario
export function GastoForm({
  gasto = null,
  categorias = CATEGORIAS_MOCK,
  tiposDocumento = [],
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
    fecha_gasto: '',
    fecha_vencimiento: '',
    categoria_id: '',
    proveedor: '',
    rut_proveedor: '',
    contacto_proveedor: '',
    telefono_proveedor: '',
    tipo_documento: '',
    numero_documento: '',
    archivo_adjunto: null,
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos del gasto si está editando
  useEffect(() => {
    if (gasto) {
      setFormData({
        concepto: gasto.concepto || '',
        descripcion: gasto.descripcion || '',
        monto: gasto.monto?.toString() || '',
        fecha_gasto: gasto.fecha_gasto || '',
        fecha_vencimiento: gasto.fecha_vencimiento || '',
        categoria_id: gasto.categoria_id?.toString() || '',
        proveedor: gasto.proveedor || '',
        rut_proveedor: gasto.rut_proveedor || '',
        contacto_proveedor: gasto.contacto_proveedor || '',
        telefono_proveedor: gasto.telefono_proveedor || '',
        tipo_documento: gasto.tipo_documento || '',
        numero_documento: gasto.numero_documento || '',
        archivo_adjunto: gasto.archivo_adjunto || null,
        observaciones: gasto.observaciones || '',
      });
    } else {
      // Resetear formulario para nuevo gasto
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const vencimiento = nextMonth.toISOString().split('T')[0];
      
      setFormData({
        concepto: '',
        descripcion: '',
        monto: '',
        fecha_gasto: today,
        fecha_vencimiento: vencimiento,
        categoria_id: '',
        proveedor: '',
        rut_proveedor: '',
        contacto_proveedor: '',
        telefono_proveedor: '',
        tipo_documento: '',
        numero_documento: '',
        archivo_adjunto: null,
        observaciones: '',
      });
    }
    
    setErrors({});
    setTouched({});
    setShowPreview(false);
  }, [gasto, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      // Manejo de archivos
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
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
        categoria_id: parseInt(formData.categoria_id),
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

  const isEditing = !!gasto;
  const title = isEditing ? 'Editar Gasto' : 'Nuevo Gasto';
  const description = isEditing 
    ? 'Modifica la información del gasto operacional' 
    : 'Registra un nuevo gasto operacional del colegio';

  const selectedCategoria = categorias.find(c => c.id.toString() === formData.categoria_id);

  // Calcular fecha mínima (un año atrás) y máxima (hoy)
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const minDate = oneYearAgo.toISOString().split('T')[0];
  const maxDate = today.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vista previa del gasto */}
          <GastoPreview
            formData={formData}
            categoria={selectedCategoria}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
          />

          {/* Información básica del gasto */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Información del Gasto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Concepto del Gasto"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.concepto}
                  touched={touched.concepto}
                  placeholder="Ej: Material de oficina"
                  icon={Tag}
                  required
                  disabled={isSubmitting}
                />

                <div className="space-y-2">
                  <Label htmlFor="categoria_id" className="text-sm font-medium text-gray-700">
                    Categoría
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => handleSelectChange('categoria_id', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.categoria_id && touched.categoria_id && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: categoria.color }}
                            />
                            <span>{categoria.nombre}</span>
                            <span className="text-xs text-gray-500">
                              (Presup: {new Intl.NumberFormat('es-CL', {
                                style: 'currency',
                                currency: 'CLP',
                                minimumFractionDigits: 0,
                              }).format(categoria.presupuesto)})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria_id && touched.categoria_id && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.categoria_id}</span>
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
                      placeholder="Describe detalladamente el gasto, su propósito y justificación..."
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Monto del Gasto"
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
                  max="10000000"
                />

                <FormField
                  label="Fecha del Gasto"
                  name="fecha_gasto"
                  type="date"
                  value={formData.fecha_gasto}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.fecha_gasto}
                  touched={touched.fecha_gasto}
                  icon={Calendar}
                  required
                  disabled={isSubmitting}
                  min={minDate}
                  max={maxDate}
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
                  icon={Clock}
                  required
                  disabled={isSubmitting}
                  min={formData.fecha_gasto || minDate}
                />
              </div>

              {/* Vista previa del monto */}
              {formData.monto && selectedCategoria && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Monto: {new Intl.NumberFormat('es-CL', {
                            style: 'currency',
                            currency: 'CLP',
                            minimumFractionDigits: 0,
                          }).format(parseInt(formData.monto) || 0)}
                        </p>
                        <p className="text-sm text-blue-600">
                          Categoría: {selectedCategoria.nombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">Presupuesto disponible</p>
                      <p className="font-medium text-blue-900">
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                        }).format(selectedCategoria.presupuesto)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del proveedor */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Información del Proveedor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nombre del Proveedor"
                  name="proveedor"
                  value={formData.proveedor}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.proveedor}
                  touched={touched.proveedor}
                  placeholder="Ej: Librería Escolar S.A."
                  icon={Building}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="RUT del Proveedor"
                  name="rut_proveedor"
                  value={formData.rut_proveedor}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.rut_proveedor}
                  touched={touched.rut_proveedor}
                  placeholder="XX.XXX.XXX-X"
                  icon={User}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Email de Contacto"
                  name="contacto_proveedor"
                  type="email"
                  value={formData.contacto_proveedor}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.contacto_proveedor}
                  touched={touched.contacto_proveedor}
                  placeholder="contacto@proveedor.cl"
                  icon={Mail}
                  disabled={isSubmitting}
                />

                <FormField
                  label="Teléfono de Contacto"
                  name="telefono_proveedor"
                  type="tel"
                  value={formData.telefono_proveedor}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.telefono_proveedor}
                  touched={touched.telefono_proveedor}
                  placeholder="+56 9 XXXX XXXX"
                  icon={Phone}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información del documento */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Receipt className="w-4 h-4" />
                <span>Información del Documento</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento" className="text-sm font-medium text-gray-700">
                    Tipo de Documento
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.tipo_documento}
                    onValueChange={(value) => handleSelectChange('tipo_documento', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.tipo_documento && touched.tipo_documento && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDocumento.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          <div className="flex items-center space-x-2">
                            <Receipt className="w-4 h-4" />
                            <span>{tipo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo_documento && touched.tipo_documento && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.tipo_documento}</span>
                    </motion.p>
                  )}
                </div>

                <FormField
                  label="Número de Documento"
                  name="numero_documento"
                  value={formData.numero_documento}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.numero_documento}
                  touched={touched.numero_documento}
                  placeholder="Ej: F-001234"
                  icon={Receipt}
                  required
                  disabled={isSubmitting}
                />

                <div className="md:col-span-2">
                  <FileUpload
                    label="Archivo Adjunto (Boleta/Factura)"
                    name="archivo_adjunto"
                    value={formData.archivo_adjunto}
                    onChange={handleInputChange}
                    error={errors.archivo_adjunto}
                    touched={touched.archivo_adjunto}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
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
                  placeholder="Información adicional, condiciones especiales, etc..."
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  Puedes incluir información adicional sobre el gasto, 
                  condiciones especiales, o cualquier detalle relevante.
                </p>
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
                {isEditing ? 'Actualizar Gasto' : 'Registrar Gasto'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GastoForm;

