// src/features/cobros/components/CobroForm.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Save, X, Receipt, DollarSign, Calendar, User, Users, FileText,
  AlertCircle, Hash, Tag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { cn } from '../../../lib/utils';

// APIs
import alumnosAPI from '../../../api/alumnos';
import { obtenerCursosActivos } from '../../../api/cursos';

const TIPOS_COBRO = ['General', 'Alumno'];
const CATEGORIAS = [
  'Matrícula', 'Mensualidad', 'Material', 'Actividades',
  'Seguro', 'Uniforme', 'Transporte', 'Alimentación', 'Otros',
];

function FormField({
  label, name, value, onChange, onBlur, error, touched,
  type = 'text', placeholder, icon: Icon, required = false, disabled = false, className, ...props
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
        <Input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            Icon && 'pl-10',
            error && touched && 'border-red-300 focus:border-red-500 focus:ring-red-200'
          )}
          {...props}
        />
      </div>
      {error && touched && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  );
}

export default function CobroForm({
  cursoId = null,
  cursosOptions = [],
  cobro = null,
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
    curso_id: cursoId || undefined,
    numero_comprobante: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchedCursosRef = useRef(false);

  // Cursos (fallback con obtenerCursosActivos)
  const [cursosLocal, setCursosLocal] = useState([]);
  const cursosParaSelect = (cursosOptions?.length ? cursosOptions : cursosLocal);

  // Alumnos por curso
  const [alumnosOptions, setAlumnosOptions] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [alumnosError, setAlumnosError] = useState(null);

  const selectedAlumno = useMemo(
    () => alumnosOptions.find(a => String(a.id) === String(formData.alumno_id)),
    [alumnosOptions, formData.alumno_id]
  );

  // Init / reset
  useEffect(() => {
    if (cobro) {
      setFormData({
        concepto: cobro.concepto || '',
        descripcion: cobro.descripcion || '',
        monto: cobro.monto?.toString() || '',
        fecha_emision: (cobro.fecha_emision || '').slice(0, 10),
        fecha_vencimiento: (cobro.fecha_vencimiento || '').slice(0, 10),
        tipo_cobro: cobro.tipo_cobro || 'General',
        categoria: cobro.categoria || undefined,
        alumno_id: cobro.alumno_id != null ? String(cobro.alumno_id) : undefined,
        curso_id: cobro.curso_id ?? cursoId ?? undefined,
        numero_comprobante: cobro.numero_comprobante || '',
        observaciones: cobro.observaciones || '',
      });
    } else {
      const today = new Date();
      const fechaEmi = today.toISOString().slice(0, 10);
      const next = new Date(today); next.setMonth(next.getMonth() + 1);
      const fechaVen = next.toISOString().slice(0, 10);
      setFormData({
        concepto: '',
        descripcion: '',
        monto: '',
        fecha_emision: fechaEmi,
        fecha_vencimiento: fechaVen,
        tipo_cobro: 'General',
        categoria: undefined,
        alumno_id: undefined,
        curso_id: cursoId ?? undefined,
        numero_comprobante: '',
        observaciones: '',
      });
    }
    setErrors({});
    setTouched({});
    setAlumnosOptions([]);
  }, [cobro, isOpen, cursoId]);

  // Cargar cursos usando obtenerCursosActivos() si no vienen por props
  useEffect(() => {
    if (!isOpen) return;
    if (fetchedCursosRef.current) return;
    if ((cursosOptions?.length ?? 0) > 0) return;

    fetchedCursosRef.current = true;
    (async () => {
      const data = await obtenerCursosActivos();
      setCursosLocal((data || []).map(c => ({
        id: c.id,
        nombre: c.nombre ?? c.nombre_curso ?? c.descripcion ?? `Curso #${c.id}`,
      })));
    })();
  }, [isOpen, cursosOptions]);

  // Autogenerar número de comprobante
  useEffect(() => {
    if (cobro) return;
    if (!formData.numero_comprobante && formData.categoria && formData.fecha_emision) {
      const f = new Date(formData.fecha_emision);
      if (!isNaN(f)) {
        const y = f.getFullYear();
        const m = String(f.getMonth() + 1).padStart(2, '0');
        const d = String(f.getDate()).padStart(2, '0');
        const code = String(formData.categoria).substring(0, 3).toUpperCase();
        const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        setFormData(prev => ({ ...prev, numero_comprobante: `${code}-${y}${m}${d}-${rand}` }));
      }
    }
  }, [formData.categoria, formData.fecha_emision, cobro, formData.numero_comprobante]);

  // Validación
  const internalValidate = (data) => {
    const e = {};
    if (!data.concepto?.trim()) e.concepto = 'Concepto requerido';
    if (!data.descripcion?.trim()) e.descripcion = 'Descripción requerida';
    const montoNum = Number(data.monto);
    if (!montoNum || montoNum <= 0) e.monto = 'Monto debe ser mayor a 0';
    if (!data.categoria) e.categoria = 'Selecciona una categoría';
    if (!data.fecha_emision) e.fecha_emision = 'Fecha de emisión requerida';
    if (!data.fecha_vencimiento) e.fecha_vencimiento = 'Fecha de vencimiento requerida';
    if (data.fecha_emision && data.fecha_vencimiento) {
      const emi = new Date(data.fecha_emision);
      const ven = new Date(data.fecha_vencimiento);
      if (!isNaN(emi) && !isNaN(ven) && ven < emi) {
        e.fecha_vencimiento = 'El vencimiento no puede ser anterior a la emisión';
      }
    }
    if (!TIPOS_COBRO.includes(data.tipo_cobro)) {
      e.tipo_cobro = 'Tipo de cobro inválido';
    } else if (data.tipo_cobro === 'General') {
      if (!data.curso_id) e.curso_id = 'Debes seleccionar un curso para un cobro general';
    } else if (data.tipo_cobro === 'Alumno') {
      if (!data.curso_id) e.curso_id = 'Selecciona un curso para elegir un alumno';
      if (!data.alumno_id) e.alumno_id = 'Selecciona un alumno';
    }
    return { isValid: Object.keys(e).length === 0, errors: e };
  };
  const runValidation = (data) => (validateForm ? validateForm(data) : internalValidate(data));

  // Handlers
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
    if (errors[name]) setErrors(s => ({ ...s, [name]: '' }));
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched(s => ({ ...s, [name]: true }));
    const v = runValidation(formData);
    if (v.errors[name]) setErrors(s => ({ ...s, [name]: v.errors[name] }));
  };

  const onSelect = (name, value) => {
    setFormData(s => ({
      ...s,
      [name]: value,
      ...(name === 'tipo_cobro' ? { alumno_id: undefined } : {})
    }));
    if (errors[name]) setErrors(s => ({ ...s, [name]: '' }));
  };

  const handleCursoChange = (curso_id) => {
    setFormData(s => ({ ...s, curso_id, alumno_id: undefined }));
    if (errors.curso_id) setErrors(s => ({ ...s, curso_id: '' }));
  };

  // Cargar alumnos cuando corresponda
  useEffect(() => {
    const load = async () => {
      if (formData.tipo_cobro !== 'Alumno' || !formData.curso_id) {
        setAlumnosOptions([]);
        return;
      }
      setLoadingAlumnos(true);
      setAlumnosError(null);
      try {
        const list = await alumnosAPI.getByCurso(formData.curso_id); // devuelve array
        const mapped = (list || []).map(a => ({
          id: a.id,
          nombre: a.nombre_completo || a.nombre || 'Estudiante',
          apoderado: a.apoderado?.nombre_completo || a.apoderado_nombre || '—',
          curso_id: a.curso_id ?? a.curso?.id ?? null,
        }));
        setAlumnosOptions(mapped);
      } catch (e) {
        setAlumnosError('No fue posible cargar los alumnos del curso');
        setAlumnosOptions([]);
        console.error(e);
      } finally {
        setLoadingAlumnos(false);
      }
    };
    load();
  }, [formData.tipo_cobro, formData.curso_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const all = Object.keys(formData).reduce((acc, k) => (acc[k] = true, acc), {});
    setTouched(all);

    const v = runValidation(formData);
    if (!v.isValid) { setErrors(v.errors); return; }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        monto: parseInt(formData.monto, 10),
        alumno_id: formData.alumno_id ? parseInt(formData.alumno_id, 10) : null,
        curso_id: formData.curso_id ?? (selectedAlumno?.curso_id ?? null),
      };
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error('Error al enviar formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!cobro;
  const title = isEditing ? 'Editar Cobro' : 'Nuevo Cobro';
  const description = isEditing ? 'Modifica la información del cobro' : 'Ingresa los datos del nuevo cobro';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" /> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" /> Información General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Concepto del Cobro"
                  name="concepto"
                  value={formData.concepto}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.concepto}
                  touched={touched.concepto}
                  placeholder="Ej: Mensualidad Marzo 2025"
                  icon={Receipt}
                  required
                  disabled={isSubmitting}
                />
                <FormField
                  label="Número de Comprobante"
                  name="numero_comprobante"
                  value={formData.numero_comprobante}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.numero_comprobante}
                  touched={touched.numero_comprobante}
                  placeholder="Se genera automáticamente"
                  icon={Hash}
                  disabled={isSubmitting}
                />
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Descripción <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Descripción detallada del cobro..."
                    rows={3}
                    disabled={isSubmitting}
                    className={cn(
                      errors.descripcion && touched.descripcion && 'border-red-300 focus:border-red-500'
                    )}
                  />
                  {errors.descripcion && touched.descripcion && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 flex items-center gap-1 mt-2"
                    >
                      <AlertCircle className="w-3 h-3" /> {errors.descripcion}
                    </motion.p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Monto"
                  name="monto"
                  type="number"
                  value={formData.monto}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.monto}
                  touched={touched.monto}
                  placeholder="Monto en CLP"
                  icon={DollarSign}
                  required
                  disabled={isSubmitting}
                  min="1"
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Categoría <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v) => onSelect('categoria', v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.categoria && touched.categoria && 'border-red-300 focus:border-red-500'
                    )}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.categoria && touched.categoria && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.categoria}
                    </motion.p>
                  )}
                </div>
                <FormField
                  label="Fecha de Emisión"
                  name="fecha_emision"
                  type="date"
                  value={formData.fecha_emision}
                  onChange={onChange}
                  onBlur={onBlur}
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
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.fecha_vencimiento}
                  touched={touched.fecha_vencimiento}
                  icon={Calendar}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Cobro / Curso / Alumno */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tipo de Cobro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Tipo de Cobro <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.tipo_cobro}
                    onValueChange={(v) => onSelect('tipo_cobro', v)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.tipo_cobro && touched.tipo_cobro && 'border-red-300 focus:border-red-500'
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>General (Todos los alumnos)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Alumno">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Individual (Un alumno)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo_cobro && touched.tipo_cobro && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.tipo_cobro}
                    </motion.p>
                  )}
                </div>

                {/* Curso */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Curso</Label>
                  <Select
                    value={formData.curso_id?.toString() || undefined}
                    onValueChange={(v) => handleCursoChange(parseInt(v, 10))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      errors.curso_id && touched.curso_id && 'border-red-300 focus:border-red-500'
                    )}>
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursosParaSelect.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre || c.descripcion || c.nombre_curso || `Curso #${c.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.curso_id && touched.curso_id && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.curso_id}
                    </motion.p>
                  )}
                </div>

                {/* Alumno */}
                {formData.tipo_cobro === 'Alumno' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Alumno <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={formData.alumno_id?.toString() || undefined}
                      onValueChange={(v) => onSelect('alumno_id', v)}
                      disabled={isSubmitting || !formData.curso_id || loadingAlumnos}
                    >
                      <SelectTrigger className={cn(
                        errors.alumno_id && touched.alumno_id && 'border-red-300 focus:border-red-500'
                      )}>
                        <SelectValue placeholder={
                          loadingAlumnos
                            ? 'Cargando alumnos...'
                            : !formData.curso_id
                              ? 'Selecciona un curso'
                              : alumnosOptions.length === 0
                                ? 'No hay alumnos en este curso'
                                : 'Selecciona un alumno'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {alumnosOptions.map(a => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            <div className="space-y-1">
                              <p className="font-medium">{a.nombre}</p>
                              <p className="text-xs text-gray-500">Apoderado: {a.apoderado}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.alumno_id && touched.alumno_id && (
                      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.alumno_id}
                      </motion.p>
                    )}
                    {alumnosError && <p className="text-sm text-red-600">{alumnosError}</p>}
                  </div>
                )}
              </div>

              {/* Vista previa del destinatario */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Destinatario:</p>
                {formData.tipo_cobro === 'General' ? (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Cobro General</p>
                      <p className="text-sm text-gray-500">Aplica a todos los alumnos del curso</p>
                    </div>
                  </div>
                ) : selectedAlumno ? (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedAlumno.nombre}</p>
                      <p className="text-sm text-gray-500">Apoderado: {selectedAlumno.apoderado}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
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
              <Label className="text-sm font-medium text-gray-700">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={onChange}
                placeholder="Observaciones adicionales..."
                rows={3}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Corrige los errores antes de continuar.</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => !isSubmitting && onClose()} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting || isLoading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 mr-2">
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
