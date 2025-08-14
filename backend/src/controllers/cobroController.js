// controllers/cobrosController.js
const { Op } = require('sequelize');
const { Cobro, Curso } = require('../models');
const ResponseHelper = require('../utils/responseHelper');
const Logger = require('../utils/logger');

// Normaliza query (?params=JSON, alias y tipos)
function normQuery(req) {
  const q = { ...req.query };
  if (typeof q.params === 'string') { try { Object.assign(q, JSON.parse(q.params)); } catch {} }
  if (q.cursoId && !q.curso_id) q.curso_id = q.cursoId;

  q.page  = parseInt(q.page  ?? 1, 10);
  q.limit = parseInt(q.limit ?? 20, 10);
  q.offset = (q.page - 1) * q.limit;

  const where = {};
  if (q.curso_id) where.curso_id = q.curso_id;
  if (q.categoria_id) where.categoria_id = q.categoria_id;
  if (q.search) {
    where[Op.or] = [
      { concepto: { [Op.like]: `%${q.search}%` } },
      { descripcion: { [Op.like]: `%${q.search}%` } },
      { numero_comprobante: { [Op.like]: `%${q.search}%` } }
    ];
  }
  return { q, where };
}

// Genera número de comprobante si no viene
function genComprobante(pref = 'CBG') {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${pref}-${Date.now()}-${num}`;
}

// Extrae el userId para auditoría
function getUserId(req) {
  const hdr = req.headers['x-user-id'];
  const byHeader = Number(hdr);
  if (Number.isFinite(byHeader) && byHeader > 0) return byHeader;
  if (req.user?.id) return req.user.id;
  if (req.auth?.userId) return req.auth.userId;
  return 1; // ← fallback DEV
}

class CobrosController {
  static async create(req, res) {
    try {
      const {
        curso_id,
        concepto,
        descripcion,
        categoria_id,
        monto_total,
        fecha_emision,
        fecha_vencimiento,
        numero_comprobante,
        observaciones
      } = req.body;

      // Validación mínima
      if (!curso_id || !concepto || monto_total == null || !fecha_vencimiento) {
        return ResponseHelper.badRequest(res, 'curso_id, concepto, monto_total y fecha_vencimiento son obligatorios');
      }

      const userId = getUserId(req);
      if (!userId) {
        return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');
      }

      // Valida curso
      const curso = await Curso.findByPk(curso_id);
      if (!curso) return ResponseHelper.notFound(res, 'Curso no encontrado');

      const monto = Number(monto_total);
      if (!Number.isFinite(monto) || monto <= 0) {
        return ResponseHelper.badRequest(res, 'monto_total inválido');
      }

      const payload = {
        curso_id,
        concepto,
        descripcion: descripcion ?? null,
        categoria_id: categoria_id ?? null,
        monto_total: monto,
        fecha_emision: fecha_emision ?? new Date(),
        fecha_vencimiento,
        numero_comprobante: numero_comprobante || genComprobante(),
        observaciones: observaciones ?? null,
        // auditoría
        creado_por: userId,
        actualizado_por: userId
      };

      const created = await Cobro.create(payload);
      return ResponseHelper.created(res, created);
    } catch (err) {
      Logger.error('create cobro', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al crear cobro', err);
    }
  }

  static async getAll(req, res) {
    try {
      const { q, where } = normQuery(req);
      const result = await Cobro.findAndCountAll({
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
      Logger.error('getAll cobros', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al listar cobros', err);
    }
  }

  static async getById(req, res) {
    try {
      const item = await Cobro.findByPk(req.params.id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro no encontrado');
      return ResponseHelper.ok(res, item);
    } catch (err) {
      Logger.error('getById cobro', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al obtener cobro', err);
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const item = await Cobro.findByPk(id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro no encontrado');

      const userId = getUserId(req);
      if (!userId) {
        return ResponseHelper.badRequest(res, 'Falta usuario emisor (x-user-id)');
      }

      const data = {
        concepto: req.body.concepto ?? item.concepto,
        descripcion: req.body.descripcion ?? item.descripcion,
        categoria_id: req.body.categoria_id ?? item.categoria_id,
        monto_total: req.body.monto_total != null ? Number(req.body.monto_total) : item.monto_total,
        fecha_emision: req.body.fecha_emision ?? item.fecha_emision,
        fecha_vencimiento: req.body.fecha_vencimiento ?? item.fecha_vencimiento,
        numero_comprobante: req.body.numero_comprobante ?? item.numero_comprobante,
        observaciones: req.body.observaciones ?? item.observaciones,
        actualizado_por: userId
      };

      if (req.body.monto_total != null) {
        const monto = Number(req.body.monto_total);
        if (!Number.isFinite(monto) || monto <= 0) {
          return ResponseHelper.badRequest(res, 'monto_total inválido');
        }
        data.monto_total = monto;
      }

      await item.update(data);
      return ResponseHelper.ok(res, item);
    } catch (err) {
      Logger.error('update cobro', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al actualizar cobro', err);
    }
  }

  // Soft delete
  static async delete(req, res) {
    try {
      const id = req.params.id;
      const item = await Cobro.findByPk(id);
      if (!item) return ResponseHelper.notFound(res, 'Cobro no encontrado');

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
      Logger.error('delete cobro', { error: err?.message, stack: err?.stack });
      return ResponseHelper.error(res, 'Error al eliminar cobro', err);
    }
  }
}

module.exports = CobrosController;
