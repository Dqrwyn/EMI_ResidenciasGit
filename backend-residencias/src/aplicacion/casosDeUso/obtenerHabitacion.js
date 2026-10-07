// ==========================================================
//  aplicacion/casosDeUso/obtenerHabitacion.js
//  Detalle completo de una habitacion: datos, residentes y activos.
// ==========================================================

import { ErrorNoEncontrado, ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { calcularOcupacion } from '../../dominio/entidades/Habitacion.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';

export function crearObtenerHabitacion({ repositorioHabitaciones, repositorioResidentes, repositorioActivos }) {
  return async function obtenerHabitacion({ bloque, codigo } = {}) {
    if (!esBloqueValido(bloque)) throw new ErrorDeValidacion('El bloque indicado no es valido');

    const codigoNormalizado = normalizarCodigoDeHabitacion(codigo);
    const habitacion = await repositorioHabitaciones.obtenerPorCodigo(bloque, codigoNormalizado);
    if (!habitacion) throw new ErrorNoEncontrado(`No existe la habitacion ${codigoNormalizado} en el bloque indicado`);

    const [residentes, activos] = await Promise.all([
      repositorioResidentes.listarPorHabitacion(bloque, codigoNormalizado),
      repositorioActivos.listarPorHabitacion(bloque, codigoNormalizado),
    ]);

    return {
      habitacion,
      ocupacion: calcularOcupacion(habitacion, residentes.length),
      residentes,
      activos: [...activos].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es')),
    };
  };
}
