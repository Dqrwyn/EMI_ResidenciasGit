// ==========================================================
//  scripts/generarEjemplos.js
//  Genera los TRES formatos de Excel con datos ficticios, para
//  probar el sistema sin cargar informacion real.
//  Uso: npm run ejemplos
// ==========================================================

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { crearEscritorExcel } from '../src/infraestructura/excel/escritorExcel.js';
import {
  FORMATO_DEPARTAMENTOS_GRANDES,
  FORMATO_DEPARTAMENTOS_PEQUENOS,
  FORMATO_ESTUDIANTES,
  NOMBRES_DE_HOJA,
} from '../src/aplicacion/servicios/estructuraDeFormatos.js';
import { BLOQUES } from '../src/dominio/objetosValor/Bloque.js';
import { ETIQUETAS_TIPO_HABITACION } from '../src/dominio/objetosValor/TipoHabitacion.js';
import { obtenerDefinicionDeHabitacion } from '../src/dominio/objetosValor/CatalogoHabitaciones.js';

const carpetaDeEjemplos = fileURLToPath(new URL('../../ejemplos/', import.meta.url));

const ESTUDIANTES_VARONES = [
  ['P1-1', 'JOSE MILTON ARISPE CHOQUE', 8801001, 70010001, 'ING. SISTEMAS', '1RO', 'H101-1', 'PEDRO ARISPE', 70020001, '2026-01-28'],
  ['P1-2', 'KEVIN AGREDA QUISPE', 8801002, 70010002, 'ING. CIVIL', '3RO', 'H101-2', 'MARIA QUISPE', 70020002, '2026-01-28'],
  ['P1-3', 'ELVIS ZAPATA SANDOVAL', 8801003, 70010003, 'ING. COMERCIAL', '1RO', 'H101-3', 'ANA SANDOVAL', 70020003, '2026-01-28'],
  ['P1-3', 'JAVIER RAMOS CESPEDES', 8801004, 70010004, 'ING. COMERCIAL', '1RO', 'H101-4', 'LUIS RAMOS', 70020004, '2026-01-28'],
  ['P1-10', 'WILDER ESPINDOLA CASTRO', 8801005, 70010005, 'ING. SISTEMAS', '5TO', 'H101-5', 'ROSA CASTRO', 70020005, '2026-01-28'],
  ['P1-10', 'SAMUEL VERDUGUEZ CONDORI', 8801006, 70010006, 'ING. SISTEMAS', '5TO', 'H101-6', 'JUAN VERDUGUEZ', 70020006, '2026-01-28'],
  ['PB-1', 'DEIBY ACSAMA OTALORA', 8801007, 70010007, 'ING. AMBIENTAL', '1RO', 'H101-7', 'ELSA OTALORA', 70020007, '2026-01-28'],
  ['PB-13', 'JHONNY ROCHA PAREDES', 8801008, 70010008, 'ARQUITECTURA', '7MO', 'H101-8', 'OLGA PAREDES', 70020008, '2026-01-28'],
];

const ESTUDIANTES_DAMAS = [
  ['P2-13', 'ANABEL CRUZ SILGUERO', 8802001, 71010001, 'ING. COMERCIAL', '1RO', 'H201-1', 'EUGENIO CRUZ', 71020001, '2026-01-27'],
  ['PB-3', 'ANDREA ISABEL ORELLANA HERVAS', 8802002, 71010002, 'ING. COMERCIAL', '1RO', 'H201-2', 'JUDIT HERVAS', 71020002, '2026-01-27'],
  ['PB-3', 'MAYERLIN FERNANDEZ CHOQUE', 8802003, 71010003, 'ING. COMERCIAL', '1RO', 'H201-3', 'RUBEN FERNANDEZ', 71020003, '2026-01-27'],
  ['P1-11', 'JHENNY FERMIN ORELLANA', 8802004, 71010004, 'ING. INDUSTRIAL', '3RO', 'H201-4', 'FELICIANA ORELLANA', 71020004, '2026-01-27'],
  ['P2-12', 'FLORICIENDA MAMANI ANDIA', 8802005, 71010005, 'ING. COMERCIAL', '1RO', 'H201-5', 'GUILLERMINIA ANDIA', 71020005, '2026-01-27'],
  ['PB-14', 'NELLY BEJARANO CONDORI', 8802006, 71010006, 'ING. COMERCIAL', '9NO', 'H201-6', 'SIRILO BEJARANO', 71020006, '2026-01-27'],
];

const DEPARTAMENTOS_PEQUENOS = [
  ['D-1', 'ING. JAQUELIN CHULVER COLQUE', 8803001, 72010001, 'DOCENTE', 300, '2026-01-27'],
  ['D-2', 'ING. ARACELI RODRIGUEZ ROJAS', 8803002, 72010002, 'DOCENTE', 300, '2026-01-27'],
  ['D-3', 'LIC. JIMENA COSSIO SILVA', 8803003, 72010003, 'ADMINISTRATIVO', 300, '2026-01-27'],
  ['D-4', 'ING. ROCIO OLIVERA TORRICO', 8803004, 72010004, 'DOCENTE', 300, '2026-01-27'],
];

