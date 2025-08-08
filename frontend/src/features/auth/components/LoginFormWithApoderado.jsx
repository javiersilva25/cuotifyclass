/**
 * Formulario de Login v7.0
 * Sistema unificado con RUT como identificador único
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Lock, GraduationCap, Loader2, Users, UserCheck, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useAuth } from '../hooks/useAuth';
import { useRutLogin } from '../hooks/useRutLogin';
import { formatearRut, validarYFormatearRut } from '../../../utils/rutValidator';
import { cn } from '../../../lib/utils';

export function LoginFormWithApoderado() {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const { rutValue, rutValid, rutError, handleRutChange, loginWithRut } = useRutLogin();
  
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('admin');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Credenciales de demostración
  const credencialesPrueba = {
    admin: [
      { 
        role: 'Administrador', 
        rut: '12.345.678-9', 
        password: 'admin123',
        description: 'Acceso completo al sistema'
      },
      { 
        role: 'Profesor', 
        rut: '98.765.432-1', 
        password: 'profesor123',
        description: 'Gestión académica y reportes'
      }
    ],
    apoderado: [
      { 
        role: 'Apoderado Principal', 
        rut: '11.222.333-4', 
        password: 'apoderado123',
        description: 'Juan Pérez - 2 hijos (María y Carlos)'
      },
      { 
        role: 'Apoderado Suplente', 
        rut: '55.666.777-8', 
        password: 'apoderado456',
        description: 'Ana González - 1 hijo (Sofía)'
      }
    ],
    tesorero: [
      { 
        role: 'Tesorero 1°A', 
        rut: '22.333.444-5', 
        password: 'tesorero123',
        description: 'Gestión financiera Primero A'
      },
      { 
        role: 'Tesorero 3°B', 
        rut: '77.888.999-0', 
        password: 'tesorero456',
        description: 'Gestión financiera Tercero B'
      }
    ]
  };

  // Manejar cambio de RUT con formateo automático
  const handleRutInputChange = (e) => {
    const valor = e.target.value;
    const resultado = validarYFormatearRut(valor, rutValue);
    handleRutChange(resultado.valor);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rutValid) {
      setError('Por favor ingrese un RUT válido');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingrese su contraseña');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await loginWithRut(password, tipoUsuario);
      
      if (result.success) {
        // Redirigir según el tipo de usuario
        switch (tipoUsuario) {
          case 'apoderado':
            navigate('/apoderado/dashboard');
            break;
          case 'tesorero':
            navigate('/tesorero/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Error en el login');
      }
    } catch (err) {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autocompletar credenciales de prueba
  const autocompletarCredenciales = (credencial) => {
    handleRutChange(credencial.rut);
    setPassword(credencial.password);
  };

  // Obtener configuración según tipo de usuario
  const getConfiguracionTipo = () => {
    switch (tipoUsuario) {
      case 'apoderado':
        return {
          titulo: 'Portal de Apoderados',
          descripcion: 'Gestione los pagos y consulte información de sus hijos',
          icono: Users,
          color: 'green',
          placeholder: 'RUT del apoderado'
        };
      case 'tesorero':
        return {
          titulo: 'Portal de Tesoreros',
          descripcion: 'Administre las finanzas de su curso asignado',
          icono: CreditCard,
          color: 'purple',
          placeholder: 'RUT del tesorero'
        };
      default:
        return {
          titulo: 'Portal Administrativo',
          descripcion: 'Sistema de gestión escolar completo',
          icono: GraduationCap,
          color: 'blue',
          placeholder: 'RUT del usuario'
        };
    }
  };

  const config = getConfiguracionTipo();
  const IconoTipo = config.icono;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className={cn(
              "mx-auto h-12 w-12 flex items-center justify-center rounded-full",
              config.color === 'green' ? 'bg-green-100' :
              config.color === 'purple' ? 'bg-purple-100' : 'bg-blue-100'
            )}>
              <IconoTipo className={cn(
                "h-6 w-6",
                config.color === 'green' ? 'text-green-600' :
                config.color === 'purple' ? 'text-purple-600' : 'text-blue-600'
              )} />
            </div>
            <CardTitle className="text-2xl font-bold">{config.titulo}</CardTitle>
            <CardDescription className="text-gray-600">
              {config.descripcion}
            </CardDescription>
            <div className="text-xs text-gray-500 mt-2">
              Sistema de Gestión Escolar v7.0
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Selector de tipo de usuario */}
            <Tabs value={tipoUsuario} onValueChange={setTipoUsuario} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="text-xs">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="apoderado" className="text-xs">
                  <Users className="h-4 w-4 mr-1" />
                  Apoderado
                </TabsTrigger>
                <TabsTrigger value="tesorero" className="text-xs">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Tesorero
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo RUT */}
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  type="text"
                  value={rutValue}
                  onChange={handleRutInputChange}
                  placeholder={config.placeholder}
                  maxLength="12"
                  className={cn(
                    "transition-colors",
                    rutError ? 'border-red-300 focus:border-red-500' : 
                    rutValue && rutValid ? 'border-green-300 focus:border-green-500' : ''
                  )}
                />
                {rutError && (
                  <p className="text-xs text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {rutError}
                  </p>
                )}
                {rutValue && rutValid && (
                  <p className="text-xs text-green-600 flex items-center">
                    <span className="mr-1">✅</span>
                    RUT válido
                  </p>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botón de envío */}
              <Button
                type="submit"
                disabled={!rutValid || !password.trim() || isSubmitting || loading}
                className={cn(
                  "w-full transition-colors",
                  config.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                  config.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                  'bg-blue-600 hover:bg-blue-700'
                )}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Credenciales de prueba */}
            <div className="space-y-3">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Credenciales de Prueba
                </h4>
              </div>
              
              <div className="space-y-2">
                {credencialesPrueba[tipoUsuario].map((credencial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => autocompletarCredenciales(credencial)}
                      className="w-full text-left justify-start h-auto p-3"
                    >
                      <div className="flex flex-col items-start">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-3 w-3" />
                          <span className="font-medium text-xs">{credencial.role}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {credencial.rut} • {credencial.password}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {credencial.description}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Información del sistema */}
            <div className="text-center space-y-1">
              <div className="text-xs text-gray-500">
                <p>🔐 RUT como identificador único</p>
                <p>👥 Sistema de roles múltiples</p>
                <p>💳 4 pasarelas de pago integradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default LoginFormWithApoderado;

