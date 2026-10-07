// ==========================================================
//  presentacion/middlewares/limiteDePeticiones.js
// ==========================================================

import { ErrorDeDominio } from '../../dominio/errores/erroresDeDominio.js';
import { obtenerIp } from '../utilidades.js';

export function crearLimiteDePeticiones({ limitador, mensaje = 'Demasiados intentos. Espere un momento e intente otra vez.' }) {
  return (peticion, _respuesta, siguiente) => {
    const resultado = limitador.permitir(obtenerIp(peticion));
    if (!resultado.permitido) {
      return siguiente(new ErrorDeDominio(`${mensaje} (vuelva a intentar en ${resultado.esperaSegundos} segundos)`, 429));
    }
    return siguiente();
  };
}