const DEPARTAMENTOS_GRANDES = [
  ['DG-1', 'TCNL. DIM. GROVER MALDONADO CONDARCO', 8804001, 73010001, 'COMANDANTE', 300, '2026-02-01'],
  ['DG-2', 'MY. DIM. JUAN CARLOS HINOJOSA LEDEZMA', 8804002, 73010002, 'MAYOR', 300, '2026-02-01'],
  ['DG-3', 'CAP. DIM. WILVER MONTAÑO ANGULO', 8804003, 73010003, 'CAPITAN', 300, '2026-02-01'],
  ['DD', 'CRNL. DIM. RICARDO SUAREZ PEREIRA', 8804004, 73010004, 'DIRECTOR DE LA ESCUELA', 350, '2026-02-01'],
];

function tipoDeHabitacion(bloque, codigo) {
  const definicion = obtenerDefinicionDeHabitacion(bloque, codigo);
  return definicion ? ETIQUETAS_TIPO_HABITACION[definicion.tipo] : '';
}

function filaDeEstudiante(orden, bloque, datos) {
  const [habitacion, nombre, ci, celular, carrera, semestre, codigo, tutor, tutorCelular, fecha] = datos;
  return [
    orden,
    bloque,
    nombre,
    ci,
    celular,
    carrera,
    semestre,
    codigo,
    habitacion,
    tipoDeHabitacion(bloque, habitacion),
    tutor,
    tutorCelular,
    fecha,
    '',
  ];
}

function filaDeDepartamento(orden, datos) {
  const [habitacion, nombre, ci, celular, cargo, costo, fecha] = datos;
  const bloque = habitacion.startsWith('D-') ? BLOQUES.DEPARTAMENTOS_PEQUENOS : BLOQUES.DEPARTAMENTOS_GRANDES;
  return [
    orden,
    nombre,
    ci,
    celular,
    cargo,
    habitacion,
    tipoDeHabitacion(bloque, habitacion),
    costo,
    fecha,
    '',
    '',
  ];
}

function titulosDe(definicion) {
  return definicion.columnas.map((columna) => columna.titulo);
}

async function principal() {
  const escritor = crearEscritorExcel();
  await mkdir(carpetaDeEjemplos, { recursive: true });

  const documentos = [
    {
      archivo: 'ejemplo-estudiantes.xlsx',
      documento: {
        titulo: FORMATO_ESTUDIANTES.titulo,
        hojas: [
          {
            nombre: NOMBRES_DE_HOJA.VARONES,
            subtitulo: 'BLOQUE VARONES',
            encabezados: titulosDe(FORMATO_ESTUDIANTES),
            filas: ESTUDIANTES_VARONES.map((datos, indice) => filaDeEstudiante(indice + 1, 'VARONES', datos)),
          },
          {
            nombre: NOMBRES_DE_HOJA.DAMAS,
            subtitulo: 'BLOQUE DAMAS',
            encabezados: titulosDe(FORMATO_ESTUDIANTES),
            filas: ESTUDIANTES_DAMAS.map((datos, indice) => filaDeEstudiante(indice + 1, 'DAMAS', datos)),
          },
        ],
      },
    },
    {
      archivo: 'ejemplo-departamentos-pequenos.xlsx',
      documento: {
        titulo: FORMATO_DEPARTAMENTOS_PEQUENOS.titulo,
        hojas: [
          {
            nombre: NOMBRES_DE_HOJA.DEPARTAMENTOS_PEQUENOS,
            subtitulo: 'BLOQUE DE DEPARTAMENTOS PEQUENOS',
            encabezados: titulosDe(FORMATO_DEPARTAMENTOS_PEQUENOS),
            filas: DEPARTAMENTOS_PEQUENOS.map((datos, indice) => filaDeDepartamento(indice + 1, datos)),
          },
        ],
      },
    },
    {
      archivo: 'ejemplo-departamentos-grandes.xlsx',
      documento: {
        titulo: FORMATO_DEPARTAMENTOS_GRANDES.titulo,
        hojas: [
          {
            nombre: NOMBRES_DE_HOJA.DEPARTAMENTOS_GRANDES,
            subtitulo: 'BLOQUE DE DEPARTAMENTOS GRANDES Y DIRECCION',
            encabezados: titulosDe(FORMATO_DEPARTAMENTOS_GRANDES),
            filas: DEPARTAMENTOS_GRANDES.map((datos, indice) => filaDeDepartamento(indice + 1, datos)),
          },
        ],
      },
    },
  ];

  for (const { archivo, documento } of documentos) {
    const buffer = await escritor.escribir(documento);
    const destino = join(carpetaDeEjemplos, archivo);
    await writeFile(destino, buffer);
    console.log(`Generado: ${destino}`);
  }

  console.log('Listo. Estos archivos se importan desde la pantalla "Datos" del sistema.');
}

principal().catch((error) => {
  console.error(`No se pudieron generar los ejemplos: ${error.message}`);
  process.exitCode = 1;
});
