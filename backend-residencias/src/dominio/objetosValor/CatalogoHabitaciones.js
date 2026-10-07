// ==========================================================
//  dominio/objetosValor/CatalogoHabitaciones.js
//  EL MAPA OFICIAL DE HABITACIONES DE LA RESIDENCIA.
//
//  Reglas confirmadas por la institucion:
//   - Bloque de estudiantes (varones y damas): 3 pisos, 14 habitaciones
//     por piso = 42 habitaciones por bloque.
//   - En cada piso: 8 habitaciones individuales y 6 compartidas.
//   - Cada piso se divide en lado IZQUIERDO y lado DERECHO.
//   - Cada lado tiene 4 individuales en los extremos (2 arriba y 2 abajo)
//     y 3 compartidas en el medio.
//   - Bloque de Departamentos Pequenos: D-1 al D-20.
//   - Bloque de Departamentos Grandes: DG-1 al DG-4.
//   - Departamento del Director: DD.
// ==========================================================

import { BLOQUES, BLOQUES_DE_ESTUDIANTES, BLOQUES_DE_PERSONAL } from './Bloque.js';
import { CAPACIDAD_POR_DEFECTO, TIPOS_HABITACION } from './TipoHabitacion.js';

export const LADOS = {
  IZQUIERDO: 'IZQUIERDO',
  DERECHO: 'DERECHO',
};

export const ETIQUETAS_LADO = {
  [LADOS.IZQUIERDO]: 'Lado izquierdo',
  [LADOS.DERECHO]: 'Lado derecho',
};

export const POSICIONES = {
  SUPERIOR: 'SUPERIOR',
  MEDIO: 'MEDIO',
  INFERIOR: 'INFERIOR',
};

export const PISOS_ESTUDIANTES = [
  { codigo: 'PB', nombre: 'Planta baja', numero: 0 },
  { codigo: 'P1', nombre: 'Primer piso', numero: 1 },
  { codigo: 'P2', nombre: 'Segundo piso', numero: 2 },
];

export const HABITACIONES_POR_LADO = 7;
export const HABITACIONES_POR_PISO = 14;
export const PISOS_POR_BLOQUE_ESTUDIANTES = 3;

// ----------------------------------------------------------
//  Distribucion interna de un lado del piso (de arriba hacia abajo):
//    1 y 2  -> individuales superiores
//    3, 4 y 5 -> compartidas del medio
//    6 y 7  -> individuales inferiores
// ----------------------------------------------------------
export const DISTRIBUCION_POR_LADO = [
  { orden: 1, posicion: POSICIONES.SUPERIOR, tipo: TIPOS_HABITACION.INDIVIDUAL },
  { orden: 2, posicion: POSICIONES.SUPERIOR, tipo: TIPOS_HABITACION.INDIVIDUAL },
  { orden: 3, posicion: POSICIONES.MEDIO, tipo: TIPOS_HABITACION.COMPARTIDA },
  { orden: 4, posicion: POSICIONES.MEDIO, tipo: TIPOS_HABITACION.COMPARTIDA },
  { orden: 5, posicion: POSICIONES.MEDIO, tipo: TIPOS_HABITACION.COMPARTIDA },
  { orden: 6, posicion: POSICIONES.INFERIOR, tipo: TIPOS_HABITACION.INDIVIDUAL },
  { orden: 7, posicion: POSICIONES.INFERIOR, tipo: TIPOS_HABITACION.INDIVIDUAL },
];

export const HABITACION_DIRECTOR = 'DD';

export const BLOQUES_CON_PISOS = BLOQUES_DE_ESTUDIANTES;

// ----------------------------------------------------------
//  Normalizacion de codigos escritos a mano ("p2-2", "PB4", "P1-09")
// ----------------------------------------------------------
export function normalizarCodigoDeHabitacion(valor) {
  if (valor === null || valor === undefined) return null;
  let texto = String(valor).trim().toUpperCase().replace(/\s+/g, '');
  if (!texto) return null;

  // "PB4" -> "PB-4", "P1-09" -> "P1-9", "DG-2" se mantiene
  texto = texto.replace(/^(PB|P1|P2|DG|D|DD)-?0*(\d+)$/, '$1-$2');
  if (texto === 'DD' || texto === 'DD-0' || texto === 'DD-') return HABITACION_DIRECTOR;
  return texto;
}

