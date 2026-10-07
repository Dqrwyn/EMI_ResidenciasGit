// ==========================================================
//  dominio/entidades/Habitacion.js
//  Reglas de la habitacion: capacidad, costo, estado y ocupacion.
//  Una habitacion NO conoce la base de datos ni el Excel.
// ==========================================================

import { ErrorDeConflicto, ErrorDeValidacion } from '../errores/erroresDeDominio.js';
import { CAPACIDAD_POR_DEFECTO } from '../objetosValor/TipoHabitacion.js';

export const ESTADOS_HABITACION = {
  ACTIVA: 'ACTIVA',
  EN_MANTENIMIENTO: 'EN_MANTENIMIENTO',
};

export const ETIQUETAS_ESTADO_HABITACION = {
  [ESTADOS_HABITACION.ACTIVA]: 'Activa',
  [ESTADOS_HABITACION.EN_MANTENIMIENTO]: 'En mantenimiento',
};

export const ESTADOS_OCUPACION = {
  VACIA: 'VACIA',
  PARCIAL: 'PARCIAL',
  LLENA: 'LLENA',
  EXCEDIDA: 'EXCEDIDA',
};

export const ETIQUETAS_OCUPACION = {
  [ESTADOS_OCUPACION.VACIA]: 'Vacia',
  [ESTADOS_OCUPACION.PARCIAL]: 'Con espacio',
  [ESTADOS_OCUPACION.LLENA]: 'Llena',
  [ESTADOS_OCUPACION.EXCEDIDA]: 'Excedida',
};

export function capacidadPorDefectoDe(tipo) {
  return CAPACIDAD_POR_DEFECTO[tipo] ?? 1;
}

export function prepararCambiosDeHabitacion(datos = {}) {
  const cambios = {};

  if (datos.capacidad !== undefined) {
    const capacidad = Number.parseInt(datos.capacidad, 10);
    if (Number.isNaN(capacidad) || capacidad < 1 || capacidad > 20) {
      throw new ErrorDeValidacion('La capacidad debe ser un numero entre 1 y 20');
    }
    cambios.capacidad = capacidad;
  }

  if (datos.costo !== undefined) {
    const costo = Number(datos.costo);
    if (Number.isNaN(costo) || costo < 0) {
      throw new ErrorDeValidacion('El costo debe ser un numero mayor o igual a cero');
    }
    cambios.costo = costo;
  }

  if (datos.estado !== undefined) {
    const estado = String(datos.estado).trim().toUpperCase();
    if (!Object.values(ESTADOS_HABITACION).includes(estado)) {
      throw new ErrorDeValidacion('El estado de la habitacion no es valido');
    }
    cambios.estado = estado;
  }

  if (datos.observaciones !== undefined) {
    cambios.observaciones = String(datos.observaciones || '').trim();
  }

  if (Object.keys(cambios).length === 0) {
    throw new ErrorDeValidacion('No se envio ningun cambio para la habitacion');
  }

  return cambios;
}

export function calcularOcupacion(habitacion, cantidadDeResidentes = 0) {
  const capacidad = habitacion?.capacidad || 0;
  const cantidad = Number(cantidadDeResidentes) || 0;
  const libres = capacidad - cantidad;

  let estado = ESTADOS_OCUPACION.VACIA;
  if (cantidad > capacidad) estado = ESTADOS_OCUPACION.EXCEDIDA;
  else if (cantidad === capacidad && capacidad > 0) estado = ESTADOS_OCUPACION.LLENA;
  else if (cantidad > 0) estado = ESTADOS_OCUPACION.PARCIAL;

  return { capacidad, cantidad, libres, estado };
}

export function validarCapacidad(habitacion, cantidadActual, opciones = {}) {
  if (!habitacion) {
    throw new ErrorDeValidacion('La habitacion indicada no existe');
  }

  if (habitacion.estado === ESTADOS_HABITACION.EN_MANTENIMIENTO && !opciones.permitirSobreOcupacion) {
    throw new ErrorDeConflicto(`La habitacion ${habitacion.codigo} esta en mantenimiento y no admite residentes`);
  }

  if (opciones.permitirSobreOcupacion) return;

  const capacidad = habitacion.capacidad || 0;
  if (cantidadActual + 1 > capacidad) {
    throw new ErrorDeConflicto(
      `La habitacion ${habitacion.codigo} ya alcanzo su capacidad de ${capacidad} persona(s). ` +
        'Aumente la capacidad de la habitacion o elija otra.',
    );
  }
}
