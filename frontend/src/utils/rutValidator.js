/**
 * Validador de RUT Chileno v7.0
 * Implementa validación completa de RUT según algoritmo oficial
 */

/**
 * Limpia el RUT removiendo puntos, guiones y espacios
 * @param {string} rut - RUT a limpiar
 * @returns {string} RUT limpio
 */
export const limpiarRut = (rut) => {
  if (!rut) return '';
  return rut.toString().replace(/[^0-9kK]/g, '').toUpperCase();
};

/**
 * Formatea el RUT con puntos y guión
 * @param {string} rut - RUT a formatear
 * @returns {string} RUT formateado
 */
export const formatearRut = (rut) => {
  const rutLimpio = limpiarRut(rut);
  
  if (rutLimpio.length < 2) return rutLimpio;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${cuerpoFormateado}-${dv}`;
};

/**
 * Calcula el dígito verificador de un RUT
 * @param {string} rutSinDv - RUT sin dígito verificador
 * @returns {string} Dígito verificador calculado
 */
export const calcularDigitoVerificador = (rutSinDv) => {
  const rutLimpio = limpiarRut(rutSinDv);
  
  if (!rutLimpio || rutLimpio.length === 0) return '';
  
  let suma = 0;
  let multiplicador = 2;
  
  // Recorrer de derecha a izquierda
  for (let i = rutLimpio.length - 1; i >= 0; i--) {
    suma += parseInt(rutLimpio[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dv = 11 - resto;
  
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
};

/**
 * Valida si un RUT es válido
 * @param {string} rut - RUT completo a validar
 * @returns {boolean} true si el RUT es válido
 */
export const validarRut = (rut) => {
  const rutLimpio = limpiarRut(rut);
  
  // Verificar longitud mínima y máxima
  if (rutLimpio.length < 2 || rutLimpio.length > 9) {
    return false;
  }
  
  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dvIngresado = rutLimpio.slice(-1);
  
  // Verificar que el cuerpo sean solo números
  if (!/^\d+$/.test(cuerpo)) {
    return false;
  }
  
  // Verificar que el dígito verificador sea válido
  if (!/^[0-9kK]$/.test(dvIngresado)) {
    return false;
  }
  
  // Calcular dígito verificador esperado
  const dvCalculado = calcularDigitoVerificador(cuerpo);
  
  // Comparar dígitos verificadores
  return dvIngresado.toUpperCase() === dvCalculado.toUpperCase();
};

/**
 * Normaliza un RUT a formato estándar (sin puntos, con guión)
 * @param {string} rut - RUT a normalizar
 * @returns {string} RUT normalizado
 */
export const normalizarRut = (rut) => {
  const rutLimpio = limpiarRut(rut);
  
  if (rutLimpio.length < 2) return rutLimpio;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  
  return `${cuerpo}-${dv}`;
};

/**
 * Obtiene solo el número del RUT (sin dígito verificador)
 * @param {string} rut - RUT completo
 * @returns {string} Número del RUT
 */
export const obtenerNumeroRut = (rut) => {
  const rutLimpio = limpiarRut(rut);
  return rutLimpio.slice(0, -1);
};

/**
 * Obtiene solo el dígito verificador del RUT
 * @param {string} rut - RUT completo
 * @returns {string} Dígito verificador
 */
export const obtenerDigitoVerificador = (rut) => {
  const rutLimpio = limpiarRut(rut);
  return rutLimpio.slice(-1);
};

/**
 * Valida y formatea un RUT en tiempo real (para inputs)
 * @param {string} valor - Valor actual del input
 * @param {string} valorAnterior - Valor anterior del input
 * @returns {object} { valor: string, valido: boolean, error: string }
 */
export const validarYFormatearRut = (valor, valorAnterior = '') => {
  // Si está borrando, permitir
  if (valor.length < valorAnterior.length) {
    return {
      valor: formatearRut(valor),
      valido: valor.length === 0 || validarRut(valor),
      error: ''
    };
  }
  
  const rutLimpio = limpiarRut(valor);
  
  // Verificar longitud máxima
  if (rutLimpio.length > 9) {
    return {
      valor: valorAnterior,
      valido: false,
      error: 'RUT demasiado largo'
    };
  }
  
  // Verificar caracteres válidos
  if (!/^[0-9kK]*$/.test(rutLimpio)) {
    return {
      valor: valorAnterior,
      valido: false,
      error: 'Solo se permiten números y K'
    };
  }
  
  const valorFormateado = formatearRut(valor);
  const esValido = rutLimpio.length === 0 || validarRut(rutLimpio);
  
  let error = '';
  if (rutLimpio.length > 0 && !esValido) {
    error = 'RUT inválido';
  }
  
  return {
    valor: valorFormateado,
    valido: esValido,
    error
  };
};

/**
 * Genera un RUT válido aleatorio (para testing)
 * @returns {string} RUT válido formateado
 */
export const generarRutAleatorio = () => {
  // Generar número aleatorio entre 1.000.000 y 25.000.000
  const numero = Math.floor(Math.random() * 24000000) + 1000000;
  const dv = calcularDigitoVerificador(numero.toString());
  return formatearRut(`${numero}${dv}`);
};

/**
 * Valida una lista de RUTs
 * @param {string[]} ruts - Array de RUTs a validar
 * @returns {object[]} Array con resultados de validación
 */
export const validarListaRuts = (ruts) => {
  return ruts.map(rut => ({
    rut: rut,
    rutFormateado: formatearRut(rut),
    rutNormalizado: normalizarRut(rut),
    valido: validarRut(rut),
    numero: obtenerNumeroRut(rut),
    digitoVerificador: obtenerDigitoVerificador(rut)
  }));
};

/**
 * Hook personalizado para manejo de RUT en componentes React
 * @param {string} valorInicial - Valor inicial del RUT
 * @returns {object} { rut, setRut, valido, error, rutLimpio, rutFormateado }
 */
export const useRut = (valorInicial = '') => {
  const [rut, setRutInterno] = React.useState(valorInicial);
  const [valido, setValido] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const setRut = React.useCallback((nuevoValor) => {
    const resultado = validarYFormatearRut(nuevoValor, rut);
    setRutInterno(resultado.valor);
    setValido(resultado.valido);
    setError(resultado.error);
  }, [rut]);
  
  React.useEffect(() => {
    if (valorInicial) {
      setRut(valorInicial);
    }
  }, [valorInicial, setRut]);
  
  return {
    rut,
    setRut,
    valido,
    error,
    rutLimpio: limpiarRut(rut),
    rutFormateado: formatearRut(rut),
    rutNormalizado: normalizarRut(rut)
  };
};

// Importar React para el hook
import React from 'react';

// Exportar todas las funciones como default también
export default {
  limpiarRut,
  formatearRut,
  calcularDigitoVerificador,
  validarRut,
  normalizarRut,
  obtenerNumeroRut,
  obtenerDigitoVerificador,
  validarYFormatearRut,
  generarRutAleatorio,
  validarListaRuts,
  useRut
};

