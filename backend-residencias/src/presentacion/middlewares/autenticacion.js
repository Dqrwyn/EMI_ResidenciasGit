// ==========================================================
//  presentacion/middlewares/autenticacion.js
//  Verifica el token y deja la sesion en peticion.sesion.
// ==========================================================

import { ErrorNoAutorizado, ErrorProhibido } from '../../dominio/errores/erroresDeDominio.js';
import { ROLES } from '../../dominio/objetosValor/RolUsuario.js';
import { envolverAsync } from '../utilidades.js';

export function crearAutenticacion({ servicioToken, repositorioUsuarios }) {
  return envolverAsync(async (peticion, _respuesta, siguiente) => {
    const token = servicioToken.obtenerDeEncabezado(peticion.headers?.authorization);
    if (!token) throw new ErrorNoAutorizado();

    const datos = servicioToken.verificar(token);

    // La cuenta debe seguir existiendo y habilitada en este momento.
    const cuenta = await repositorioUsuarios.buscarPorUsuario(datos.usuario);
    if (!cuenta || cuenta.activo === false) {
      throw new ErrorNoAutorizado('Su cuenta ya no esta habilitada. Contacte al administrador.');
    }

    peticion.sesion = {
      usuario: cuenta.usuario,
      nombre: cuenta.nombre,
      rol: cuenta.rol,
    };

    siguiente();
  });
}

export function exigirAdministrador(peticion, _respuesta, siguiente) {
  if (peticion.sesion?.rol !== ROLES.ADMINISTRADOR) {
    return siguiente(new ErrorProhibido('Solo el administrador puede realizar esta operacion'));
  }
  return siguiente();
}

export function exigirRol(...rolesPermitidos) {
  return (peticion, _respuesta, siguiente) => {
    if (!rolesPermitidos.includes(peticion.sesion?.rol)) {
      return siguiente(new ErrorProhibido('Su rol no tiene permiso para realizar esta operacion'));
    }
    return siguiente();
  };
}
