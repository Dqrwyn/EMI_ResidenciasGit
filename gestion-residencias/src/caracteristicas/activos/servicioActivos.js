// ==========================================================
//  caracteristicas/activos/servicioActivos.js
// ==========================================================

import { clienteHttp } from '../../servicios/clienteHttp.js';

export const servicioActivos = {
  crear(datos) {
    return clienteHttp.crear('/activos', datos);
  },

  actualizar(id, cambios) {
    return clienteHttp.actualizar(`/activos/${id}`, cambios);
  },

  eliminar(id) {
    return clienteHttp.eliminar(`/activos/${id}`);
  },
};
