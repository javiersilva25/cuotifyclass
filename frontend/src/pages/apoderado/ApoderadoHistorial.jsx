import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Download, 
  Filter,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  FileText,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DatePickerWithRange } from '../../components/ui/date-picker';
import { useApoderadoData } from '../../features/apoderado/hooks/useApoderado';
import { useNavigate } from 'react-router-dom';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ApoderadoHistorial() {
  const navigate = useNavigate();
  const {
    historialPagos,
    hijos,
    isLoading,
    loadHistorialPagos
  } = useApoderadoData();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    metodo: 'todos',
    periodo: 'todos',
    fechaRango: null
  });

  const [pagosFiltrados, setPagosFiltrados] = useState([]);

  // Cargar historial completo al montar
  useEffect(() => {
    loadHistorialPagos(100); // Cargar últimos 100 pagos
  }, [loadHistorialPagos]);

  // Aplicar filtros
  useEffect(() => {
    let pagos = [...historialPagos];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      pagos = pagos.filter(pago => 
        pago.cuota?.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        pago.transaccion_id?.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }

    // Filtro por método de pago
    if (filtros.metodo !== 'todos') {
      pagos = pagos.filter(pago => pago.metodo_pago === filtros.metodo);
    }

    // Filtro por período
    if (filtros.periodo !== 'todos') {
      const ahora = new Date();
      let fechaInicio, fechaFin;

      switch (filtros.periodo) {
        case 'este-mes':
          fechaInicio = startOfMonth(ahora);
          fechaFin = endOfMonth(ahora);
          break;
        case 'este-ano':
          fechaInicio = startOfYear(ahora);
          fechaFin = endOfYear(ahora);
          break;
        case 'ultimos-3-meses':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 3, 1);
          fechaFin = ahora;
          break;
        default:
          break;
      }

      if (fechaInicio && fechaFin) {
        pagos = pagos.filter(pago => {
          const fechaPago = new Date(pago.fecha_pago);
          return fechaPago >= fechaInicio && fechaPago <= fechaFin;
        });
      }
    }

    // Filtro por rango de fechas personalizado
    if (filtros.fechaRango?.from && filtros.fechaRango?.to) {
      pagos = pagos.filter(pago => {
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago >= filtros.fechaRango.from && fechaPago <= filtros.fechaRango.to;
      });
    }

    setPagosFiltrados(pagos);
  }, [historialPagos, filtros]);

  const getMetodoIcon = (metodo) => {
    switch (metodo?.toLowerCase()) {
      case 'stripe': return <CreditCard className="w-4 h-4" />;
      case 'transbank': return <Banknote className="w-4 h-4" />;
      case 'mercadopago': return <Smartphone className="w-4 h-4" />;
      case 'bancoestado': return <Building2 className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMetodoColor = (metodo) => {
    switch (metodo?.toLowerCase()) {
      case 'stripe': return 'bg-purple-100 text-purple-800';
      case 'transbank': return 'bg-red-100 text-red-800';
      case 'mercadopago': return 'bg-blue-100 text-blue-800';
      case 'bancoestado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportarHistorial = () => {
    // Crear CSV con los datos filtrados
    const headers = ['Fecha', 'Cuota', 'Estudiante', 'Monto', 'Método', 'ID Transacción'];
    const csvContent = [
      headers.join(','),
      ...pagosFiltrados.map(pago => {
        const hijo = hijos.find(h => h.id === pago.alumno_id);
        return [
          format(new Date(pago.fecha_pago), 'dd/MM/yyyy'),
          `"${pago.cuota?.nombre || ''}"`,
          `"${hijo?.nombre || ''} ${hijo?.apellido || ''}"`,
          pago.monto_pagado,
          pago.metodo_pago,
          pago.transaccion_id
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-pagos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular estadísticas
  const totalPagado = pagosFiltrados.reduce((sum, pago) => sum + pago.monto_pagado, 0);
  const pagosPorMetodo = pagosFiltrados.reduce((acc, pago) => {
    acc[pago.metodo_pago] = (acc[pago.metodo_pago] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
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
                  Historial de Pagos
                </h1>
                <p className="text-sm text-gray-600">
                  Revisa todos tus pagos realizados
                </p>
              </div>
            </div>
            <Button 
              onClick={exportarHistorial}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalPagado.toLocaleString('es-CL')}
              </div>
              <p className="text-xs text-muted-foreground">
                En {pagosFiltrados.length} transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Realizados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagosFiltrados.length}</div>
              <p className="text-xs text-muted-foreground">
                Transacciones exitosas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Método Más Usado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(pagosPorMetodo).length > 0 
                  ? Object.entries(pagosPorMetodo).sort(([,a], [,b]) => b - a)[0][0]
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Método preferido
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por cuota o ID..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  className="pl-10"
                />
              </div>

              <Select 
                value={filtros.metodo} 
                onValueChange={(value) => setFiltros(prev => ({ ...prev, metodo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los métodos</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="transbank">Transbank</SelectItem>
                  <SelectItem value="mercadopago">MercadoPago</SelectItem>
                  <SelectItem value="bancoestado">BancoEstado</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filtros.periodo} 
                onValueChange={(value) => setFiltros(prev => ({ ...prev, periodo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los períodos</SelectItem>
                  <SelectItem value="este-mes">Este mes</SelectItem>
                  <SelectItem value="ultimos-3-meses">Últimos 3 meses</SelectItem>
                  <SelectItem value="este-ano">Este año</SelectItem>
                </SelectContent>
              </Select>

              <DatePickerWithRange
                date={filtros.fechaRango}
                setDate={(range) => setFiltros(prev => ({ ...prev, fechaRango: range }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de pagos */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Transacciones</CardTitle>
            <CardDescription>
              {pagosFiltrados.length} transacciones encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pagosFiltrados.length > 0 ? (
              <div className="space-y-4">
                {pagosFiltrados.map((pago, index) => {
                  const hijo = hijos.find(h => h.id === pago.alumno_id);
                  
                  return (
                    <motion.div
                      key={pago.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{pago.cuota?.nombre}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                {hijo?.nombre} {hijo?.apellido}
                              </span>
                              <span>•</span>
                              <span>
                                {format(new Date(pago.fecha_pago), 'dd MMM yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-600">
                              ${pago.monto_pagado.toLocaleString('es-CL')}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              {pago.transaccion_id}
                            </p>
                          </div>
                          
                          <Badge className={`flex items-center gap-1 ${getMetodoColor(pago.metodo_pago)}`}>
                            {getMetodoIcon(pago.metodo_pago)}
                            {pago.metodo_pago}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No se encontraron pagos
                </h3>
                <p className="text-gray-500">
                  Intenta ajustar los filtros para ver más resultados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

