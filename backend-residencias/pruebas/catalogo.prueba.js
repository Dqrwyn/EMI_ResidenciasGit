// ==========================================================
//  pruebas/catalogo.prueba.js
//  El mapa de habitaciones es una regla del negocio: se verifica
//  habitacion por habitacion.
// ==========================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DISTRIBUCION_POR_LADO,
  generarCatalogoDeBloque,
  generarCatalogoHabitaciones,
  HABITACION_DIRECTOR,
  LADOS,
  normalizarCodigoDeHabitacion,
  PISOS_ESTUDIANTES,
} from '../src/dominio/objetosValor/CatalogoHabitaciones.js';
import { BLOQUES, BLOQUES_DE_ESTUDIANTES } from '../src/dominio/objetosValor/Bloque.js';
import { TIPOS_HABITACION } from '../src/dominio/objetosValor/TipoHabitacion.js';

test('el bloque de estudiantes tiene 42 habitaciones: 14 por piso en 3 pisos', () => {
  for (const bloque of BLOQUES_DE_ESTUDIANTES) {
    const habitaciones = generarCatalogoDeBloque(bloque);
    assert.equal(habitaciones.length, 42);
    assert.equal(habitaciones.filter((h) => h.piso === 'PB').length, 14);
    assert.equal(habitaciones.filter((h) => h.piso === 'P1').length, 14);
    assert.equal(habitaciones.filter((h) => h.piso === 'P2').length, 14);
  }
});

test('cada piso tiene 8 individuales y 6 compartidas', () => {
  for (const bloque of BLOQUES_DE_ESTUDIANTES) {
    for (const piso of PISOS_ESTUDIANTES) {
      const delPiso = generarCatalogoDeBloque(bloque).filter((h) => h.piso === piso.codigo);
      assert.equal(delPiso.filter((h) => h.tipo === TIPOS_HABITACION.INDIVIDUAL).length, 8);
      assert.equal(delPiso.filter((h) => h.tipo === TIPOS_HABITACION.COMPARTIDA).length, 6);
    }
  }
});

test('cada lado tiene 2 individuales arriba, 3 compartidas al medio y 2 individuales abajo', () => {
  for (const bloque of BLOQUES_DE_ESTUDIANTES) {
    for (const habitacion of generarCatalogoDeBloque(bloque)) {
      const distribucion = DISTRIBUCION_POR_LADO.find((fila) => fila.orden === habitacion.orden);
      assert.equal(habitacion.tipo, distribucion.tipo, `${habitacion.codigo} no respeta la distribucion`);
      assert.equal(habitacion.posicion, distribucion.posicion);
    }

    const izquierda = generarCatalogoDeBloque(bloque).filter(
      (h) => h.piso === 'PB' && h.lado === LADOS.IZQUIERDO,
    );
    assert.deepEqual(
      izquierda.map((h) => h.orden),
      [1, 2, 3, 4, 5, 6, 7],
    );
  }
});

test('la numeracion coincide con la relacion de la institucion (1-7 izquierda, 8-14 derecha)', () => {
  const habitaciones = generarCatalogoDeBloque(BLOQUES.VARONES).filter((h) => h.piso === 'PB');
  const porCodigo = Object.fromEntries(habitaciones.map((h) => [h.codigo, h]));

  assert.equal(porCodigo['PB-1'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-2'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-3'].tipo, TIPOS_HABITACION.COMPARTIDA);
  assert.equal(porCodigo['PB-4'].tipo, TIPOS_HABITACION.COMPARTIDA);
  assert.equal(porCodigo['PB-5'].tipo, TIPOS_HABITACION.COMPARTIDA);
  assert.equal(porCodigo['PB-6'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-7'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-8'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-9'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-10'].tipo, TIPOS_HABITACION.COMPARTIDA);
  assert.equal(porCodigo['PB-11'].tipo, TIPOS_HABITACION.COMPARTIDA);
  assert.equal(porCodigo['PB-12'].tipo, TIPOS_HABITACION.COMPARTIDA);
  assert.equal(porCodigo['PB-13'].tipo, TIPOS_HABITACION.INDIVIDUAL);
  assert.equal(porCodigo['PB-14'].tipo, TIPOS_HABITACION.INDIVIDUAL);

  assert.equal(porCodigo['PB-1'].capacidad, 1);
  assert.equal(porCodigo['PB-3'].capacidad, 3);
});

test('los departamentos pequenos van del D-1 al D-20 y los grandes del DG-1 al DG-4 mas el DD', () => {
  const pequenos = generarCatalogoDeBloque(BLOQUES.DEPARTAMENTOS_PEQUENOS);
  assert.equal(pequenos.length, 20);
  assert.equal(pequenos[0].codigo, 'D-1');
  assert.equal(pequenos[19].codigo, 'D-20');
  assert.ok(pequenos.every((h) => h.tipo === TIPOS_HABITACION.DEPARTAMENTO_PEQUENO));

  const grandes = generarCatalogoDeBloque(BLOQUES.DEPARTAMENTOS_GRANDES);
  assert.deepEqual(
    grandes.map((h) => h.codigo),
    ['DG-1', 'DG-2', 'DG-3', 'DG-4', HABITACION_DIRECTOR],
  );
  assert.equal(grandes[4].tipo, TIPOS_HABITACION.DIRECTOR);
});

test('el catalogo completo tiene 109 habitaciones', () => {
  assert.equal(generarCatalogoHabitaciones().length, 109);
});

test('los codigos escritos a mano se normalizan', () => {
  assert.equal(normalizarCodigoDeHabitacion('p2-2'), 'P2-2');
  assert.equal(normalizarCodigoDeHabitacion('PB4'), 'PB-4');
  assert.equal(normalizarCodigoDeHabitacion('P1-09'), 'P1-9');
  assert.equal(normalizarCodigoDeHabitacion(' dg-2 '), 'DG-2');
  assert.equal(normalizarCodigoDeHabitacion('dd'), 'DD');
  assert.equal(normalizarCodigoDeHabitacion(''), null);
});
