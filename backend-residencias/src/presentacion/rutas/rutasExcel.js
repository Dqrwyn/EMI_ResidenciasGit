// ==========================================================
//  presentacion/rutas/rutasExcel.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasExcel({ controlador, autenticacion, cargaDeArchivos }) {
  const rutas = Router();

  rutas.use(autenticacion);

  rutas.post('/excel/importar', cargaDeArchivos, envolverAsync(controlador.importar));
  rutas.get('/excel/exportar', envolverAsync(controlador.exportar));
  rutas.get('/excel/plantilla/:formato', envolverAsync(controlador.exportar));

  return rutas;
}
