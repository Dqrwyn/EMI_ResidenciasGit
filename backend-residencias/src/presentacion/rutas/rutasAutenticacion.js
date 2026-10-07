// ==========================================================
//  presentacion/rutas/rutasAutenticacion.js
// ==========================================================

import { Router } from 'express';
import { envolverAsync } from '../utilidades.js';

export function crearRutasAutenticacion({ controlador, autenticacion, limiteDeIngreso }) {
  const rutas = Router();

  rutas.post('/autenticacion/iniciar-sesion', limiteDeIngreso, envolverAsync(controlador.iniciarSesion));
  rutas.get('/autenticacion/yo', autenticacion, envolverAsync(controlador.yo));

  return rutas;
}
