// ==========================================================
//  dominio/objetosValor/Bloque.js
//  Los bloques (edificios) que administra el sistema.
// ==========================================================

export const BLOQUES = {
  VARONES: 'VARONES',
  DAMAS: 'DAMAS',
  DEPARTAMENTOS_PEQUENOS: 'DEPARTAMENTOS_PEQUENOS',
  DEPARTAMENTOS_GRANDES: 'DEPARTAMENTOS_GRANDES',
};

export const ETIQUETAS_BLOQUE = {
  [BLOQUES.VARONES]: 'Bloque de Estudiantes Varones',
  [BLOQUES.DAMAS]: 'Bloque de Estudiantes Damas',
  [BLOQUES.DEPARTAMENTOS_PEQUENOS]: 'Bloque de Departamentos Pequenos',
  [BLOQUES.DEPARTAMENTOS_GRANDES]: 'Bloque de Departamentos Grandes',
};

export const ETIQUETAS_CORTAS_BLOQUE = {
  [BLOQUES.VARONES]: 'Varones',
  [BLOQUES.DAMAS]: 'Damas',
  [BLOQUES.DEPARTAMENTOS_PEQUENOS]: 'Departamentos pequenos',
  [BLOQUES.DEPARTAMENTOS_GRANDES]: 'Departamentos grandes',
};

export const BLOQUES_DE_ESTUDIANTES = [BLOQUES.VARONES, BLOQUES.DAMAS];

export const BLOQUES_DE_PERSONAL = [BLOQUES.DEPARTAMENTOS_PEQUENOS, BLOQUES.DEPARTAMENTOS_GRANDES];

export const TODOS_LOS_BLOQUES = [
  BLOQUES.VARONES,
  BLOQUES.DAMAS,
  BLOQUES.DEPARTAMENTOS_PEQUENOS,
  BLOQUES.DEPARTAMENTOS_GRANDES,
];

export function esBloqueValido(bloque) {
  return TODOS_LOS_BLOQUES.includes(bloque);
}

export function normalizarBloque(valor) {
  if (!valor) return null;
  const texto = String(valor)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

  if (['VARONES', 'VARON', 'EST._VARONES', 'HOMBRES', 'BLOQUE_VARONES'].includes(texto)) return BLOQUES.VARONES;
  if (['DAMAS', 'MUJERES', 'EST._DAMAS', 'BLOQUE_DAMAS'].includes(texto)) return BLOQUES.DAMAS;
  if (
    [
      'DEPARTAMENTOS_PEQUENOS',
      'DEPARTAMENTOS_PEQUENOS',
      'DEPARTAMENTO_PEQUENO',
      'DP',
      'D',
      'ADMINISTRATIVOS',
      'DOCENTES',
      'BLOQUE_DE_DEPARTAMENTOS_PEQUENOS',
    ].includes(texto)
  ) {
    return BLOQUES.DEPARTAMENTOS_PEQUENOS;
  }
  if (
    [
      'DEPARTAMENTOS_GRANDES',
      'DEPARTAMENTO_GRANDE',
      'DG',
      'MILITAR',
      'OFICIALES',
      'BLOQUE_DE_DEPARTAMENTOS_GRANDES',
      'DIRECTOR',
      'DD',
    ].includes(texto)
  ) {
    return BLOQUES.DEPARTAMENTOS_GRANDES;
  }
  return null;
}
