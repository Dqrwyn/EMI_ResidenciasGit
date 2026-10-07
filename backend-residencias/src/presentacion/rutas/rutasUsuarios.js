// ==========================================================
//  presentacion/rutas/rutasUsuarios.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasUsuarios({ controlador, autenticacion, exigirAdministrador }) {
  const rutas = Router();

  rutas.use(autenticacion);
  rutas.use(exigirAdministrador);

  rutas.get('/usuarios', envolverAsync(controlador.listar));
  rutas.post('/usuarios', envolverAsync(controlador.crear));
  rutas.patch('/usuarios/:usuario', envolverAsync(controlador.actualizar));
  rutas.post('/usuarios/:usuario/contrasena', envolverAsync(controlador.cambiarContrasena));
  rutas.delete('/usuarios/:usuario', envolverAsync(controlador.eliminar));

  return rutas;
}
