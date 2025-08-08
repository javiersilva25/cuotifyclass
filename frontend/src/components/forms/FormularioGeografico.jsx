/**
 * Formulario Geográfico v7.0
 * Componente para capturar información geográfica de Chile
 */

import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

// Datos geográficos de Chile
const REGIONES_CHILE = [
  { codigo: 'XV', nombre: 'Arica y Parinacota' },
  { codigo: 'I', nombre: 'Tarapacá' },
  { codigo: 'II', nombre: 'Antofagasta' },
  { codigo: 'III', nombre: 'Atacama' },
  { codigo: 'IV', nombre: 'Coquimbo' },
  { codigo: 'V', nombre: 'Valparaíso' },
  { codigo: 'RM', nombre: 'Metropolitana de Santiago' },
  { codigo: 'VI', nombre: 'Libertador General Bernardo O\'Higgins' },
  { codigo: 'VII', nombre: 'Maule' },
  { codigo: 'XVI', nombre: 'Ñuble' },
  { codigo: 'VIII', nombre: 'Biobío' },
  { codigo: 'IX', nombre: 'La Araucanía' },
  { codigo: 'XIV', nombre: 'Los Ríos' },
  { codigo: 'X', nombre: 'Los Lagos' },
  { codigo: 'XI', nombre: 'Aysén del General Carlos Ibáñez del Campo' },
  { codigo: 'XII', nombre: 'Magallanes y de la Antártica Chilena' }
];

const PROVINCIAS_POR_REGION = {
  'RM': [
    'Santiago', 'Cordillera', 'Chacabuco', 'Maipo', 'Melipilla', 'Talagante'
  ],
  'V': [
    'Valparaíso', 'Isla de Pascua', 'Los Andes', 'Petorca', 'Quillota', 'San Antonio', 'San Felipe de Aconcagua'
  ],
  'VIII': [
    'Concepción', 'Arauco', 'Biobío'
  ],
  'IX': [
    'Cautín', 'Malleco'
  ],
  'X': [
    'Llanquihue', 'Chiloé', 'Osorno', 'Palena'
  ],
  // Agregar más provincias según necesidad
};

const COMUNAS_POR_PROVINCIA = {
  'Santiago': [
    'Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
    'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana',
    'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul',
    'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel',
    'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel',
    'San Ramón', 'Vitacura'
  ],
  'Valparaíso': [
    'Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar'
  ],
  'Concepción': [
    'Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco',
    'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé'
  ],
  // Agregar más comunas según necesidad
};

