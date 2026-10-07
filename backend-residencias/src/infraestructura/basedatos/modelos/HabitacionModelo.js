// ==========================================================
//  infraestructura/basedatos/modelos/HabitacionModelo.js
// ==========================================================

import mongoose from 'mongoose';

const HabitacionEsquema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, trim: true, uppercase: true },
    bloque: { type: String, required: true, trim: true, uppercase: true },
    piso: { type: String, default: null, trim: true, uppercase: true },
    lado: { type: String, default: null, trim: true, uppercase: true },
    orden: { type: Number, default: 0 },
    posicion: { type: String, default: null, trim: true, uppercase: true },
    tipo: { type: String, required: true, trim: true, uppercase: true },
    capacidad: { type: Number, required: true, min: 0, default: 1 },
    costo: { type: Number, default: 0, min: 0 },
    estado: { type: String, default: 'ACTIVA', trim: true, uppercase: true },
    observaciones: { type: String, default: '', trim: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, versionKey: false },
);

HabitacionEsquema.index({ bloque: 1, codigo: 1 }, { unique: true });
HabitacionEsquema.index({ bloque: 1, piso: 1, lado: 1, orden: 1 });

export const HabitacionModelo = mongoose.models.Habitacion || mongoose.model('Habitacion', HabitacionEsquema);

export function aHabitacionPlana(documento) {
  if (!documento) return null;
  const objeto = typeof documento.toObject === 'function' ? documento.toObject() : documento;
  return {
    id: String(objeto._id),
    codigo: objeto.codigo,
    bloque: objeto.bloque,
    piso: objeto.piso,
    lado: objeto.lado,
    orden: objeto.orden,
    posicion: objeto.posicion,
    tipo: objeto.tipo,
    capacidad: objeto.capacidad,
    costo: objeto.costo,
    estado: objeto.estado,
    observaciones: objeto.observaciones || '',
    creadoEn: objeto.creadoEn,
    actualizadoEn: objeto.actualizadoEn,
  };
}
