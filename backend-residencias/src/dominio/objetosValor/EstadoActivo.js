// ==========================================================
//  dominio/objetosValor/EstadoActivo.js
//  Estado fisico de un activo (bien) de la habitacion.
// ==========================================================

export const ESTADOS_ACTIVO = {
  OPTIMO: 'OPTIMO',
  DETERIORADO: 'DETERIORADO',
  EN_REPARACION: 'EN_REPARACION',
  NO_UBICADO: 'NO_UBICADO',
  OTRO: 'OTRO',
};

export const ETIQUETAS_ESTADO_ACTIVO = {
  [ESTADOS_ACTIVO.OPTIMO]: 'Optimo',
  [ESTADOS_ACTIVO.DETERIORADO]: 'Deteriorado',
  [ESTADOS_ACTIVO.EN_REPARACION]: 'En reparacion',
  [ESTADOS_ACTIVO.NO_UBICADO]: 'No ubicado',
  [ESTADOS_ACTIVO.OTRO]: 'Otro',
};

export const LISTA_ESTADOS_ACTIVO = Object.values(ESTADOS_ACTIVO);

export function normalizarEstadoActivo(valor) {
  if (!valor) return ESTADOS_ACTIVO.OPTIMO;
  const texto = String(valor)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
  if (['OPTIMO', 'BUENO', 'OK', 'EXCELENTE'].includes(texto)) return ESTADOS_ACTIVO.OPTIMO;
  if (['DETERIORADO', 'MALO', 'REGULAR'].includes(texto)) return ESTADOS_ACTIVO.DETERIORADO;
  if (['EN_REPARACION', 'REPARACION', 'EN_MANTENIMIENTO', 'MANTENIMIENTO'].includes(texto)) return ESTADOS_ACTIVO.EN_REPARACION;
  if (['NO_UBICADO', 'PERDIDO', 'NO_APARECE'].includes(texto)) return ESTADOS_ACTIVO.NO_UBICADO;
  return ESTADOS_ACTIVO.OTRO;
}
