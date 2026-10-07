// ==========================================================
//  presentacion/controladores/controladorPanel.js
// ==========================================================

import { responderExito } from '../utilidades.js';

export function crearControladorPanel({ casos }) {
  return {
    async resumen(_peticion, respuesta) {
      const resultado = await casos.obtenerResumen();
      responderExito(respuesta, resultado);
    },

    async movimientos(peticion, respuesta) {
      const resultado = await casos.listarMovimientos(peticion.query || {});
      responderExito(respuesta, resultado);
    },
  };
}
