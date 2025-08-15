// controllers/cobroAlumnoController.js
const { Op } = require('sequelize');
const { CobroAlumno, Alumno, Curso, Cobro } = require('../models'); // ← uso Cobro para vincular cobro_id
const { sequelize } = require('../config/database');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

/* ----------------------------- Helpers ----------------------------- */
function normQuery(req) {
  const q = { ...req.query };
  if (typeof q.params === 'string') { try { Object.assign(q, JSON.parse(q.params)); } catch {} }

  if (q.cursoId && !q.curso_id) q.curso_id = q.cursoId;
  if (q.alumnoId && !q.alumno_id) q.alumno_id = q.alumnoId;

  q.page  = parseInt(q.page  ?? 1, 10);
  q.limit = parseInt(q.limit ?? 20, 10);
  q.offset = (q.page - 1) * q.limit;

  const where = {};
  if (q.curso_id) where.curso_id = q.curso_id;
  if (q.alumno_id) where.alumno_id = q.alumno_id;
  if (q.categoria_id) where.categoria_id = q.categoria_id;
  if (q.estado) where.estado = q.estado;
  if (q.search) {
    where[Op.or] = [
      { concepto: { [Op.like]: `%${q.search}%` } },
      { descripcion: { [Op.like]: `%${q.search}%` } },
      { numero_comprobante: { [Op.like]: `%${q.search}%` } }
    ];
  }
  return { q, where };
}

