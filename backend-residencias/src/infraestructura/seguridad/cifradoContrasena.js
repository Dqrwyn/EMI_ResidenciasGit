// ==========================================================
//  infraestructura/seguridad/cifradoContrasena.js
//  Las contrasenas se guardan cifradas (bcrypt). Nunca en texto.
// ==========================================================

import bcrypt from 'bcryptjs';

const RONDAS = 10;

export function crearCifradoContrasena(rondas = RONDAS) {
  return {
    async cifrar(contrasena) {
      return bcrypt.hash(String(contrasena), rondas);
    },

    async verificar(contrasena, hash) {
      if (!hash) return false;
      return bcrypt.compare(String(contrasena), hash);
    },
  };
}
