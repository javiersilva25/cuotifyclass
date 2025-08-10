import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Calendar,
  TrendingUp,
  Eye,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useApoderadoData, usePayments } from '../../features/apoderado/hooks/useApoderado';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    refreshData
  } = useApoderadoData();
  
  const {
    gateways,
    recommendation,
    getRecommendation
  } = usePayments();

  const [selectedTab, setSelectedTab] = useState('resumen');

  // Cargar datos al montar el componente
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Obtener recomendación de pasarela para el total de deudas
  useEffect(() => {
    if (deudasPendientes.length > 0) {
      const totalDeuda = deudasPendientes.reduce((sum, deuda) => sum + deuda.monto, 0);
      getRecommendation({ amount: totalDeuda });
    }
  }, [deudasPendientes, getRecommendation]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePagarDeudas = () => {
    navigate('/apoderado/pagos');
  };

  const handleVerHistorial = () => {
    navigate('/apoderado/historial');
  };

  // Calcular estadísticas
  const totalDeudas = deudasPendientes.reduce((sum, deuda) => sum + deuda.monto, 0);
  const deudasVencidas = deudasPendientes.filter(deuda => 
    new Date(deuda.fecha_limite) < new Date()
  ).length;
  const pagosEsteAno = historialPagos.filter(pago => 
    new Date(pago.fecha_pago).getFullYear() === new Date().getFullYear()
  );
  const totalPagadoEsteAno = pagosEsteAno.reduce((sum, pago) => sum + pago.monto_pagado, 0);

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
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
                <h1 className="text-xl font-bold text-gray-900">
                  Portal de Apoderados
                </h1>
                <p className="text-sm text-gray-600">
                  Bienvenido, {user?.nombre || 'Apoderado'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
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

          {/* Tab: Resumen */}
          <TabsContent value="resumen" className="space-y-6">
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Hijos Registrados</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{hijos.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Estudiantes activos
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deudas Pendientes</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${totalDeudas.toLocaleString('es-CL')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {deudasPendientes.length} cuotas pendientes
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deudas Vencidas</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{deudasVencidas}</div>
                    <p className="text-xs text-muted-foreground">
                      Requieren atención inmediata
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pagado este año</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${totalPagadoEsteAno.toLocaleString('es-CL')}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pagosEsteAno.length} pagos realizados
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Realizar Pagos
                  </CardTitle>
                  <CardDescription>
                    Paga las cuotas pendientes de tus hijos
                  </CardDescription>
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
                  <CardDescription>
                    Revisa tus pagos anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {historialPagos.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {historialPagos.slice(0, 3).map((pago, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{pago.cuota?.nombre}</p>
                              <p className="text-xs text-gray-600">
                                {format(new Date(pago.fecha_pago), 'dd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                ${pago.monto_pagado.toLocaleString('es-CL')}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {pago.metodo_pago}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleVerHistorial}
                        className="w-full"
                      >
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

          {/* Tab: Mis Hijos */}
          <TabsContent value="hijos" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hijos.map((hijo, index) => (
                <motion.div
                  key={hijo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {hijo.nombre.charAt(0)}
                        </div>
                        {hijo.nombre} {hijo.apellido}
                      </CardTitle>
                      <CardDescription>
                        {hijo.curso?.nombre} - RUT: {hijo.rut}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Curso:</span>
                          <span className="font-medium">{hijo.curso?.nombre}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estado:</span>
                          <Badge variant="outline" className="text-green-600">
                            Activo
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Deudas:</span>
                          <span className="font-medium">
                            {deudasPendientes.filter(d => d.alumno_id === hijo.id).length} pendientes
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Deudas Pendientes */}
          <TabsContent value="deudas" className="space-y-6">
            {deudasPendientes.length > 0 ? (
              <div className="space-y-4">
                {deudasPendientes.map((deuda, index) => {
                  const isVencida = new Date(deuda.fecha_limite) < new Date();
                  const hijo = hijos.find(h => h.id === deuda.alumno_id);
                  
                  return (
                    <motion.div
                      key={deuda.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={isVencida ? 'border-red-200 bg-red-50' : ''}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{deuda.nombre}</h3>
                                {isVencida && (
                                  <Badge variant="destructive">Vencida</Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Estudiante:</span>
                                  <p className="font-medium">{hijo?.nombre} {hijo?.apellido}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Curso:</span>
                                  <p className="font-medium">{hijo?.curso?.nombre}</p>
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
                                ${deuda.monto.toLocaleString('es-CL')}
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
                  <h3 className="text-xl font-semibold text-green-600 mb-2">
                    ¡Excelente! No tienes deudas pendientes
                  </h3>
                  <p className="text-gray-600">
                    Todas las cuotas de tus hijos están al día
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Historial */}
          <TabsContent value="historial" className="space-y-6">
            {historialPagos.length > 0 ? (
              <div className="space-y-4">
                {historialPagos.map((pago, index) => (
                  <motion.div
                    key={pago.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
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
                              ${pago.monto_pagado.toLocaleString('es-CL')}
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
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay pagos registrados
                  </h3>
                  <p className="text-gray-500">
                    Los pagos que realices aparecerán en este historial
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

