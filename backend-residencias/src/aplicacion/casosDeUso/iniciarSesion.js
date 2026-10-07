// ==========================================================
//  aplicacion/casosDeUso/iniciarSesion.js
//  Ingreso con usuario y contrasena. Devuelve un token firmado.
// ==========================================================

import { ErrorNoAutorizado, ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';
import { normalizarUsuario } from '../../dominio/entidades/Usuario.js';

export function crearIniciarSesion({ repositorioUsuarios, cifradoContrasena, servicioToken, repositorioMovimientos }) {
  return async function iniciarSesion({ usuario, contrasena } = {}) {
    const usuarioNormalizado = normalizarUsuario(usuario);
    if (!usuarioNormalizado || !contrasena) {
      throw new ErrorDeValidacion('Escriba su usuario y su contrasena');
    }

    const cuenta = await repositorioUsuarios.buscarPorUsuario(usuarioNormalizado);
    if (!cuenta) throw new ErrorNoAutorizado('Usuario o contrasena incorrectos');
    if (cuenta.activo === false) throw new ErrorNoAutorizado('La cuenta esta deshabilitada. Contacte al administrador.');

    const coincide = await cifradoContrasena.verificar(contrasena, cuenta.hashContrasena);
    if (!coincide) throw new ErrorNoAutorizado('Usuario o contrasena incorrectos');

    const token = servicioToken.firmar({
      usuario: cuenta.usuario,
      nombre: cuenta.nombre,
      rol: cuenta.rol,
    });

    if (repositorioMovimientos) {
      await repositorioMovimientos.registrar({
        tipo: 'USUARIO',
        detalle: `Inicio de sesion de ${cuenta.usuario}`,
        usuario: cuenta.usuario,
        fecha: new Date(),
      });
    }

    return {
      token,
      usuario: {
        usuario: cuenta.usuario,
        nombre: cuenta.nombre,
        rol: cuenta.rol,
      },
    };
  };
}
