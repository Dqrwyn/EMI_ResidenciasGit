// ==========================================================
//  aplicacion/casosDeUso/gestionarUsuarios.js
//  Alta, edicion, cambio de contrasena y baja de cuentas.
//  Solo el rol ADMINISTRADOR llega hasta aqui (lo garantiza la
//  capa de presentacion).
// ==========================================================

import { ErrorDeConflicto, ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { normalizarUsuario, prepararUsuario } from '../../dominio/entidades/Usuario.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

export function crearGestionarUsuarios({ repositorioUsuarios, cifradoContrasena, repositorioMovimientos }) {
  async function dejarRastro(detalle, usuarioEjecutor) {
    if (!repositorioMovimientos) return;
    await repositorioMovimientos.registrar(
      crearMovimiento({ tipo: TIPOS_MOVIMIENTO.USUARIO, detalle, usuario: usuarioEjecutor }),
    );
  }

  return {
    async listar() {
      const usuarios = await repositorioUsuarios.listar();
      return usuarios.map(({ hashContrasena, ...resto }) => resto);
    },

    async crear({ datos = {}, usuarioEjecutor = null } = {}) {
      const preparado = prepararUsuario(datos);
      const existente = await repositorioUsuarios.buscarPorUsuario(preparado.usuario);
      if (existente) throw new ErrorDeConflicto(`El usuario ${preparado.usuario} ya existe`);

      const hashContrasena = await cifradoContrasena.cifrar(datos.contrasena);
      const creado = await repositorioUsuarios.crear({ ...preparado, hashContrasena });

      await dejarRastro(`Usuario creado: ${creado.usuario} (${creado.rol})`, usuarioEjecutor);

      const { hashContrasena: _, ...sinHash } = creado;
      return sinHash;
    },

    async actualizar({ usuario, cambios = {}, usuarioEjecutor = null } = {}) {
      const usuarioNormalizado = normalizarUsuario(usuario);
      const existente = await repositorioUsuarios.buscarPorUsuario(usuarioNormalizado);
      if (!existente) throw new ErrorNoEncontrado(`El usuario ${usuarioNormalizado} no existe`);

      const preparado = prepararUsuario(
        {
          usuario: existente.usuario,
          nombre: cambios.nombre ?? existente.nombre,
          rol: cambios.rol ?? existente.rol,
          activo: cambios.activo ?? existente.activo,
        },
        { exigirContrasena: false },
      );

      if (existente.rol === 'ADMINISTRADOR' && (preparado.rol !== 'ADMINISTRADOR' || preparado.activo === false)) {
        const administradores = (await repositorioUsuarios.listar()).filter(
          (cuenta) => cuenta.rol === 'ADMINISTRADOR' && cuenta.activo !== false,
        );
        if (administradores.length <= 1) {
          throw new ErrorDeConflicto('No se puede deshabilitar o degradar al unico administrador del sistema');
        }
      }

      const actualizado = await repositorioUsuarios.actualizar(usuarioNormalizado, {
        nombre: preparado.nombre,
        rol: preparado.rol,
        activo: preparado.activo,
      });

      await dejarRastro(`Usuario actualizado: ${usuarioNormalizado}`, usuarioEjecutor);

      const { hashContrasena: _, ...sinHash } = actualizado;
      return sinHash;
    },

    async cambiarContrasena({ usuario, contrasena, usuarioEjecutor = null } = {}) {
      const usuarioNormalizado = normalizarUsuario(usuario);
      const existente = await repositorioUsuarios.buscarPorUsuario(usuarioNormalizado);
      if (!existente) throw new ErrorNoEncontrado(`El usuario ${usuarioNormalizado} no existe`);

      const preparado = prepararUsuario(
        { usuario: existente.usuario, nombre: existente.nombre, rol: existente.rol, contrasena },
      );

      const hashContrasena = await cifradoContrasena.cifrar(contrasena);
      await repositorioUsuarios.actualizar(usuarioNormalizado, { hashContrasena });

      await dejarRastro(`Contrasena cambiada: ${preparado.usuario}`, usuarioEjecutor);
      return { usuario: usuarioNormalizado, actualizado: true };
    },

    async eliminar({ usuario, usuarioEjecutor = null } = {}) {
      const usuarioNormalizado = normalizarUsuario(usuario);
      if (!usuarioNormalizado) throw new ErrorDeValidacion('Debe indicar el usuario que desea eliminar');

      const existente = await repositorioUsuarios.buscarPorUsuario(usuarioNormalizado);
      if (!existente) throw new ErrorNoEncontrado(`El usuario ${usuarioNormalizado} no existe`);
      if (usuarioNormalizado === usuarioEjecutor) throw new ErrorDeConflicto('No puede eliminar su propia cuenta');

      if (existente.rol === 'ADMINISTRADOR') {
        const administradores = (await repositorioUsuarios.listar()).filter(
          (cuenta) => cuenta.rol === 'ADMINISTRADOR' && cuenta.activo !== false,
        );
        if (administradores.length <= 1) {
          throw new ErrorDeConflicto('No se puede eliminar al unico administrador del sistema');
        }
      }

      await repositorioUsuarios.eliminar(usuarioNormalizado);
      await dejarRastro(`Usuario eliminado: ${usuarioNormalizado}`, usuarioEjecutor);
      return { usuario: usuarioNormalizado, eliminado: true };
    },
  };
}
