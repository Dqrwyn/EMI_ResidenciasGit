// ==========================================================
//  caracteristicas/panel/servicioPanel.js
// ==========================================================

import { clienteHttp } from '../../servicios/clienteHttp.js';

export const servicioPanel = {
  obtenerResumen() {
    return clienteHttp.obtener('/panel');
  },

  listarMovimientos(filtros = {}) {
    return clienteHttp.obtener('/movimientos', filtros);
  },
};
