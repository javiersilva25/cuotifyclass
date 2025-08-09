// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// --- Helpers ---
const normalizaRutPlano = (r = '') =>
  r.replace(/\./g, '').replace(/-/g, '').toUpperCase();

const ROLE_FALLBACK = ['administrador']; // si no encuentra roles, puedes cambiarlo

// Pool MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // asegúrate que coincida con tu .env
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Lee roles desde BD y los normaliza a strings en minúscula
async function getRolesForRut(rutPlano) {
  const [rows] = await pool.query(
    `SELECT LOWER(r.nombre_rol) AS rol
       FROM persona_roles pr
       JOIN roles r ON r.id = pr.rol_id
      WHERE pr.rut = ?
        AND pr.activo = 1
        AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= CURDATE())`,
    [rutPlano]
  );
  const roles = rows.map(r => r.rol).filter(Boolean);
  return roles.length ? roles : ROLE_FALLBACK;
}

// Para tokens simulados: token_simulado|<RUT>|<rol1,rol2,...>
function buildSimToken(rutPlano, roles) {
  return `token_simulado|${rutPlano}|${roles.join(',')}`;
}

function parseSimToken(token) {
  // formatos soportados:
  // - token_simulado|<RUT>|rol1,rol2
  // - token_simulado_admin|<RUT> (legacy)
  if (!token.startsWith('token_simulado')) return null;
  const parts = token.split('|');
  if (parts.length === 3) {
    const [, rut, rolesCsv] = parts;
    const roles = (rolesCsv || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return { rut, roles };
  }
  // legacy: token_simulado_admin|RUT
  if (parts.length === 2) {
    const legacyStr = parts[0]; // token_simulado_admin
    const rut = parts[1];
    const roles = legacyStr.includes('admin') ? ['administrador'] : ['user'];
    return { rut, roles };
  }
  return null;
}

// --------- LOGIN ---------
router.post('/login', async (req, res) => {
  try {
    const rutPlano = normalizaRutPlano(req.body.rut || '');
    const { password } = req.body || {};
    if (!rutPlano || !password) {
      return res.status(400).json({ success:false, message:'Faltan credenciales' });
    }

    // Trae auth + persona
    const [rows] = await pool.query(
      `SELECT 
         ua.rut_persona AS rut,
         ua.password_hash,
         ua.ultimo_acceso,
         ua.intentos_fallidos,
         ua.bloqueado_hasta,
         ua.debe_cambiar_password,
         p.rut_formateado,
         p.email,
         CONCAT(p.nombres,' ',p.apellido_paterno) AS name
       FROM usuarios_auth ua
       LEFT JOIN personas p ON p.rut = ua.rut_persona
       WHERE ua.rut_persona = ?
       LIMIT 1`,
      [rutPlano]
    );

    if (!rows.length) {
      return res.status(401).json({ success:false, message:'Credenciales inválidas' });
    }

    const userAuth = rows[0];

    // ¿Bloqueado?
    if (userAuth.bloqueado_hasta) {
      const [chk] = await pool.query(
        `SELECT NOW() < ? AS locked, TIMESTAMPDIFF(MINUTE, NOW(), ?) AS min_rest;`,
        [userAuth.bloqueado_hasta, userAuth.bloqueado_hasta]
      );
      if (chk?.[0]?.locked) {
        return res.status(423).json({
          success:false,
          message:`Cuenta bloqueada. Intenta en ~${Math.max(1, chk[0].min_rest)} min.`
        });
      }
    }

    // Valida contraseña
    const ok = await bcrypt.compare(password, userAuth.password_hash || '');
    const MAX_INTENTOS = Number(process.env.AUTH_MAX_INTENTOS || 5);
    const BLOQUEO_MIN = Number(process.env.AUTH_BLOQUEO_MIN || 15);

    if (!ok) {
      const intentos = (userAuth.intentos_fallidos || 0) + 1;

      if (intentos >= MAX_INTENTOS) {
        await pool.query(
          `UPDATE usuarios_auth 
             SET intentos_fallidos = 0,
                 bloqueado_hasta = DATE_ADD(NOW(), INTERVAL ? MINUTE)
           WHERE rut_persona = ?`,
          [BLOQUEO_MIN, rutPlano]
        );
        return res.status(423).json({
          success:false,
          message:`Cuenta bloqueada por ${BLOQUEO_MIN} min por intentos fallidos.`
        });
      } else {
        await pool.query(
          `UPDATE usuarios_auth SET intentos_fallidos = ? WHERE rut_persona = ?`,
          [intentos, rutPlano]
        );
        return res.status(401).json({
          success:false,
          message:`Credenciales inválidas. Intentos restantes: ${MAX_INTENTOS - intentos}`
        });
      }
    }

    // Éxito: limpia contadores, desbloquea, marca último acceso
    await pool.query(
      `UPDATE usuarios_auth 
          SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = NOW()
        WHERE rut_persona = ?`,
      [rutPlano]
    );

    // ---- ROLES desde BD ----
    const roles = await getRolesForRut(rutPlano); // ej: ["administrador"]

    // ---- Token simulado con roles ----
    const token = buildSimToken(rutPlano, roles);

    return res.json({
      success: true,
      data: {
        user: {
          id: 1, // usa tu ID real si lo tienes
          rut: userAuth.rut,
          rut_formateado: userAuth.rut_formateado,
          name: userAuth.name,
          email: userAuth.email,
          roles // <-- IMPORTANTE para el frontend
        },
        token,
        debeCambiarPassword: !!userAuth.debe_cambiar_password
      }
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, message:'Error de servidor' });
  }
});

// --------- /me ---------
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const parsed = parseSimToken(token);
    if (!parsed) return res.status(401).json({ success:false, message:'Token inválido' });

    const rutPlano = parsed.rut;

    const [rows] = await pool.query(
      `SELECT p.rut, p.rut_formateado, p.email, CONCAT(p.nombres,' ',p.apellido_paterno) AS name
         FROM personas p
        WHERE p.rut = ? LIMIT 1`,
      [rutPlano]
    );
    if (!rows.length) {
      return res.status(401).json({ success:false, message:'Token no corresponde a usuario' });
    }

    // (re)leer roles desde BD para consistencia
    const roles = await getRolesForRut(rutPlano);

    return res.json({
      success:true,
      data:{
        user: {
          id: 1, // ajusta según tu esquema
          rut: rows[0].rut,
          rut_formateado: rows[0].rut_formateado,
          name: rows[0].name,
          email: rows[0].email,
          roles // <-- IMPORTANTE
        }
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, message:'Error de servidor' });
  }
});

// --------- Cambio de contraseña obligatoria ---------
router.post('/cambiar-password', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const parsed = parseSimToken(token);
    if (!parsed) return res.status(401).json({ success:false, message:'Token inválido' });

    const rutPlano = parsed.rut;
    const { passwordActual, passwordNueva } = req.body || {};
    if (!passwordActual || !passwordNueva)
      return res.status(400).json({ success:false, message:'Datos incompletos' });

    const [rows] = await pool.query(
      `SELECT password_hash FROM usuarios_auth WHERE rut_persona = ? LIMIT 1`,
      [rutPlano]
    );
    if (!rows.length) return res.status(404).json({ success:false, message:'Usuario no encontrado' });

    const ok = await bcrypt.compare(passwordActual, rows[0].password_hash || '');
    if (!ok) return res.status(401).json({ success:false, message:'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(passwordNueva, 10);
    await pool.query(
      `UPDATE usuarios_auth 
          SET password_hash = ?, debe_cambiar_password = 0 
        WHERE rut_persona = ?`,
      [hash, rutPlano]
    );

    return res.json({ success:true, message:'Contraseña actualizada' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success:false, message:'Error de servidor' });
  }
});

module.exports = router;
