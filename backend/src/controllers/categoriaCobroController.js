// antes: const { CategoriaCobro } = require('../models');
const CategoriaCobro = require('../models/categoriaCobro');  // ✅
const Response = require('../utils/responseHelper');

class CategoriaCobroController {
  static async getAll(req, res) {
    try {
      const items = await CategoriaCobro.findAll({ where: { activo: true }, order: [['nombre', 'ASC']] });
      return Response.ok(res, items);
    } catch (err) {
      return Response.error(res, 'Error al listar categorías de cobro', err);
    }
  }
}
module.exports = CategoriaCobroController;
