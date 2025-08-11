/**
 * Login + Registro (RUT + contraseña) - JSX con API config
 */
import React, { useState } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS, buildUrl } from '@/config/api';

export default function SimpleLogin() {
  const { login, loading, error, getUserType, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [localError, setLocalError] = useState('');

  const normalizeRut = (v) =>
    String(v || '').replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();

  const handleAuthSuccess = async () => {
    await getCurrentUser();
    const from = location.state && location.state.from && location.state.from.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    const type = getUserType();
    switch (type) {
      case 'apoderado':
        navigate('/apoderado/dashboard', { replace: true }); break;
      case 'tesorero':
        navigate('/tesorero/dashboard', { replace: true }); break;
      case 'profesor':
      case 'directivo':
      case 'alumno':
        navigate('/dashboard', { replace: true }); break;
      case 'admin':
      default:
        navigate('/dashboard', { replace: true }); break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (isRegister) {
        const res = await fetch(buildUrl(API_ENDPOINTS.AUTH.REGISTER), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rut: normalizeRut(rut), password })
        });
        const data = await res.json();
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || 'No se pudo registrar');
        }
      }

      const result = await login(rut, password);
      if (result && result.success) {
        await handleAuthSuccess();
      } else {
        setLocalError(result?.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setLocalError(err?.message || 'Error de conexión con el servidor');
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
        maxWidth: '420px'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '1.25rem',
          color: '#1f2937',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'} · SGE v8.2
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              RUT:
            </label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '1rem' }}
              placeholder="14.052.405-0"
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: 500 }}>
              Contraseña:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: 4, fontSize: '1rem' }}
              placeholder="Contraseña"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {(error || localError) && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: 4,
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {error || localError}
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
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (isRegister ? 'Creando...' : 'Ingresando...') : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setLocalError(''); }}
            style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
          >
            {isRegister ? 'Inicia sesión' : 'Crear cuenta'}
          </button>
        </div>

        {!isRegister && (
          <div style={{
            marginTop: '1.25rem',
            padding: '0.9rem',
            backgroundColor: '#f9fafb',
            borderRadius: 4,
            fontSize: '0.85rem',
            color: '#6b7280'
          }}>
            <strong>Credenciales de prueba:</strong><br />
            RUT: 14.052.405-0<br />
            Contraseña: 123456
          </div>
        )}
      </div>
    </div>
  );
}
