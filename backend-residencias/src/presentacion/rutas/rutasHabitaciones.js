// ==========================================================
//  presentacion/rutas/rutasHabitaciones.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasHabitaciones({ controlador, autenticacion }) {
  const rutas = Router();

  rutas.use(autenticacion);

  rutas.get('/habitaciones', envolverAsync(controlador.listar));
  rutas.get('/habitaciones/:bloque/:codigo', envolverAsync(controlador.obtener));
  rutas.patch('/habitaciones/:bloque/:codigo', envolverAsync(controlador.actualizar));

  return rutas;
}
