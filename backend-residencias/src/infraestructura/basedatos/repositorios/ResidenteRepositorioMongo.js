// ==========================================================
//  infraestructura/basedatos/repositorios/ResidenteRepositorioMongo.js
// ==========================================================

import { aResidentePlano, ResidenteModelo } from '../modelos/ResidenteModelo.js';

function escaparExpresion(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function construirFiltro(filtros = {}) {
  const filtro = {};

  if (filtros.bloque) filtro.bloque = filtros.bloque;
  if (filtros.estado) filtro.estado = filtros.estado;
  if (filtros.tipo) filtro.tipo = filtros.tipo;
  if (filtros.habitacionCodigo) filtro.habitacionCodigo = filtros.habitacionCodigo;
  if (filtros.sinHabitacion) filtro.habitacionCodigo = null;

  if (filtros.texto) {
    const expresion = new RegExp(escaparExpresion(filtros.texto), 'i');
    filtro.$or = [{ nombre: expresion }, { ci: expresion }, { celular: expresion }, { codigo: expresion }];
  }

  if (filtros.ci) {
    filtro.ci = new RegExp(escaparExpresion(filtros.ci), 'i');
  }

  return filtro;
}

function construirOrden(orden) {
  if (orden === 'nombre') return { nombre: 1 };
  return { bloque: 1, habitacionCodigo: 1, nombre: 1 };
}

export class ResidenteRepositorioMongo {
  async buscarPorCi(ci) {
    const documento = await ResidenteModelo.findOne({ ci }).lean();
    return aResidentePlano(documento);
  }

  async listar(filtros = {}) {
    const consulta = ResidenteModelo.find(construirFiltro(filtros)).sort(construirOrden(filtros.orden));
    if (filtros.limite) consulta.limit(filtros.limite);
    if (filtros.salto) consulta.skip(filtros.salto);
    const documentos = await consulta.lean();
    return documentos.map(aResidentePlano);
  }

  async contar(filtros = {}) {
    return ResidenteModelo.countDocuments(construirFiltro(filtros));
  }

  async listarPorHabitacion(bloque, codigo) {
    const documentos = await ResidenteModelo.find({
      bloque,
      habitacionCodigo: codigo,
      estado: 'ACTIVO',
    })
      .sort({ nombre: 1 })
      .lean();
    return documentos.map(aResidentePlano);
  }

  async listarActivos(filtros = {}) {
    const filtro = { estado: 'ACTIVO' };
    if (filtros.bloque) filtro.bloque = filtros.bloque;
    const documentos = await ResidenteModelo.find(filtro).sort({ nombre: 1 }).lean();
    return documentos.map(aResidentePlano);
  }

  async crear(residente) {
    const documento = await ResidenteModelo.create(residente);
    return aResidentePlano(documento);
  }

  async actualizar(ci, cambios) {
    const documento = await ResidenteModelo.findOneAndUpdate(
      { ci },
      { $set: cambios },
      { new: true, runValidators: true },
    ).lean();
    return aResidentePlano(documento);
  }

  async eliminar(ci) {
    const documento = await ResidenteModelo.findOneAndDelete({ ci }).lean();
    return aResidentePlano(documento);
  }

  async resumenPorHabitacion(bloque) {
    const resultados = await ResidenteModelo.aggregate([
      { $match: { bloque, estado: 'ACTIVO', habitacionCodigo: { $ne: null } } },
      { $group: { _id: '$habitacionCodigo', cantidad: { $sum: 1 } } },
    ]);
    return resultados.map((fila) => ({ habitacionCodigo: fila._id, cantidad: fila.cantidad }));
  }
}
