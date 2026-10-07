// ==========================================================
//  aplicacion/casosDeUso/actualizarHabitacion.js
// ==========================================================

import { ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { prepararCambiosDeHabitacion } from '../../dominio/entidades/Habitacion.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

export function crearActualizarHabitacion({ repositorioHabitaciones, repositorioMovimientos }) {
  return async function actualizarHabitacion({ bloque, codigo, cambios, usuario } = {}) {
    if (!esBloqueValido(bloque)) throw new ErrorDeValidacion('El bloque indicado no es valido');

    const codigoNormalizado = normalizarCodigoDeHabitacion(codigo);
    const habitacion = await repositorioHabitaciones.obtenerPorCodigo(bloque, codigoNormalizado);
    if (!habitacion) throw new ErrorNoEncontrado(`No existe la habitacion ${codigoNormalizado}`);

    const cambiosLimpios = prepararCambiosDeHabitacion(cambios);
    const actualizada = await repositorioHabitaciones.actualizar(bloque, codigoNormalizado, cambiosLimpios);

    const detalles = [];
    if (cambiosLimpios.capacidad !== undefined && cambiosLimpios.capacidad !== habitacion.capacidad) {
      detalles.push(`capacidad ${habitacion.capacidad} -> ${cambiosLimpios.capacidad}`);
    }
    if (cambiosLimpios.costo !== undefined && cambiosLimpios.costo !== habitacion.costo) {
      detalles.push(`costo ${habitacion.costo} -> ${cambiosLimpios.costo}`);
    }
    if (cambiosLimpios.estado !== undefined && cambiosLimpios.estado !== habitacion.estado) {
      detalles.push(`estado ${habitacion.estado} -> ${cambiosLimpios.estado}`);
    }
    if (cambiosLimpios.observaciones !== undefined) detalles.push('observaciones actualizadas');

    await repositorioMovimientos.registrar(
      crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.HABITACION,
        habitacionOrigen: codigoNormalizado,
        detalle: detalles.join(', '),
        usuario,
      }),
    );

    return actualizada;
  };
}
