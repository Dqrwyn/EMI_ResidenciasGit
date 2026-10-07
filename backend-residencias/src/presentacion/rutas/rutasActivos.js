// ==========================================================
//  presentacion/rutas/rutasActivos.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasActivos({ controlador, autenticacion }) {
  const rutas = Router();

  rutas.use(autenticacion);

  rutas.post('/activos', envolverAsync(controlador.crear));
  rutas.patch('/activos/:id', envolverAsync(controlador.actualizar));
  rutas.delete('/activos/:id', envolverAsync(controlador.eliminar));

  return rutas;
}
