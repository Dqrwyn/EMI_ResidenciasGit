// ==========================================================
//  infraestructura/basedatos/modelos/UsuarioModelo.js
// ==========================================================

import mongoose from 'mongoose';

const UsuarioEsquema = new mongoose.Schema(
  {
    usuario: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true, trim: true },
    rol: { type: String, required: true, trim: true, uppercase: true, default: 'RESPONSABLE' },
    activo: { type: Boolean, default: true },
    hashContrasena: { type: String, required: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, versionKey: false },
);

export const UsuarioModelo = mongoose.models.Usuario || mongoose.model('Usuario', UsuarioEsquema);

export function aUsuarioPlano(documento) {
  if (!documento) return null;
  const objeto = typeof documento.toObject === 'function' ? documento.toObject() : documento;
  return {
    id: String(objeto._id),
    usuario: objeto.usuario,
    nombre: objeto.nombre,
    rol: objeto.rol,
    activo: objeto.activo !== false,
    hashContrasena: objeto.hashContrasena,
    creadoEn: objeto.creadoEn,
    actualizadoEn: objeto.actualizadoEn,
  };
}
