// ==========================================================
//  aplicacion/servicios/ordenDeHabitaciones.js
//  Orden oficial: piso (planta baja, primer piso, segundo piso),
//  luego lado (izquierdo, derecho) y luego la posicion (arriba,
//  medio, abajo).
// ==========================================================

import { LADOS } from '../../dominio/objetosValor/CatalogoHabitaciones.js';

const ORDEN_PISOS = { PB: 0, P1: 1, P2: 2 };
const ORDEN_LADOS = { [LADOS.IZQUIERDO]: 0, [LADOS.DERECHO]: 1 };

export function compararHabitaciones(a, b) {
  const pisoA = ORDEN_PISOS[a.piso] ?? 9;
  const pisoB = ORDEN_PISOS[b.piso] ?? 9;
  if (pisoA !== pisoB) return pisoA - pisoB;

  const ladoA = ORDEN_LADOS[a.lado] ?? 9;
  const ladoB = ORDEN_LADOS[b.lado] ?? 9;
  if (ladoA !== ladoB) return ladoA - ladoB;

  const ordenA = a.orden ?? numeroDeHabitacion(a.codigo);
  const ordenB = b.orden ?? numeroDeHabitacion(b.codigo);
  if (ordenA !== ordenB) return ordenA - ordenB;

  return String(a.codigo).localeCompare(String(b.codigo));
}

export function ordenarHabitaciones(habitaciones = []) {
  return [...habitaciones].sort(compararHabitaciones);
}

function numeroDeHabitacion(codigo = '') {
  const partes = String(codigo).match(/(\d+)$/);
  return partes ? Number.parseInt(partes[1], 10) : 0;
}

export function agruparPorPiso(habitaciones = []) {
  const grupos = new Map();
  for (const habitacion of ordenarHabitaciones(habitaciones)) {
    const piso = habitacion.piso || 'UNICO';
    if (!grupos.has(piso)) grupos.set(piso, []);
    grupos.get(piso).push(habitacion);
  }
  return grupos;
}

export function agruparPorLado(habitacionesDelPiso = []) {
  return {
    [LADOS.IZQUIERDO]: habitacionesDelPiso.filter((habitacion) => habitacion.lado === LADOS.IZQUIERDO),
    [LADOS.DERECHO]: habitacionesDelPiso.filter((habitacion) => habitacion.lado === LADOS.DERECHO),
  };
}
