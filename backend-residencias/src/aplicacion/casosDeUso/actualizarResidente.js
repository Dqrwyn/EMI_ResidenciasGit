// ==========================================================
//  aplicacion/casosDeUso/actualizarResidente.js
//  Edicion de datos. Si se cambia la habitacion, se valida la
//  capacidad y se registra el movimiento correspondiente.
// ==========================================================

import { ErrorDeConflicto, ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { normalizarCi, prepararResidente } from '../../dominio/entidades/Residente.js';
import { validarCapacidad } from '../../dominio/entidades/Habitacion.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

const CAMPOS_EDITABLES = [
  'nombre',
  'tipo',
  'celular',
  'carrera',
  'semestre',
  'codigo',
  'tutorNombre',
  'tutorCelular',
  'cargo',
  'correo',
  'observaciones',
  'fechaIngreso',
  'estado',
  'bloque',
  'habitacionCodigo',
];

export function crearActualizarResidente({
  repositorioHabitaciones,
  repositorioResidentes,
  repositorioMovimientos,
}) {
  return async function actualizarResidente({ ci, cambios = {}, usuario = null, permitirSobreOcupacion = false } = {}) {
    const ciNormalizado = normalizarCi(ci);
    if (!ciNormalizado) throw new ErrorDeValidacion('Debe indicar el CI del residente que desea actualizar');

    const residente = await repositorioResidentes.buscarPorCi(ciNormalizado);
    if (!residente) throw new ErrorNoEncontrado(`No se encontro ningun residente con el CI ${ciNormalizado}`);

    const cambiosPermitidos = {};
    for (const campo of CAMPOS_EDITABLES) {
      if (cambios[campo] !== undefined) cambiosPermitidos[campo] = cambios[campo];
    }

    const fusionados = {
      ...residente,
      ...cambiosPermitidos,
      ci: residente.ci,
    };
    const preparado = prepararResidente(fusionados);

    const bloqueDestino = cambiosPermitidos.bloque !== undefined ? cambiosPermitidos.bloque : residente.bloque;
    const codigoDestino =
      cambiosPermitidos.habitacionCodigo !== undefined
        ? normalizarCodigoDeHabitacion(cambiosPermitidos.habitacionCodigo)
        : residente.habitacionCodigo;

    const cambiaDeHabitacion = codigoDestino !== residente.habitacionCodigo;
    let habitacionDestino = null;

    if (codigoDestino) {
      if (!esBloqueValido(bloqueDestino)) {
        throw new ErrorDeValidacion('Debe indicar el bloque de la habitacion');
      }
      habitacionDestino = await repositorioHabitaciones.obtenerPorCodigo(bloqueDestino, codigoDestino);
      if (!habitacionDestino) {
        throw new ErrorNoEncontrado(`La habitacion ${codigoDestino} no existe en el bloque indicado`);
      }

      if (cambiaDeHabitacion) {
        const ocupantes = await repositorioResidentes.listarPorHabitacion(bloqueDestino, habitacionDestino.codigo);
        validarCapacidad(habitacionDestino, ocupantes.length, { permitirSobreOcupacion });
      }
    } else if (cambiaDeHabitacion) {
      habitacionDestino = null;
    }

    preparado.bloque = codigoDestino ? bloqueDestino : null;

    const actualizado = await repositorioResidentes.actualizar(ciNormalizado, preparado);

    if (cambiaDeHabitacion) {
      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.MOVIMIENTO,
          residenteCi: actualizado.ci,
          residenteNombre: actualizado.nombre,
          habitacionOrigen: residente.habitacionCodigo,
          habitacionDestino: actualizado.habitacionCodigo,
          detalle: cambios.motivo || 'Cambio de habitacion desde la edicion de datos',
          usuario,
        }),
      );
    } else {
      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.ACTUALIZACION,
          residenteCi: actualizado.ci,
          residenteNombre: actualizado.nombre,
          habitacionDestino: actualizado.habitacionCodigo,
          detalle: describirCambios(residente, actualizado, cambiosPermitidos),
          usuario,
        }),
      );
    }

    return actualizado;
  };
}

function describirCambios(antes, despues, cambios) {
  const cambiados = Object.keys(cambios).filter((campo) => {
    const valorAntes = antes[campo] === undefined || antes[campo] === null ? '' : String(antes[campo]);
    const valorDespues = despues[campo] === undefined || despues[campo] === null ? '' : String(despues[campo]);
    return valorAntes !== valorDespues;
  });

  if (cambiados.length === 0) return 'Sin cambios efectivos';
  return `Datos actualizados: ${cambiados.join(', ')}`;
}

export function validarQueElResidenteEsteActivo(residente) {
  if (residente?.estado === 'RETIRADO') {
    throw new ErrorDeConflicto(
      `El residente ${residente.nombre} figura como RETIRADO. Reactive su ficha antes de moverlo de habitacion.`,
    );
  }
}
