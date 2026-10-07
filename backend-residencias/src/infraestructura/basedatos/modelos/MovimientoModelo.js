// ==========================================================
//  infraestructura/basedatos/modelos/MovimientoModelo.js
// ==========================================================

import mongoose from 'mongoose';

const MovimientoEsquema = new mongoose.Schema(
  {
    tipo: { type: String, required: true, trim: true, uppercase: true },
    residenteCi: { type: String, default: null, trim: true, uppercase: true },
    residenteNombre: { type: String, default: null, trim: true, uppercase: true },
    habitacionOrigen: { type: String, default: null, trim: true, uppercase: true },
    habitacionDestino: { type: String, default: null, trim: true, uppercase: true },
    detalle: { type: String, default: '', trim: true },
    usuario: { type: String, default: null, trim: true },
    fecha: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

MovimientoEsquema.index({ fecha: -1 });
MovimientoEsquema.index({ residenteCi: 1, fecha: -1 });
MovimientoEsquema.index({ tipo: 1, fecha: -1 });

export const MovimientoModelo = mongoose.models.Movimiento || mongoose.model('Movimiento', MovimientoEsquema);

export function aMovimientoPlano(documento) {
  if (!documento) return null;
  const objeto = typeof documento.toObject === 'function' ? documento.toObject() : documento;
  return {
    id: String(objeto._id),
    tipo: objeto.tipo,
    residenteCi: objeto.residenteCi || null,
    residenteNombre: objeto.residenteNombre || null,
    habitacionOrigen: objeto.habitacionOrigen || null,
    habitacionDestino: objeto.habitacionDestino || null,
    detalle: objeto.detalle || '',
    usuario: objeto.usuario || null,
    fecha: objeto.fecha,
  };
}
