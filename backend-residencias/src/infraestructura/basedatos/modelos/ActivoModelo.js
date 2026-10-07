// ==========================================================
//  infraestructura/basedatos/modelos/ActivoModelo.js
//  Los activos pertenecen a la habitacion (bloque + codigo).
// ==========================================================

import mongoose from 'mongoose';

const ActivoEsquema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, uppercase: true },
    codigo: { type: String, default: '', trim: true, uppercase: true },
    estado: { type: String, default: 'OPTIMO', trim: true, uppercase: true },
    observacion: { type: String, default: '', trim: true },
    bloque: { type: String, required: true, trim: true, uppercase: true },
    habitacionCodigo: { type: String, required: true, trim: true, uppercase: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, versionKey: false },
);

ActivoEsquema.index({ bloque: 1, habitacionCodigo: 1 });
ActivoEsquema.index({ estado: 1 });

export const ActivoModelo = mongoose.models.Activo || mongoose.model('Activo', ActivoEsquema);

export function aActivoPlano(documento) {
  if (!documento) return null;
  const objeto = typeof documento.toObject === 'function' ? documento.toObject() : documento;
  return {
    id: String(objeto._id),
    nombre: objeto.nombre,
    codigo: objeto.codigo || '',
    estado: objeto.estado,
    observacion: objeto.observacion || '',
    bloque: objeto.bloque,
    habitacionCodigo: objeto.habitacionCodigo,
    creadoEn: objeto.creadoEn,
    actualizadoEn: objeto.actualizadoEn,
  };
}
