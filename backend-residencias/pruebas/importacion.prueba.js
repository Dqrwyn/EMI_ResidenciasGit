// ==========================================================
//  pruebas/importacion.prueba.js
//  Se arma un Excel de verdad en memoria, se importa y despues
//  se exporta y se vuelve a importar: el ciclo completo debe
//  conservar todos los datos.
// ==========================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { crearRepositoriosFalsos } from './ayudas/falsos.js';
import { crearLibroDePrueba, ENCABEZADOS_DEPARTAMENTOS, ENCABEZADOS_ESTUDIANTES } from './ayudas/excelDePrueba.js';
import { crearImportarDesdeExcel } from '../src/aplicacion/casosDeUso/importarDesdeExcel.js';
import { crearExportarExcel } from '../src/aplicacion/casosDeUso/exportarExcel.js';
import { crearLectorExcel } from '../src/infraestructura/excel/lectorExcel.js';
import { crearEscritorExcel } from '../src/infraestructura/excel/escritorExcel.js';
import { FORMATOS } from '../src/aplicacion/servicios/estructuraDeFormatos.js';

function armarCasos() {
  const falsos = crearRepositoriosFalsos();
  const lectorExcel = crearLectorExcel();
  const escritorExcel = crearEscritorExcel();

  return {
    ...falsos,
    lectorExcel,
    escritorExcel,
    importar: crearImportarDesdeExcel({
      repositorioHabitaciones: falsos.repositorioHabitaciones,
      repositorioResidentes: falsos.repositorioResidentes,
      repositorioMovimientos: falsos.repositorioMovimientos,
      lectorExcel,
    }),
    exportar: crearExportarExcel({
      repositorioHabitaciones: falsos.repositorioHabitaciones,
      repositorioResidentes: falsos.repositorioResidentes,
    }),
  };
}

// ------------------------------------------------------------
//  El archivo que usa la institucion, con tildes, mayusculas y
//  errores de escritura ("p2-2", "PB4").
// ------------------------------------------------------------
async function libroDeEstudiantes() {
  return crearLibroDePrueba([
    {
      nombre: 'EST. VARONES',
      titulo: 'RELACIÓN NOMINAL DE RESIDENCIA I/2026',
      encabezados: ENCABEZADOS_ESTUDIANTES,
      filas: [
        [null, 1, 'ABEL CONDORI MERIDA', 15040801, 67534664, 'CC.BB.', '1RO', 'H819-2', 'P2-3', 'TIPO D', 'MARISOL MERIDA', 63492814, '2026-01-28', ''],
        [null, 2, 'AMED PASCUAL FUENTES', 13647925, 67935395, 'CC.BB.', '1RO', 'H817-6', 'p2-2', 'TIPO C', 'VILMA FUENTES', 67418046, '2026-01-28', 'INTERNET'],
        [null, 3, 'ROY MAYCON SANCHEZ MEJIA', 13682784, 77507684, 'CC.BB.', '1RO', 'H618-4', 'PB4', 'TIPO D', 'CARLOS SANCHEZ', 72737718, '2026-01-28', ''],
        [null, 4, 'JHOEL ZAMBRANA BECERRA', 14511455, 63884287, 'CC.BB.', '1RO', 'H835-4', 'P2-10', 'TIPO D', 'TEODOCIO ZAMBRANA', 73759161, '2026-01-28', ''],
        [null, 5, '', 99999999, 70000000, '', '', 'P1-1', '', '', '', '', ''],
        [null, 6, 'EVO RIOJA CHOQUE', 14112354, 71184654, 'ING. CIVIL', '1RO', 'H865-6', 'RD-7', 'TIPO D', 'SIXTO RIOJA', 68605986, '2026-01-27', ''],
      ],
    },
    {
      nombre: 'EST. DAMAS',
      encabezados: ENCABEZADOS_ESTUDIANTES,
      filas: [
        [null, 1, 'JHENNY FERMIN ORELLANA', 13531672, 64882442, 'ING. COMERCIAL', '3RO', 'H762-5', 'P1-11', 'TIPO D', 'FELICIANA ORELLANA', 67441997, '2026-01-27', 'INTERNET'],
        [null, 2, 'RUTH TANIA CONDORI POMA', 14511932, 74365182, 'ING. COMERCIAL', '1RO', 'H810-9', 'PB-1', 'TIPO C', 'CRISTINA POMA', 72729675, '2026-01-27', ''],
      ],
    },
  ]);
}

