import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  Tag, 
  DollarSign, 
  Palette,
  Hash,
  FileText,
  Folder,
  AlertCircle,
  BookOpen,
  Book,
  Zap,
  Droplets,
  Wifi,
  Users,
  GraduationCap,
  Briefcase,
  Wrench,
  UtensilsCrossed,
  Bus,
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
import React, { useMemo } from 'react';

// Tipos disponibles
const TIPOS = [
  'Educativo',
  'Operacional',
  'Personal',
  'Mantenimiento',
  'Bienestar',
  'Transporte',
];

// Colores predefinidos
const COLORES = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Púrpura', value: '#8B5CF6' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Naranja', value: '#F97316' },
];

// Íconos disponibles
const ICONOS = [
  { name: 'Etiqueta', value: 'Tag', icon: Tag },
  { name: 'Libro Abierto', value: 'BookOpen', icon: BookOpen },
  { name: 'Libro', value: 'Book', icon: Book },
  { name: 'Paleta', value: 'Palette', icon: Palette },
  { name: 'Rayo', value: 'Zap', icon: Zap },
  { name: 'Gotas', value: 'Droplets', icon: Droplets },
  { name: 'WiFi', value: 'Wifi', icon: Wifi },
  { name: 'Usuarios', value: 'Users', icon: Users },
  { name: 'Graduación', value: 'GraduationCap', icon: GraduationCap },
  { name: 'Maletín', value: 'Briefcase', icon: Briefcase },
  { name: 'Llave', value: 'Wrench', icon: Wrench },
  { name: 'Cubiertos', value: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Bus', value: 'Bus', icon: Bus },
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

// Componente para selector de color
function ColorSelector({ value, onChange, error, touched }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        Color
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <div className="grid grid-cols-5 gap-2">
        {COLORES.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "w-10 h-10 rounded-lg border-2 transition-all",
              value === color.value 
                ? "border-gray-900 scale-110" 
                : "border-gray-200 hover:border-gray-400"
            )}
            style={{ backgroundColor: color.value }}
            title={color.name}
          >
            {value === color.value && (
              <div className="w-full h-full rounded-md bg-white bg-opacity-30 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </button>
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

// Componente para selector de ícono
function IconSelector({ value, onChange, error, touched }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        Ícono
        <span className="text-red-500 ml-1">*</span>
      </Label>
      
      <div className="grid grid-cols-6 gap-2">
        {ICONOS.map((icono) => {
          const IconComponent = icono.icon;
          return (
            <button
              key={icono.value}
              type="button"
              onClick={() => onChange(icono.value)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all flex items-center justify-center",
                value === icono.value 
                  ? "border-blue-500 bg-blue-50 text-blue-600" 
                  : "border-gray-200 hover:border-gray-400 text-gray-600"
              )}
              title={icono.name}
            >
              <IconComponent className="w-5 h-5" />
            </button>
          );
        })}
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
export function CategoriaGastoForm({
  categoria = null,
  categoriasPadre = [],
  isOpen = false,
  onClose,
  onSubmit,
  isLoading = false,
  validateForm,
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    tipo: '',
    presupuesto_mensual: '',
    categoria_padre_id: '',
    color: '#3B82F6',
    icono: 'Tag',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos de la categoría si está editando
  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        codigo: categoria.codigo || '',
        descripcion: categoria.descripcion || '',
        tipo: categoria.tipo || '',
        presupuesto_mensual: categoria.presupuesto_mensual?.toString() || '',
        categoria_padre_id: categoria.categoria_padre_id?.toString() || '',
        color: categoria.color || '#3B82F6',
        icono: categoria.icono || 'Tag',
      });
    } else {
      // Resetear formulario para nueva categoría
      setFormData({
        nombre: '',
        codigo: '',
        descripcion: '',
        tipo: '',
        presupuesto_mensual: '',
        categoria_padre_id: '',
        color: '#3B82F6',
        icono: 'Tag',
      });
    }
    
    setErrors({});
    setTouched({});
  }, [categoria, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generar código basado en el nombre
    if (name === 'nombre' && !categoria) {
      const codigo = value
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        codigo: codigo,
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

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color: color,
    }));
    
    if (errors.color) {
      setErrors(prev => ({
        ...prev,
        color: '',
      }));
    }
  };

  const handleIconChange = (icono) => {
    setFormData(prev => ({
      ...prev,
      icono: icono,
    }));
    
    if (errors.icono) {
      setErrors(prev => ({
        ...prev,
        icono: '',
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
        presupuesto_mensual: parseInt(formData.presupuesto_mensual),
        categoria_padre_id: formData.categoria_padre_id ? parseInt(formData.categoria_padre_id) : null,
        nivel: formData.categoria_padre_id ? 1 : 0,
        orden: 1, // Se puede calcular en el backend
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

  const isEditing = !!categoria;
  const title = isEditing ? 'Editar Categoría' : 'Nueva Categoría';
  const description = isEditing 
    ? 'Modifica la información de la categoría de gasto' 
    : 'Ingresa los datos de la nueva categoría de gasto';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Tag className="w-5 h-5" />
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
                  label="Nombre de la Categoría"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.nombre}
                  touched={touched.nombre}
                  placeholder="Ej: Material Didáctico"
                  icon={Tag}
                  required
                  disabled={isSubmitting}
                />

                <FormField
                  label="Código"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.codigo}
                  touched={touched.codigo}
                  placeholder="Ej: MAT-DID"
                  icon={Hash}
                  required
                  disabled={isSubmitting}
                />

                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
                    Tipo
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleSelectChange('tipo', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.tipo && touched.tipo && "border-red-300 focus:border-red-500"
                    )}>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo && touched.tipo && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.tipo}</span>
                    </motion.p>
                  )}
                </div>

                <FormField
                  label="Presupuesto Mensual"
                  name="presupuesto_mensual"
                  type="number"
                  value={formData.presupuesto_mensual}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  error={errors.presupuesto_mensual}
                  touched={touched.presupuesto_mensual}
                  placeholder="Monto en pesos chilenos"
                  icon={DollarSign}
                  required
                  disabled={isSubmitting}
                  min="0"
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
                      placeholder="Descripción detallada de la categoría..."
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

          {/* Jerarquía */}
          {categoriasPadre.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Folder className="w-4 h-4" />
                  <span>Jerarquía</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="categoria_padre_id" className="text-sm font-medium text-gray-700">
                    Categoría Padre (Opcional)
                  </Label>
                  <Select
                    value={formData.categoria_padre_id}
                    onValueChange={(value) => handleSelectChange('categoria_padre_id', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin categoría padre</SelectItem>
                      {categoriasPadre.map((categoriaPadre) => (
                        <SelectItem key={categoriaPadre.id} value={categoriaPadre.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: categoriaPadre.color }}
                            />
                            <span>{categoriaPadre.nombre}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Si seleccionas una categoría padre, esta será una subcategoría
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apariencia */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span>Apariencia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorSelector
                  value={formData.color}
                  onChange={handleColorChange}
                  error={errors.color}
                  touched={touched.color}
                />

                <IconSelector
                  value={formData.icono}
                  onChange={handleIconChange}
                  error={errors.icono}
                  touched={touched.icono}
                />
              </div>

              {/* Vista previa */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <div className="flex items-center space-x-3">
                  <div 
                    className="p-2 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.color + '20', color: formData.color }}
                  >
                    {ICONOS.find(i => i.value === formData.icono)?.icon && (
                      React.createElement(ICONOS.find(i => i.value === formData.icono).icon, { className: "w-5 h-5" })
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {formData.nombre || 'Nombre de la categoría'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formData.codigo || 'CODIGO'}
                    </p>
                  </div>
                </div>
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

export default CategoriaGastoForm;

