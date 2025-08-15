// src/services/reporteApoderadoService.js
const { Op } = require('sequelize');
const {
  Usuario,
  Alumno,
  Curso,
  CobroAlumno,        // ← NUEVO: usamos cobros_alumnos
  CuentaCurso,
  MovimientoCuenta,
  TipoCuenta,
} = require('../models');

class ReporteApoderadoService {
  /* ----------------------------- helpers ----------------------------- */
  async _getHijos(apoderadoId) {
    return Alumno.findAll({
      include: [
        { model: Usuario, as: 'apoderado', where: { id: apoderadoId } },
        { model: Curso, as: 'curso', required: false },
      ],
    });
  }
  _sum(arr, pick) {
    return (arr || []).reduce((s, x) => s + Number(pick(x) || 0), 0);
  }
  _restante(ca) {
    const total = Number(ca.monto || 0);
    const pagado = Number(ca.monto_pagado || 0);
    return Math.max(total - pagado, 0);
  }

  /* ------------------------ métricas del mes ------------------------- */
  async getMetricasRapidas(apoderadoId) {
    // verifica apoderado
    const apoderado = await Usuario.findByPk(apoderadoId);
    if (!apoderado) throw new Error('Apoderado no encontrado');

    const hijos = await this._getHijos(apoderadoId);
    if (!hijos.length) {
      return {
        mes_actual: { total_pagado: 0, total_pendiente: 0, cantidad_hijos: 0 },
        estado_general: { cumplimiento: 0 },
      };
    }
    const hijosIds = hijos.map((h) => h.id);

    const inicioMes = new Date();
    inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);

    // Pagado en el mes (pagos completos o parciales)
    const cobrosMes = await CobroAlumno.findAll({
      where: {
        alumno_id: { [Op.in]: hijosIds },
        fecha_pago: { [Op.gte]: inicioMes },
        estado: { [Op.in]: ['pagado', 'parcial'] },
      },
      attributes: ['monto_pagado'],
    });
    const totalPagado = this._sum(cobrosMes, (x) => x.monto_pagado);

    // Deuda pendiente total (restante > 0)
    const cobrosPend = await CobroAlumno.findAll({
      where: {
        alumno_id: { [Op.in]: hijosIds },
        estado: { [Op.in]: ['pendiente', 'parcial'] },
      },
      attributes: ['monto', 'monto_pagado'],
    });
    const totalPendiente = this._sum(cobrosPend, (x) => this._restante(x));

    const totalDeudas = totalPagado + totalPendiente;
    const cumplimiento = totalDeudas > 0 ? Math.round((totalPagado / totalDeudas) * 100) : 100;