test('se reconocen las hojas EST. VARONES y EST. DAMAS y se importan los residentes', async () => {
  const casos = armarCasos();
  const buffer = await libroDeEstudiantes();

  const resultado = await casos.importar({ buffer, nombreArchivo: 'relacion.xlsx' });

  assert.equal(resultado.formato, FORMATOS.ESTUDIANTES);
  assert.equal(resultado.filasLeidas, 8);
  assert.equal(resultado.creados, 7);
  assert.equal(resultado.errores.length, 1, 'la fila sin nombre debe quedar como error');
  assert.match(resultado.errores[0].mensaje, /no tiene nombre/);
  assert.equal(resultado.sinHabitacion, 1);
  assert.ok(resultado.advertencias.some((aviso) => /RD-7/.test(aviso.mensaje)));

  const abel = await casos.repositorioResidentes.buscarPorCi('15040801');
  assert.equal(abel.habitacionCodigo, 'P2-3');
  assert.equal(abel.bloque, 'VARONES');
  assert.equal(abel.tipo, 'ESTUDIANTE');

  // "p2-2" y "PB4" se normalizan al codigo oficial
  const amed = await casos.repositorioResidentes.buscarPorCi('13647925');
  assert.equal(amed.habitacionCodigo, 'P2-2');
  const roy = await casos.repositorioResidentes.buscarPorCi('13682784');
  assert.equal(roy.habitacionCodigo, 'PB-4');

  const ruth = await casos.repositorioResidentes.buscarPorCi('14511932');
  assert.equal(ruth.bloque, 'DAMAS');
  assert.equal(ruth.habitacionCodigo, 'PB-1');

  const evo = await casos.repositorioResidentes.buscarPorCi('14112354');
  assert.equal(evo.habitacionCodigo, null);
  assert.equal(evo.bloque, 'VARONES');
});

test('reimportar el mismo archivo no duplica y solo actualiza lo que cambio', async () => {
  const casos = armarCasos();
  const buffer = await libroDeEstudiantes();

  await casos.importar({ buffer, nombreArchivo: 'relacion.xlsx' });
  const segunda = await casos.importar({ buffer, nombreArchivo: 'relacion.xlsx' });

  assert.equal(segunda.creados, 0);
  assert.equal(segunda.actualizados, 0);
  assert.equal(segunda.sinCambios, 7);
  assert.equal(casos.estado.residentes.size, 7);
});

test('reimportar con un dato nuevo actualiza al residente sin perder lo demas', async () => {
  const casos = armarCasos();
  await casos.importar({ buffer: await libroDeEstudiantes(), nombreArchivo: 'relacion.xlsx' });

  const buffer = await crearLibroDePrueba([
    {
      nombre: 'EST. VARONES',
      encabezados: ENCABEZADOS_ESTUDIANTES,
      filas: [
        [null, 1, 'ABEL CONDORI MERIDA', 15040801, 67534664, 'CC.BB.', '1RO', 'H819-2', 'P2-10', 'TIPO D', 'MARISOL MERIDA', 63492814, '2026-01-28', 'CAMBIO DE CUARTO'],
      ],
    },
  ]);

  const resultado = await casos.importar({ buffer, nombreArchivo: 'cambio.xlsx' });
  assert.equal(resultado.actualizados, 1);
  assert.equal(resultado.movidos, 1);

  const abel = await casos.repositorioResidentes.buscarPorCi('15040801');
  assert.equal(abel.habitacionCodigo, 'P2-10');
  assert.equal(abel.carrera, 'CC.BB.');
  assert.equal(abel.tutorNombre, 'MARISOL MERIDA');
  assert.equal(abel.observaciones, 'CAMBIO DE CUARTO');
});

test('la fila de un residente no borra sus datos cuando el Excel trae celdas vacias', async () => {
  const casos = armarCasos();
  await casos.importar({ buffer: await libroDeEstudiantes(), nombreArchivo: 'relacion.xlsx' });

  const buffer = await crearLibroDePrueba([
    {
      nombre: 'EST. VARONES',
      encabezados: ENCABEZADOS_ESTUDIANTES,
      filas: [[null, 1, 'ABEL CONDORI MERIDA', 15040801, '', '', '', '', 'P2-3', '', '', '', '', '']],
    },
  ]);

  await casos.importar({ buffer, nombreArchivo: 'parcial.xlsx' });
  const abel = await casos.repositorioResidentes.buscarPorCi('15040801');

  assert.equal(abel.celular, '67534664');
  assert.equal(abel.carrera, 'CC.BB.');
  assert.equal(abel.tutorCelular, '63492814');
});

