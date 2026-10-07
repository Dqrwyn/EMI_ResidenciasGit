// ==========================================================
//  dominio/entidades/Movimiento.js
//  Auditoria de todo lo que pasa en la residencia: ingresos,
//  cambios de habitacion, retiros, cambios de datos, activos.
// ==========================================================

export const TIPOS_MOVIMIENTO = {
  INGRESO: 'INGRESO',
  MOVIMIENTO: 'MOVIMIENTO',
  RETIRO: 'RETIRO',
  REINGRESO: 'REINGRESO',
  ACTUALIZACION: 'ACTUALIZACION',
  HABITACION: 'HABITACION',
  ACTIVO: 'ACTIVO',
  IMPORTACION: 'IMPORTACION',
  USUARIO: 'USUARIO',
};

export const ETIQUETAS_MOVIMIENTO = {
  [TIPOS_MOVIMIENTO.INGRESO]: 'Ingreso',
  [TIPOS_MOVIMIENTO.MOVIMIENTO]: 'Cambio de habitacion',
  [TIPOS_MOVIMIENTO.RETIRO]: 'Retiro',
  [TIPOS_MOVIMIENTO.REINGRESO]: 'Reingreso',
  [TIPOS_MOVIMIENTO.ACTUALIZACION]: 'Actualizacion de datos',
  [TIPOS_MOVIMIENTO.HABITACION]: 'Cambio en la habitacion',
  [TIPOS_MOVIMIENTO.ACTIVO]: 'Movimiento de activos',
  [TIPOS_MOVIMIENTO.IMPORTACION]: 'Importacion de Excel',
  [TIPOS_MOVIMIENTO.USUARIO]: 'Gestion de usuarios',
};

export function crearMovimiento({
  tipo,
  residenteCi = null,
  residenteNombre = null,
  habitacionOrigen = null,
  habitacionDestino = null,
  detalle = '',
  usuario = null,
} = {}) {
  if (!Object.values(TIPOS_MOVIMIENTO).includes(tipo)) {
    throw new Error(`Tipo de movimiento desconocido: ${tipo}`);
  }

  return {
    tipo,
    residenteCi: residenteCi || null,
    residenteNombre: residenteNombre || null,
    habitacionOrigen: habitacionOrigen || null,
    habitacionDestino: habitacionDestino || null,
    detalle: String(detalle || '').trim(),
    usuario: usuario || null,
    fecha: new Date(),
  };
}
