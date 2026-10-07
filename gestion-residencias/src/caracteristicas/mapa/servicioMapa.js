// ==========================================================
//  caracteristicas/mapa/servicioMapa.js
// ==========================================================

import { clienteHttp } from '../../servicios/clienteHttp.js';

export const servicioMapa = {
  listarHabitaciones(bloque) {
    return clienteHttp.obtener('/habitaciones', { bloque });
  },

  obtenerHabitacion(bloque, codigo) {
    return clienteHttp.obtener(`/habitaciones/${bloque}/${encodeURIComponent(codigo)}`);
  },

  actualizarHabitacion(bloque, codigo, cambios) {
    return clienteHttp.actualizar(`/habitaciones/${bloque}/${encodeURIComponent(codigo)}`, cambios);
  },
};
