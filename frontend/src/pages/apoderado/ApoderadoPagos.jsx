// src/pages/apoderado/ApoderadoPagos.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Calculator,
  Star,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Checkbox } from '../../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { useApoderadoData, usePayments } from '../../features/apoderado/hooks/useApoderado';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
// import Navbar from '../../pages/Navbar.jsx'; // opcional (no se usa aquí)

export default function ApoderadoPagos() {
  const navigate = useNavigate();
  const {
    deudasPendientes,
    hijos,
    isLoading: loadingData,
    refreshData
  } = useApoderadoData();
  
  const {
    gateways,
    recommendation,
    comparison,
    isLoading: loadingPayments,
    getRecommendation,
    compareGateways,
    createPayment
  } = usePayments();

  const [selectedDeudas, setSelectedDeudas] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar datos al montar
  useEffect(() => { refreshData(); }, [refreshData]);

  // Seleccionar todas las deudas por defecto
  useEffect(() => {
    if (deudasPendientes.length > 0) {
      setSelectedDeudas(deudasPendientes.map(d => d.id));
    } else {
      setSelectedDeudas([]);
    }
  }, [deudasPendientes]);

  // Obtener recomendación y comparación cuando cambien las deudas seleccionadas
  useEffect(() => {
    if (selectedDeudas.length > 0) {
      const total = selectedDeudas.reduce((sum, deudaId) => {
        const deuda = deudasPendientes.find(d => d.id === deudaId);
        return sum + (deuda?.monto || 0);
      }, 0);
      if (total > 0) {
        getRecommendation({ amount: total });
        compareGateways(total);
      }
    }
  }, [selectedDeudas, deudasPendientes, getRecommendation, compareGateways]);

  // Usar recomendación automática
  useEffect(() => {
    if (recommendation && !selectedGateway) {
      setSelectedGateway(recommendation.gateway);
    }
  }, [recommendation, selectedGateway]);

  const handleDeudaToggle = (deudaId) => {
    setSelectedDeudas(prev => 
      prev.includes(deudaId)
        ? prev.filter(id => id !== deudaId)
        : [...prev, deudaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDeudas.length === deudasPendientes.length) {
      setSelectedDeudas([]);
    } else {
      setSelectedDeudas(deudasPendientes.map(d => d.id));
    }
  };

  const handleProcessPayment = async () => {
    if (selectedDeudas.length === 0) {
      toast.error('Selecciona al menos una deuda para pagar');
      return;
    }
    if (!selectedGateway) {
      toast.error('Selecciona un método de pago');
      return;
    }

    setIsProcessing(true);
    try {
      // El backend ya normaliza deuda_ids -> cuota_ids
      const payload = {
        deuda_ids: selectedDeudas,
        gateway: selectedGateway,
        payment_method: 'card',
        country: 'CL',
      };

      const result = await createPayment(payload);
      // result ejemplo (MP): { gateway:'mercadopago', preference_id, init_point, sandbox_init_point, ... }

      if (result?.gateway === 'mercadopago') {
        const go = result.init_point || result.sandbox_init_point;
        if (!go) throw new Error('No se recibió init_point de Mercado Pago');
        // Redirige al checkout de Mercado Pago
        window.location.href = go;
        return; // importante: no seguir flujo local
      }

      // Otros gateways (placeholder)
      toast.success('Pago creado. Sigue las instrucciones de la pasarela seleccionada.');
      setTimeout(() => navigate('/apoderado/dashboard'), 1500);
    } catch (error) {
      toast.error(error.message || 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSeleccionado = selectedDeudas.reduce((sum, deudaId) => {
    const deuda = deudasPendientes.find(d => d.id === deudaId);
    return sum + (deuda?.monto || 0);
  }, 0);

  const getGatewayIcon = (gatewayId) => {
    switch (gatewayId) {
      case 'stripe': return <CreditCard className="w-5 h-5" />;
      case 'transbank': return <Banknote className="w-5 h-5" />;
      case 'mercadopago': return <Smartphone className="w-5 h-5" />;
      case 'bancoestado': return <Building2 className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const getGatewayColor = (gatewayId) => {
    switch (gatewayId) {
      case 'stripe': return 'from-purple-600 to-blue-600';
      case 'transbank': return 'from-red-600 to-orange-600';
      case 'mercadopago': return 'from-blue-600 to-cyan-600';
      case 'bancoestado': return 'from-green-600 to-emerald-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  if (loadingData || loadingPayments) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/apoderado/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Realizar Pagos
              </h1>
              <p className="text-sm text-gray-600">
                Sistema unificado de pagos - Elige la mejor opción
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Deudas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deudas pendientes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Deudas Pendientes</CardTitle>
                    <CardDescription>
                      Selecciona las cuotas que deseas pagar
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedDeudas.length === deudasPendientes.length ? 'Deseleccionar' : 'Seleccionar'} Todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {deudasPendientes.map((deuda, index) => {
                  const isSelected = selectedDeudas.includes(deuda.id);
                  const fecha = deuda.fecha_limite ? new Date(deuda.fecha_limite) : null;
                  const isVencida = fecha ? fecha < new Date() : false;
                  const hijo = hijos.find(h => String(h.id) === String(deuda.alumno_id));
                  const nombreHijo = hijo?.nombre_completo || 'Estudiante';

                  return (
                    <motion.div
                      key={deuda.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : isVencida 
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleDeudaToggle(deuda.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => handleDeudaToggle(deuda.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{deuda.nombre}</h3>
                            {isVencida && <Badge variant="destructive">Vencida</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span>Estudiante: </span>
                              <span className="font-medium">{nombreHijo}</span>
                            </div>
                            <div>
                              <span>Vencimiento: </span>
                              <span className={`font-medium ${isVencida ? 'text-red-600' : ''}`}>
                                {fecha ? format(fecha, 'dd MMM yyyy', { locale: es }) : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${Number(deuda.monto || 0).toLocaleString('es-CL')}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Métodos de pago */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Métodos de Pago Disponibles
                </CardTitle>
                <CardDescription>
                  Elige el método que prefieras. Te recomendamos la opción más económica.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway}>
                  <div className="space-y-4">
                    {gateways.map((gateway) => {
                      const isRecommended = recommendation?.gateway === gateway.id;
                      const comparisonData = comparison?.comparison?.find(c => c.gateway === gateway.id);
                      
                      return (
                        <motion.div
                          key={gateway.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedGateway === gateway.id 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedGateway(gateway.id)}
                        >
                          {isRecommended && (
                            <div className="absolute -top-2 -right-2">
                              <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Recomendado
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4">
                            <RadioGroupItem value={gateway.id} id={gateway.id} />
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGatewayColor(gateway.id)} flex items-center justify-center text-white`}>
                              {getGatewayIcon(gateway.id)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Label htmlFor={gateway.id} className="font-semibold cursor-pointer">
                                  {gateway.name}
                                </Label>
                                {isRecommended && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    Más económico
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{gateway.description}</p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-gray-500">Comisión: {gateway.fees}</span>
                                {comparisonData && (
                                  <span className="font-medium text-green-600">
                                    Costo estimado: ${Number(comparisonData.estimated_fee || 0).toLocaleString('es-CL')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {comparison && (
                  <div className="mt-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowComparison(!showComparison)}
                      className="flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      {showComparison ? 'Ocultar' : 'Ver'} Comparación de Costos
                    </Button>
                    
                    {showComparison && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-semibold mb-3">
                          Comparación para ${Number(totalSeleccionado || 0).toLocaleString('es-CL')} CLP
                        </h4>
                        <div className="space-y-2">
                          {(comparison.comparison || []).map((item, index) => (
                            <div key={item.gateway} className="flex items-center justify-between text-sm">
                              <span className={`font-medium ${index === 0 ? 'text-green-600' : ''}`}>
                                {item.name} {index === 0 && '(Más económico)'}
                              </span>
                              <span className={`${index === 0 ? 'text-green-600 font-bold' : ''}`}>
                                ${Number(item.estimated_fee || 0).toLocaleString('es-CL')} CLP
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Resumen */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen del Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cuotas seleccionadas:</span>
                    <span className="font-medium">{selectedDeudas.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">${Number(totalSeleccionado || 0).toLocaleString('es-CL')}</span>
                  </div>
                  {selectedGateway && comparison && (
                    <div className="flex justify-between text-sm">
                      <span>Comisión estimada:</span>
                      <span className="font-medium text-red-600">
                        ${Number(comparison.comparison?.find(c => c.gateway === selectedGateway)?.estimated_fee || 0).toLocaleString('es-CL')}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total a pagar:</span>
                  <span className="text-green-600">${Number(totalSeleccionado || 0).toLocaleString('es-CL')}</span>
                </div>

                {recommendation && selectedGateway === recommendation.gateway && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      ¡Excelente elección! Estás usando la opción más económica.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleProcessPayment}
                  disabled={selectedDeudas.length === 0 || !selectedGateway || isProcessing}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Proceder al Pago
                    </>
                  )}
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    El pago se procesará de forma segura a través de la pasarela seleccionada. 
                    Recibirás una confirmación por email.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
