// ==========================================================
//  presentacion/rutas/rutasResidentes.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasResidentes({ controlador, autenticacion }) {
  const rutas = Router();

  rutas.use(autenticacion);

  rutas.get('/residentes', envolverAsync(controlador.listar));
  rutas.get('/residentes/buscar', envolverAsync(controlador.buscarPorCi));
  rutas.post('/residentes', envolverAsync(controlador.crear));
  rutas.patch('/residentes/:ci', envolverAsync(controlador.actualizar));
  rutas.post('/residentes/:ci/mover', envolverAsync(controlador.mover));
  rutas.post('/residentes/:ci/retirar', envolverAsync(controlador.retirar));
  rutas.post('/residentes/:ci/reactivar', envolverAsync(controlador.reactivar));

  return rutas;
}
