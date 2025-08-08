const express = require('express');
const router = express.Router();

// Usuarios de ejemplo
const demoUsers = [
  { email: 'admin@test.com', password: 'admin123', role: 'ADMIN' },
  { email: 'profesor@test.com', password: 'profesor123', role: 'PROFESOR' },
  { email: 'tesorero@test.com', password: 'tesorero123', role: 'TESORERO' }
];

// Ruta: POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = demoUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }

  return res.json({
    success: true,
    data: {
      user: {
        id: 1,
        name: user.email.split('@')[0],
        email: user.email,
        role: user.role
      },
      token: 'token_simulado_' + user.role.toLowerCase()
    }
  });
});

// Ruta: GET /api/auth/me
router.get('/me', (req, res) => {
  // Simula recuperación de datos de sesión (en backend real, se usa el token)
  const fakeToken = req.headers.authorization?.split(' ')[1];

  if (!fakeToken || !fakeToken.startsWith('token_simulado_')) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o no proporcionado'
    });
  }

  const role = fakeToken.replace('token_simulado_', '').toUpperCase();
  const user = demoUsers.find(u => u.role === role);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Token no corresponde a un usuario válido'
    });
  }

  return res.json({
    success: true,
    data: {
      id: 1,
      name: user.email.split('@')[0],
      email: user.email,
      role: user.role
    }
  });
});

// Ruta: POST /api/auth/logout
router.post('/logout', (req, res) => {
  // En este caso solo simula, ya que no hay sesión real en backend
  return res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
});

module.exports = router;
