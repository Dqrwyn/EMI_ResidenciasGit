// ==========================================================
//  aplicacion/casosDeUso/moverResidente.js
//  Cambia a un residente de habitacion CONSERVANDO TODOS SUS
//  DATOS. Solo se valida la habitacion de destino.
// ==========================================================

import { ErrorDeConflicto, ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { normalizarCi } from '../../dominio/entidades/Residente.js';
import { validarCapacidad } from '../../dominio/entidades/Habitacion.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

export function crearMoverResidente({
  repositorioHabitaciones,
  repositorioResidentes,
  repositorioMovimientos,
}) {
  return async function moverResidente({
    ci,
    bloqueDestino,
    habitacionDestino,
    motivo = 'Cambio de habitacion',
    usuario = null,
    permitirSobreOcupacion = false,
  } = {}) {
    const ciNormalizado = normalizarCi(ci);
    if (!ciNormalizado) throw new ErrorDeValidacion('Debe indicar el CI del residente que desea mover');

    const residente = await repositorioResidentes.buscarPorCi(ciNormalizado);
    if (!residente) throw new ErrorNoEncontrado(`No se encontro ningun residente con el CI ${ciNormalizado}`);

    if (residente.estado === 'RETIRADO') {
      throw new ErrorDeConflicto(
        `El residente ${residente.nombre} figura como RETIRADO. Reactive su ficha antes de moverlo de habitacion.`,
      );
    }

    if (!esBloqueValido(bloqueDestino)) throw new ErrorDeValidacion('Debe indicar el bloque de la habitacion de destino');

    const codigoDestino = normalizarCodigoDeHabitacion(habitacionDestino);
    if (!codigoDestino) throw new ErrorDeValidacion('Debe indicar la habitacion de destino');

    if (residente.habitacionCodigo === codigoDestino && residente.bloque === bloqueDestino) {
      throw new ErrorDeConflicto(`El residente ya se encuentra en la habitacion ${codigoDestino}`);
    }

    const habitacion = await repositorioHabitaciones.obtenerPorCodigo(bloqueDestino, codigoDestino);
    if (!habitacion) {
      throw new ErrorNoEncontrado(`La habitacion ${codigoDestino} no existe en el bloque indicado`);
    }

    const ocupantes = await repositorioResidentes.listarPorHabitacion(bloqueDestino, habitacion.codigo);
    validarCapacidad(habitacion, ocupantes.length, { permitirSobreOcupacion });

    const actualizado = await repositorioResidentes.actualizar(ciNormalizado, {
      ...residente,
      bloque: bloqueDestino,
      habitacionCodigo: habitacion.codigo,
    });

    await repositorioMovimientos.registrar(
      crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.MOVIMIENTO,
        residenteCi: actualizado.ci,
        residenteNombre: actualizado.nombre,
        habitacionOrigen: residente.habitacionCodigo,
        habitacionDestino: habitacion.codigo,
        detalle: motivo,
        usuario,
      }),
    );

    return {
      residente: actualizado,
      habitacionDestino: habitacion,
      habitacionOrigen: residente.habitacionCodigo,
    };
  };
}
