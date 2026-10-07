// ==========================================================
//  aplicacion/casosDeUso/sembrarCatalogo.js
//  Copia el catalogo oficial (objetosValor/CatalogoHabitaciones)
//  a la base de datos. Nunca borra ni pisa la capacidad, el costo
//  o el estado que el personal haya cambiado a mano.
// ==========================================================

import { generarCatalogoHabitaciones } from '../../dominio/objetosValor/CatalogoHabitaciones.js';

export function crearSembrarCatalogo({ repositorioHabitaciones }) {
  return async function sembrarCatalogo() {
    const definiciones = generarCatalogoHabitaciones();
    const resultado = await repositorioHabitaciones.sincronizarCatalogo(definiciones);
    return {
      total: definiciones.length,
      creadas: resultado?.creadas ?? 0,
      existentes: resultado?.existentes ?? 0,
    };
  };
}
