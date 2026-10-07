// ==========================================================
//  presentacion/aplicacionExpress.js
//  Une middlewares, controladores y rutas. Ninguna regla de
//  negocio vive aqui.
// ==========================================================

import express from 'express';
import cors from 'cors';

import { variablesDeEntorno } from '../../config/variablesDeEntorno.js';
import { crearContenedor } from './contenedor.js';
import { crearAutenticacion, exigirAdministrador } from './middlewares/autenticacion.js';
import { crearCargaDeArchivos } from './middlewares/cargaDeArchivos.js';
import { crearLimiteDePeticiones } from './middlewares/limiteDePeticiones.js';
import { crearManejadorDeErrores, manejadorDeRutaNoEncontrada } from './middlewares/manejadorDeErrores.js';

import { crearControladorAutenticacion } from './controladores/controladorAutenticacion.js';
import { crearControladorCatalogo } from './controladores/controladorCatalogo.js';
import { crearControladorHabitaciones } from './controladores/controladorHabitaciones.js';
import { crearControladorResidentes } from './controladores/controladorResidentes.js';
import { crearControladorActivos } from './controladores/controladorActivos.js';
import { crearControladorExcel } from './controladores/controladorExcel.js';
import { crearControladorPanel } from './controladores/controladorPanel.js';
import { crearControladorUsuarios } from './controladores/controladorUsuarios.js';

import { crearRutasSalud } from './rutas/rutasSalud.js';
import { crearRutasAutenticacion } from './rutas/rutasAutenticacion.js';
import { crearRutasPanel } from './rutas/rutasPanel.js';
import { crearRutasHabitaciones } from './rutas/rutasHabitaciones.js';
import { crearRutasResidentes } from './rutas/rutasResidentes.js';
import { crearRutasActivos } from './rutas/rutasActivos.js';
import { crearRutasExcel } from './rutas/rutasExcel.js';
import { crearRutasUsuarios } from './rutas/rutasUsuarios.js';

export function crearAplicacion({ contenedor = crearContenedor() } = {}) {
  const { casos, servicios, repositorios, registrador } = contenedor;

  const aplicacion = express();
  aplicacion.disable('x-powered-by');
  aplicacion.use(cors({ origin: variablesDeEntorno.origenesPermitidos, credentials: true }));
  aplicacion.use(express.json({ limit: '5mb' }));
  aplicacion.use(express.urlencoded({ extended: true, limit: '5mb' }));

  const autenticacion = crearAutenticacion({
    servicioToken: servicios.servicioToken,
    repositorioUsuarios: repositorios.repositorioUsuarios,
  });

  const cargaDeArchivos = crearCargaDeArchivos();

  const limiteDeIngreso = crearLimiteDePeticiones({
    limitador: servicios.limitadorDeIngreso,
    mensaje: 'Demasiados intentos de ingreso.',
  });

  const controladores = {
    autenticacion: crearControladorAutenticacion({ casos }),
    catalogo: crearControladorCatalogo(),
    habitaciones: crearControladorHabitaciones({ casos }),
    residentes: crearControladorResidentes({ casos }),
    activos: crearControladorActivos({ casos }),
    excel: crearControladorExcel({ casos, escritorExcel: servicios.escritorExcel }),
    panel: crearControladorPanel({ casos }),
    usuarios: crearControladorUsuarios({ casos }),
  };

  aplicacion.use('/api', crearRutasSalud({}));
  aplicacion.use('/api', crearRutasAutenticacion({ controlador: controladores.autenticacion, autenticacion, limiteDeIngreso }));
  aplicacion.use('/api', crearRutasPanel({ controlador: controladores.panel, controladorCatalogo: controladores.catalogo, autenticacion }));
  aplicacion.use('/api', crearRutasHabitaciones({ controlador: controladores.habitaciones, autenticacion }));
  aplicacion.use('/api', crearRutasResidentes({ controlador: controladores.residentes, autenticacion }));
  aplicacion.use('/api', crearRutasActivos({ controlador: controladores.activos, autenticacion }));
  aplicacion.use('/api', crearRutasExcel({ controlador: controladores.excel, autenticacion, cargaDeArchivos }));
  aplicacion.use('/api', crearRutasUsuarios({ controlador: controladores.usuarios, autenticacion, exigirAdministrador }));

  aplicacion.use(manejadorDeRutaNoEncontrada);
  aplicacion.use(crearManejadorDeErrores({ registrador }));

  return aplicacion;
}
