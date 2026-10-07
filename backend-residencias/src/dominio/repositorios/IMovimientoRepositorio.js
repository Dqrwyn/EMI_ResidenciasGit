// ==========================================================
//  dominio/repositorios/IMovimientoRepositorio.js
//  CONTRATO del historial (auditoria).
// ==========================================================

export class IMovimientoRepositorio {
  /** Guarda un movimiento del historial. */
  async registrar(_movimiento) {
    throw new Error('No implementado: registrar');
  }

  /** Lista movimientos con filtros (tipo, texto, fechas, paginacion). */
  async listar(_filtros) {
    throw new Error('No implementado: listar');
  }

  /** Cuenta movimientos que cumplen los filtros. */
  async contar(_filtros) {
    throw new Error('No implementado: contar');
  }

  /** Historial de un residente por su CI. */
  async listarPorResidente(_ci, _limite) {
    throw new Error('No implementado: listarPorResidente');
  }
}
