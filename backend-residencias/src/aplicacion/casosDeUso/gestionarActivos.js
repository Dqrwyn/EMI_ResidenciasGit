// ==========================================================
//  aplicacion/casosDeUso/gestionarActivos.js
//  Los activos son de la HABITACION: alta, edicion y baja.
// ==========================================================

import { ErrorDeValidacion, ErrorNoEncontrado } from '../../dominio/errores/erroresDeDominio.js';
import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { prepararActivo, prepararCambiosDeActivo } from '../../dominio/entidades/Activo.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';

export function crearGestionarActivos({
  repositorioHabitaciones,
  repositorioActivos,
  repositorioMovimientos,
}) {
  async function verificarHabitacion(bloque, codigo) {
    if (!esBloqueValido(bloque)) throw new ErrorDeValidacion('El bloque indicado no es valido');
    const codigoNormalizado = normalizarCodigoDeHabitacion(codigo);
    const habitacion = await repositorioHabitaciones.obtenerPorCodigo(bloque, codigoNormalizado);
    if (!habitacion) throw new ErrorNoEncontrado(`No existe la habitacion ${codigoNormalizado} en el bloque indicado`);
    return habitacion;
  }

  return {
    async crear({ bloque, habitacionCodigo, datos = {}, usuario = null } = {}) {
      const habitacion = await verificarHabitacion(bloque, habitacionCodigo);
      const activo = prepararActivo({ ...datos, habitacionCodigo: habitacion.codigo });

      const creado = await repositorioActivos.crear({ ...activo, bloque });

      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.ACTIVO,
          habitacionDestino: habitacion.codigo,
          detalle: `Alta de activo: ${creado.nombre}${creado.codigo ? ` (${creado.codigo})` : ''}`,
          usuario,
        }),
      );

      return creado;
    },

    async actualizar({ id, datos = {}, usuario = null } = {}) {
      if (!id) throw new ErrorDeValidacion('Debe indicar el activo que desea actualizar');

      const cambios = prepararCambiosDeActivo(datos);
      const actualizado = await repositorioActivos.actualizar(id, cambios);
      if (!actualizado) throw new ErrorNoEncontrado('El activo indicado no existe');

      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.ACTIVO,
          habitacionDestino: actualizado.habitacionCodigo,
          detalle: `Activo actualizado: ${actualizado.nombre} (${actualizado.estado})`,
          usuario,
        }),
      );

      return actualizado;
    },

    async eliminar({ id, usuario = null } = {}) {
      if (!id) throw new ErrorDeValidacion('Debe indicar el activo que desea eliminar');

      const eliminado = await repositorioActivos.eliminar(id);
      if (!eliminado) throw new ErrorNoEncontrado('El activo indicado no existe');

      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.ACTIVO,
          habitacionOrigen: eliminado.habitacionCodigo,
          detalle: `Baja de activo: ${eliminado.nombre}`,
          usuario,
        }),
      );

      return eliminado;
    },
  };
}
