// ==========================================================
//  dominio/repositorios/IUsuarioRepositorio.js
//  CONTRATO del repositorio de usuarios del sistema.
// ==========================================================

export class IUsuarioRepositorio {
  /** Busca una cuenta por su nombre de usuario (normalizado). */
  async buscarPorUsuario(_usuario) {
    throw new Error('No implementado: buscarPorUsuario');
  }

  /** Lista todas las cuentas. */
  async listar() {
    throw new Error('No implementado: listar');
  }

  /** Crea una cuenta nueva. */
  async crear(_usuario) {
    throw new Error('No implementado: crear');
  }

  /** Actualiza una cuenta por nombre de usuario. */
  async actualizar(_usuario, _cambios) {
    throw new Error('No implementado: actualizar');
  }

  /** Elimina una cuenta. */
  async eliminar(_usuario) {
    throw new Error('No implementado: eliminar');
  }
}
