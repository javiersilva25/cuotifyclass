// src/features/alumnos/components/AlumnoForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, User, Calendar, GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { cn } from '../../../lib/utils';
import apiClient from '../../../api/client';

// Fallbacks sin datos hardcodeados
const CURSOS_FALLBACK = [];
const APODERADOS_FALLBACK = [];

function Field({
  label, name, value, onChange, onBlur, error, touched,
  type = 'text', placeholder, icon: Icon, required = false, disabled = false
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
          className={cn(
            Icon && 'pl-10',
            error && touched && 'border-red-300 focus:border-red-500 focus:ring-red-200'
          )}
        />
      </div>
      {error && touched && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  );
}

export default function AlumnoForm({
  alumno = null,
  isOpen = false,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const isEditing = !!alumno;

  const [formData, setFormData] = useState({
    rut: '',                    // requerido solo al crear
    nombre_completo: '',
    fecha_nacimiento: '',
    curso_id: undefined,
    apoderado_id: undefined,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cursos, setCursos] = useState([]);
  const [apoderados, setApoderados] = useState([]);

  // Cargar combos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          apiClient.get('/api/cursos').catch(() => ({ data: CURSOS_FALLBACK })),
          apiClient.get('/api/apoderados').catch(() => ({ data: APODERADOS_FALLBACK })),
        ]);
        if (!mounted) return;
        setCursos(cRes?.data?.data ?? cRes?.data ?? CURSOS_FALLBACK);
        setApoderados(aRes?.data?.data ?? aRes?.data ?? APODERADOS_FALLBACK);
      } catch {
        if (!mounted) return;
        setCursos(CURSOS_FALLBACK);
        setApoderados(APODERADOS_FALLBACK);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Set de datos al abrir / reset
  useEffect(() => {
    if (alumno) {
      setFormData({
        rut: '', // al editar NO pedimos ni cambiamos RUT
        nombre_completo: alumno.nombre_completo || '',
        fecha_nacimiento: (alumno.fecha_nacimiento || '').slice(0, 10),
        curso_id: alumno.curso_id != null ? String(alumno.curso_id) : undefined,
        apoderado_id: alumno.apoderado_id != null ? String(alumno.apoderado_id) : undefined,
      });
    } else {
      setFormData({
        rut: '',
        nombre_completo: '',
        fecha_nacimiento: '',
        curso_id: undefined,
        apoderado_id: undefined,
      });
    }
    setErrors({});
    setTouched({});
  }, [alumno, isOpen]);

  // Validación mínima: solo RUT al crear
  const validate = useMemo(() => (data) => {
    const e = {};
    if (!isEditing && !data.rut?.trim()) e.rut = 'Requerido';
    return { isValid: Object.keys(e).length === 0, errors: e };
  }, [isEditing]);

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
    setFormData(s => ({ ...s, [name]: value }));
    if (errors[name]) setErrors(s => ({ ...s, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      rut: true,
      nombre_completo: true,
      fecha_nacimiento: true,
      curso_id: true,
      apoderado_id: true,
    });

    const v = validate(formData);
    if (!v.isValid) { setErrors(v.errors); return; }

    setIsSubmitting(true);
    try {
      const toIntOrNull = (v) => (v ? parseInt(v, 10) : null);
      const payload = isEditing
        ? {
            nombre_completo: formData.nombre_completo?.trim() || null,
            fecha_nacimiento: formData.fecha_nacimiento || null,
            curso_id: toIntOrNull(formData.curso_id),
            apoderado_id: toIntOrNull(formData.apoderado_id),
          }
        : {
            rut: formData.rut.trim(),
            nombre_completo: formData.nombre_completo?.trim() || null,
            fecha_nacimiento: formData.fecha_nacimiento || null,
            curso_id: toIntOrNull(formData.curso_id),
            apoderado_id: toIntOrNull(formData.apoderado_id),
          };

      await onSubmit(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica la información del alumno' : 'Ingresa los datos del nuevo alumno'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identificación */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4" /> Identificación
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isEditing && (
                <Field
                  label="RUT de la persona"
                  name="rut"
                  value={formData.rut}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.rut}
                  touched={touched.rut}
                  placeholder="Ej: 12.345.678-9"
                  required
                />
              )}

              <div className={cn(!isEditing && 'md:col-span-2')}>
                <Field
                  label="Nombre completo (opcional)"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.nombre_completo}
                  touched={touched.nombre_completo}
                  placeholder="Si se omite, se tomará desde Personas"
                  icon={User}
                  disabled={isSubmitting || isLoading}
                />
              </div>

              <Field
                label="Fecha de nacimiento (opcional)"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={onChange}
                onBlur={onBlur}
                error={errors.fecha_nacimiento}
                touched={touched.fecha_nacimiento}
                icon={Calendar}
                disabled={isSubmitting || isLoading}
              />
            </CardContent>
          </Card>

          {/* Académico */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-centered gap-2">
                <GraduationCap className="w-4 h-4" /> Académico (opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* curso_id */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Curso</Label>
                <Select
                  value={formData.curso_id || undefined}
                  onValueChange={(v) => onSelect('curso_id', v)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.length === 0 ? (
                      <SelectItem value="__none" disabled>No hay cursos</SelectItem>
                    ) : (
                      cursos.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre_curso || c.nombre || `Curso ${c.id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* apoderado_id */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Apoderado</Label>
                <Select
                  value={formData.apoderado_id || undefined}
                  onValueChange={(v) => onSelect('apoderado_id', v)}
                  disabled={isSubmitting || isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un apoderado" />
                  </SelectTrigger>
                  <SelectContent>
                    {apoderados.length === 0 ? (
                      <SelectItem value="__none" disabled>No hay apoderados</SelectItem>
                    ) : (
                      apoderados.map(a => (
                        <SelectItem
                          key={a.id || a.apoderado_id}
                          value={String(a.id || a.apoderado_id)}
                        >
                          {a.nombre_completo || a.nombre || `Apoderado ${a.id || a.apoderado_id}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Errores */}
          {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Corrige los errores antes de continuar.</AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <DialogFooter className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" /> Cancelar
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
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