    return {
      mes_actual: {
        total_pagado: totalPagado,
        total_pendiente: totalPendiente,
        cantidad_hijos: hijos.length,
      },
      estado_general: { cumplimiento },
    };
  }

  /* ------------------------- resumen general ------------------------- */
  async getResumenGeneral(apoderadoId) {
    const hijos = await this._getHijos(apoderadoId);
    if (!hijos.length) {
      return {
        resumen_consolidado: { total_pagado: 0, total_pendiente: 0, promedio_por_hijo: 0 },
        distribucion_global: [],
        tendencias: { porcentaje_completitud: 0, recomendacion: 'No hay datos disponibles' },
      };
    }
    const hijosIds = hijos.map((h) => h.id);

    const cobros = await CobroAlumno.findAll({
      where: { alumno_id: { [Op.in]: hijosIds } },
      attributes: ['concepto', 'monto', 'monto_pagado', 'estado'],
    });

    const totalPagado = this._sum(cobros, (x) => x.monto_pagado);
    const totalPendiente = this._sum(
      cobros.filter((x) => ['pendiente', 'parcial'].includes(String(x.estado))),
      (x) => this._restante(x)
    );
    const promedioHijo = hijos.length ? totalPagado / hijos.length : 0;

    // Distribución global por concepto (sobre lo efectivamente pagado)
    const byConcept = {};
    for (const c of cobros) {
      const k = c.concepto || 'Otros';
      byConcept[k] = (byConcept[k] || 0) + Number(c.monto_pagado || 0);
    }
    const totalDistrib = this._sum(Object.values(byConcept), (x) => x);
    const distribucion_global = Object.entries(byConcept)
      .filter(([, v]) => v > 0)
      .map(([concepto, monto]) => ({
        cuenta: concepto,
        monto,
        porcentaje: totalDistrib > 0 ? Math.round((monto / totalDistrib) * 100) : 0,
        color: this.getColorByCuentaTipo(concepto),
      }));

    const totalDeudas = totalPagado + totalPendiente;
    const porcentaje_completitud = totalDeudas > 0 ? Math.round((totalPagado / totalDeudas) * 100) : 100;
    let recomendacion = 'Mantener el ritmo de pagos actual';
    if (porcentaje_completitud < 50) recomendacion = 'Se recomienda ponerse al día con los pagos pendientes';
    else if (porcentaje_completitud > 90) recomendacion = 'Excelente cumplimiento de pagos';

    return {
      resumen_consolidado: {
        total_pagado: totalPagado,
        total_pendiente: totalPendiente,
        promedio_por_hijo: promedioHijo,
      },
      distribucion_global,
      tendencias: { porcentaje_completitud, recomendacion },
    };
  }

  /* ---------------------- reporte por alumno único -------------------- */
  async getReportePorAlumno(apoderadoId, alumnoId) {
    // verifica pertenencia
    const alumno = await Alumno.findOne({
      where: { id: alumnoId },
      include: [{ model: Usuario, as: 'apoderado', where: { id: apoderadoId } }, { model: Curso, as: 'curso' }],
    });
    if (!alumno) throw new Error('Alumno no encontrado o no pertenece al apoderado');

    const cobros = await CobroAlumno.findAll({
      where: { alumno_id: alumnoId },
      attributes: [
        'id',
        'concepto',
        'numero_comprobante',
        'monto',
        'monto_pagado',
        'estado',
        'fecha_emision',
        'fecha_vencimiento',
        'fecha_pago',
      ],
      order: [['fecha_vencimiento', 'ASC'], ['id', 'ASC']],
    });

    const pagos = cobros
      .filter((x) => Number(x.monto_pagado) > 0)
      .map((c) => ({
        id: c.id,
        concepto: c.concepto,
        numero_comprobante: c.numero_comprobante,
        monto_pagado: Number(c.monto_pagado || 0),
        fecha_pago: c.fecha_pago || null,
        estado: c.estado,
      }));

    const pendientes = cobros
      .filter((x) => ['pendiente', 'parcial'].includes(String(x.estado)) && this._restante(x) > 0)
      .map((c) => ({
        id: c.id,
        concepto: c.concepto,
        numero_comprobante: c.numero_comprobante,
        monto: Number(c.monto || 0),
        pagado: Number(c.monto_pagado || 0),
        restante: this._restante(c),
        fecha_vencimiento: c.fecha_vencimiento,
        estado: c.estado,
      }));

    const totalPagado = this._sum(pagos, (x) => x.monto_pagado);
    const totalPendiente = this._sum(pendientes, (x) => x.restante);

    // Distribución por concepto (sobre lo pagado del alumno)
    const byConcept = {};
    for (const p of pagos) byConcept[p.concepto || 'Otros'] = (byConcept[p.concepto || 'Otros'] || 0) + p.monto_pagado;
    const distribucion_por_cuenta = Object.entries(byConcept).map(([cuenta, monto]) => ({ cuenta, monto }));

    return {
      alumno: { id: alumno.id, nombre: alumno.nombre, curso: alumno.curso?.nombre_curso || alumno.curso?.nombre },
      resumen: {
        total_pagado: totalPagado,
        total_pendiente: totalPendiente,
        cantidad_pagos: pagos.length,
        promedio_mensual: pagos.length > 0 ? totalPagado / Math.max(pagos.length, 1) : 0,
      },
      pagos,
      deudas_pendientes: pendientes,
      distribucion_por_cuenta,
    };
  }

  /* --------------------- reporte por tipo de pago --------------------- */
  async getReportePorTipoPago(apoderadoId) {
    const hijos = await this._getHijos(apoderadoId);
    if (!hijos.length) return { total_general: 0, resumen_por_tipo: [] };
    const hijosIds = hijos.map((h) => h.id);

    const cobros = await CobroAlumno.findAll({
      where: {
        alumno_id: { [Op.in]: hijosIds },
        estado: { [Op.in]: ['pagado', 'parcial'] },
        monto_pagado: { [Op.gt]: 0 },
      },
      attributes: ['concepto', 'monto_pagado'],
    });

    const tipos = {};
    for (const c of cobros) {
      const t = c.concepto || 'Otros';
      if (!tipos[t]) tipos[t] = { total_pagado: 0, cantidad_pagos: 0, cuenta_destino: this.getCuentaDestinoByConcepto(t) };
      tipos[t].total_pagado += Number(c.monto_pagado || 0);
      tipos[t].cantidad_pagos += 1;
    }
    const total_general = Object.values(tipos).reduce((s, x) => s + x.total_pagado, 0);
    const resumen_por_tipo = Object.entries(tipos).map(([tipo_pago, v]) => ({
      tipo_pago,
      cuenta_destino: v.cuenta_destino,
      total_pagado: v.total_pagado,
      cantidad_pagos: v.cantidad_pagos,
    }));
    return { total_general, resumen_por_tipo };
  }

  /* ---------------------- actividades (sin cambios) ------------------- */
  async getActividadesDisponibles(apoderadoId) {
    const hijos = await this._getHijos(apoderadoId);
    const cursosIds = [...new Set(hijos.map((h) => h.curso_id))];

    const tiposActividad = await TipoCuenta.findAll({
      where: { nombre: { [Op.in]: ['Actividades', 'Ayuda Social', 'Eventos'] } },
    });

    const cuentasActividades = await CuentaCurso.findAll({
      where: {
        curso_id: { [Op.in]: cursosIds },
        tipo_cuenta_id: { [Op.in]: tiposActividad.map((t) => t.id) },
      },
      include: [
        { model: TipoCuenta, as: 'tipoCuenta' },
        { model: Curso, as: 'curso' },
      ],
    });

    return cuentasActividades.map((cuenta) => ({
      id: cuenta.id,
      nombre: `${cuenta.tipoCuenta?.nombre} - ${cuenta.curso?.nombre_curso || cuenta.curso?.nombre}`,
      tipo: cuenta.tipoCuenta?.nombre,
      curso: cuenta.curso?.nombre_curso || cuenta.curso?.nombre,
    }));
  }

  async getReportePorActividad(apoderadoId, actividadId) {
    const cuenta = await CuentaCurso.findByPk(actividadId, {
      include: [{ model: TipoCuenta, as: 'tipoCuenta' }, { model: Curso, as: 'curso' }],
    });
    if (!cuenta) throw new Error('Actividad no encontrada');

    // verifica que tenga hijos en el curso
    await this._getHijos(apoderadoId); // si necesitas validar curso, puedes filtrarlos por curso_id = cuenta.curso_id

    const ingresos = await MovimientoCuenta.findAll({ where: { cuenta_id: actividadId, tipo: 'ingreso' } });
    const egresos = await MovimientoCuenta.findAll({ where: { cuenta_id: actividadId, tipo: 'egreso' } });

    const totalIngresos = this._sum(ingresos, (x) => x.monto);
    const totalGastos = this._sum(egresos, (x) => x.monto);
    const balance = totalIngresos - totalGastos;

    return {
      actividad: {
        id: cuenta.id,
        nombre: cuenta.tipoCuenta?.nombre,
        tipo: cuenta.tipoCuenta?.nombre,
        curso: cuenta.curso?.nombre_curso || cuenta.curso?.nombre,
        fecha_actividad: new Date().toISOString().split('T')[0],
        estado: balance >= 0 ? 'completada' : 'en_proceso',
      },
      balance_financiero: { total_ingresos: totalIngresos, total_gastos: totalGastos, balance },
      participacion: { hijos: [] },
    };
  }

  /* ------------------------- utilitarios ------------------------- */
  getColorByCuentaTipo(tipo) {
    const colores = {
      'Tesorería General': '#22c55e',
      'Ayuda Social': '#3b82f6',
      'Actividades': '#f59e0b',
      'Infraestructura': '#ef4444',
      Otros: '#6b7280',
    };
    return colores[tipo] || colores.Otros;
  }

  getCuentaDestinoByConcepto(concepto = '') {
    const m = {
      Mensualidad: 'Tesorería General',
      Cuota: 'Tesorería General',
      'Cupón Gas': 'Ayuda Social',
      Beca: 'Ayuda Social',
      Paseo: 'Actividades',
      Evento: 'Actividades',
      Material: 'Tesorería General',
    };
    for (const [k, v] of Object.entries(m)) {
      if (concepto.toLowerCase().includes(k.toLowerCase())) return v;
    }
    return 'Tesorería General';
  }
}

module.exports = new ReporteApoderadoService();
