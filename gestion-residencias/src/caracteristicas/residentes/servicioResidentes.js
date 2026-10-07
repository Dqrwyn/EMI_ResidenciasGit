// ==========================================================
//  caracteristicas/residentes/servicioResidentes.js
// ==========================================================

import { clienteHttp } from '../../servicios/clienteHttp.js';

export const servicioResidentes = {
  listar(filtros = {}) {
    return clienteHttp.obtener('/residentes', filtros);
  },

  buscarPorCi(ci) {
    return clienteHttp.obtener('/residentes/buscar', { ci });
  },

  crear(datos) {
    return clienteHttp.crear('/residentes', datos);
  },

  actualizar(ci, cambios) {
    return clienteHttp.actualizar(`/residentes/${encodeURIComponent(ci)}`, cambios);
  },

  mover(ci, { bloqueDestino, habitacionDestino, motivo, permitirSobreOcupacion }) {
    return clienteHttp.crear(`/residentes/${encodeURIComponent(ci)}/mover`, {
      bloqueDestino,
      habitacionDestino,
      motivo,
      permitirSobreOcupacion,
    });
  },

  retirar(ci, { motivo, fechaRetiro }) {
    return clienteHttp.crear(`/residentes/${encodeURIComponent(ci)}/retirar`, { motivo, fechaRetiro });
  },

  reactivar(ci, { bloqueDestino, habitacionDestino, motivo }) {
    return clienteHttp.crear(`/residentes/${encodeURIComponent(ci)}/reactivar`, {
      bloqueDestino,
      habitacionDestino,
      motivo,
    });
  },
};
