// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');

const router = express.Router();

const JWT_SECRET  = process.env.JWT_SECRET  || 'cambia_esto_en_prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

const signToken = (rut_persona) =>
  jwt.sign({ sub: rut_persona }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const parseBearer = (req) => {
  const h = req.headers.authorization || '';
  const [t, v] = h.split(' ');
  return t?.toLowerCase() === 'bearer' ? v : null;
};

const authGuard = (req, res, next) => {
  try {
    const token = parseBearer(req);
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    const dec = jwt.verify(token, JWT_SECRET);
    req.rut_persona = dec.sub;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

const normalizeRut = (rut) => String(rut || '').replace(/\./g, '').trim();
const isBcryptHash = (h) => typeof h === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(h);

const shapeUser = (p, rolesRows) => ({
  rut: p?.rut || null,
  nombres: p?.nombres || null,       // quedará null si la columna no existe
  apellidos: p?.apellidos || null,   // idem
  email: p?.email || null,
  persona_roles: (rolesRows || []).map(r => ({
    rol_id: r.rol_id,
    nombre_rol: r.nombre_rol,
    curso_id: r.curso_id || null,
  })),
});

/* ========== LOGIN ========== */
router.post('/login', async (req, res) => {
  try {
    const { rut, password } = req.body || {};
    if (!rut || !password) {
      return res.status(400).json({ success: false, message: 'RUT y contraseña requeridos' });
    }

    const rutIn = normalizeRut(rut);

    // Solo usuarios_auth (sin JOIN susceptibles a columnas)
    const [rows] = await sequelize.query(
      `
      SELECT 
        ua.rut_persona,
        ua.password_hash,
        ua.ultimo_acceso,
        ua.bloqueado_hasta,
        ua.debe_cambiar_password
      FROM usuarios_auth ua
      WHERE REPLACE(ua.rut_persona, '.', '') = REPLACE(:rutIn, '.', '')
      LIMIT 1
      `,
      { replacements: { rutIn } }
    );

    const ua = rows?.[0];
    if (!ua) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    if (ua.bloqueado_hasta && new Date(ua.bloqueado_hasta) > new Date()) {
      return res.status(423).json({ success: false, message: 'Usuario bloqueado temporalmente' });
    }

    let ok = false;
    if (isBcryptHash(ua.password_hash)) {
      try { ok = await bcrypt.compare(password, ua.password_hash); } catch { ok = false; }
    } else {
      ok = ua.password_hash === password; // fallback DEV
    }
    if (!ok) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const token = signToken(ua.rut_persona);

    await sequelize.query(
      `UPDATE usuarios_auth SET ultimo_acceso = NOW() WHERE rut_persona = :rut_persona`,
      { replacements: { rut_persona: ua.rut_persona } }
    );

    return res.json({ success: true, data: { token } });
  } catch (e) {
    console.error('AUTH /login error:', e?.message || e);
    return res.status(500).json({ success: false, message: 'Error en login' });
  }
});

/* ========== ME ========== */
router.get('/me', authGuard, async (req, res) => {
  try {
    const rut_persona = req.rut_persona;

    // Selección mínima y segura de PERSONAS (evita columnas inexistentes)
    const [persRows] = await sequelize.query(
      `
      SELECT p.rut, p.email
      FROM personas p
      WHERE p.rut = :rut_persona
      LIMIT 1
      `,
      { replacements: { rut_persona } }
    );
    // Si no hay fila en personas, igual construimos con el RUT
    const p = persRows?.[0] || { rut: rut_persona, email: null };

    // Roles activos y vigentes desde PERSONA_ROLES
    const [rolesRows] = await sequelize.query(
      `
      SELECT 
        pr.rol_id,
        r.nombre_rol,
        pr.curso_id
      FROM persona_roles pr
      LEFT JOIN roles r ON r.id = pr.rol_id
      WHERE pr.rut_persona = :rut_persona
        AND pr.activo = 1
        AND (pr.fecha_inicio IS NULL OR pr.fecha_inicio <= CURDATE())
        AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= CURDATE())
      `,
      { replacements: { rut_persona } }
    );

    const user = shapeUser(p, rolesRows || []);
    return res.json({ success: true, data: { user } });
  } catch (e) {
    console.error('AUTH /me error:', e?.message || e);
    return res.status(500).json({ success: false, message: 'Error obteniendo perfil' });
  }
});

/* ========== REFRESH ========== */
router.post('/refresh', authGuard, async (req, res) => {
  try {
    const newToken = signToken(req.rut_persona);
    return res.json({ success: true, data: { token: newToken } });
  } catch {
    return res.status(401).json({ success: false, message: 'No se pudo refrescar' });
  }
});

/* ========== LOGOUT ========== */
router.post('/logout', authGuard, async (_req, res) => {
  return res.json({ success: true, message: 'Logout ok' });
});

module.exports = router;
