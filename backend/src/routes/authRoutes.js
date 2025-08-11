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

// Normaliza RUT: quita puntos y guión, DV en mayúscula
const normalizeRut = (rut) =>
  String(rut || '')
    .replace(/\./g, '')
    .replace(/-/g, '')
    .trim()
    .toUpperCase();

const isBcryptHash = (h) =>
  typeof h === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(h);

const shapeUser = (p, rolesRows) => ({
  rut: p?.rut || null,
  nombres: p?.nombres || null,
  apellidos: p?.apellidos || null,
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

    // Busca sólo en usuarios_auth con comparación normalizada (sin puntos ni guión)
    const [rows] = await sequelize.query(
      `
      SELECT 
        ua.rut_persona,
        ua.password_hash,
        ua.ultimo_acceso,
        ua.bloqueado_hasta,
        ua.debe_cambiar_password
      FROM usuarios_auth ua
      WHERE REPLACE(REPLACE(UPPER(ua.rut_persona), '.', ''), '-', '') = :rutIn
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
      ok = ua.password_hash === password; // sólo para DEV
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

/* ========== REGISTER (rut + password) con persona + rol APODERADO ========== */
// /api/auth/register para tu esquema real
router.post('/register', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { rut, password } = req.body || {};
    if (!rut || !password) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'RUT y contraseña requeridos' });
    }

    const rutN = normalizeRut(rut);
    const rutFmt = (() => {
      const body = rutN.slice(0, -1), dv = rutN.slice(-1);
      return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
    })();

    // 1) Ya existe en usuarios_auth?
    const [[ua]] = await sequelize.query(
      `SELECT 1 FROM usuarios_auth 
       WHERE REPLACE(REPLACE(UPPER(rut_persona),'.',''),'-','') = :rutN LIMIT 1`,
      { replacements: { rutN }, transaction: t }
    );
    if (ua) { await t.rollback(); return res.status(409).json({ success:false, message:'RUT ya registrado' }); }

    // 2) Insert credenciales (usuarios_auth)
    const hash = await bcrypt.hash(password, 12);
    await sequelize.query(
      `INSERT INTO usuarios_auth
        (rut_persona, password_hash, ultimo_acceso, intentos_fallidos, debe_cambiar_password, created_at)
       VALUES
        (:rut, :hash, NULL, 0, 0, NOW())`,
      { replacements: { rut: rutN, hash }, transaction: t }
    );

    // 3) Asegurar persona (personas) con campos NOT NULL
    const [[pers]] = await sequelize.query(
      `SELECT 1 FROM personas 
       WHERE REPLACE(REPLACE(UPPER(rut),'.',''),'-','') = :rutN LIMIT 1`,
      { replacements: { rutN }, transaction: t }
    );
    if (!pers) {
      // placeholders válidos a tu esquema
      const nombres = 'Usuario';
      const apellido_paterno = 'SinApellido';
      const fecha_nacimiento = '2000-01-01';
      const genero = 'O';
      const email = `${rutN}@auto.local`;  // único por RUT

      await sequelize.query(
        `INSERT INTO personas
          (rut, rut_formateado, nombres, apellido_paterno, apellido_materno,
           fecha_nacimiento, genero, email, telefono, direccion,
           codigo_comuna, codigo_provincia, codigo_region,
           activo, es_dato_prueba, created_at)
         VALUES
          (:rut, :rutFmt, :nombres, :apPat, NULL,
           :fecNac, :genero, :email, NULL, NULL,
           NULL, NULL, NULL,
           1, 0, NOW())`,
        { replacements: {
            rut: rutN, rutFmt, nombres,
            apPat: apellido_paterno, fecNac: fecha_nacimiento,
            genero, email
          }, transaction: t }
      );
    }

    // 4) Asignar rol APODERADO (si existe) en persona_roles
    const [[rol]] = await sequelize.query(
      `SELECT id FROM roles WHERE UPPER(nombre_rol) = 'APODERADO' LIMIT 1`,
      { transaction: t }
    );
    if (rol?.id) {
      const [[ya]] = await sequelize.query(
        `SELECT 1 FROM persona_roles
         WHERE rut = :rut AND rol_id = :rol LIMIT 1`,
        { replacements: { rut: rutN, rol: rol.id }, transaction: t }
      );
      if (!ya) {
        await sequelize.query(
          `INSERT INTO persona_roles
            (rut_persona, rut, rol_id, curso_id, fecha_inicio, fecha_fin,
             activo, es_dato_prueba, created_at)
           VALUES
            (:rut, :rut, :rol, NULL, CURDATE(), NULL,
             1, 0, NOW())`,
          { replacements: { rut: rutN, rol: rol.id }, transaction: t }
        );
      }
    }

    await t.commit();
    return res.status(201).json({ success: true, data: { token: signToken(rutN) } });
  } catch (e) {
    await t.rollback();
    console.error('AUTH /register error:', e?.message || e);
    return res.status(500).json({ success: false, message: 'Error en registro' });
  }
});



/* ========== ME ========== */
router.get('/me', authGuard, async (req, res) => {
  try {
    const rut_persona = req.rut_persona;
    const rutClean = normalizeRut(rut_persona);

    // Si no hay fila en personas, devolvemos al menos el RUT original
    const [persRows] = await sequelize.query(
      `
      SELECT p.rut, p.email
      FROM personas p
      WHERE REPLACE(REPLACE(UPPER(p.rut), '.', ''), '-', '') = :rutClean
      LIMIT 1
      `,
      { replacements: { rutClean } }
    );
    const p = persRows?.[0] || { rut: rut_persona, email: null };

    const [rolesRows] = await sequelize.query(
      `
      SELECT 
        pr.rol_id,
        r.nombre_rol,
        pr.curso_id
      FROM persona_roles pr
      LEFT JOIN roles r ON r.id = pr.rol_id
      WHERE REPLACE(REPLACE(UPPER(pr.rut_persona), '.', ''), '-', '') = :rutClean
        AND pr.activo = 1
        AND (pr.fecha_inicio IS NULL OR pr.fecha_inicio <= CURDATE())
        AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= CURDATE())
      `,
      { replacements: { rutClean } }
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
