import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { 
  Users, 
  Search, 
  Eye,
  DollarSign,
  AlertCircle,
  BookOpen,
  Filter
} from 'lucide-react';
import { useAlumnosCursoTesorero, useTesoreroActual } from '../../features/tesorero/hooks/useTesorero';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';
import  Navbar  from '../../pages/Navbar.jsx';

const TesoreroAlumnos = () => {
  const { tesorero } = useTesoreroActual();
  const { alumnos, loading, error, pagination, fetchAlumnos, changePage } = useAlumnosCursoTesorero();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    estado_deuda: '',
    orden: 'nombre'
  });

  useEffect(() => {
    fetchAlumnos({
      search: searchTerm,
      ...filtros
    });
  }, [searchTerm, filtros, fetchAlumnos]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!tesorero || !tesorero.curso) {
    return (
      <>
                {/* Navbar global */}
                <Navbar /> 
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Sin Curso Asignado</CardTitle>
            <CardDescription>
              No tienes un curso asignado como tesorero.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      </>
    );
  }

  const curso = tesorero.curso;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alumnos del Curso</h1>
          <p className="text-muted-foreground">
            Gestión de alumnos del curso {curso.nombre_curso}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>{curso.nombre_curso}</span>
          </Badge>
          <Badge variant="outline">
            {alumnos.length} alumnos
          </Badge>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o apellido..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            
            <select
              value={filtros.estado_deuda}
              onChange={(e) => handleFiltroChange('estado_deuda', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Con deudas pendientes</option>
              <option value="pagado">Sin deudas pendientes</option>
            </select>

            <select
              value={filtros.orden}
              onChange={(e) => handleFiltroChange('orden', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="apellido">Ordenar por apellido</option>
              <option value="deuda_desc">Mayor deuda primero</option>
              <option value="deuda_asc">Menor deuda primero</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alumnos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Lista de Alumnos</span>
          </CardTitle>
          <CardDescription>
            Alumnos matriculados en el curso {curso.nombre_curso}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando alumnos...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : alumnos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron alumnos</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Estado Financiero</TableHead>
                    <TableHead>Deuda Total</TableHead>
                    <TableHead>Último Pago</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alumnos.map((alumno) => (
                    <TableRow key={alumno.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{alumno.nombre} {alumno.apellido}</p>
                          <p className="text-sm text-muted-foreground">ID: {alumno.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {alumno.rut || 'No registrado'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={alumno.deuda_total > 0 ? 'destructive' : 'default'}
                        >
                          {alumno.deuda_total > 0 ? 'Con deudas' : 'Al día'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${alumno.deuda_total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(alumno.deuda_total || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {alumno.ultimo_pago ? (
                          <div>
                            <p className="text-sm">{formatDate(alumno.ultimo_pago.fecha)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(alumno.ultimo_pago.monto)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin pagos</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link to={`/tesorero/alumnos/${alumno.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalle
                            </Link>
                          </Button>
                          
                          {alumno.deuda_total > 0 && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                            >
                              <Link to={`/tesorero/alumnos/${alumno.id}/deudas`}>
                                <DollarSign className="h-4 w-4 mr-1" />
                                Gestionar Deudas
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.totalItems)} de{' '}
                    {pagination.totalItems} alumnos
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen Estadístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alumnos.length}</div>
            <p className="text-xs text-muted-foreground">
              Alumnos matriculados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Deudas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alumnos.filter(a => a.deuda_total > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Alumnos con deudas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Al Día</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alumnos.filter(a => a.deuda_total === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Alumnos sin deudas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nota Informativa */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Acceso Restringido al Curso
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Solo puedes ver y gestionar alumnos del curso <strong>{curso.nombre_curso}</strong>. 
                Los datos financieros mostrados corresponden únicamente a este curso.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesoreroAlumnos;

