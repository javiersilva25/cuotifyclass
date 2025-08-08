import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail, Lock, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useLogin, useAuthValidation } from '../hooks/useAuth';
import { cn } from '../../../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export function LoginForm() {
  const { handleLogin, isLoading, error } = useLogin();
  const { validateLoginForm } = useAuthValidation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/alumnos';

  // Credenciales de demostración
  const demoCredentials = [
    { 
      role: 'Administrador', 
      email: 'admin@test.com', 
      password: 'admin123',
      description: 'Acceso completo al sistema'
    },
    { 
      role: 'Profesor', 
      email: 'profesor@test.com', 
      password: 'profesor123',
      description: 'Gestión académica y reportes'
    },
    { 
      role: 'Tesorero', 
      email: 'tesorero@test.com', 
      password: 'tesorero123',
      description: 'Gestión financiera y cobros'
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error de validación cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validar campo individual
    const validation = validateLoginForm(formData);
    if (validation.errors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: validation.errors[name],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({ email: true, password: true });
    
    // Validar formulario
    const validation = validateLoginForm(formData);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // Limpiar errores de validación
    setValidationErrors({});
    
    // Intentar login
    await handleLogin(formData);
    const result = await handleLogin(formData);
      if (result.success) {
        navigate(from, { replace: true });
      }
  };

  const fillDemoCredentials = (credentials) => {
    setFormData({
      email: credentials.email,
      password: credentials.password,
    });
    setValidationErrors({});
    setTouched({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <GraduationCap className="w-8 h-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sistema de Gestión Escolar
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="tu@email.com"
                    className={cn(
                      "pl-10 h-11 transition-all duration-200",
                      validationErrors.email 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    )}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {touched.email && validationErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {validationErrors.email}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 pr-10 h-11 transition-all duration-200",
                      validationErrors.password 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    )}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && validationErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600"
                  >
                    {validationErrors.password}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            {/* Credenciales de demostración */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Credenciales de demostración:
              </p>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <motion.button
                    key={cred.role}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => fillDemoCredentials(cred)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-sm group"
                    disabled={isLoading}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700 group-hover:text-blue-700">
                          {cred.role}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {cred.description}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-blue-500">
                        {cred.email}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          © 2024 Sistema de Gestión Escolar. Todos los derechos reservados.
        </motion.p>
      </motion.div>
    </div>
  );
}

export default LoginForm;

