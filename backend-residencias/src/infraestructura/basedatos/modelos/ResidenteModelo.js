// ==========================================================
//  infraestructura/basedatos/modelos/ResidenteModelo.js
// ==========================================================

import mongoose from 'mongoose';

const ResidenteEsquema = new mongoose.Schema(
  {
    ci: { type: String, required: true, unique: true, trim: true, uppercase: true },
    nombre: { type: String, required: true, trim: true, uppercase: true },
    tipo: { type: String, required: true, trim: true, uppercase: true },
    estado: { type: String, default: 'ACTIVO', trim: true, uppercase: true },
    celular: { type: String, default: '', trim: true },
    carrera: { type: String, default: '', trim: true },
    semestre: { type: String, default: '', trim: true, uppercase: true },
    codigo: { type: String, default: '', trim: true },
    tutorNombre: { type: String, default: '', trim: true, uppercase: true },
    tutorCelular: { type: String, default: '', trim: true },
    cargo: { type: String, default: '', trim: true },
    correo: { type: String, default: '', trim: true },
    observaciones: { type: String, default: '', trim: true },
    fechaIngreso: { type: String, default: '', trim: true },
    fechaRetiro: { type: String, default: '', trim: true },
    bloque: { type: String, default: null, trim: true, uppercase: true },
    habitacionCodigo: { type: String, default: null, trim: true, uppercase: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, versionKey: false },
);

ResidenteEsquema.index({ bloque: 1, habitacionCodigo: 1, estado: 1 });
ResidenteEsquema.index({ estado: 1, tipo: 1 });
ResidenteEsquema.index({ nombre: 1 });

export const ResidenteModelo = mongoose.models.Residente || mongoose.model('Residente', ResidenteEsquema);

export function aResidentePlano(documento) {
  if (!documento) return null;
  const objeto = typeof documento.toObject === 'function' ? documento.toObject() : documento;
  return {
    id: String(objeto._id),
    ci: objeto.ci,
    nombre: objeto.nombre,
    tipo: objeto.tipo,
    estado: objeto.estado,
    celular: objeto.celular || '',
    carrera: objeto.carrera || '',
    semestre: objeto.semestre || '',
    codigo: objeto.codigo || '',
    tutorNombre: objeto.tutorNombre || '',
    tutorCelular: objeto.tutorCelular || '',
    cargo: objeto.cargo || '',
    correo: objeto.correo || '',
    observaciones: objeto.observaciones || '',
    fechaIngreso: objeto.fechaIngreso || '',
    fechaRetiro: objeto.fechaRetiro || '',
    bloque: objeto.bloque || null,
    habitacionCodigo: objeto.habitacionCodigo || null,
    creadoEn: objeto.creadoEn,
    actualizadoEn: objeto.actualizadoEn,
  };
}