const FormularioGeografico = ({ 
  valores = {}, 
  onChange, 
  errores = {},
  requerido = false,
  mostrarTitulo = true 
}) => {
  const [regionSeleccionada, setRegionSeleccionada] = useState(valores.region || '');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState(valores.provincia || '');
  const [comunaSeleccionada, setComunaSeleccionada] = useState(valores.comuna || '');
  const [direccion, setDireccion] = useState(valores.direccion || '');

  // Obtener provincias disponibles según región
  const provinciasDisponibles = regionSeleccionada 
    ? PROVINCIAS_POR_REGION[regionSeleccionada] || []
    : [];

  // Obtener comunas disponibles según provincia
  const comunasDisponibles = provinciaSeleccionada 
    ? COMUNAS_POR_PROVINCIA[provinciaSeleccionada] || []
    : [];

  // Manejar cambio de región
  const handleRegionChange = (region) => {
    setRegionSeleccionada(region);
    setProvinciaSeleccionada('');
    setComunaSeleccionada('');
    
    if (onChange) {
      onChange({
        region,
        provincia: '',
        comuna: '',
        direccion
      });
    }
  };

  // Manejar cambio de provincia
  const handleProvinciaChange = (provincia) => {
    setProvinciaSeleccionada(provincia);
    setComunaSeleccionada('');
    
    if (onChange) {
      onChange({
        region: regionSeleccionada,
        provincia,
        comuna: '',
        direccion
      });
    }
  };

  // Manejar cambio de comuna
  const handleComunaChange = (comuna) => {
    setComunaSeleccionada(comuna);
    
    if (onChange) {
      onChange({
        region: regionSeleccionada,
        provincia: provinciaSeleccionada,
        comuna,
        direccion
      });
    }
  };

  // Manejar cambio de dirección
  const handleDireccionChange = (nuevaDireccion) => {
    setDireccion(nuevaDireccion);
    
    if (onChange) {
      onChange({
        region: regionSeleccionada,
        provincia: provinciaSeleccionada,
        comuna: comunaSeleccionada,
        direccion: nuevaDireccion
      });
    }
  };

  // Sincronizar con valores externos
  useEffect(() => {
    if (valores.region !== regionSeleccionada) {
      setRegionSeleccionada(valores.region || '');
    }
    if (valores.provincia !== provinciaSeleccionada) {
      setProvinciaSeleccionada(valores.provincia || '');
    }
    if (valores.comuna !== comunaSeleccionada) {
      setComunaSeleccionada(valores.comuna || '');
    }
    if (valores.direccion !== direccion) {
      setDireccion(valores.direccion || '');
    }
  }, [valores]);

  const contenido = (
    <div className="space-y-4">
      {/* Dirección */}
      <div>
        <Label htmlFor="direccion">
          Dirección {requerido && '*'}
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="direccion"
            value={direccion}
            onChange={(e) => handleDireccionChange(e.target.value)}
            placeholder="Av. Libertador Bernardo O'Higgins 1234"
            className={`pl-10 ${errores.direccion ? 'border-red-300 focus:border-red-500' : ''}`}
          />
        </div>
        {errores.direccion && (
          <p className="text-xs text-red-600 mt-1">{errores.direccion}</p>
        )}
      </div>

      {/* Región */}
      <div>
        <Label htmlFor="region">
          Región {requerido && '*'}
        </Label>
        <Select value={regionSeleccionada} onValueChange={handleRegionChange}>
          <SelectTrigger className={errores.region ? 'border-red-300 focus:border-red-500' : ''}>
            <SelectValue placeholder="Seleccione una región" />
          </SelectTrigger>
          <SelectContent>
            {REGIONES_CHILE.map((region) => (
              <SelectItem key={region.codigo} value={region.codigo}>
                {region.codigo} - {region.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errores.region && (
          <p className="text-xs text-red-600 mt-1">{errores.region}</p>
        )}
      </div>

      {/* Provincia */}
      <div>
        <Label htmlFor="provincia">
          Provincia {requerido && '*'}
        </Label>
        <Select 
          value={provinciaSeleccionada} 
          onValueChange={handleProvinciaChange}
          disabled={!regionSeleccionada}
        >
          <SelectTrigger className={errores.provincia ? 'border-red-300 focus:border-red-500' : ''}>
            <SelectValue placeholder={
              regionSeleccionada 
                ? "Seleccione una provincia" 
                : "Primero seleccione una región"
            } />
          </SelectTrigger>
          <SelectContent>
            {provinciasDisponibles.map((provincia) => (
              <SelectItem key={provincia} value={provincia}>
                {provincia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errores.provincia && (
          <p className="text-xs text-red-600 mt-1">{errores.provincia}</p>
        )}
      </div>

      {/* Comuna */}
      <div>
        <Label htmlFor="comuna">
          Comuna {requerido && '*'}
        </Label>
        <Select 
          value={comunaSeleccionada} 
          onValueChange={handleComunaChange}
          disabled={!provinciaSeleccionada}
        >
          <SelectTrigger className={errores.comuna ? 'border-red-300 focus:border-red-500' : ''}>
            <SelectValue placeholder={
              provinciaSeleccionada 
                ? "Seleccione una comuna" 
                : "Primero seleccione una provincia"
            } />
          </SelectTrigger>
          <SelectContent>
            {comunasDisponibles.map((comuna) => (
              <SelectItem key={comuna} value={comuna}>
                {comuna}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errores.comuna && (
          <p className="text-xs text-red-600 mt-1">{errores.comuna}</p>
        )}
      </div>

      {/* Información adicional */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <p className="flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          Complete la información geográfica para una mejor localización
        </p>
        {regionSeleccionada && (
          <p className="mt-1">
            <strong>Región seleccionada:</strong> {
              REGIONES_CHILE.find(r => r.codigo === regionSeleccionada)?.nombre
            }
          </p>
        )}
      </div>
    </div>
  );

  if (mostrarTitulo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="h-5 w-5 mr-2" />
            Información Geográfica
          </CardTitle>
          <CardDescription>
            Complete la información de ubicación en Chile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contenido}
        </CardContent>
      </Card>
    );
  }

  return contenido;
};

export default FormularioGeografico;

