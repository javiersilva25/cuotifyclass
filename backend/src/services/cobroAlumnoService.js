// services/cobroAlumnoService.js
const { CobroAlumno, Curso, DeudaCompanero } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op, fn, col } = require('sequelize');

class CobroAlumnoService {
  /* ================== CREATE ================== */
  static async create(cobroData, userId) {
    const dataWithAudit = { ...cobroData, ...addCreateAudit(userId) };
    return CobroAlumno.create(dataWithAudit);
  }

  /* ================== LIST ================== */
  // options: { page, limit, curso_id, alumno_id, estado, search }
  static async findAll(options = {}) {
    let {
      page = 1,
      limit = 10,
      curso_id,
      alumno_id,
      estado,     // 'pendiente' | 'pagado' | 'anulado'
      search,     // concepto / rut / nombre (aquí aplicamos a concepto)
    } = options;

    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;
    const offset = (page - 1) * limit;

    const where = {};
    if (curso_id)  where.curso_id  = parseInt(curso_id, 10);
    if (alumno_id) where.alumno_id = parseInt(alumno_id, 10);
    if (estado)    where.estado    = String(estado).toLowerCase().trim();
    if (search)    where.concepto  = { [Op.like]: `%${search}%` };

    const { count, rows } = await CobroAlumno.findAndCountAll({
      where,
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      limit,
      offset,
      order: [['fecha_creacion', 'DESC'], ['id', 'DESC']],
    });

    return {
      items: rows,
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
    return CobroAlumno.findByPk(id, {
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
    });
  }

  /* ================== BY CURSO / ALUMNO / PARENT ================== */
  static async findByCurso(cursoId) {
    return CobroAlumno.findAll({
      where: { curso_id: parseInt(cursoId, 10) },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_creacion', 'DESC'], ['id', 'DESC']],
    });
  }

  static async findByAlumno(alumnoId) {
    return CobroAlumno.findAll({
      where: { alumno_id: parseInt(alumnoId, 10) },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_creacion', 'DESC'], ['id', 'DESC']],
    });
  }

  // hijos de cobro padre (requiere columna cobro_id en cobros_alumnos)
  static async findByParentCobro(cobroId) {
    return CobroAlumno.findAll({
      where: { cobro_id: parseInt(cobroId, 10) },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_creacion', 'DESC'], ['id', 'DESC']],
    });
  }

  static async findPendientes(filters = {}) {
    const where = { estado: 'pendiente' };
    if (filters.curso_id)  where.curso_id  = parseInt(filters.curso_id, 10);
    if (filters.alumno_id) where.alumno_id = parseInt(filters.alumno_id, 10);

    return CobroAlumno.findAll({
      where,
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_creacion', 'DESC'], ['id', 'DESC']],
    });
  }

  static async findByConcepto(concepto) {
    return CobroAlumno.findAll({
      where: { concepto: { [Op.like]: `%${concepto}%` } },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      order: [['fecha_creacion', 'DESC'], ['id', 'DESC']],
    });
  }

  /* ================== UPDATE ================== */
  static async update(id, updateData, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) return null;

    const dataWithAudit = { ...updateData, ...addUpdateAudit(userId) };
    await cobro.update(dataWithAudit);
    return this.findById(id);
  }

  /* ================== PAGO / REVERSION / ANULACIÓN ================== */
  static async registrarPago(id, data, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) return null;

    const payload = {
      estado: 'pagado',
      monto_pagado: data.monto,
      metodo_pago: data.metodo_pago || null,
      transaccion_id: data.transaccion_id || null,
      fecha_pago: data.fecha_pago || new Date(),
      ...addUpdateAudit(userId),
    };
    await cobro.update(payload);
    return this.findById(id);
  }

  static async revertirPago(id, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) return null;

    await cobro.update({
      estado: 'pendiente',
      monto_pagado: null,
      metodo_pago: null,
      transaccion_id: null,
      fecha_pago: null,
      ...addUpdateAudit(userId),
    });
    return this.findById(id);
  }

  static async anular(id, { motivo = null } = {}, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) return null;

    await cobro.update({
      estado: 'anulado',
      motivo_anulacion: motivo,
      fecha_anulacion: new Date(),
      ...addUpdateAudit(userId),
    });
    return this.findById(id);
  }

  static async reasignarAlumno(id, nuevo_alumno_id, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) return null;

    await cobro.update({
      alumno_id: parseInt(nuevo_alumno_id, 10),
      ...addUpdateAudit(userId),
    });
    return this.findById(id);
  }

  static async isPaid(id) {
    const cobro = await CobroAlumno.findByPk(id, { attributes: ['id', 'estado'] });
    return !!cobro && cobro.estado === 'pagado';
  }

  /* ================== DELETE (SOFT) ================== */
  static async delete(id, userId) {
    const cobro = await CobroAlumno.findByPk(id);
    if (!cobro) return false;

    // Regla de negocio: no eliminar si tiene deudas de compañeros asociadas
    const deudasCount = await DeudaCompanero.count({ where: { cobro_alumnos_id: id } });
    if (deudasCount > 0) {
      throw new Error('No se puede eliminar el cobro porque tiene deudas de compañeros asociadas');
    }

    await cobro.softDelete(userId);
    return true;
  }

  /* ================== RESTORE ================== */
  static async restore(id) {
    const cobro = await CobroAlumno.scope('deleted').findByPk(id);
    if (!cobro) return false;
    await cobro.restore();
    return true;
  }

  /* ================== TOTAL x CURSO ================== */
  static async getTotalByCurso(cursoId) {
    const total = await CobroAlumno.sum('monto', { where: { curso_id: parseInt(cursoId, 10) } });
    return total || 0;
  }

  /* ================== ESTADÍSTICAS ================== */
  static async getEstadisticas(filters = {}) {
    const where = {};
    if (filters.curso_id) where.curso_id = parseInt(filters.curso_id, 10);
    if (filters.fecha_desde && filters.fecha_hasta) {
      where.fecha_creacion = { [Op.between]: [filters.fecha_desde, filters.fecha_hasta] };
    }

    const [totalCobros, montoTotal] = await Promise.all([
      CobroAlumno.count({ where }),
      CobroAlumno.sum('monto', { where }),
    ]);

    return {
      total_cobros: totalCobros,
      monto_total: montoTotal || 0,
    };
  }

  /* ================== GROUP BY CURSO ================== */
  static async getGroupedByCurso() {
    return CobroAlumno.findAll({
      attributes: [
        'curso_id',
        [fn('COUNT', col('CobroAlumno.id')), 'total_cobros'],
        [fn('SUM', col('CobroAlumno.monto')), 'total_monto'],
      ],
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'ano_escolar'] },
      ],
      group: ['CobroAlumno.curso_id', 'curso.id', 'curso.nombre_curso', 'curso.ano_escolar'],
      order: [[fn('SUM', col('CobroAlumno.monto')), 'DESC']],
    });
  }

  /* ================== BULK ================== */
  static async createBulk(cursoId, cobrosData, userId) {
    const cobrosWithAudit = cobrosData.map(c => ({
      ...c,
      curso_id: parseInt(cursoId, 10),
      ...addCreateAudit(userId),
    }));
    return CobroAlumno.bulkCreate(cobrosWithAudit);
  }
}

module.exports = CobroAlumnoService;
