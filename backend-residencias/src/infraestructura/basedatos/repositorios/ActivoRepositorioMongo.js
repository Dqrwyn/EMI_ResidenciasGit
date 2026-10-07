// ==========================================================
//  infraestructura/basedatos/repositorios/ActivoRepositorioMongo.js
// ==========================================================

import { ActivoModelo, aActivoPlano } from '../modelos/ActivoModelo.js';

export class ActivoRepositorioMongo {
  async listarPorHabitacion(bloque, codigo) {
    const documentos = await ActivoModelo.find({ bloque, habitacionCodigo: codigo }).sort({ nombre: 1 }).lean();
    return documentos.map(aActivoPlano);
  }

  async listarPorBloque(bloque) {
    const documentos = await ActivoModelo.find({ bloque }).sort({ habitacionCodigo: 1, nombre: 1 }).lean();
    return documentos.map(aActivoPlano);
  }

  async crear(activo) {
    const documento = await ActivoModelo.create(activo);
    return aActivoPlano(documento);
  }

  async actualizar(id, cambios) {
    const documento = await ActivoModelo.findByIdAndUpdate(id, { $set: cambios }, { new: true }).lean();
    return aActivoPlano(documento);
  }

  async eliminar(id) {
    const documento = await ActivoModelo.findByIdAndDelete(id).lean();
    return aActivoPlano(documento);
  }

  async contarConAtencion() {
    return ActivoModelo.countDocuments({ estado: { $ne: 'OPTIMO' } });
  }

  async resumenPorHabitacion(bloque) {
    const resultados = await ActivoModelo.aggregate([
      { $match: { bloque } },
      {
        $group: {
          _id: '$habitacionCodigo',
          total: { $sum: 1 },
          conAtencion: { $sum: { $cond: [{ $ne: ['$estado', 'OPTIMO'] }, 1, 0] } },
        },
      },
    ]);
    return resultados.map((fila) => ({
      habitacionCodigo: fila._id,
      total: fila.total,
      conAtencion: fila.conAtencion,
    }));
  }
}
