// src/pages/ApoderadoDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CreditCard, AlertCircle, CheckCircle, Clock,
  DollarSign, Calendar, TrendingUp, Eye, LogOut, User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useApoderadoData, usePayments } from '../../features/apoderado/hooks/useApoderado';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../../pages/Navbar.jsx';

export default function ApoderadoDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    profile,
    hijos,
    deudasPendientes,
    historialPagos,
    isLoading,
    error,
    refreshData,
  } = useApoderadoData();

  const { recommendation, getRecommendation } = usePayments();

  const [selectedTab, setSelectedTab] = useState('resumen');

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    if (deudasPendientes?.length) {
      const total = deudasPendientes.reduce((s, d) => s + (Number(d.monto) || 0), 0);
      getRecommendation({ amount: total });
    }
  }, [deudasPendientes, getRecommendation]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const handlePagarDeudas = () => navigate('/apoderado/pagos');
  const handleVerHistorial = () => navigate('/apoderado/historial');

  // ===== métricas rápidas =====
  const totalDeudas = useMemo(
    () => (deudasPendientes || []).reduce((s, d) => s + (Number(d.monto) || 0), 0),
    [deudasPendientes]
  );
  const deudasVencidas = useMemo(
    () => (deudasPendientes || []).filter(d => new Date(d.fecha_limite) < new Date()).length,
    [deudasPendientes]
  );
  const pagosEsteAno = useMemo(
    () => (historialPagos || []).filter(p => new Date(p.fecha_pago).getFullYear() === new Date().getFullYear()),
    [historialPagos]
  );
  const totalPagadoEsteAno = useMemo(
    () => pagosEsteAno.reduce((s, p) => s + (Number(p.monto_pagado) || 0), 0),
    [pagosEsteAno]
  );

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  // ===== helpers de display seguros =====
  const safeNombre = (h) => {
    const full = h?.nombre_completo?.trim();
    if (full) return full;
    const piezas = [h?.nombre, h?.apellido, h?.apellido_paterno, h?.apellido_materno]
      .map(x => (x || '').trim()).filter(Boolean);
    return piezas.join(' ') || 'Estudiante';
  };

  const safeInicial = (h) => (safeNombre(h).charAt(0) || 'E').toUpperCase();

  const safeCurso = (h) => {
    return h?.curso?.nombre
      || h?.curso_nombre
      || h?.nombre_curso
      || (h?.curso_id ? `Curso ${h.curso_id}` : 'Sin curso');
  };

  console.log('[DEBUG hijos]', hijos);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portal de Apoderados</h1>
                  <p className="text-sm text-gray-600">
                    Bienvenido, {user?.nombre || profile?.nombre || 'Apoderado'}
                  </p>
                </div>
              </div>

              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="hijos">Mis Hijos</TabsTrigger>
              <TabsTrigger value="deudas">Deudas Pendientes</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            {/* ===== Resumen ===== */}
            <TabsContent value="resumen" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { t: 'Hijos Registrados', v: hijos?.length || 0, icon: Users },
                  { t: 'Deudas Pendientes', v: `$${totalDeudas.toLocaleString('es-CL')}`, icon: DollarSign },
                  { t: 'Deudas Vencidas', v: deudasVencidas, icon: AlertCircle, accent: 'text-red-600' },
                  { t: 'Pagado este año', v: `$${totalPagadoEsteAno.toLocaleString('es-CL')}`, icon: TrendingUp, accent: 'text-green-600' },
                ].map((kpi, i) => (
                  <motion.div key={kpi.t} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.t}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${kpi.accent || ''}`}>{kpi.v}</div>
                        <p className="text-xs text-muted-foreground">
                          {kpi.t === 'Hijos Registrados' ? 'Estudiantes activos' : null}
                          {kpi.t === 'Deudas Pendientes' ? `${deudasPendientes.length} cuotas` : null}
                          {kpi.t === 'Pagado este año' ? `${pagosEsteAno.length} pagos` : null}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Acciones rápidas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Realizar Pagos
                    </CardTitle>
                    <CardDescription>Paga las cuotas pendientes de tus hijos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {totalDeudas > 0 ? (
                      <>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-yellow-800">
                                Total a pagar: ${totalDeudas.toLocaleString('es-CL')}
                              </p>
                              <p className="text-sm text-yellow-600">
                                {deudasPendientes.length} cuotas pendientes
                              </p>
                            </div>
                            {recommendation && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Recomendado: {recommendation.gateway_info?.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={handlePagarDeudas}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pagar Ahora
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <p className="text-green-600 font-medium">¡Todas las cuotas están al día!</p>
                        <p className="text-sm text-gray-600">No tienes deudas pendientes</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Historial de Pagos
                    </CardTitle>
                    <CardDescription>Revisa tus pagos anteriores</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {historialPagos?.length ? (
                      <>
                        <div className="space-y-2">
                          {historialPagos.slice(0, 3).map((pago) => (
                            <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{pago.cuota?.nombre}</p>
                                <p className="text-xs text-gray-600">
                                  {format(new Date(pago.fecha_pago), 'dd MMM yyyy', { locale: es })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">
                                  ${Number(pago.monto_pagado || 0).toLocaleString('es-CL')}
                                </p>
                                <Badge variant="outline" className="text-xs">{pago.metodo_pago}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" onClick={handleVerHistorial} className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Historial Completo
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No hay pagos registrados</p>
                        <p className="text-sm text-gray-500">Los pagos aparecerán aquí una vez realizados</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ===== Mis Hijos ===== */}
            <TabsContent value="hijos" className="space-y-6">
              {hijos?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hijos.map((hijo, i) => {
                    const nombre = safeNombre(hijo);
                    const inicial = safeInicial(hijo);
                    const cursoNombre = safeCurso(hijo);
                    const rutDisplay = hijo.rut || hijo.usuario_rut || hijo.usuario_id; // si existiera

                    return (
                      <motion.div
                        key={hijo.id ?? `${nombre}-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {inicial}
                              </div>
                              <span className="truncate">{nombre}</span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                              {cursoNombre}
                              {rutDisplay ? <span className="ml-2 text-xs text-gray-500">• RUT: {rutDisplay}</span> : null}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Curso:</span>
                                <span className="font-medium">{cursoNombre}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Estado:</span>
                                <Badge variant="outline" className="text-green-600">Activo</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Deudas:</span>
                                <span className="font-medium">
                                  {(deudasPendientes || []).filter(d => String(d.alumno_id) === String(hijo.id)).length} pendientes
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-14 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">Aún no hay hijos vinculados</h3>
                    <p className="text-sm text-gray-500">Cuando el colegio asigne a tus hijos, aparecerán aquí.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ===== Deudas Pendientes ===== */}
            <TabsContent value="deudas" className="space-y-6">
              {(deudasPendientes || []).length ? (
                <div className="space-y-4">
                  {deudasPendientes.map((deuda, index) => {
                    const isVencida = new Date(deuda.fecha_limite) < new Date();
                    const hijo = (hijos || []).find(h => String(h.id) === String(deuda.alumno_id));
                    const nombre = hijo ? safeNombre(hijo) : 'Estudiante';
                    const cursoNombre = hijo ? safeCurso(hijo) : '—';

                    return (
                      <motion.div
                        key={deuda.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06 }}
                      >
                        <Card className={isVencida ? 'border-red-200 bg-red-50' : ''}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">{deuda.nombre}</h3>
                                  {isVencida && <Badge variant="destructive">Vencida</Badge>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Estudiante:</span>
                                    <p className="font-medium">{nombre}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Curso:</span>
                                    <p className="font-medium">{cursoNombre}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Fecha límite:</span>
                                    <p className={`font-medium ${isVencida ? 'text-red-600' : ''}`}>
                                      {format(new Date(deuda.fecha_limite), 'dd MMM yyyy', { locale: es })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  ${Number(deuda.monto || 0).toLocaleString('es-CL')}
                                </p>
                                <p className="text-sm text-gray-600">CLP</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handlePagarDeudas}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pagar Todas las Deudas (${totalDeudas.toLocaleString('es-CL')})
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-600 mb-2">¡Excelente! No tienes deudas pendientes</h3>
                    <p className="text-gray-600">Todas las cuotas de tus hijos están al día</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ===== Historial ===== */}
            <TabsContent value="historial" className="space-y-6">
              {(historialPagos || []).length ? (
                <div className="space-y-4">
                  {historialPagos.map((pago, index) => (
                    <motion.div key={pago.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <h3 className="font-semibold">{pago.cuota?.nombre}</h3>
                                <Badge variant="outline">{pago.metodo_pago}</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Fecha de pago:</span>
                                  <p className="font-medium">
                                    {format(new Date(pago.fecha_pago), 'dd MMM yyyy HH:mm', { locale: es })}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">ID Transacción:</span>
                                  <p className="font-medium font-mono text-xs">{pago.transaccion_id}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Estado:</span>
                                  <Badge className="bg-green-100 text-green-800">Pagado</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">
                                ${Number(pago.monto_pagado || 0).toLocaleString('es-CL')}
                              </p>
                              <p className="text-sm text-gray-600">CLP</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pagos registrados</h3>
                    <p className="text-gray-500">Los pagos que realices aparecerán en este historial</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
