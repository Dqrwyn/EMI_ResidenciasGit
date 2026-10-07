// ==========================================================
//  infraestructura/basedatos/repositorios/MovimientoRepositorioMongo.js
// ==========================================================

import { aMovimientoPlano, MovimientoModelo } from '../modelos/MovimientoModelo.js';

function escaparExpresion(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function construirFiltro(filtros = {}) {
  const filtro = {};
  if (filtros.tipo) filtro.tipo = filtros.tipo;

  if (filtros.texto) {
    const expresion = new RegExp(escaparExpresion(filtros.texto), 'i');
    filtro.$or = [
      { residenteCi: expresion },
      { residenteNombre: expresion },
      { detalle: expresion },
      { habitacionOrigen: expresion },
      { habitacionDestino: expresion },
      { usuario: expresion },
    ];
  }

  if (filtros.desde || filtros.hasta) {
    filtro.fecha = {};
    if (filtros.desde) filtro.fecha.$gte = new Date(filtros.desde);
    if (filtros.hasta) {
      const hasta = new Date(filtros.hasta);
      hasta.setHours(23, 59, 59, 999);
      filtro.fecha.$lte = hasta;
    }
  }

  return filtro;
}

export class MovimientoRepositorioMongo {
  async registrar(movimiento) {
    const documento = await MovimientoModelo.create(movimiento);
    return aMovimientoPlano(documento);
  }

  async listar(filtros = {}) {
    const consulta = MovimientoModelo.find(construirFiltro(filtros)).sort({ fecha: -1 });
    if (filtros.limite) consulta.limit(filtros.limite);
    if (filtros.salto) consulta.skip(filtros.salto);
    const documentos = await consulta.lean();
    return documentos.map(aMovimientoPlano);
  }

  async contar(filtros = {}) {
    return MovimientoModelo.countDocuments(construirFiltro(filtros));
  }

  async listarPorResidente(ci, limite = 20) {
    const documentos = await MovimientoModelo.find({ residenteCi: ci }).sort({ fecha: -1 }).limit(limite).lean();
    return documentos.map(aMovimientoPlano);
  }
}
