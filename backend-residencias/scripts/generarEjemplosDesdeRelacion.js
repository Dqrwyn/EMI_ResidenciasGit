// ==========================================================
//  scripts/generarEjemplosDesdeRelacion.js
//  Convierte la relacion nominal que usa la institucion a los
//  TRES formatos nuevos del sistema, listos para importar.
//
//  Uso:
//    npm run ejemplos:relacion
//    npm run ejemplos:relacion -- "B:/ruta/RELACION NOMINAL.xlsx"
//
//  Que hace con los datos:
//   - Estudiantes: conserva la habitacion, normaliza los codigos
//     escritos a mano ("p2-2", "PB4") y marca con OBS los cuartos
//     que no existen en el nuevo catalogo.
//   - Administrativos, docentes y militares: los deja SIN
//     HABITACION (el catalogo nuevo es D-1..D-20, DG-1..DG-4 y DD)
//     y anota en OBS la habitacion que tenian en el archivo viejo.
// ==========================================================

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { crearLectorExcel } from '../src/infraestructura/excel/lectorExcel.js';
import { crearEscritorExcel } from '../src/infraestructura/excel/escritorExcel.js';
import { buscarFilaDeEncabezado } from '../src/aplicacion/casosDeUso/importarDesdeExcel.js';
import { reconocerColumna } from '../src/aplicacion/servicios/mapeadorColumnas.js';
import { aTexto } from '../src/aplicacion/servicios/normalizadorTexto.js';
import { ordenarHabitaciones } from '../src/aplicacion/servicios/ordenDeHabitaciones.js';
import {
  FORMATO_DEPARTAMENTOS_GRANDES,
  FORMATO_DEPARTAMENTOS_PEQUENOS,
  FORMATO_ESTUDIANTES,
  NOMBRES_DE_HOJA,
} from '../src/aplicacion/servicios/estructuraDeFormatos.js';
import { BLOQUES } from '../src/dominio/objetosValor/Bloque.js';
import { ETIQUETAS_TIPO_HABITACION } from '../src/dominio/objetosValor/TipoHabitacion.js';
import {
  generarCatalogoDeBloque,
  normalizarCodigoDeHabitacion,
  obtenerDefinicionDeHabitacion,
} from '../src/dominio/objetosValor/CatalogoHabitaciones.js';

const RUTA_POR_DEFECTO = 'B:/MIS_ARCHIVOS/marcus/RELACION NOMINAL RESIDENCIA I 2025.xlsx';
const carpetaDeEjemplos = fileURLToPath(new URL('../../ejemplos/', import.meta.url));

const rutaEntrada = process.argv[2] || RUTA_POR_DEFECTO;

// ----------------------------------------------------------
//  Lectura de encabezados
// ----------------------------------------------------------
function posicionesPorCampo(titulos = []) {
  const posiciones = new Map();
  titulos.forEach((titulo, indice) => {
    const clave = reconocerColumna(titulo);
    if (!clave) return;
    if (!posiciones.has(clave)) posiciones.set(clave, []);
    posiciones.get(clave).push(indice);
  });
  return posiciones;
}

// El formato viejo tiene DOS tablas al lado (administrativos). Cada
// tabla empieza en una columna "N°" y termina donde empieza la otra.
function detectarTablas(titulos = []) {
  const posiciones = posicionesPorCampo(titulos);
  const inicios = posiciones.get('orden') || [0];

  return inicios.map((inicio, indice) => {
    const fin = indice + 1 < inicios.length ? inicios[indice + 1] : titulos.length;
    const columnas = (clave) => (posiciones.get(clave) || []).filter((posicion) => posicion >= inicio && posicion < fin);
    const columna = (clave) => columnas(clave)[0];

    return {
      inicio,
      fin,
      nombre: columna('nombre'),
      ci: columnas('ci'),
      celular: columna('celular'),
      habitacion: columna('habitacionCodigo'),
      cargo: columna('cargo'),
      costo: columna('costo'),
      fechaIngreso: columna('fechaIngreso'),
      fechaRetiro: columna('fechaRetiro'),
      observaciones: columna('observaciones'),
    };
  });
}

function valorEn(celdas, posicion) {
  return posicion === undefined ? '' : aTexto(celdas[posicion]);
}

