// src/pages/tesorero/tesorerodashboard.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Users, DollarSign, AlertCircle, TrendingUp, BookOpen, CreditCard, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import Navbar from '../../pages/Navbar.jsx';
import tesoreroAPI from '../../api/tesorero';

const TesoreroDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tesorero, setTesorero] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await tesoreroAPI.getMyData();
        if (!mounted) return;

        console.debug('[TESORERO] /me =>', me);

        // Acepta { curso: { id } } o { curso_id } como válidos
        const cursoId =
          me?.curso?.id ??
          me?.curso_id ??
          me?.curso?.curso_id ?? null;

        setTesorero(me || null);

        if (cursoId) {
          const [r1, r2] = await Promise.all([
            tesoreroAPI.getResumenCurso(),               // { data: {...} }
            tesoreroAPI.getEstadisticasFinancierasCurso()// { data: {...} }
          ]);
          if (!mounted) return;
          setResumen(r1?.data || null);
          setEstadisticas(r2?.data || null);
        } else {
          setError('No estás asignado como tesorero de ningún curso.');
        }
      } catch (e) {
        // Muestra el mensaje del backend si vino 404
        const msg = e?.response?.data?.message || e?.message || 'Error al cargar datos';
        console.warn('[TESORERO] /me error =>', msg);
        setError(msg);
        setTesorero(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const curso = tesorero?.curso ?? (tesorero?.curso_id ? {
    id: tesorero.curso_id,
    nombre_curso: tesorero.curso_nombre || 'Curso',
    nivel_id: tesorero.nivel_id ?? undefined,
    ano_escolar: tesorero.ano_escolar ?? undefined
  } : null);

  // Si no hay curso asignado o vino error, muestra tarjeta informativa
  if (!curso?.id) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Sin Curso Asignado</CardTitle>
              <CardDescription>
                No tienes un curso asignado como tesorero. Contacta al administrador para obtener acceso.
              </CardDescription>
            </CardHeader>
            {error && (
              <CardContent>
                <p className="text-center text-sm text-red-600">{error}</p>
              </CardContent>
            )}
          </Card>
        </div>
      </>
    );
  }

  const usuario = tesorero?.persona || tesorero?.usuario || {};

  return (
    <>
          <Navbar />
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Tesorero</h1>
          <p className="text-muted-foreground">Gestión financiera del curso {curso.nombre_curso}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{curso.nombre_curso}</span>
          </Badge>
          {curso.ano_escolar && <Badge variant="outline">Año {curso.ano_escolar}</Badge>}
        </div>
      </div>

      {/* Info Tesorero */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Información del Tesorero</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-lg font-semibold">
                {[usuario.nombres, usuario.apellidos].filter(Boolean).join(' ') || '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{usuario.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Asignación</p>
              <p className="text-lg">{formatDate(tesorero?.fecha_asignacion)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumen?.total_alumnos || 0}</div>
            <p className="text-xs text-muted-foreground">Alumnos en el curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estadisticas?.total_recaudado || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas?.total_pagos || 0} pagos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deudas Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(estadisticas?.total_pendiente || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {estadisticas?.total_deudas || 0} deudas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia de Cobro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estadisticas?.total_recaudado && estadisticas?.total_pendiente
                ? Math.round((estadisticas.total_recaudado / (estadisticas.total_recaudado + estadisticas.total_pendiente)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Porcentaje de cobro</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona las finanzas de tu curso de manera eficiente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link to="/tesorero/alumnos">
                <Users className="h-6 w-6" />
                <span>Ver Alumnos</span>
                <span className="text-xs opacity-75">Gestionar alumnos del curso</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link to="/tesorero/pagos">
                <CreditCard className="h-6 w-6" />
                <span>Gestionar Pagos</span>
                <span className="text-xs opacity-75">Ver y administrar pagos</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link to="/tesorero/deudas">
                <AlertCircle className="h-6 w-6" />
                <span>Deudas Pendientes</span>
                <span className="text-xs opacity-75">Revisar deudas por cobrar</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link to="/tesorero/reportes">
                <FileText className="h-6 w-6" />
                <span>Generar Reportes</span>
                <span className="text-xs opacity-75">Reportes financieros</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Curso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Información del Curso</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre del Curso</p>
              <p className="text-lg font-semibold">{curso.nombre_curso}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nivel</p>
              <p className="text-lg">{curso.nivel_id ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Año Escolar</p>
              <p className="text-lg">{curso.ano_escolar ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Alumnos</p>
              <p className="text-lg font-semibold">{resumen?.total_alumnos || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen financiero */}
      {estadisticas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Resumen Financiero</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Recaudado:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(estadisticas.total_recaudado)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Pendiente:</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(estadisticas.total_pendiente)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Esperado:</span>
                <span className="text-lg font-bold">
                  {formatCurrency((estadisticas.total_recaudado || 0) + (estadisticas.total_pendiente || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
};

export default TesoreroDashboard;
