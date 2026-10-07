// ==========================================================
//  presentacion/rutas/rutasSalud.js
//  Diagnostico publico: sirve para comprobar que el servidor y
//  la base de datos estan en pie, sin iniciar sesion.
// ==========================================================

import { Router } from 'express';
import mongoose from 'mongoose';

export function crearRutasSalud({ version = '2.0.0' }) {
  const rutas = Router();

  rutas.get('/salud', (_peticion, respuesta) => {
    respuesta.json({
      exito: true,
      datos: {
        estado: 'activo',
        version,
        baseDeDatos: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
        fecha: new Date().toISOString(),
      },
    });
  });

  return rutas;
}