// ----------------------------------------------------------
//  Estudiantes
// ----------------------------------------------------------
function convertirEstudiantes(hoja, bloque) {
  const encabezado = buscarFilaDeEncabezado(hoja.filas);
  if (!encabezado) return [];

  const mapa = encabezado.mapa;
  const posiciones = posicionesPorCampo(encabezado.titulos);
  const catalogo = ordenarHabitaciones(generarCatalogoDeBloque(bloque));
  const posicionPorCodigo = new Map(catalogo.map((habitacion, indice) => [habitacion.codigo, indice]));

  const convertidos = [];
  const ciVistos = new Set();

  for (let indice = encabezado.indice + 1; indice < hoja.filas.length; indice += 1) {
    const celdas = hoja.filas[indice] || [];
    const nombre = valorEn(celdas, mapa.nombre);
    const ci = valorEn(celdas, mapa.ci);
    if (!nombre && !ci) continue;
    if (ci && ciVistos.has(ci)) continue;
    if (ci) ciVistos.add(ci);

    if (reconocerColumna(nombre) && reconocerColumna(ci)) continue;

    const habitacionOriginal = valorEn(celdas, mapa.habitacionCodigo);
    const codigo = normalizarCodigoDeHabitacion(habitacionOriginal);
    const definicion = codigo ? obtenerDefinicionDeHabitacion(bloque, codigo) : null;

    const notas = [];
    const observacionOriginal = valorEn(celdas, posiciones.get('observaciones')?.[0] ?? mapa.observaciones);
    if (observacionOriginal) notas.push(observacionOriginal);
    if (!definicion && habitacionOriginal) {
      notas.push(`REVISAR HABITACION (en el archivo decia: ${habitacionOriginal})`);
    }
    if (!habitacionOriginal) notas.push('SIN HABITACION EN EL ARCHIVO');

    convertidos.push({
      posicion: definicion ? posicionPorCodigo.get(definicion.codigo) : 999,
      valores: [
        '',
        bloque === BLOQUES.VARONES ? 'VARONES' : 'DAMAS',
        nombre,
        ci,
        valorEn(celdas, mapa.celular),
        valorEn(celdas, mapa.carrera),
        valorEn(celdas, mapa.semestre),
        valorEn(celdas, mapa.codigo),
        definicion ? definicion.codigo : '',
        definicion ? ETIQUETAS_TIPO_HABITACION[definicion.tipo] : '',
        valorEn(celdas, mapa.tutorNombre),
        valorEn(celdas, mapa.tutorCelular),
        valorEn(celdas, mapa.fechaIngreso),
        notas.join(' | '),
      ],
    });
  }

  convertidos.sort((a, b) => a.posicion - b.posicion);

  return convertidos.map((fila, indice) => {
    const valores = [...fila.valores];
    valores[0] = indice + 1;
    return valores;
  });
}

