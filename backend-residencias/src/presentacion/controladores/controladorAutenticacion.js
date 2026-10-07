// ==========================================================
//  presentacion/controladores/controladorAutenticacion.js
// ==========================================================

import { responderExito } from '../utilidades.js';

export function crearControladorAutenticacion({ casos }) {
  return {
    async iniciarSesion(peticion, respuesta) {
      const resultado = await casos.iniciarSesion({
        usuario: peticion.body?.usuario,
        contrasena: peticion.body?.contrasena,
      });
      responderExito(respuesta, resultado);
    },

    async yo(peticion, respuesta) {
      responderExito(respuesta, { usuario: peticion.sesion });
    },
  };
}
