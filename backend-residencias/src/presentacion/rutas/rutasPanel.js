// ==========================================================
//  presentacion/rutas/rutasPanel.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasPanel({ controlador, controladorCatalogo, autenticacion }) {
  const rutas = Router();

  rutas.use(autenticacion);

  rutas.get('/catalogo', envolverAsync(controladorCatalogo.obtener));
  rutas.get('/panel', envolverAsync(controlador.resumen));
  rutas.get('/movimientos', envolverAsync(controlador.movimientos));

  return rutas;
}