// ----------------------------------------------------------
//  Personal (administrativos, docentes y militares)
// ----------------------------------------------------------
function convertirPersonal(hoja, destino) {
  const encabezado = buscarFilaDeEncabezado(hoja.filas);
  if (!encabezado) return [];

  const tablas = detectarTablas(encabezado.titulos).filter((tabla) => tabla.nombre !== undefined);
  const registros = [];

  for (let indice = encabezado.indice + 1; indice < hoja.filas.length; indice += 1) {
    const celdas = hoja.filas[indice] || [];

    for (const tabla of tablas) {
      const nombre = valorEn(celdas, tabla.nombre);
      if (!nombre) continue;

      const ci = tabla.ci.map((posicion) => valorEn(celdas, posicion)).find(Boolean) || '';

      // Las hojas viejas repiten la fila de encabezados en el medio;
      // hay que saltarla para no confundirla con una persona.
      if (reconocerColumna(nombre) && reconocerColumna(ci)) continue;

      registros.push({
        nombre,
        ci,
        celular: valorEn(celdas, tabla.celular),
        habitacionOriginal: valorEn(celdas, tabla.habitacion),
        cargo: valorEn(celdas, tabla.cargo),
        costo: valorEn(celdas, tabla.costo),
        fechaIngreso: valorEn(celdas, tabla.fechaIngreso),
        fechaRetiro: valorEn(celdas, tabla.fechaRetiro),
      });
    }
  }

  const vistos = new Set();
  const unicos = [];
  for (const registro of registros) {
    const clave = registro.ci ? `ci:${registro.ci}` : `nombre:${registro.nombre.toUpperCase()}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    unicos.push(registro);
  }

  unicos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  return unicos.map((registro, indice) => {
    const notas = [];
    if (registro.cargo) notas.push(`CARGO EN EL ARCHIVO: ${registro.cargo}`);
    if (registro.habitacionOriginal) notas.push(`HABITACION ANTERIOR: ${registro.habitacionOriginal}`);
    notas.push(destino === 'GRANDES' ? 'ASIGNAR DEPARTAMENTO (DG-1..DG-4 o DD)' : 'ASIGNAR DEPARTAMENTO (D-1..D-20)');

    return [
      indice + 1,
      registro.nombre,
      registro.ci,
      registro.celular,
      registro.cargo,
      '',
      '',
      registro.costo || '',
      registro.fechaIngreso,
      registro.fechaRetiro,
      notas.join(' | '),
    ];
  });
}

function titulosDe(definicion) {
  return definicion.columnas.map((columna) => columna.titulo);
}

// ----------------------------------------------------------
//  Principal
// ----------------------------------------------------------
async function principal() {
  const lector = crearLectorExcel();
  const escritor = crearEscritorExcel();

  console.log(`Leyendo: ${rutaEntrada}`);
  const libro = await lector.leerArchivo(rutaEntrada);
  console.log(`Hojas encontradas: ${libro.hojas.map((hoja) => hoja.nombre).join(' | ')}`);

  const hojaVarones = libro.hojas.find((hoja) => /VARONES|HOMBRES/i.test(hoja.nombre));
  const hojaDamas = libro.hojas.find((hoja) => /DAMAS|MUJERES/i.test(hoja.nombre));
  const hojaAdministrativos = libro.hojas.find((hoja) => /ADMINISTRATIV/i.test(hoja.nombre));
  const hojaOficiales = libro.hojas.find((hoja) => /OFICIAL|MILITAR/i.test(hoja.nombre));

  const documentos = [];
  const titulosEstudiantes = titulosDe(FORMATO_ESTUDIANTES);

  if (hojaVarones || hojaDamas) {
    const hojas = [];
    if (hojaVarones) {
      const filas = convertirEstudiantes(hojaVarones, BLOQUES.VARONES);
      console.log(`Varones convertidos: ${filas.length} filas`);
      hojas.push({ nombre: NOMBRES_DE_HOJA.VARONES, subtitulo: 'BLOQUE VARONES', encabezados: titulosEstudiantes, filas });
    }
    if (hojaDamas) {
      const filas = convertirEstudiantes(hojaDamas, BLOQUES.DAMAS);
      console.log(`Damas convertidas: ${filas.length} filas`);
      hojas.push({ nombre: NOMBRES_DE_HOJA.DAMAS, subtitulo: 'BLOQUE DAMAS', encabezados: titulosEstudiantes, filas });
    }
    documentos.push({
      archivo: 'relacion-2025-estudiantes.xlsx',
      documento: { titulo: FORMATO_ESTUDIANTES.titulo, hojas },
    });
  }

  if (hojaAdministrativos) {
    const filas = convertirPersonal(hojaAdministrativos, 'PEQUENOS');
    console.log(`Personal administrativo y docente: ${filas.length} filas`);
    documentos.push({
      archivo: 'relacion-2025-departamentos-pequenos.xlsx',
      documento: {
        titulo: FORMATO_DEPARTAMENTOS_PEQUENOS.titulo,
        hojas: [
          {
            nombre: NOMBRES_DE_HOJA.DEPARTAMENTOS_PEQUENOS,
            subtitulo: 'BLOQUE DE DEPARTAMENTOS PEQUENOS',
            encabezados: titulosDe(FORMATO_DEPARTAMENTOS_PEQUENOS),
            filas,
          },
        ],
      },
    });
  }

  if (hojaOficiales) {
    const filas = convertirPersonal(hojaOficiales, 'GRANDES');
    console.log(`Personal militar: ${filas.length} filas`);
    documentos.push({
      archivo: 'relacion-2025-departamentos-grandes.xlsx',
      documento: {
        titulo: FORMATO_DEPARTAMENTOS_GRANDES.titulo,
        hojas: [
          {
            nombre: NOMBRES_DE_HOJA.DEPARTAMENTOS_GRANDES,
            subtitulo: 'BLOQUE DE DEPARTAMENTOS GRANDES Y DIRECCION',
            encabezados: titulosDe(FORMATO_DEPARTAMENTOS_GRANDES),
            filas,
          },
        ],
      },
    });
  }

  if (documentos.length === 0) {
    throw new Error('No se reconocio ninguna hoja de estudiantes, administrativos u oficiales');
  }

  await mkdir(carpetaDeEjemplos, { recursive: true });

  for (const { archivo, documento } of documentos) {
    const buffer = await escritor.escribir(documento);
    const destino = join(carpetaDeEjemplos, archivo);
    await writeFile(destino, buffer);
    console.log(`Generado: ${destino}`);
  }

  console.log('\nEstos archivos se importan desde la pantalla "Datos" del sistema.');
  console.log('Los estudiantes conservan su habitacion; el personal queda pendiente de asignar departamento.');
}

principal().catch((error) => {
  console.error(`No se pudo convertir la relacion: ${error.message}`);
  process.exitCode = 1;
});
