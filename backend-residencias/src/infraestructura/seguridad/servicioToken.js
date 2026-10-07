// ==========================================================
//  infraestructura/seguridad/servicioToken.js
//  Sesiones firmadas con JWT.
// ==========================================================

import jwt from 'jsonwebtoken';
import { ErrorNoAutorizado, ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';

const LONGITUD_MINIMA_CLAVE = 32;

export function crearServicioToken({ secreto, vigencia = '12h' }) {
  if (!secreto || secreto.length < LONGITUD_MINIMA_CLAVE) {
    throw new ErrorDeValidacion(
      'La variable JWT_SECRETO debe tener al menos 32 caracteres. Revise el archivo .env del backend.',
    );
  }

  return {
    firmar(datos) {
      return jwt.sign(datos, secreto, { expiresIn: vigencia });
    },

    verificar(token) {
      try {
        return jwt.verify(token, secreto);
      } catch {
        throw new ErrorNoAutorizado('Su sesion expiro o el token no es valido. Vuelva a iniciar sesion.');
      }
    },

    obtenerDeEncabezado(encabezadoAutorizacion) {
      if (!encabezadoAutorizacion) return null;
      const [tipo, token] = String(encabezadoAutorizacion).split(' ');
      if (tipo !== 'Bearer' || !token) return null;
      return token;
    },
  };
}
