// src/controllers/apoderadoController.js
const { Op, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const {
  Usuario,
  Alumno,
  Curso,
  CobroAlumno, // ← usamos cobros_alumnos como fuente de verdad
} = require('../models');
const ReporteApoderadoService = require('../services/reporteApoderadoService');

/* --------------------------- helpers --------------------------- */
function getApoderadoId(req) {
  // Ajusta según tu token: id/sub/rut o header de prueba
  return (
    req.user?.id ??
    req.user?.sub ??
    req.user?.rut ??
    req.headers['x-user-id'] ??
    null
  );
}
function ok(res, data) { return res.status(200).json({ success: true, data }); }
function err(res, msg = 'Error interno') { return res.status(500).json({ success: false, message: msg }); }

/* ======================= Controller ======================= */
class ApoderadoController {
  /* -------- listado simple (selects), sin cambios -------- */
  static async listActivos(_req, res) {
    try {
      const [rows] = await sequelize.query(`
        SELECT 
          p.rut  AS id,
          p.rut,
          CONCAT_WS(' ', p.nombres, p.apellido_paterno, p.apellido_materno) AS nombre_completo
        FROM persona_roles pr
        JOIN personas p ON p.rut = pr.rut_persona
        JOIN roles r    ON r.id = pr.rol_id
        WHERE pr.activo = 1 AND UPPER(r.nombre_rol) = 'APODERADO'
        ORDER BY p.nombres, p.apellido_paterno, p.apellido_materno
      `);
      return ok(res, rows);
    } catch {
      return err(res, 'Error obteniendo apoderados');
    }
  }

  /* ---------------------- Portal: ME ---------------------- */

  // Hijos del apoderado + deuda_total por hijo
  static async getMisHijos(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) return res.status(401).json({ success: false, message: 'No autenticado' });

      const hijos = await Alumno.findAll({
        include: [
          { model: Usuario, as: 'apoderado', where: { id: apoderadoId } },
          { model: Curso, as: 'curso', required: false },
        ],
        order: [['id', 'ASC']],
      });

      const ids = hijos.map(h => h.id);
      if (!ids.length) return ok(res, []);

      // deudas por alumno (pendiente/parcial): SUM(monto - IFNULL(monto_pagado,0))
      const deudas = await CobroAlumno.findAll({
        where: {
          alumno_id: { [Op.in]: ids },
          estado: { [Op.in]: ['pendiente', 'parcial'] },
        },
        attributes: [
          'alumno_id',
          [literal('SUM(monto - IFNULL(monto_pagado,0))'), 'deuda_total'],
        ],
        group: ['alumno_id'],
      });
      const mapDeuda = new Map(deudas.map(d => [Number(d.alumno_id), Number(d.get('deuda_total') || 0)]));

      const data = hijos.map(h => ({
        id: h.id,
        rut: h.rut ?? null,
        nombre: h.nombre ?? h.nombre_completo ?? null,
        curso: h.curso ? (h.curso.nombre_curso || h.curso.nombre) : null,
        curso_id: h.curso_id ?? h.curso?.id ?? null,
        deuda_total: mapDeuda.get(Number(h.id)) || 0,
      }));
      return ok(res, data);
    } catch (e) {
      return err(res, e?.message || 'Error al obtener hijos');
    }
  }

  // Métricas rápidas (mes actual) usando servicio simplificado
  static async getMetricasRapidas(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) return res.status(401).json({ success: false, message: 'No autenticado' });
      const data = await ReporteApoderadoService.getMetricasRapidas(apoderadoId);
      return ok(res, data);
    } catch (e) {
      return err(res, e?.message || 'Error al obtener métricas');
    }
  }

  // Resumen general (pagado, pendiente, distribución)
  static async getResumenGeneral(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) return res.status(401).json({ success: false, message: 'No autenticado' });
      const data = await ReporteApoderadoService.getResumenGeneral(apoderadoId);
      return ok(res, data);
    } catch (e) {
      return err(res, e?.message || 'Error al obtener resumen');
    }
  }

  // Deudas pendientes consolidado (lista de cobros de todos los hijos)
  static async getDeudasPendientes(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) return res.status(401).json({ success: false, message: 'No autenticado' });

      // hijos del apoderado
      const hijos = await Alumno.findAll({
        include: [{ model: Usuario, as: 'apoderado', where: { id: apoderadoId } }],
      });
      const ids = hijos.map(h => h.id);
      if (!ids.length) return ok(res, []);

      const items = await CobroAlumno.findAll({
        where: {
          alumno_id: { [Op.in]: ids },
          estado: { [Op.in]: ['pendiente', 'parcial'] },
        },
        attributes: [
          'id', 'alumno_id', 'curso_id', 'concepto', 'numero_comprobante',
          'monto', 'monto_pagado', 'estado', 'fecha_emision', 'fecha_vencimiento',
        ],
        order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
      });

      // respuesta “lista” con restante calculado
      const data = items.map(c => ({
        id: c.id,
        alumno_id: c.alumno_id,
        curso_id: c.curso_id,
        concepto: c.concepto,
        numero_comprobante: c.numero_comprobante,
        monto: Number(c.monto || 0),
        pagado: Number(c.monto_pagado || 0),
        restante: Math.max(Number(c.monto || 0) - Number(c.monto_pagado || 0), 0),
        estado: c.estado,
        fecha_emision: c.fecha_emision,
        fecha_vencimiento: c.fecha_vencimiento,
      }));
      return ok(res, data);
    } catch (e) {
      return err(res, e?.message || 'Error al obtener deudas');
    }
  }

  /* ---------------------- Portal: por alumno ---------------------- */

  // Resumen por alumno (del mismo apoderado)
  static async getResumenPorAlumno(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) return res.status(401).json({ success: false, message: 'No autenticado' });
      const alumnoId = Number(req.params.alumnoId);
      const data = await ReporteApoderadoService.getReportePorAlumno(apoderadoId, alumnoId);
      return ok(res, data);
    } catch (e) {
      return err(res, e?.message || 'Error al obtener resumen del alumno');
    }
  }

  // Solo deudas del alumno (pendiente/parcial)
  static async getDeudasPorAlumno(req, res) {
    try {
      const apoderadoId = getApoderadoId(req);
      if (!apoderadoId) return res.status(401).json({ success: false, message: 'No autenticado' });

      const alumnoId = Number(req.params.alumnoId);

      // verificación de pertenencia mínima
      const belongs = await Alumno.findOne({
        where: { id: alumnoId },
        include: [{ model: Usuario, as: 'apoderado', where: { id: apoderadoId } }],
      });
      if (!belongs) return res.status(403).json({ success: false, message: 'Alumno no pertenece al apoderado' });

      const items = await CobroAlumno.findAll({
        where: { alumno_id: alumnoId, estado: { [Op.in]: ['pendiente', 'parcial'] } },
        attributes: [
          'id', 'concepto', 'numero_comprobante', 'monto', 'monto_pagado',
          'estado', 'fecha_emision', 'fecha_vencimiento',
        ],
        order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
      });

      const data = items.map(c => ({
        id: c.id,
        concepto: c.concepto,
        numero_comprobante: c.numero_comprobante,
        monto: Number(c.monto || 0),
        pagado: Number(c.monto_pagado || 0),
        restante: Math.max(Number(c.monto || 0) - Number(c.monto_pagado || 0), 0),
        estado: c.estado,
        fecha_emision: c.fecha_emision,
        fecha_vencimiento: c.fecha_vencimiento,
      }));
      return ok(res, data);
    } catch (e) {
      return err(res, e?.message || 'Error al obtener deudas del alumno');
    }
  }
}

module.exports = ApoderadoController;