// ----------------------------------------------------------
//  Generacion del catalogo completo
// ----------------------------------------------------------
function crearDefinicion({ codigo, bloque, piso, lado, orden, posicion, tipo }) {
  return {
    codigo,
    bloque,
    piso,
    lado,
    orden,
    posicion,
    tipo,
    capacidad: CAPACIDAD_POR_DEFECTO[tipo],
    costo: 0,
  };
}

function generarPisoDeEstudiantes(bloque, piso) {
  const habitaciones = [];

  for (const lado of [LADOS.IZQUIERDO, LADOS.DERECHO]) {
    const base = lado === LADOS.IZQUIERDO ? 0 : HABITACIONES_POR_LADO;

    for (const { orden, posicion, tipo } of DISTRIBUCION_POR_LADO) {
      habitaciones.push(
        crearDefinicion({
          codigo: `${piso.codigo}-${base + orden}`,
          bloque,
          piso: piso.codigo,
          lado,
          orden,
          posicion,
          tipo,
        }),
      );
    }
  }

  return habitaciones;
}

function generarBloqueDeEstudiantes(bloque) {
  return PISOS_ESTUDIANTES.flatMap((piso) => generarPisoDeEstudiantes(bloque, piso));
}

function generarDepartamentosPequenos() {
  return Array.from({ length: 20 }, (_, indice) =>
    crearDefinicion({
      codigo: `D-${indice + 1}`,
      bloque: BLOQUES.DEPARTAMENTOS_PEQUENOS,
      piso: null,
      lado: null,
      orden: indice + 1,
      posicion: null,
      tipo: TIPOS_HABITACION.DEPARTAMENTO_PEQUENO,
    }),
  );
}

function generarDepartamentosGrandes() {
  const departamentos = Array.from({ length: 4 }, (_, indice) =>
    crearDefinicion({
      codigo: `DG-${indice + 1}`,
      bloque: BLOQUES.DEPARTAMENTOS_GRANDES,
      piso: null,
      lado: null,
      orden: indice + 1,
      posicion: null,
      tipo: TIPOS_HABITACION.DEPARTAMENTO_GRANDE,
    }),
  );

  departamentos.push(
    crearDefinicion({
      codigo: HABITACION_DIRECTOR,
      bloque: BLOQUES.DEPARTAMENTOS_GRANDES,
      piso: null,
      lado: null,
      orden: 5,
      posicion: null,
      tipo: TIPOS_HABITACION.DIRECTOR,
    }),
  );

  return departamentos;
}

export function generarCatalogoDeBloque(bloque) {
  if (BLOQUES_DE_ESTUDIANTES.includes(bloque)) return generarBloqueDeEstudiantes(bloque);
  if (bloque === BLOQUES.DEPARTAMENTOS_PEQUENOS) return generarDepartamentosPequenos();
  if (bloque === BLOQUES.DEPARTAMENTOS_GRANDES) return generarDepartamentosGrandes();
  return [];
}

export function generarCatalogoHabitaciones() {
  return [...BLOQUES_DE_ESTUDIANTES, ...BLOQUES_DE_PERSONAL].flatMap((bloque) => generarCatalogoDeBloque(bloque));
}

export function obtenerDefinicionDeHabitacion(bloque, codigo) {
  const codigoNormalizado = normalizarCodigoDeHabitacion(codigo);
  if (!codigoNormalizado) return null;
  return generarCatalogoDeBloque(bloque).find((definicion) => definicion.codigo === codigoNormalizado) || null;
}

export function bloquesDeHabitacion(habitacion) {
  return habitacion.lado ? [LADOS.IZQUIERDO, LADOS.DERECHO] : [];
}

export function contarTiposDelPiso(habitaciones = []) {
  return habitaciones.reduce(
    (conteo, habitacion) => {
      if (habitacion.tipo === TIPOS_HABITACION.INDIVIDUAL) conteo.individuales += 1;
      if (habitacion.tipo === TIPOS_HABITACION.COMPARTIDA) conteo.compartidas += 1;
      return conteo;
    },
    { individuales: 0, compartidas: 0 },
  );
}
