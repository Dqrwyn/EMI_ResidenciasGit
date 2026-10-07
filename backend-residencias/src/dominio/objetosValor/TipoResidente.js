// ==========================================================
//  dominio/objetosValor/TipoResidente.js
//  Clasificacion de las personas que viven en la residencia.
// ==========================================================

export const TIPOS_RESIDENTE = {
  ESTUDIANTE: 'ESTUDIANTE',
  ADMINISTRATIVO: 'ADMINISTRATIVO',
  DOCENTE: 'DOCENTE',
  MILITAR: 'MILITAR',
  DIRECTOR: 'DIRECTOR',
  OTRO: 'OTRO',
};

export const ETIQUETAS_TIPO_RESIDENTE = {
  [TIPOS_RESIDENTE.ESTUDIANTE]: 'Estudiante',
  [TIPOS_RESIDENTE.ADMINISTRATIVO]: 'Administrativo',
  [TIPOS_RESIDENTE.DOCENTE]: 'Docente',
  [TIPOS_RESIDENTE.MILITAR]: 'Personal militar',
  [TIPOS_RESIDENTE.DIRECTOR]: 'Director',
  [TIPOS_RESIDENTE.OTRO]: 'Otro',
};

export function esTipoResidenteValido(tipo) {
  return Object.values(TIPOS_RESIDENTE).includes(tipo);
}

export function normalizarTipoResidente(valor) {
  if (!valor) return null;
  const texto = String(valor)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
  const mapa = {
    ESTUDIANTE: TIPOS_RESIDENTE.ESTUDIANTE,
    ESTUDIANTES: TIPOS_RESIDENTE.ESTUDIANTE,
    ALUMNO: TIPOS_RESIDENTE.ESTUDIANTE,
    ADMINISTRATIVO: TIPOS_RESIDENTE.ADMINISTRATIVO,
    ADMINISTRATIVA: TIPOS_RESIDENTE.ADMINISTRATIVO,
    PERSONAL_ADMINISTRATIVO: TIPOS_RESIDENTE.ADMINISTRATIVO,
    DOCENTE: TIPOS_RESIDENTE.DOCENTE,
    DOCENTES: TIPOS_RESIDENTE.DOCENTE,
    INGENIERO: TIPOS_RESIDENTE.DOCENTE,
    LICENCIADO: TIPOS_RESIDENTE.DOCENTE,
    MILITAR: TIPOS_RESIDENTE.MILITAR,
    OFICIAL: TIPOS_RESIDENTE.MILITAR,
    OFICIALES: TIPOS_RESIDENTE.MILITAR,
    DIRECTOR: TIPOS_RESIDENTE.DIRECTOR,
    OTRO: TIPOS_RESIDENTE.OTRO,
  };
  return mapa[texto] || null;
}
