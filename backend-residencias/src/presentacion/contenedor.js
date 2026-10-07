// ==========================================================
//  presentacion/contenedor.js
//  RAIZ DE COMPOSICION. Es el UNICO archivo del sistema donde se
//  decide que implementacion usa cada contrato ("para
//  IHabitacionRepositorio usaremos HabitacionRepositorioMongo").
//  Gracias a esto, las capas internas no conocen la tecnologia.
// ==========================================================

import { variablesDeEntorno } from '../../config/variablesDeEntorno.js';

// --- Infraestructura -------------------------------------------------
import { HabitacionRepositorioMongo } from '../infraestructura/basedatos/repositorios/HabitacionRepositorioMongo.js';
import { ResidenteRepositorioMongo } from '../infraestructura/basedatos/repositorios/ResidenteRepositorioMongo.js';
import { ActivoRepositorioMongo } from '../infraestructura/basedatos/repositorios/ActivoRepositorioMongo.js';
import { UsuarioRepositorioMongo } from '../infraestructura/basedatos/repositorios/UsuarioRepositorioMongo.js';
import { MovimientoRepositorioMongo } from '../infraestructura/basedatos/repositorios/MovimientoRepositorioMongo.js';
import { crearLectorExcel } from '../infraestructura/excel/lectorExcel.js';
import { crearEscritorExcel } from '../infraestructura/excel/escritorExcel.js';
import { crearCifradoContrasena } from '../infraestructura/seguridad/cifradoContrasena.js';
import { crearServicioToken } from '../infraestructura/seguridad/servicioToken.js';
import { crearLimitadorDeIntentos } from '../infraestructura/seguridad/limitadorDeIntentos.js';
import { crearRegistrador } from '../infraestructura/registro/registrador.js';

// --- Casos de uso ----------------------------------------------------
import { crearSembrarCatalogo } from '../aplicacion/casosDeUso/sembrarCatalogo.js';
import { crearListarHabitaciones } from '../aplicacion/casosDeUso/listarHabitaciones.js';
import { crearObtenerHabitacion } from '../aplicacion/casosDeUso/obtenerHabitacion.js';
import { crearActualizarHabitacion } from '../aplicacion/casosDeUso/actualizarHabitacion.js';
import { crearListarResidentes } from '../aplicacion/casosDeUso/listarResidentes.js';
import { crearBuscarResidentePorCi } from '../aplicacion/casosDeUso/buscarResidentePorCi.js';
import { crearRegistrarResidente } from '../aplicacion/casosDeUso/registrarResidente.js';
import { crearActualizarResidente } from '../aplicacion/casosDeUso/actualizarResidente.js';
import { crearMoverResidente } from '../aplicacion/casosDeUso/moverResidente.js';
import { crearRetirarResidente, crearReactivarResidente } from '../aplicacion/casosDeUso/retirarResidente.js';
import { crearGestionarActivos } from '../aplicacion/casosDeUso/gestionarActivos.js';
import { crearImportarDesdeExcel } from '../aplicacion/casosDeUso/importarDesdeExcel.js';
import { crearExportarExcel } from '../aplicacion/casosDeUso/exportarExcel.js';
import { crearIniciarSesion } from '../aplicacion/casosDeUso/iniciarSesion.js';
import { crearGestionarUsuarios } from '../aplicacion/casosDeUso/gestionarUsuarios.js';
import { crearObtenerResumen } from '../aplicacion/casosDeUso/obtenerResumen.js';
import { crearListarMovimientos } from '../aplicacion/casosDeUso/listarMovimientos.js';

export function crearContenedor({ registrador = crearRegistrador(variablesDeEntorno.nivelRegistro) } = {}) {
  // --- Repositorios (contratos -> implementaciones) -----------------
  const repositorioHabitaciones = new HabitacionRepositorioMongo();
  const repositorioResidentes = new ResidenteRepositorioMongo();
  const repositorioActivos = new ActivoRepositorioMongo();
  const repositorioUsuarios = new UsuarioRepositorioMongo();
  const repositorioMovimientos = new MovimientoRepositorioMongo();

  // --- Servicios de infraestructura ---------------------------------
  const cifradoContrasena = crearCifradoContrasena();
  const servicioToken = crearServicioToken({
    secreto: variablesDeEntorno.jwtSecreto,
    vigencia: variablesDeEntorno.jwtVigencia,
  });
  const lectorExcel = crearLectorExcel();
  const escritorExcel = crearEscritorExcel();
  const limitadorDeIngreso = crearLimitadorDeIntentos({
    maximo: variablesDeEntorno.limiteIntentosIngreso,
    ventanaMs: 60 * 1000,
  });

  // --- Casos de uso -------------------------------------------------
  const dependenciasDeHabitaciones = { repositorioHabitaciones, repositorioResidentes, repositorioActivos };

  const casos = {
    sembrarCatalogo: crearSembrarCatalogo({ repositorioHabitaciones }),
    listarHabitaciones: crearListarHabitaciones(dependenciasDeHabitaciones),
    obtenerHabitacion: crearObtenerHabitacion(dependenciasDeHabitaciones),
    actualizarHabitacion: crearActualizarHabitacion({ repositorioHabitaciones, repositorioMovimientos }),
    listarResidentes: crearListarResidentes(dependenciasDeHabitaciones),
    buscarResidentePorCi: crearBuscarResidentePorCi({ ...dependenciasDeHabitaciones, repositorioMovimientos }),
    registrarResidente: crearRegistrarResidente({
      repositorioHabitaciones,
      repositorioResidentes,
      repositorioMovimientos,
    }),
    actualizarResidente: crearActualizarResidente({
      repositorioHabitaciones,
      repositorioResidentes,
      repositorioMovimientos,
    }),
    moverResidente: crearMoverResidente({ repositorioHabitaciones, repositorioResidentes, repositorioMovimientos }),
    retirarResidente: crearRetirarResidente({ repositorioResidentes, repositorioMovimientos }),
    reactivarResidente: crearReactivarResidente({
      repositorioHabitaciones,
      repositorioResidentes,
      repositorioMovimientos,
    }),
    activos: crearGestionarActivos({ repositorioHabitaciones, repositorioActivos, repositorioMovimientos }),
    importarDesdeExcel: crearImportarDesdeExcel({
      repositorioHabitaciones,
      repositorioResidentes,
      repositorioMovimientos,
      lectorExcel,
    }),
    exportarExcel: crearExportarExcel({ repositorioHabitaciones, repositorioResidentes }),
    iniciarSesion: crearIniciarSesion({
      repositorioUsuarios,
      cifradoContrasena,
      servicioToken,
      repositorioMovimientos,
    }),
    usuarios: crearGestionarUsuarios({ repositorioUsuarios, cifradoContrasena, repositorioMovimientos }),
    obtenerResumen: crearObtenerResumen({
      repositorioHabitaciones,
      repositorioResidentes,
      repositorioActivos,
      repositorioMovimientos,
    }),
    listarMovimientos: crearListarMovimientos({ repositorioMovimientos }),
  };

  return {
    registrador,
    repositorios: {
      repositorioHabitaciones,
      repositorioResidentes,
      repositorioActivos,
      repositorioUsuarios,
      repositorioMovimientos,
    },
    servicios: { cifradoContrasena, servicioToken, lectorExcel, escritorExcel, limitadorDeIngreso },
    casos,
  };
}
