/**
 * Componente de login simple para testing v8.2
 */
import React, { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export function SimpleLogin() {
  const { login, loading, error, getUserType, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const result = await login(rut, password);
      if (result && result.success) {
        // Asegura usuario actualizado (roles normalizados) por si el login no lo trae completo
        await getCurrentUser();

        // Si venía de una ruta protegida, respétala
        const from = location.state?.from?.pathname;
        if (from && from !== '/login') {
          navigate(from, { replace: true });
          return;
        }

        // Redirección por rol
        const type = getUserType();
        switch (type) {
          case 'apoderado':
            navigate('/apoderado/dashboard', { replace: true });
            break;
          case 'tesorero':
            navigate('/tesorero/dashboard', { replace: true });
            break;
          case 'profesor':
          case 'directivo':
          case 'alumno':
            navigate('/dashboard', { replace: true });
            break;
          case 'admin':
          default:
            navigate('/dashboard', { replace: true });
            break;
        }
      } else {
        setLoginError(result?.error || 'Error en el login');
      }
    } catch (err) {
      setLoginError(err.message || 'Error de conexión con el servidor');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1f2937',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          Sistema de Gestión Escolar v8.2
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              RUT:
            </label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="14.052.405-0"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="Contraseña"
            />
          </div>

          {(error || loginError) && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error || loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <strong>Credenciales de prueba:</strong><br />
          RUT: 14.052.405-0<br />
          Contraseña: 123456
        </div>
      </div>
    </div>
  );
}

export default SimpleLogin;
