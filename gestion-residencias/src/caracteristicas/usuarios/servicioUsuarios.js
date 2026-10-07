// ==========================================================
//  caracteristicas/usuarios/servicioUsuarios.js
// ==========================================================

import { clienteHttp } from '../../servicios/clienteHttp.js';

export const servicioUsuarios = {
  listar() {
    return clienteHttp.obtener('/usuarios');
  },

  crear(datos) {
    return clienteHttp.crear('/usuarios', datos);
  },

  actualizar(usuario, cambios) {
    return clienteHttp.actualizar(`/usuarios/${encodeURIComponent(usuario)}`, cambios);
  },

  cambiarContrasena(usuario, contrasena) {
    return clienteHttp.crear(`/usuarios/${encodeURIComponent(usuario)}/contrasena`, { contrasena });
  },

  eliminar(usuario) {
    return clienteHttp.eliminar(`/usuarios/${encodeURIComponent(usuario)}`);
  },
};
