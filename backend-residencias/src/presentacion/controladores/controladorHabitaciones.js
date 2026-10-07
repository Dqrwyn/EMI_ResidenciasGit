// ==========================================================
//  presentacion/controladores/controladorHabitaciones.js
// ==========================================================

import { responderExito } from '../utilidades.js';

export function crearControladorHabitaciones({ casos }) {
  return {
    async listar(peticion, respuesta) {
      const resultado = await casos.listarHabitaciones({ bloque: peticion.query?.bloque });
      responderExito(respuesta, resultado);
    },

    async obtener(peticion, respuesta) {
      const resultado = await casos.obtenerHabitacion({
        bloque: peticion.params.bloque,
        codigo: peticion.params.codigo,
      });
      responderExito(respuesta, resultado);
    },

    async actualizar(peticion, respuesta) {
      const resultado = await casos.actualizarHabitacion({
        bloque: peticion.params.bloque,
        codigo: peticion.params.codigo,
        cambios: peticion.body || {},
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },
  };
}
