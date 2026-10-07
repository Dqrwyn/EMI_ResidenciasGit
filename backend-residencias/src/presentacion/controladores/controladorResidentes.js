// ==========================================================
//  presentacion/controladores/controladorResidentes.js
// ==========================================================

import { responderExito } from '../utilidades.js';

export function crearControladorResidentes({ casos }) {
  return {
    async listar(peticion, respuesta) {
      const resultado = await casos.listarResidentes(peticion.query || {});
      responderExito(respuesta, resultado);
    },

    async buscarPorCi(peticion, respuesta) {
      const resultado = await casos.buscarResidentePorCi({ ci: peticion.query?.ci });
      responderExito(respuesta, resultado);
    },

    async crear(peticion, respuesta) {
      const resultado = await casos.registrarResidente({
        datos: peticion.body || {},
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado, 201);
    },

    async actualizar(peticion, respuesta) {
      const resultado = await casos.actualizarResidente({
        ci: peticion.params.ci,
        cambios: peticion.body || {},
        usuario: peticion.sesion?.usuario,
        permitirSobreOcupacion: peticion.body?.permitirSobreOcupacion === true,
      });
      responderExito(respuesta, resultado);
    },

    async mover(peticion, respuesta) {
      const resultado = await casos.moverResidente({
        ci: peticion.params.ci,
        bloqueDestino: peticion.body?.bloqueDestino,
        habitacionDestino: peticion.body?.habitacionDestino,
        motivo: peticion.body?.motivo,
        usuario: peticion.sesion?.usuario,
        permitirSobreOcupacion: peticion.body?.permitirSobreOcupacion === true,
      });
      responderExito(respuesta, resultado);
    },

    async retirar(peticion, respuesta) {
      const resultado = await casos.retirarResidente({
        ci: peticion.params.ci,
        motivo: peticion.body?.motivo,
        fechaRetiro: peticion.body?.fechaRetiro,
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },

    async reactivar(peticion, respuesta) {
      const resultado = await casos.reactivarResidente({
        ci: peticion.params.ci,
        bloqueDestino: peticion.body?.bloqueDestino,
        habitacionDestino: peticion.body?.habitacionDestino,
        motivo: peticion.body?.motivo,
        usuario: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },
  };
}
