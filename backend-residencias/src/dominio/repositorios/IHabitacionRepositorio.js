// ==========================================================
//  dominio/repositorios/IHabitacionRepositorio.js
//  CONTRATO. El dominio solo conoce estos metodos; la base de
//  datos (Mongo) los implementa en infraestructura.
// ==========================================================

export class IHabitacionRepositorio {
  /** Lista las habitaciones de un bloque, o de todos si no se indica. */
  async listar(_bloque) {
    throw new Error('No implementado: listar');
  }

  /** Devuelve la habitacion de un bloque y codigo, o null. */
  async obtenerPorCodigo(_bloque, _codigo) {
    throw new Error('No implementado: obtenerPorCodigo');
  }

  /** Devuelve todas las habitaciones de un bloque cuyos codigos esten en la lista. */
  async obtenerVarias(_bloque, _codigos) {
    throw new Error('No implementado: obtenerVarias');
  }

  /** Aplica cambios (capacidad, costo, estado, observaciones) a una habitacion. */
  async actualizar(_bloque, _codigo, _cambios) {
    throw new Error('No implementado: actualizar');
  }

  /** Crea o sincroniza el catalogo oficial de habitaciones. */
  async sincronizarCatalogo(_definiciones) {
    throw new Error('No implementado: sincronizarCatalogo');
  }
}
