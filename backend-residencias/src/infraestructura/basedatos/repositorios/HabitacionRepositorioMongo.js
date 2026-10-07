// ==========================================================
//  infraestructura/basedatos/repositorios/HabitacionRepositorioMongo.js
//  Implementa IHabitacionRepositorio con MongoDB.
// ==========================================================

import { aHabitacionPlana, HabitacionModelo } from '../modelos/HabitacionModelo.js';

export class HabitacionRepositorioMongo {
  async listar(bloque) {
    const filtro = bloque ? { bloque } : {};
    const documentos = await HabitacionModelo.find(filtro).lean();
    return documentos.map(aHabitacionPlana);
  }

  async obtenerPorCodigo(bloque, codigo) {
    const documento = await HabitacionModelo.findOne({ bloque, codigo }).lean();
    return aHabitacionPlana(documento);
  }

  async obtenerVarias(bloque, codigos = []) {
    const documentos = await HabitacionModelo.find({ bloque, codigo: { $in: codigos } }).lean();
    return documentos.map(aHabitacionPlana);
  }

  async actualizar(bloque, codigo, cambios) {
    const documento = await HabitacionModelo.findOneAndUpdate(
      { bloque, codigo },
      { $set: cambios },
      { new: true },
    ).lean();
    return aHabitacionPlana(documento);
  }

  // --------------------------------------------------------
  //  Sincroniza el catalogo oficial sin pisar los cambios que
  //  el personal hizo a mano (capacidad, costo, estado, notas).
  // --------------------------------------------------------
  async sincronizarCatalogo(definiciones = []) {
    if (definiciones.length === 0) return { creadas: 0, existentes: 0 };

    const existentes = await HabitacionModelo.countDocuments();
    const operaciones = definiciones.map((definicion) => ({
      updateOne: {
        filter: { bloque: definicion.bloque, codigo: definicion.codigo },
        update: {
          $set: {
            piso: definicion.piso,
            lado: definicion.lado,
            orden: definicion.orden,
            posicion: definicion.posicion,
            tipo: definicion.tipo,
          },
          $setOnInsert: {
            capacidad: definicion.capacidad,
            costo: definicion.costo,
            estado: 'ACTIVA',
            observaciones: '',
          },
        },
        upsert: true,
      },
    }));

    await HabitacionModelo.bulkWrite(operaciones, { ordered: false });
    const total = await HabitacionModelo.countDocuments();
    return { creadas: Math.max(total - existentes, 0), existentes };
  }
}
