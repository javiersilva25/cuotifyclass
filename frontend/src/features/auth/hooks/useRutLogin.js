/**
 * Hook para manejo de login con RUT v8.0
 * Maneja validación y formateo de RUT chileno
 */

import { useState, useCallback } from 'react';
import { validarRut, limpiarRut, formatearRut } from '../../../utils/rutValidator';
import { useAuth } from './useAuth';

/**
 * Hook para manejo de login con RUT
 * @returns {object} Funciones y estado para login con RUT
 */
export const useRutLogin = () => {
  const { login } = useAuth();
  const [rutValue, setRutValue] = useState('');
  const [rutValid, setRutValid] = useState(false);
  const [rutError, setRutError] = useState('');

  /**
   * Maneja el cambio en el campo RUT
   * @param {Event} event - Evento del input
   */
  const handleRutChange = useCallback((event) => {
    const value = event.target.value;
    setRutValue(value);

    // Limpiar errores previos
    setRutError('');

    if (!value.trim()) {
      setRutValid(false);
      return;
    }

    try {
      const rutLimpio = limpiarRut(value);
      const esValido = validarRut(rutLimpio);
      
      setRutValid(esValido);
      
      if (!esValido && value.length > 8) {
        setRutError('RUT inválido');
      }
    } catch (error) {
      setRutValid(false);
      setRutError('Formato de RUT incorrecto');
    }
  }, []);

  /**
   * Realiza login con RUT y contraseña
   * @param {string} password - Contraseña del usuario
   * @param {string} tipoUsuario - Tipo de usuario (admin, apoderado, tesorero)
   * @returns {Promise<object>} Resultado del login
   */
  const loginWithRut = useCallback(async (password, tipoUsuario = 'admin') => {
    if (!rutValid) {
      throw new Error('RUT inválido');
    }

    if (!password.trim()) {
      throw new Error('Contraseña requerida');
    }

    try {
      const rutLimpio = limpiarRut(rutValue);
      const result = await login(rutLimpio, password, tipoUsuario);
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [rutValue, rutValid, login]);

  /**
   * Formatea el RUT para mostrar
   * @returns {string} RUT formateado
   */
  const getFormattedRut = useCallback(() => {
    if (!rutValue) return '';
    
    try {
      const rutLimpio = limpiarRut(rutValue);
      return formatearRut(rutLimpio);
    } catch (error) {
      return rutValue;
    }
  }, [rutValue]);

  /**
   * Limpia el formulario de RUT
   */
  const clearRut = useCallback(() => {
    setRutValue('');
    setRutValid(false);
    setRutError('');
  }, []);

  /**
   * Valida si el RUT actual es válido
   * @returns {boolean} True si el RUT es válido
   */
  const validateCurrentRut = useCallback(() => {
    if (!rutValue.trim()) {
      setRutError('RUT requerido');
      return false;
    }

    try {
      const rutLimpio = limpiarRut(rutValue);
      const esValido = validarRut(rutLimpio);
      
      if (!esValido) {
        setRutError('RUT inválido');
        return false;
      }

      setRutError('');
      return true;
    } catch (error) {
      setRutError('Formato de RUT incorrecto');
      return false;
    }
  }, [rutValue]);

  return {
    // Estado del RUT
    rutValue,
    rutValid,
    rutError,
    
    // Funciones de manejo
    handleRutChange,
    loginWithRut,
    getFormattedRut,
    clearRut,
    validateCurrentRut,
    
    // Utilidades
    isRutEmpty: !rutValue.trim(),
    isRutComplete: rutValue.length >= 9,
    formattedRut: getFormattedRut(),
  };
};

export default useRutLogin;

