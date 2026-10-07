// ==========================================================
//  aplicacion/casosDeUso/buscarResidentePorCi.js
//  El buscador principal del sistema: se escribe el CI y se
//  devuelve la ficha completa con su habitacion e historial.
// ==========================================================

import { ErrorNoEncontrado, ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';
import { normalizarCi } from '../../dominio/entidades/Residente.js';

export function crearBuscarResidentePorCi({
  repositorioResidentes,
  repositorioHabitaciones,
  repositorioMovimientos,
  repositorioActivos,
}) {
  return async function buscarResidentePorCi({ ci, incluirHistorial = true } = {}) {
    const ciNormalizado = normalizarCi(ci);
    if (!ciNormalizado) throw new ErrorDeValidacion('Escriba un carnet de identidad para buscar');

    const residente = await repositorioResidentes.buscarPorCi(ciNormalizado);
    if (!residente) throw new ErrorNoEncontrado(`No se encontro ningun residente con el CI ${ciNormalizado}`);

    const habitacion = residente.habitacionCodigo
      ? await repositorioHabitaciones.obtenerPorCodigo(residente.bloque, residente.habitacionCodigo)
      : null;

    const activos = habitacion
      ? await repositorioActivos.listarPorHabitacion(residente.bloque, habitacion.codigo)
      : [];

    const historial = incluirHistorial ? await repositorioMovimientos.listarPorResidente(ciNormalizado, 20) : [];

    return {
      residente,
      habitacion,
      activosDeLaHabitacion: activos,
      historial,
      companerosDeHabitacion: habitacion
        ? (await repositorioResidentes.listarPorHabitacion(residente.bloque, habitacion.codigo)).filter(
            (companero) => companero.ci !== residente.ci,
          )
        : [],
    };
  };
}
