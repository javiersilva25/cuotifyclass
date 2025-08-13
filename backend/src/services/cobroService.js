// services/cobroService.js
const { Cobro, Curso, DeudaAlumno } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');

class CobroService {
  /* ================== CREATE ================== */
  static async create(cobroData, userId) {
    const dataWithAudit = { ...cobroData, ...addCreateAudit(userId) };
    return Cobro.create(dataWithAudit);
  }

  /* ================== LIST ================== */
  static async findAll(options = {}) {
    let {
      page = 1,
      limit = 10,
      curso_id,
      fecha_desde,
      fecha_hasta,
      vencidos_only = false,
    } = options;

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (curso_id) where.curso_id = parseInt(curso_id, 10);

    // Rango de fechas (si viene)
    if (fecha_desde && fecha_hasta) {
      where.fecha_vencimiento = { [Op.between]: [fecha_desde, fecha_hasta] };
    }

    // Vencidos_only (se combina con otros filtros sin pisarlos)
    if (vencidos_only) {
      where.fecha_vencimiento = {
        ...(where.fecha_vencimiento || {}),
        [Op.lt]: new Date(),
      };
    }

    const { count, rows } = await Cobro.findAndCountAll({
      where,
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      limit,
      offset,
      order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
    });

    return {
      cobros: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit) || 1,
      },
    };
  }

  /* ================== DETAIL ================== */
  static async findById(id) {
    return Cobro.findByPk(id, {
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
    });
  }

  /* ================== BY CURSO ================== */
  static async findByCurso(cursoId) {
    return Cobro.findAll({
      where: { curso_id: parseInt(cursoId, 10) },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
    });
  }

  /* ================== VENCIDOS ================== */
  static async findVencidos() {
    return Cobro.findAll({
      where: { fecha_vencimiento: { [Op.lt]: new Date() } },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
    });
  }

  /* ================== BY DATE RANGE ================== */
  static async findByDateRange(fechaInicio, fechaFin) {
    return Cobro.findAll({
      where: { fecha_vencimiento: { [Op.between]: [fechaInicio, fechaFin] } },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
    });
  }

  /* ================== UPDATE ================== */
  static async update(id, updateData, userId) {
    const cobro = await Cobro.findByPk(id);
    if (!cobro) return null;
    const dataWithAudit = { ...updateData, ...addUpdateAudit(userId) };
    await cobro.update(dataWithAudit);
    return this.findById(id);
  }

  /* ================== DELETE (SOFT) ================== */
  static async delete(id, userId) {
    const cobro = await Cobro.findByPk(id);
    if (!cobro) return false;

    const deudasCount = await DeudaAlumno.count({ where: { cobro_id: id } });
    if (deudasCount > 0) {
      throw new Error('No se puede eliminar el cobro porque tiene deudas asociadas');
    }

    await cobro.softDelete(userId);
    return true;
  }

  /* ================== RESTORE ================== */
  static async restore(id) {
    const cobro = await Cobro.scope('deleted').findByPk(id);
    if (!cobro) return false;
    await cobro.restore();
    return true;
  }

  /* ================== PRÓXIMOS A VENCER ================== */
  static async findProximosAVencer(dias = 7) {
    const ahora = new Date();
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + (parseInt(dias, 10) || 7));

    return Cobro.findAll({
      where: { fecha_vencimiento: { [Op.between]: [ahora, fechaLimite] } },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
    });
  }

  /* ================== TOTAL X CURSO ================== */
  static async getTotalByCurso(cursoId) {
    const total = await Cobro.sum('monto_total', { where: { curso_id: parseInt(cursoId, 10) } });
    return total || 0;
  }

  /* ================== ESTADÍSTICAS ================== */
  static async getEstadisticas(filters = {}) {
    const where = {};

    if (filters.curso_id) where.curso_id = parseInt(filters.curso_id, 10);

    if (filters.fecha_desde && filters.fecha_hasta) {
      where.fecha_vencimiento = { [Op.between]: [filters.fecha_desde, filters.fecha_hasta] };
    }

    const ahora = new Date();
    const sieteDias = new Date();
    sieteDias.setDate(sieteDias.getDate() + 7);

    const [total, vencidos, proximosAVencer, montoTotal] = await Promise.all([
      Cobro.count({ where }),
      Cobro.count({ where: { ...where, fecha_vencimiento: { [Op.lt]: ahora } } }),
      Cobro.count({ where: { ...where, fecha_vencimiento: { [Op.between]: [ahora, sieteDias] } } }),
      Cobro.sum('monto_total', { where }),
    ]);

    return {
      total_cobros: total,
      cobros_vencidos: vencidos,
      cobros_proximos_vencer: proximosAVencer,
      monto_total: montoTotal || 0,
    };
  }
}

module.exports = CobroService;
