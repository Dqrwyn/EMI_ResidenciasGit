// ==========================================================
//  presentacion/controladores/controladorActivos.js
//  Los activos se administran desde la habitacion.
// ==========================================================

import { responderExito } from '../utilidades.js';

export function crearControladorActivos({ casos }) {
  return {
    async crear(peticion, respuesta) {
      const resultado = await casos.activos.crear({
        bloque: peticion.body?.bloque,
        habitacionCodigo: peticion.body?.habitacionCodigo,
        datos: peticion.body || {},
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado, 201);
    },

    async actualizar(peticion, respuesta) {
      const resultado = await casos.activos.actualizar({
        id: peticion.params.id,
        datos: peticion.body || {},
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },

    async eliminar(peticion, respuesta) {
      const resultado = await casos.activos.eliminar({
        id: peticion.params.id,
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },
  };
}