function genComprobante(pref = 'CBI') {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${pref}-${Date.now()}-${num}`;
}

function getUserId(req) {
  const hdr = req.headers['x-user-id'];
  return req.user?.id ?? req.auth?.userId ?? (hdr != null ? Number(hdr) : null);
}

async function resolveCobroId({ cursoId, cobro_id, numero_comprobante }) {
  if (cobro_id) return cobro_id;
  if (!numero_comprobante) return null;
  const cg = await Cobro.findOne({ where: { curso_id: cursoId, numero_comprobante } });
  return cg?.id ?? null;
}

/* --------------------------- Controller ---------------------------- */
class CobroAlumnoController {
  // Crear cobro individual (si viene cobro_id o número, se vincula al cobro general)
  static async create(req, res) {
    try {
      const {
        alumno_id,
        curso_id: cursoIdBody,
        concepto,
        descripcion,
        categoria_id,
        monto,
        fecha_emision,
        fecha_vencimiento,
        numero_comprobante,
        observaciones,
        metodo_pago,
        estado,
        transaccion_id,
        cobro_id, // opcional para vincular al general
      } = req.body;

      if (!alumno_id || !concepto || monto == null || !fecha_vencimiento) {
        return ResponseHelper.badRequest(res, 'alumno_id, concepto, monto y fecha_vencimiento son obligatorios');
      }

      const userId = getUserId(req);
      if (!userId) return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');

      const alumno = await Alumno.findByPk(alumno_id);
      if (!alumno) return ResponseHelper.notFound(res, 'Alumno no encontrado');

      const cursoId = cursoIdBody ?? alumno.curso_id;
      if (!cursoId) return ResponseHelper.badRequest(res, 'curso_id es obligatorio o debe ser derivable del alumno');

      const curso = await Curso.findByPk(cursoId);
      if (!curso) return ResponseHelper.notFound(res, 'Curso no encontrado');

      const montoNum = Number(monto);
      if (!Number.isFinite(montoNum) || montoNum <= 0) return ResponseHelper.badRequest(res, 'monto inválido');

      // Vinculación con cobro general (si procede)
      const numero = numero_comprobante || genComprobante();
      const cobroGeneralId = await resolveCobroId({ cursoId, cobro_id, numero_comprobante: numero_comprobante });

      const payload = {
        alumno_id,
        curso_id: cursoId,
        cobro_id: cobroGeneralId ?? null,
        concepto,
        descripcion: descripcion ?? null,
        categoria_id: categoria_id ?? null,
        monto: montoNum,
        monto_pagado: 0,
        fecha_emision: fecha_emision ?? new Date(),
        fecha_vencimiento,
        numero_comprobante: numero,
        observaciones: observaciones ?? null,
        metodo_pago: metodo_pago ?? null,
        estado: estado ?? 'pendiente',
        transaccion_id: transaccion_id ?? null,
        // auditoría
        creado_por: userId,
        actualizado_por: userId
      };

      const created = await CobroAlumno.create(payload);
      return ResponseHelper.created(res, created);
    } catch (err) {
      Logger.error('create cobro alumno', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al crear cobro de alumno', err);
    }
  }

  static async getAll(req, res) {
    try {
      const { q, where } = normQuery(req);
      const result = await CobroAlumno.findAndCountAll({
        where,
        order: [['id', 'DESC']],
        limit: q.limit,
        offset: q.offset
      });
      return ResponseHelper.ok(res, {
        items: result.rows,
        total: result.count,
        page: q.page,
        pages: Math.ceil(result.count / q.limit)
      });
    } catch (err) {
      Logger.error('getAll cobros alumnos', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al listar cobros de alumnos', err);
    }
  }

  static async getById(req, res) {
    try {
      const item = await CobroAlumno.findByPk(req.params.id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro de alumno no encontrado');
      return ResponseHelper.ok(res, item);
    } catch (err) {
      Logger.error('getById cobro alumno', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al obtener cobro de alumno', err);
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const item = await CobroAlumno.findByPk(id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro de alumno no encontrado');

      const userId = getUserId(req);
      if (!userId) return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');

      // Normaliza/valida monto si viene
      let montoUpd = item.monto;
      if (req.body.monto != null) {
        const m = Number(req.body.monto);
        if (!Number.isFinite(m) || m <= 0) return ResponseHelper.badRequest(res, 'monto inválido');
        montoUpd = m;
      }

      // Recalcular cobro_id si cambian curso/numero o si llega explícito
      const cursoIdUpd = req.body.curso_id ?? item.curso_id;
      const numeroUpd = req.body.numero_comprobante ?? item.numero_comprobante;
      const cobroIdUpd = ('cobro_id' in req.body || 'numero_comprobante' in req.body || 'curso_id' in req.body)
        ? await resolveCobroId({ cursoId: cursoIdUpd, cobro_id: req.body.cobro_id, numero_comprobante: numeroUpd })
        : item.cobro_id;

      const data = {
        alumno_id: req.body.alumno_id ?? item.alumno_id,
        curso_id: cursoIdUpd,
        cobro_id: cobroIdUpd ?? null,
        concepto: req.body.concepto ?? item.concepto,
        descripcion: req.body.descripcion ?? item.descripcion,
        categoria_id: req.body.categoria_id ?? item.categoria_id,
        monto: montoUpd,
        fecha_emision: req.body.fecha_emision ?? item.fecha_emision,
        fecha_vencimiento: req.body.fecha_vencimiento ?? item.fecha_vencimiento,
        numero_comprobante: numeroUpd,
        observaciones: req.body.observaciones ?? item.observaciones,
        metodo_pago: req.body.metodo_pago ?? item.metodo_pago,
        estado: req.body.estado ?? item.estado,
        transaccion_id: req.body.transaccion_id ?? item.transaccion_id,
        actualizado_por: userId
      };

      await item.update(data);
      return ResponseHelper.ok(res, item);
    } catch (err) {
      Logger.error('update cobro alumno', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al actualizar cobro de alumno', err);
    }
  }

  // Registrar pago (soporta pago incremental con `pago` o set absoluto con `monto_pagado`)
  static async pagar(req, res) {
    try {
      const id = req.params.id;
      const item = await CobroAlumno.findByPk(id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro de alumno no encontrado');

      const userId = getUserId(req);
      if (!userId) return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');

      const { metodo_pago, transaccion_id } = req.body;

      const pagarDelta = req.body.pago != null ? Number(req.body.pago) : null;
      const setAbs     = req.body.monto_pagado != null ? Number(req.body.monto_pagado) : null;

      let nuevoPagado = item.monto_pagado ?? 0;
      if (pagarDelta != null) nuevoPagado += pagarDelta;
      else if (setAbs != null) nuevoPagado = setAbs;
      else nuevoPagado = item.monto;

      // límites y estado
      if (!Number.isFinite(nuevoPagado) || nuevoPagado < 0) nuevoPagado = 0;
      if (nuevoPagado > item.monto) nuevoPagado = item.monto;

      const nuevoEstado = nuevoPagado >= item.monto ? 'pagado' : 'parcial';
      const fecha_pago = nuevoEstado === 'pagado' ? new Date() : item.fecha_pago ?? null;

      await item.update({
        estado: nuevoEstado,
        monto_pagado: nuevoPagado,
        fecha_pago,
        metodo_pago: metodo_pago ?? item.metodo_pago,
        transaccion_id: transaccion_id ?? item.transaccion_id,
        actualizado_por: userId
      });

      return ResponseHelper.ok(res, item);
    } catch (err) {
      Logger.error('pagar cobro alumno', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al registrar pago', err);
    }
  }

  // Soft delete
  static async delete(req, res) {
    try {
      const id = req.params.id;
      const item = await CobroAlumno.findByPk(id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro de alumno no encontrado');

      const userId = getUserId(req);
      if (!userId) return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');

      await item.update({
        eliminado_por: userId,
        fecha_eliminacion: new Date()
      });
      return ResponseHelper.ok(res, { success: true });
    } catch (err) {
      Logger.error('delete cobro alumno', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al eliminar cobro de alumno', err);
    }
  }

  // Backfill opcional para datos existentes (emparienta por curso_id + numero_comprobante)
  static async backfillCobroId(req, res) {
    try {
      const cursoId = req.query.curso_id ? Number(req.query.curso_id) : null;
      const [result] = await sequelize.query(
        `
        UPDATE cobros_alumnos ca
        JOIN cobros c
          ON c.curso_id = ca.curso_id
         AND c.numero_comprobante = ca.numero_comprobante
        SET ca.cobro_id = c.id
        WHERE ca.cobro_id IS NULL
        ${cursoId ? 'AND ca.curso_id = :cursoId' : ''}
        `,
        { replacements: { cursoId } }
      );
      return ResponseHelper.ok(res, { updated: result?.affectedRows ?? 0 });
    } catch (err) {
      Logger.error('backfillCobroId', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error en backfill de cobro_id', err);
    }
  }
}

module.exports = CobroAlumnoController;
