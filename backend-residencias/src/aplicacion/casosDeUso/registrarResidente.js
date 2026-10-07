// ==========================================================
//  aplicacion/casosDeUso/registrarResidente.js
// ==========================================================

import { ErrorDeConflicto, ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { prepararResidente } from '../../dominio/entidades/Residente.js';
import { validarCapacidad } from '../../dominio/entidades/Habitacion.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

export function crearRegistrarResidente({
  repositorioHabitaciones,
  repositorioResidentes,
  repositorioMovimientos,
}) {
  return async function registrarResidente({ datos = {}, usuario = null } = {}) {
    const residente = prepararResidente(datos);

    const existente = await repositorioResidentes.buscarPorCi(residente.ci);
    if (existente) {
      throw new ErrorDeConflicto(
        `Ya existe un residente con el CI ${residente.ci} (${existente.nombre}). Use la edicion para actualizar sus datos.`,
      );
    }

    if (residente.habitacionCodigo) {
      if (!esBloqueValido(residente.bloque)) {
        throw new ErrorDeValidacion('Debe indicar el bloque al que pertenece la habitacion');
      }

      const habitacion = await repositorioHabitaciones.obtenerPorCodigo(residente.bloque, residente.habitacionCodigo);
      if (!habitacion) {
        throw new ErrorNoEncontrado(
          `La habitacion ${residente.habitacionCodigo} no existe en el bloque seleccionado`,
        );
      }

      const ocupantes = await repositorioResidentes.listarPorHabitacion(residente.bloque, habitacion.codigo);
      validarCapacidad(habitacion, ocupantes.length);
      residente.habitacionCodigo = habitacion.codigo;
    }

    const creado = await repositorioResidentes.crear(residente);

    await repositorioMovimientos.registrar(
      crearMovimiento({
        tipo: TIPOS_MOVIMIENTO.INGRESO,
        residenteCi: creado.ci,
        residenteNombre: creado.nombre,
        habitacionDestino: creado.habitacionCodigo,
        detalle: 'Registro de residente',
        usuario,
      }),
    );

    return creado;
  };
}
