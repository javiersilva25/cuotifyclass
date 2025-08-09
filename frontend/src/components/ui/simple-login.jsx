import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

// RUT para API: sin puntos, CON guion (XXXXXXXX-DV)
function normalizaRut(r) {
  const s = (r || '').toUpperCase().replace(/\./g, '').replace(/-/g, '');
  if (!s) return '';
  const base = s.slice(0, -1);
  const dv = s.slice(-1);
  return `${base}-${dv}`;
}

export default function SimpleLogin() {
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [rut, setRut] = useState('14.052.405-0');
  const [password, setPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoginError('');

    const rutApi = normalizaRut(rut);
    try {
      const res = await login(rutApi, password);
      if (!res?.success) {
        setLoginError(res?.message || res?.error || 'Error en el login');
        return;
      }
      if (res.mustChange) {
        navigate('/cambiar-password', { replace: true });
        return;
      }
      // Si no hay mustChange, isAuthenticated quedará true y el useEffect redirige
    } catch (err) {
      setLoginError(err?.message || 'Error de conexión con el servidor');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      console.log('USER EN ROUTE:', user);
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#f3f4f6', fontFamily:'system-ui,-apple-system,sans-serif' }}>
      <div style={{ backgroundColor:'white', padding:'2rem', borderRadius:'8px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)', width:'100%', maxWidth:'400px' }}>
        <h1 style={{ textAlign:'center', marginBottom:'2rem', color:'#1f2937', fontSize:'1.5rem', fontWeight:'bold' }}>
          Sistema de Gestión Escolar v8.0
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', marginBottom:'0.5rem', color:'#374151', fontWeight:500 }}>RUT:</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              style={{ width:'100%', padding:'0.75rem', border:'1px solid #d1d5db', borderRadius:4, fontSize:'1rem' }}
              placeholder="14.052.405-0"
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ display:'block', marginBottom:'0.5rem', color:'#374151', fontWeight:500 }}>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width:'100%', padding:'0.75rem', border:'1px solid #d1d5db', borderRadius:4, fontSize:'1rem' }}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </div>

          {(error || loginError) && (
            <div style={{ backgroundColor:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'0.75rem', borderRadius:4, marginBottom:'1rem', fontSize:'0.875rem' }}>
              {error || loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width:'100%', backgroundColor: loading ? '#9ca3af' : '#3b82f6', color:'white', padding:'0.75rem', border:'none', borderRadius:4, fontSize:'1rem', fontWeight:500, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop:'1.5rem', padding:'1rem', backgroundColor:'#f9fafb', borderRadius:4, fontSize:'0.875rem', color:'#6b7280' }}>
          <strong>Credenciales de prueba:</strong><br />
          RUT: 14.052.405-0<br />
          Contraseña: 123456
        </div>
      </div>
    </div>
  );
}
