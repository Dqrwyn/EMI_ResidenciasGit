// ==========================================================
//  aplicacion/servicios/mapeadorColumnas.js
//  Reconoce la fila de encabezados de un Excel aunque cambie el
//  orden de las columnas, las mayusculas o los tildes.
// ==========================================================

import { COLUMNAS, NOMBRES_DE_HOJA, obtenerDefinicionDeFormato } from './estructuraDeFormatos.js';
import { normalizarClave, normalizarEspacios } from './normalizadorTexto.js';

const ALIAS_POR_CLAVE = new Map(
  Object.values(COLUMNAS).map((columna) => [columna.clave, columna.alias.map((alias) => normalizarClave(alias))]),
);

const CLAVE_POR_ALIAS = new Map();
for (const columna of Object.values(COLUMNAS)) {
  for (const alias of columna.alias) {
    CLAVE_POR_ALIAS.set(normalizarClave(alias), columna.clave);
  }
}

export function reconocerColumna(encabezado) {
  const clave = normalizarClave(encabezado);
  if (!clave) return null;
  if (CLAVE_POR_ALIAS.has(clave)) return CLAVE_POR_ALIAS.get(clave);

  // Coincidencias parciales: "N° HABITACION (Bloque A)" sigue siendo la habitacion.
  for (const [alias, columna] of CLAVE_POR_ALIAS.entries()) {
    if (alias.length >= 6 && (clave.startsWith(alias) || clave.includes(alias))) return columna;
  }
  return null;
}

export function esEncabezadoDeFormato(filaDeCeldas = []) {
  return mapearEncabezados(filaDeCeldas).cantidadReconocida >= 3;
}

export function mapearEncabezados(filaDeCeldas = []) {
  const mapa = {};
  filaDeCeldas.forEach((celda, indice) => {
    const clave = reconocerColumna(celda);
    if (clave && mapa[clave] === undefined) mapa[clave] = indice;
  });
  return { mapa, cantidadReconocida: Object.keys(mapa).length };
}

// ----------------------------------------------------------
//  Deteccion del formato del archivo a partir de los encabezados
//  y de los nombres de las hojas.
// ----------------------------------------------------------
export function detectarFormato({ encabezados = [], nombresDeHojas = [] }) {
  const claves = encabezados.map((encabezado) => reconocerColumna(encabezado)).filter(Boolean);
  const tiene = (clave) => claves.includes(clave);

  const nombresNormalizados = nombresDeHojas.map((nombre) => normalizarClave(nombre));
  const hojaEstudiantes = nombresNormalizados.some(
    (nombre) => nombre.includes('VARONES') || nombre.includes('DAMAS') || nombre === normalizarClave(NOMBRES_DE_HOJA.VARONES),
  );
  const hojaPequenos = nombresNormalizados.some((nombre) => nombre.includes('PEQUENOS') || nombre.includes('DEPARTAMENTOSPEQUENOS'));
  const hojaGrandes = nombresNormalizados.some(
    (nombre) =>
      nombre.includes('GRANDES') ||
      nombre.includes('GENERALES') ||
      nombre.includes('OFICIALES') ||
      nombre.includes('MILITAR') ||
      nombre.includes('DIRECTOR'),
  );

  if (hojaEstudiantes) return 'ESTUDIANTES';
  if (hojaPequenos) return 'DEPARTAMENTOS_PEQUENOS';
  if (hojaGrandes) return 'DEPARTAMENTOS_GRANDES';

  const pareceEstudiante = tiene('carrera') || tiene('semestre') || tiene('tutorNombre') || tiene('codigo');
  if (pareceEstudiante) {
    const tieneHabitacionDeDepartamento = false;
    if (!tieneHabitacionDeDepartamento) return 'ESTUDIANTES';
  }
  if (tiene('cargo') || tiene('costo')) {
    const bloquesDeclarados = claves.filter((clave) => clave === 'bloque').length;
    if (bloquesDeclarados >= 0) return 'DEPARTAMENTOS_PEQUENOS';
  }
  return null;
}

export function interpretarFila(mapaDeColumnas, filaDeCeldas = []) {
  const registro = {};
  for (const [clave, indice] of Object.entries(mapaDeColumnas)) {
    const valor = filaDeCeldas[indice];
    registro[clave] = valor === undefined || valor === null ? '' : valor;
  }
  return registro;
}

export function titulosDeFormato(formato) {
  const definicion = obtenerDefinicionDeFormato(formato);
  return definicion ? definicion.columnas.map((columna) => columna.titulo) : [];
}

export function normalizarEncabezadoParaExportar(titulo) {
  return normalizarEspacios(titulo);
}
