// ==========================================================
//  dominio/objetosValor/EstadoResidente.js
//  Solo dos estados: ACTIVO (vive en la residencia) y RETIRADO.
// ==========================================================

export const ESTADOS_RESIDENTE = {
  ACTIVO: 'ACTIVO',
  RETIRADO: 'RETIRADO',
};

export const ETIQUETAS_ESTADO_RESIDENTE = {
  [ESTADOS_RESIDENTE.ACTIVO]: 'Activo',
  [ESTADOS_RESIDENTE.RETIRADO]: 'Retirado',
};

export function esEstadoResidenteValido(estado) {
  return Object.values(ESTADOS_RESIDENTE).includes(estado);
}
