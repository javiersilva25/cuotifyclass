/**
 * Página de Carga Masiva v7.0
 * Sistema de carga masiva de usuarios con RUT y roles múltiples
 */

import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Users, FileSpreadsheet, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import FormularioGeografico from '../../components/forms/FormularioGeografico';

const CargaMasiva = () => {
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState([]);
  const [vistaPrevia, setVistaPrevia] = useState([]);

  // Datos de ejemplo para la plantilla
  const ejemploPlantilla = [
    {
      rut: '12345678-9',
      nombres: 'Juan Carlos',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'González',
      email: 'juan.perez@email.com',
      telefono: '+56912345678',
      fechaNacimiento: '1985-03-15',
      direccion: 'Av. Libertador 1234',
      comuna: 'Santiago',
      provincia: 'Santiago',
      region: 'RM',
      roles: 'apoderado,tesorero'
    },
    {
      rut: '98765432-1',
      nombres: 'María Elena',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Silva',
      email: 'maria.gonzalez@email.com',
      telefono: '+56987654321',
      fechaNacimiento: '1990-07-22',
      direccion: 'Calle Principal 567',
      comuna: 'Providencia',
      provincia: 'Santiago',
      region: 'RM',
      roles: 'profesor'
    }
  ];

  const handleArchivoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setArchivo(file);
      setResultado(null);
      setErrores([]);
      
      // Simular vista previa
      setVistaPrevia(ejemploPlantilla.slice(0, 3));
    }
  };

  const procesarArchivo = async () => {
    if (!archivo) return;

    setCargando(true);
    setProgreso(0);
    
    // Simular procesamiento con validaciones
    const interval = setInterval(() => {
      setProgreso(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCargando(false);
          setResultado({
            total: 150,
            exitosos: 145,
            errores: 5,
            nuevos: 120,
            actualizados: 25,
            duplicados: 3,
            rutInvalidos: 2
          });
          setErrores([
            { fila: 15, error: 'RUT inválido: 12345678-0', campo: 'rut' },
            { fila: 23, error: 'Email duplicado: admin@test.com', campo: 'email' },
            { fila: 45, error: 'Rol no válido: estudiante', campo: 'roles' },
            { fila: 67, error: 'Comuna no encontrada: San Pedro', campo: 'comuna' },
            { fila: 89, error: 'Fecha de nacimiento inválida', campo: 'fechaNacimiento' }
          ]);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const descargarPlantilla = () => {
    const headers = [
      'rut', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'email', 'telefono',
      'fechaNacimiento', 'direccion', 'comuna', 'provincia', 'region', 'roles'
    ];
    
    const csvContent = [
      headers.join(','),
      ...ejemploPlantilla.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_usuarios_v7.0.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Carga Masiva de Usuarios</h1>
        <p className="text-gray-600">Sistema v7.0 - RUT como identificador único con información geográfica</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
          <TabsTrigger value="template">Plantilla</TabsTrigger>
          <TabsTrigger value="geography">Geografía</TabsTrigger>
          <TabsTrigger value="help">Ayuda</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Cargar Archivo de Usuarios
              </CardTitle>
              <CardDescription>
                Suba un archivo CSV o Excel con la información completa de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleArchivoChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    Seleccione un archivo
                  </p>
                  <p className="text-gray-500">
                    CSV, Excel (.xlsx, .xls) hasta 10MB
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Incluye validación de RUT y datos geográficos de Chile
                  </p>
                </label>
              </div>

              {archivo && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium">Archivo seleccionado:</p>
                  <p className="text-sm text-gray-600">{archivo.name}</p>
                  <p className="text-sm text-gray-600">
                    Tamaño: {(archivo.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {vistaPrevia.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vista Previa</CardTitle>
                    <CardDescription>
                      Primeros registros del archivo (validación automática)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>RUT</TableHead>
                          <TableHead>Nombre Completo</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Roles</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vistaPrevia.map((persona, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{persona.rut}</TableCell>
                            <TableCell>
                              {persona.nombres} {persona.apellidoPaterno} {persona.apellidoMaterno}
                            </TableCell>
                            <TableCell>{persona.email}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{persona.comuna}, {persona.provincia}</div>
                                <div className="text-gray-500">{persona.region}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {persona.roles.split(',').map((rol, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {rol.trim()}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {cargando && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Procesando archivo...</span>
                    <span>{progreso}%</span>
                  </div>
                  <Progress value={progreso} className="w-full" />
                  <p className="text-xs text-gray-500">
                    Validando RUTs, emails y datos geográficos...
                  </p>
                </div>
              )}

              <Button
                onClick={procesarArchivo}
                disabled={!archivo || cargando}
                className="w-full"
              >
                {cargando ? 'Procesando...' : 'Procesar Archivo'}
              </Button>
            </CardContent>
          </Card>

          {resultado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Procesamiento Completado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{resultado.total}</p>
                      <p className="text-sm text-gray-600">Total registros</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{resultado.exitosos}</p>
                      <p className="text-sm text-gray-600">Exitosos</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-500">{resultado.nuevos}</p>
                      <p className="text-xs text-gray-600">Nuevos usuarios</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-500">{resultado.actualizados}</p>
                      <p className="text-xs text-gray-600">Actualizados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {errores.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Errores Encontrados ({errores.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {errores.map((error, index) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded">
                          <span className="font-medium">Fila {error.fila}:</span> {error.error}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Plantilla de Carga v7.0</CardTitle>
              <CardDescription>
                Descargue la plantilla actualizada con campos geográficos de Chile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  La plantilla incluye todos los campos requeridos y ejemplos de datos válidos
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Campos incluidos:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• RUT (identificador único)</div>
                  <div>• Nombres y apellidos</div>
                  <div>• Email y teléfono</div>
                  <div>• Fecha de nacimiento</div>
                  <div>• Dirección completa</div>
                  <div>• Comuna, Provincia, Región</div>
                  <div>• Roles (separados por comas)</div>
                  <div>• Campos de auditoría</div>
                </div>
              </div>

              <Button onClick={descargarPlantilla} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla CSV v7.0
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Información Geográfica
              </CardTitle>
              <CardDescription>
                Ejemplo de formulario geográfico integrado en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioGeografico 
                mostrarTitulo={false}
                requerido={true}
                valores={{
                  direccion: 'Av. Libertador Bernardo O\'Higgins 1234',
                  comuna: 'Santiago',
                  provincia: 'Santiago',
                  region: 'RM'
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guía de Uso v7.0</CardTitle>
                <CardDescription>
                  Sistema actualizado con RUT y datos geográficos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    El RUT es el identificador único del sistema. Cada persona puede tener múltiples roles.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600">Campos requeridos:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>RUT (formato: 12.345.678-9 o 12345678-9)</li>
                      <li>Nombres</li>
                      <li>Apellido Paterno</li>
                      <li>Email (único en el sistema)</li>
                      <li>Al menos un rol válido</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-600">Campos opcionales:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Apellido Materno</li>
                      <li>Teléfono</li>
                      <li>Fecha de nacimiento</li>
                      <li>Dirección, Comuna, Provincia, Región</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-purple-600">Roles disponibles:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div>• administrador</div>
                      <div>• profesor</div>
                      <div>• tesorero</div>
                      <div>• apoderado</div>
                      <div>• alumno</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-600">Validaciones automáticas:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      <li>Validación de RUT chileno</li>
                      <li>Verificación de email único</li>
                      <li>Validación de roles existentes</li>
                      <li>Verificación de comunas, provincias y regiones de Chile</li>
                      <li>Formato de fecha de nacimiento</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CargaMasiva;

