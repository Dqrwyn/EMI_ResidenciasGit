// ==========================================================
//  presentacion/controladores/controladorUsuarios.js
//  Solo accesible con rol ADMINISTRADOR.
// ==========================================================

import { responderExito } from '../utilidades.js';

export function crearControladorUsuarios({ casos }) {
  return {
    async listar(_peticion, respuesta) {
      responderExito(respuesta, await casos.usuarios.listar());
    },

    async crear(peticion, respuesta) {
      const resultado = await casos.usuarios.crear({
        datos: peticion.body || {},
        usuarioEjecutor: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado, 201);
    },

    async actualizar(peticion, respuesta) {
      const resultado = await casos.usuarios.actualizar({
        usuario: peticion.params.usuario,
        cambios: peticion.body || {},
        usuarioEjecutor: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },

    async cambiarContrasena(peticion, respuesta) {
      const resultado = await casos.usuarios.cambiarContrasena({
        usuario: peticion.params.usuario,
        contrasena: peticion.body?.contrasena,
        usuarioEjecutor: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },

    async eliminar(peticion, respuesta) {
      const resultado = await casos.usuarios.eliminar({
        usuario: peticion.params.usuario,
        usuarioEjecutor: peticion.sesion?.usuario,
      });
      responderExito(respuesta, resultado);
    },
  };
}
