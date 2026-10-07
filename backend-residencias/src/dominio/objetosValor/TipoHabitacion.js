// ==========================================================
//  dominio/objetosValor/TipoHabitacion.js
//  Tipos de habitacion y su capacidad por defecto.
// ==========================================================

export const TIPOS_HABITACION = {
  INDIVIDUAL: 'INDIVIDUAL',
  COMPARTIDA: 'COMPARTIDA',
  DEPARTAMENTO_PEQUENO: 'DEPARTAMENTO_PEQUENO',
  DEPARTAMENTO_GRANDE: 'DEPARTAMENTO_GRANDE',
  DIRECTOR: 'DIRECTOR',
};

export const ETIQUETAS_TIPO_HABITACION = {
  [TIPOS_HABITACION.INDIVIDUAL]: 'Individual',
  [TIPOS_HABITACION.COMPARTIDA]: 'Compartida',
  [TIPOS_HABITACION.DEPARTAMENTO_PEQUENO]: 'Departamento pequeno',
  [TIPOS_HABITACION.DEPARTAMENTO_GRANDE]: 'Departamento grande',
  [TIPOS_HABITACION.DIRECTOR]: 'Departamento del Director',
};

export const CAPACIDAD_POR_DEFECTO = {
  [TIPOS_HABITACION.INDIVIDUAL]: 1,
  [TIPOS_HABITACION.COMPARTIDA]: 3,
  [TIPOS_HABITACION.DEPARTAMENTO_PEQUENO]: 2,
  [TIPOS_HABITACION.DEPARTAMENTO_GRANDE]: 4,
  [TIPOS_HABITACION.DIRECTOR]: 2,
};

export function esHabitacionDeEstudiante(tipo) {
  return tipo === TIPOS_HABITACION.INDIVIDUAL || tipo === TIPOS_HABITACION.COMPARTIDA;
}
