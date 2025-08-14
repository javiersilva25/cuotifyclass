// controllers/cobroAlumnoController.js
const { Op } = require('sequelize');
const { CobroAlumno, Alumno, Curso } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

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
  return (
    req.user?.id ??
    req.auth?.userId ??
    (hdr != null ? Number(hdr) : null)
  );
}

class CobroAlumnoController {
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
        transaccion_id
      } = req.body;

      if (!alumno_id || !concepto || monto == null || !fecha_vencimiento) {
        return ResponseHelper.badRequest(res, 'alumno_id, concepto, monto y fecha_vencimiento son obligatorios');
      }

      const userId = getUserId(req);
      if (!userId) {
        return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');
      }

      // Valida alumno y obtiene curso si no viene
      const alumno = await Alumno.findByPk(alumno_id);
      if (!alumno) return ResponseHelper.notFound(res, 'Alumno no encontrado');

      const cursoId = cursoIdBody ?? alumno.curso_id;
      if (!cursoId) {
        return ResponseHelper.badRequest(res, 'curso_id es obligatorio o debe ser derivable del alumno');
      }
      // (opcional) validar existencia del curso si lo deseas estrictamente
      const curso = await Curso.findByPk(cursoId);
      if (!curso) return ResponseHelper.notFound(res, 'Curso no encontrado');

      const montoNum = Number(monto);
      if (!Number.isFinite(montoNum) || montoNum <= 0) {
        return ResponseHelper.badRequest(res, 'monto inválido');
      }

      const payload = {
        alumno_id,
        curso_id: cursoId,
        concepto,
        descripcion: descripcion ?? null,
        categoria_id: categoria_id ?? null,
        monto: montoNum,
        fecha_emision: fecha_emision ?? new Date(),
        fecha_vencimiento,
        numero_comprobante: numero_comprobante || genComprobante(),
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
        limit: q.limit, offset: q.offset
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
      if (!userId) {
        return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');
      }

      // Normaliza/valida monto si viene
      let montoUpd = item.monto;
      if (req.body.monto != null) {
        const m = Number(req.body.monto);
        if (!Number.isFinite(m) || m <= 0) {
          return ResponseHelper.badRequest(res, 'monto inválido');
        }
        montoUpd = m;
      }

      const data = {
        alumno_id: req.body.alumno_id ?? item.alumno_id,
        curso_id: req.body.curso_id ?? item.curso_id,
        concepto: req.body.concepto ?? item.concepto,
        descripcion: req.body.descripcion ?? item.descripcion,
        categoria_id: req.body.categoria_id ?? item.categoria_id,
        monto: montoUpd,
        fecha_emision: req.body.fecha_emision ?? item.fecha_emision,
        fecha_vencimiento: req.body.fecha_vencimiento ?? item.fecha_vencimiento,
        numero_comprobante: req.body.numero_comprobante ?? item.numero_comprobante,
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

  // Marcar como pagado (ajusta solo campos existentes en tu tabla)
  static async pagar(req, res) {
    try {
      const id = req.params.id;
      const item = await CobroAlumno.findByPk(id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro de alumno no encontrado');

      const userId = getUserId(req);
      if (!userId) {
        return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');
      }

      const { metodo_pago, transaccion_id } = req.body;

      await item.update({
        estado: 'pagado',
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
      if (!userId) {
        return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');
      }

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
}

module.exports = CobroAlumnoController;
