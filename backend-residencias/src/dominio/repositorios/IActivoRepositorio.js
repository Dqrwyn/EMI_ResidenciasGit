// ==========================================================
//  dominio/repositorios/IActivoRepositorio.js
//  CONTRATO del repositorio de activos (bienes de habitacion).
// ==========================================================

export class IActivoRepositorio {
  /** Lista los activos de una habitacion de un bloque. */
  async listarPorHabitacion(_bloque, _codigo) {
    throw new Error('No implementado: listarPorHabitacion');
  }

  /** Lista los activos de todas las habitaciones de un bloque (conteo para el mapa). */
  async listarPorBloque(_bloque) {
    throw new Error('No implementado: listarPorBloque');
  }

  /** Crea un activo dentro de una habitacion. */
  async crear(_activo) {
    throw new Error('No implementado: crear');
  }

  /** Actualiza un activo por su identificador. */
  async actualizar(_id, _cambios) {
    throw new Error('No implementado: actualizar');
  }

  /** Elimina un activo por su identificador. */
  async eliminar(_id) {
    throw new Error('No implementado: eliminar');
  }

  /** Cuenta los activos que requieren atencion (estado distinto de OPTIMO). */
  async contarConAtencion() {
    throw new Error('No implementado: contarConAtencion');
  }

  /** Resumen de activos por habitacion de un bloque. */
  async resumenPorHabitacion(_bloque) {
    throw new Error('No implementado: resumenPorHabitacion');
  }
}
