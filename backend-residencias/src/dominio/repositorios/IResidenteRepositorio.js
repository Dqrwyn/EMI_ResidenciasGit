// ==========================================================
//  dominio/repositorios/IResidenteRepositorio.js
//  CONTRATO del repositorio de residentes.
// ==========================================================

export class IResidenteRepositorio {
  /** Busca por carnet de identidad (normalizado). Devuelve null si no existe. */
  async buscarPorCi(_ci) {
    throw new Error('No implementado: buscarPorCi');
  }

  /** Lista residentes con filtros: bloque, habitacion, tipo, estado, texto, pagina, limite. */
  async listar(_filtros = {}) {
    throw new Error('No implementado: listar');
  }

  /** Cuenta residentes que cumplen los filtros (para paginacion). */
  async contar(_filtros = {}) {
    throw new Error('No implementado: contar');
  }

  /** Devuelve los residentes activos de una habitacion de un bloque. */
  async listarPorHabitacion(_bloque, _codigo) {
    throw new Error('No implementado: listarPorHabitacion');
  }

  /** Devuelve todos los residentes activos agrupables por habitacion (para el mapa). */
  async listarActivos(_filtros = {}) {
    throw new Error('No implementado: listarActivos');
  }

  /** Crea un residente nuevo. */
  async crear(_residente) {
    throw new Error('No implementado: crear');
  }

  /** Actualiza un residente identificado por su CI. */
  async actualizar(_ci, _cambios) {
    throw new Error('No implementado: actualizar');
  }

  /** Elimina definitivamente un residente (solo para correcciones). */
  async eliminar(_ci) {
    throw new Error('No implementado: eliminar');
  }

  /** Resumen por habitacion: cantidad de residentes activos de un bloque. */
  async resumenPorHabitacion(_bloque) {
    throw new Error('No implementado: resumenPorHabitacion');
  }
}