test('los departamentos pequenos y grandes se detectan por el nombre de la hoja', async () => {
  const casos = armarCasos();

  const pequenos = await crearLibroDePrueba([
    {
      nombre: 'DEPARTAMENTOS PEQUEÑOS',
      encabezados: ENCABEZADOS_DEPARTAMENTOS,
      filas: [
        [1, 'ING. JAQUELIN CHULVER COLQUE', 7308214, 69600135, 'DOCENTE', 'D-1', 'TIPO B', 300, '2026-01-27', '', ''],
        [2, 'LIC. IRMA VASQUEZ CONDORI', 9942879, 68237334, 'ADMINISTRATIVO', 'D-20', 'TIPO B', 300, '2026-01-27', '', ''],
      ],
    },
  ]);

  const resultadoPequenos = await casos.importar({ buffer: pequenos, nombreArchivo: 'departamentos.xlsx' });
  assert.equal(resultadoPequenos.formato, FORMATOS.DEPARTAMENTOS_PEQUENOS);
  assert.equal(resultadoPequenos.creados, 2);

  const jaquelin = await casos.repositorioResidentes.buscarPorCi('7308214');
  assert.equal(jaquelin.bloque, 'DEPARTAMENTOS_PEQUENOS');
  assert.equal(jaquelin.habitacionCodigo, 'D-1');
  assert.equal(jaquelin.tipo, 'DOCENTE');
  assert.equal(jaquelin.cargo, 'DOCENTE');

  const grandes = await crearLibroDePrueba([
    {
      nombre: 'DEPARTAMENTOS GRANDES',
      encabezados: ENCABEZADOS_DEPARTAMENTOS,
      filas: [
        [1, 'TCNL. DIM. GROVER MALDONADO CONDARCO', 4962952, 72064664, 'COMANDANTE', 'DG-1', 'TIPO A', 300, '2026-02-01', '', ''],
        [2, 'MY. DIM. JUAN CARLOS HINOJOSA LEDEZMA', 5226961, 67702764, 'JEFE DE AREA', 'DD', 'TIPO A', 300, '2026-02-01', '', ''],
      ],
    },
  ]);

  const resultadoGrandes = await casos.importar({ buffer: grandes, nombreArchivo: 'militares.xlsx' });
  assert.equal(resultadoGrandes.formato, FORMATOS.DEPARTAMENTOS_GRANDES);

  const director = await casos.repositorioResidentes.buscarPorCi('5226961');
  assert.equal(director.habitacionCodigo, 'DD');
  assert.equal(director.tipo, 'DIRECTOR');
  assert.equal(director.bloque, 'DEPARTAMENTOS_GRANDES');
});

test('se avisa cuando una habitacion supera su capacidad, sin perder el dato', async () => {
  const casos = armarCasos();

  const buffer = await crearLibroDePrueba([
    {
      nombre: 'EST. VARONES',
      encabezados: ENCABEZADOS_ESTUDIANTES,
      filas: [
        [null, 1, 'UNO PEREZ', 1000001, '', '', '', '', 'PB-1', '', '', '', '', ''],
        [null, 2, 'DOS PEREZ', 1000002, '', '', '', '', 'PB-1', '', '', '', '', ''],
      ],
    },
  ]);

  const resultado = await casos.importar({ buffer, nombreArchivo: 'lleno.xlsx' });
  assert.equal(resultado.creados, 2);
  assert.ok(resultado.advertencias.some((aviso) => /supera su capacidad/.test(aviso.mensaje)));
});

test('exportar e importar de nuevo conserva todos los datos (ida y vuelta)', async () => {
  const origen = armarCasos();
  await origen.importar({ buffer: await libroDeEstudiantes(), nombreArchivo: 'relacion.xlsx' });

  const { documento, nombreArchivo } = await origen.exportar({ formato: FORMATOS.ESTUDIANTES });
  assert.equal(nombreArchivo.startsWith('relacion-estudiantes-'), true);
  assert.equal(documento.hojas.length, 2);
  assert.deepEqual(
    documento.hojas.map((hoja) => hoja.nombre),
    ['EST. VARONES', 'EST. DAMAS'],
  );
  assert.equal(documento.hojas[0].encabezados[0], 'N');
  assert.ok(documento.hojas[0].filas.length >= 42, 'deben aparecer todas las habitaciones del bloque');

  const buffer = await origen.escritorExcel.escribir(documento);

  const destino = armarCasos();
  const resultado = await destino.importar({ buffer, nombreArchivo });

  assert.equal(resultado.creados, 7);
  assert.equal(resultado.errores.length, 0);

  const abel = await destino.repositorioResidentes.buscarPorCi('15040801');
  assert.equal(abel.habitacionCodigo, 'P2-3');
  assert.equal(abel.carrera, 'CC.BB.');
  assert.equal(abel.tutorCelular, '63492814');
  assert.equal(abel.observaciones, '');

  const evo = await destino.repositorioResidentes.buscarPorCi('14112354');
  assert.equal(evo.habitacionCodigo, null);
  assert.equal(evo.bloque, 'VARONES');
});

test('la plantilla vacia conserva todas las habitaciones y ningun residente', async () => {
  const casos = armarCasos();
  await casos.importar({ buffer: await libroDeEstudiantes(), nombreArchivo: 'relacion.xlsx' });

  const { documento, nombreArchivo } = await casos.exportar({ formato: FORMATOS.DEPARTAMENTOS_PEQUENOS, soloPlantilla: true });
  assert.ok(nombreArchivo.startsWith('plantilla-'));

  const hoja = documento.hojas[0];
  assert.equal(hoja.filas.length, 20);
  assert.equal(hoja.filas[0][5], 'D-1');
  assert.equal(hoja.filas[19][5], 'D-20');
  assert.ok(hoja.filas.every((fila) => fila[2] === ''));
});
