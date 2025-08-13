// src/features/cursos/components/CursoForm.jsx
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, GraduationCap, Calendar, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { cn } from '../../../lib/utils';
import apiClient from '../../../api/client';
import { obtenerProfesoresActivos } from '../../../api/profesores';

function Field({
  label, name, value, onChange, onBlur, error, touched,
  type='text', placeholder, icon:Icon, required=false, disabled=false
}) {
  return (
    <div className="space-y-2">
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
          className={cn(Icon && 'pl-10', error && touched && 'border-red-300 focus:border-red-500 focus:ring-red-200')}
        />
      </div>
      {error && touched && (
        <motion.p initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  );
}

export default function CursoForm({
  curso = null,
  isOpen = false,
  onClose,
  onSubmit,
  isLoading = false,
  validateForm, // opcional
}) {
  const [formData, setFormData] = useState({
    nombre_curso: '',
    nivel_id: undefined,
    ano_escolar: String(new Date().getFullYear()),
    profesor_id: undefined, // ID numérico o RUT string
  });

  const [niveles, setNiveles] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loadingProf, setLoadingProf] = useState(false);
  const [loadingNiv, setLoadingNiv] = useState(false);
  const [profError, setProfError] = useState('');
  const [nivError, setNivError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar combos al abrir
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      setLoadingNiv(true); setLoadingProf(true);
      setNivError(''); setProfError('');
      try {
        const [nivRes, profList] = await Promise.all([
          apiClient.get('/api/niveles'),
          obtenerProfesoresActivos(),
        ]);
        const niv = nivRes?.data?.data ?? nivRes?.data ?? [];
        const profs = Array.isArray(profList) ? profList : [];

        setNiveles(Array.isArray(niv) ? niv : []);
        setProfesores(profs);

        // Si no hay profesores, limpiar selección previa
        if (profs.length === 0 && formData.profesor_id) {
          setFormData(s => ({ ...s, profesor_id: undefined }));
        }
      } catch {
        setNiveles([]); setProfesores([]);
        setNivError('No fue posible cargar niveles.');
        setProfError('No fue posible cargar profesores.');
        // Asegurar estado consistente
        setFormData(s => ({ ...s, profesor_id: undefined }));
      } finally {
        setLoadingNiv(false); setLoadingProf(false);
      }
    })();
    // no añadir formData en deps para evitar recargas
  }, [isOpen]);

  // Cargar datos si edita
  useEffect(() => {
    if (curso) {
      setFormData({
        nombre_curso: curso.nombre_curso ?? '',
        nivel_id: curso.nivel_id != null ? String(curso.nivel_id) : undefined,
        ano_escolar: curso.ano_escolar != null ? String(curso.ano_escolar) : String(new Date().getFullYear()),
        profesor_id: curso.profesor_id != null ? String(curso.profesor_id) : undefined,
      });
    } else {
      setFormData({
        nombre_curso: '',
        nivel_id: undefined,
        ano_escolar: String(new Date().getFullYear()),
        profesor_id: undefined,
      });
    }
    setErrors({}); setTouched({});
  }, [curso, isOpen]);

  // Validación
  const validate = useMemo(() => (data) => {
    if (typeof validateForm === 'function') {
      const ve = validateForm(data) || {};
      const isValid = Object.keys(ve).length === 0;
      return { isValid, errors: ve };
    }
    const e = {};
    if (!data.nombre_curso?.trim()) e.nombre_curso = 'Requerido';
    if (!data.nivel_id) e.nivel_id = 'Requerido';
    if (!data.ano_escolar || !/^\d{4}$/.test(String(data.ano_escolar))) e.ano_escolar = 'Año inválido';
    return { isValid: Object.keys(e).length === 0, errors: e };
  }, [validateForm]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(s => ({ ...s, [name]: value }));
    if (errors[name]) setErrors(s => ({ ...s, [name]: '' }));
  };
  const onBlur = (e) => {
    const { name } = e.target;
    setTouched(s => ({ ...s, [name]: true }));
    const v = validate(formData);
    if (v.errors[name]) setErrors(s => ({ ...s, [name]: v.errors[name] }));
  };
  const onSelect = (name, value) => {
    // Evitar propagar marcador "__none"
    const val = value === '__none' ? undefined : value;
    setFormData(s => ({ ...s, [name]: val }));
    if (errors[name]) setErrors(s => ({ ...s, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nombre_curso: true, nivel_id: true, ano_escolar: true, profesor_id: true });

    const v = validate(formData);
    if (!v.isValid) { setErrors(v.errors); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        nombre_curso: formData.nombre_curso.trim(),
        nivel_id: Number(formData.nivel_id),
        ano_escolar: Number(formData.ano_escolar),
        ...(formData.profesor_id
          ? (isNaN(Number(formData.profesor_id))
              ? { profesor_rut: String(formData.profesor_id) }
              : { profesor_id: Number(formData.profesor_id) })
          : {}),
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!curso;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!isSubmitting && !open) onClose(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            {isEditing ? 'Editar Curso' : 'Nuevo Curso'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica la información del curso' : 'Ingresa los datos del nuevo curso'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Datos del Curso</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <Field
                label="Nombre del curso"
                name="nombre_curso"
                value={formData.nombre_curso}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.nombre_curso}
                touched={touched.nombre_curso}
                placeholder="Ej: 1° Básico A"
                icon={GraduationCap}
                required
                disabled={isSubmitting || isLoading}
              />

              {/* nivel_id */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Nivel <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.nivel_id || undefined}
                  onValueChange={(v) => onSelect('nivel_id', v)}
                  disabled={isSubmitting || isLoading || loadingNiv}
                >
                  <SelectTrigger className={cn(errors.nivel_id && touched.nivel_id && 'border-red-300 focus:border-red-500')}>
                    <SelectValue placeholder={loadingNiv ? 'Cargando niveles...' : (nivError || 'Selecciona un nivel')} />
                  </SelectTrigger>
                  <SelectContent>
                    {niveles.length === 0 && !loadingNiv ? (
                      <SelectItem value="__none" disabled>No hay niveles disponibles</SelectItem>
                    ) : (
                      niveles.map(n => (
                        <SelectItem key={n.id} value={String(n.id)}>
                          {n.nombre_nivel || `Nivel ${n.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.nivel_id && touched.nivel_id && (
                  <motion.p initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.nivel_id}
                  </motion.p>
                )}
              </div>

              {/* ano_escolar */}
              <Field
                label="Año escolar"
                name="ano_escolar"
                type="number"
                value={formData.ano_escolar}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.ano_escolar}
                touched={touched.ano_escolar}
                placeholder="Ej: 2025"
                icon={Calendar}
                required
                disabled={isSubmitting || isLoading}
                min="2000"
                max="2099"
              />

              {/* profesor_id (opcional) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Profesor (opcional)</Label>
                <Select
                  value={formData.profesor_id || undefined}
                  onValueChange={(v) => onSelect('profesor_id', v)}
                  disabled={isSubmitting || isLoading || loadingProf}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingProf ? 'Cargando profesores...' : (profError || 'Selecciona un profesor')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(!profesores || profesores.length === 0) && !loadingProf ? (
                      <SelectItem value="__none" disabled>No hay profesores activos</SelectItem>
                    ) : (
                      profesores.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {p.nombre_completo || p.nombre || `Profesor ${p.id}`}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Corrige los errores antes de continuar.</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => !isSubmitting && onClose()} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading} className="bg-blue-600 hover:bg-blue-700">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
