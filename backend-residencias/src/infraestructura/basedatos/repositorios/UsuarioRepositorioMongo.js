// ==========================================================
//  infraestructura/basedatos/repositorios/UsuarioRepositorioMongo.js
// ==========================================================

import { aUsuarioPlano, UsuarioModelo } from '../modelos/UsuarioModelo.js';

export class UsuarioRepositorioMongo {
  async buscarPorUsuario(usuario) {
    const documento = await UsuarioModelo.findOne({ usuario }).lean();
    return aUsuarioPlano(documento);
  }

  async listar() {
    const documentos = await UsuarioModelo.find({}).sort({ usuario: 1 }).lean();
    return documentos.map(aUsuarioPlano);
  }

  async crear(usuario) {
    const documento = await UsuarioModelo.create(usuario);
    return aUsuarioPlano(documento);
  }

  async actualizar(usuario, cambios) {
    const documento = await UsuarioModelo.findOneAndUpdate(
      { usuario },
      { $set: cambios },
      { new: true, runValidators: true },
    ).lean();
    return aUsuarioPlano(documento);
  }

  async eliminar(usuario) {
    const documento = await UsuarioModelo.findOneAndDelete({ usuario }).lean();
    return aUsuarioPlano(documento);
  }
}
