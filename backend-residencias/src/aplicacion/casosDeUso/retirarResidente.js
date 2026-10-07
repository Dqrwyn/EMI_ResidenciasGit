// ==========================================================
//  aplicacion/casosDeUso/retirarResidente.js
//  Retiro (libera la habitacion) y reingreso de un residente.
// ==========================================================

import { ErrorDeConflicto, ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { normalizarCi, normalizarFecha } from '../../dominio/entidades/Residente.js';
import { validarCapacidad } from '../../dominio/entidades/Habitacion.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

export function crearRetirarResidente({ repositorioResidentes, repositorioMovimientos }) {
  return async function retirarResidente({ ci, motivo = '', fechaRetiro = null, usuario = null } = {}) {
    const ciNormalizado = normalizarCi(ci);
    if (!ciNormalizado) throw new ErrorDeValidacion('Debe indicar el CI del residente');

    const residente = await repositorioResidentes.buscarPorCi(ciNormalizado);
    if (!residente) throw new ErrorNoEncontrado(`No se encontro ningun residente con el CI ${ciNormalizado}`);
    if (residente.estado === 'RETIRADO') throw new ErrorDeConflicto(`${residente.nombre} ya figura como RETIRADO`);

    const actualizado = await repositorioResidentes.actualizar(ciNormalizado, {
      ...residente,
      estado: 'RETIRADO',
      fechaRetiro: normalizarFecha(fechaRetiro || new Date()),
      observaciones: motivo ? `${residente.observaciones ? `${residente.observaciones} | ` : ''}RETIRO: ${motivo}` : residente.observaciones,
    });

    await repositorioMovimientos.registrar(
      crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.RETIRO,
        residenteCi: actualizado.ci,
        residenteNombre: actualizado.nombre,
        habitacionOrigen: residente.habitacionCodigo,
        detalle: motivo || 'Retiro de la residencia',
        usuario,
      }),
    );

    return actualizado;
  };
}

export function crearReactivarResidente({ repositorioHabitaciones, repositorioResidentes, repositorioMovimientos }) {
  return async function reactivarResidente({
    ci,
    bloqueDestino = null,
    habitacionDestino = null,
    motivo = '',
    usuario = null,
  } = {}) {
    const ciNormalizado = normalizarCi(ci);
    if (!ciNormalizado) throw new ErrorDeValidacion('Debe indicar el CI del residente');

    const residente = await repositorioResidentes.buscarPorCi(ciNormalizado);
    if (!residente) throw new ErrorNoEncontrado(`No se encontro ningun residente con el CI ${ciNormalizado}`);
    if (residente.estado === 'ACTIVO') throw new ErrorDeConflicto(`${residente.nombre} ya figura como ACTIVO`);

    let habitacion = null;
    let bloque = residente.bloque;

    if (habitacionDestino) {
      if (!esBloqueValido(bloqueDestino)) throw new ErrorDeValidacion('Debe indicar el bloque de la habitacion');
      const codigo = normalizarCodigoDeHabitacion(habitacionDestino);
      habitacion = await repositorioHabitaciones.obtenerPorCodigo(bloqueDestino, codigo);
      if (!habitacion) throw new ErrorNoEncontrado(`La habitacion ${codigo} no existe en el bloque indicado`);

      const ocupantes = await repositorioResidentes.listarPorHabitacion(bloqueDestino, habitacion.codigo);
      validarCapacidad(habitacion, ocupantes.length);
      bloque = bloqueDestino;
    }

    const actualizado = await repositorioResidentes.actualizar(ciNormalizado, {
      ...residente,
      estado: 'ACTIVO',
      fechaRetiro: '',
      bloque: habitacion ? bloque : null,
      habitacionCodigo: habitacion ? habitacion.codigo : null,
      observaciones: motivo
        ? `${residente.observaciones ? `${residente.observaciones} | ` : ''}REINGRESO: ${motivo}`
        : residente.observaciones,
    });

    await repositorioMovimientos.registrar(
      crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.REINGRESO,
        residenteCi: actualizado.ci,
        residenteNombre: actualizado.nombre,
        habitacionDestino: actualizado.habitacionCodigo,
        detalle: motivo || 'Reingreso a la residencia',
        usuario,
      }),
    );

    return actualizado;
  };
}
