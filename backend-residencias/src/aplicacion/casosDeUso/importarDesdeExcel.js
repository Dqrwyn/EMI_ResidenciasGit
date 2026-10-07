// ==========================================================
//  aplicacion/casosDeUso/importarDesdeExcel.js
//  Lee un Excel (estudiantes, departamentos pequenos o grandes),
//  crea o actualiza residentes y los asigna a su habitacion.
//
//  Reglas:
//   1. Si el CI no existe, se crea al residente.
//   2. Si el CI ya existe, se actualizan solo los datos que trae
//      el archivo (una celda vacia NUNCA borra lo que ya estaba).
//   3. Si el archivo asigna otra habitacion, se registra el cambio.
//   4. Si la habitacion no existe o esta llena, se informa como
//      advertencia y el dato no se pierde.
// ==========================================================

import { ErrorDeImportacion } from '../../dominio/errores/erroresDeDominio.js';
import { BLOQUES, normalizarBloque } from '../../dominio/objetosValor/Bloque.js';
import { normalizarCodigoDeHabitacion } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { prepararResidente } from '../../dominio/entidades/Residente.js';
import { normalizarTipoResidente, TIPOS_RESIDENTE } from '../../dominio/objetosValor/TipoResidente.js';
import { crearMovimiento, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';
import {
  detectarFormato,
  esEncabezadoDeFormato,
  interpretarFila,
  mapearEncabezados,
} from '../servicios/mapeadorColumnas.js';
import { aTexto, esVacio, normalizarClave } from '../servicios/normalizadorTexto.js';
import { FORMATOS, obtenerDefinicionDeFormato } from '../servicios/estructuraDeFormatos.js';

const MAXIMO_MENSAJES = 80;
const MAXIMO_FILAS_DE_ENCABEZADO = 15;

export function crearImportarDesdeExcel({
  repositorioHabitaciones,
  repositorioResidentes,
  repositorioMovimientos,
  lectorExcel,
}) {
  return async function importarDesdeExcel({
    buffer,
    nombreArchivo = 'archivo.xlsx',
    formato = null,
    usuario = null,
    permitirSobreOcupacion = true,
  } = {}) {
    if (!buffer) throw new ErrorDeImportacion('No se recibio ningun archivo');

    const inicio = Date.now();
    const libro = await lectorExcel.leer(buffer);

    if (!libro.hojas || libro.hojas.length === 0) {
      throw new ErrorDeImportacion('El archivo no contiene ninguna hoja con datos');
    }

    const resultado = {
      archivo: nombreArchivo,
      formato: null,
      filasLeidas: 0,
      creados: 0,
      actualizados: 0,
      sinCambios: 0,
      movidos: 0,
      sinHabitacion: 0,
      errores: [],
      advertencias: [],
      habitacionesTocadas: [],
      duracionMs: 0,
    };

    // ---- 1. Detectar el formato -------------------------------------
    const nombresDeHojas = libro.hojas.map((hoja) => hoja.nombre);
    const encabezadosDeMuestra = [];
    for (const hoja of libro.hojas) {
      const encabezado = buscarFilaDeEncabezado(hoja.filas);
      if (encabezado) encabezadosDeMuestra.push(...encabezado.titulos);
    }

    const formatoDetectado = formato || detectarFormato({ encabezados: encabezadosDeMuestra, nombresDeHojas });
    if (!formatoDetectado || !obtenerDefinicionDeFormato(formatoDetectado)) {
      throw new ErrorDeImportacion(
        'No se pudo reconocer el formato del archivo. Indique si es de estudiantes, de departamentos pequenos o de departamentos grandes.',
      );
    }
    resultado.formato = formatoDetectado;

    // ---- 2. Indices de apoyo ----------------------------------------
    const habitacionesPorBloque = new Map();
    const cargarHabitaciones = async (bloque) => {
      if (!habitacionesPorBloque.has(bloque)) {
        const habitaciones = await repositorioHabitaciones.listar(bloque);
        habitacionesPorBloque.set(bloque, new Map(habitaciones.map((habitacion) => [habitacion.codigo, habitacion])));
      }
      return habitacionesPorBloque.get(bloque);
    };

    const claveHabitacion = (bloque, codigo) => `${bloque}|${codigo}`;
    const ocupacionPorHabitacion = new Map();
    const cargarOcupacion = async (bloque) => {
      if (ocupacionPorHabitacion.has(`cargado:${bloque}`)) return;
      for (const fila of await repositorioResidentes.resumenPorHabitacion(bloque)) {
        ocupacionPorHabitacion.set(claveHabitacion(bloque, fila.habitacionCodigo), fila.cantidad);
      }
      ocupacionPorHabitacion.set(`cargado:${bloque}`, true);
    };

    const residentesPorCi = new Map();
    const buscarResidente = async (ci) => {
      if (!residentesPorCi.has(ci)) residentesPorCi.set(ci, await repositorioResidentes.buscarPorCi(ci));
      return residentesPorCi.get(ci);
    };

    const contexto = {
      usuario,
      permitirSobreOcupacion,
      resultado,
      repositorioResidentes,
      repositorioMovimientos,
      cargarHabitaciones,
      cargarOcupacion,
      ocupacionPorHabitacion,
      claveHabitacion,
      buscarResidente,
      residentesPorCi,
    };

    // ---- 3. Recorrer las hojas --------------------------------------
    for (const hoja of libro.hojas) {
      const encabezado = buscarFilaDeEncabezado(hoja.filas);
      if (!encabezado) {
        resultado.advertencias.push({
          hoja: hoja.nombre,
          fila: null,
          mensaje: 'La hoja no tiene una fila de encabezados reconocible; se omitio por completo',
        });
        continue;
      }

      const bloqueDeLaHoja = bloqueSegunNombreDeHoja(hoja.nombre, formatoDetectado);

      for (let indice = encabezado.indice + 1; indice < hoja.filas.length; indice += 1) {
        const celdas = hoja.filas[indice] || [];
        const numeroDeFila = indice + 1;
        const registro = interpretarFila(encabezado.mapa, celdas);
        if (filaVacia(registro)) continue;

        resultado.filasLeidas += 1;

        try {
          await procesarFila({
            registro,
            numeroDeFila,
            hoja: hoja.nombre,
            bloqueDeLaHoja,
            formato: formatoDetectado,
            ...contexto,
          });
        } catch (error) {
          if (resultado.errores.length < MAXIMO_MENSAJES) {
            const detalles = Array.isArray(error.detalles) && error.detalles.length > 0 ? ` (${error.detalles.join('; ')})` : '';
            resultado.errores.push({ hoja: hoja.nombre, fila: numeroDeFila, mensaje: `${error.message}${detalles}` });
          }
        }
      }
    }

    resultado.habitacionesTocadas = [...new Set(resultado.habitacionesTocadas)];
    resultado.duracionMs = Date.now() - inicio;

    if (repositorioMovimientos) {
      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.IMPORTACION,
          detalle:
            `Importacion de ${nombreArchivo}: ${resultado.creados} creados, ` +
            `${resultado.actualizados} actualizados, ${resultado.errores.length} filas con problemas`,
          usuario,
        }),
      );
    }

    return resultado;
  };
}

// ============================================================
//  Auxiliares (exportados para las pruebas)
// ============================================================

export function buscarFilaDeEncabezado(filas = []) {
  const limite = Math.min(filas.length, MAXIMO_FILAS_DE_ENCABEZADO);
  for (let indice = 0; indice < limite; indice += 1) {
    const titulos = (filas[indice] || []).map((celda) => aTexto(celda));
    if (esEncabezadoDeFormato(titulos)) {
      const { mapa } = mapearEncabezados(titulos);
      return { numeroDeFila: indice + 1, indice, titulos, mapa };
    }
  }
  return null;
}

export function bloqueSegunNombreDeHoja(nombre, formato) {
  if (formato === FORMATOS.DEPARTAMENTOS_PEQUENOS) return BLOQUES.DEPARTAMENTOS_PEQUENOS;
  if (formato === FORMATOS.DEPARTAMENTOS_GRANDES) return BLOQUES.DEPARTAMENTOS_GRANDES;
  const clave = normalizarClave(nombre);
  if (clave.includes('VARONES') || clave.includes('HOMBRES')) return BLOQUES.VARONES;
  if (clave.includes('DAMAS') || clave.includes('MUJERES')) return BLOQUES.DAMAS;
  return null;
}

export function filaVacia(registro = {}) {
  return esVacio(registro.nombre) && esVacio(registro.ci);
}

export function bloqueSegunCodigoDeHabitacion(codigo) {
  if (!codigo) return null;
  if (/^D-\d+$/.test(codigo)) return BLOQUES.DEPARTAMENTOS_PEQUENOS;
  if (/^(DG-\d+|DD)$/.test(codigo)) return BLOQUES.DEPARTAMENTOS_GRANDES;
  return null;
}

function tipoPorDefecto(formato, codigoDeHabitacion, bloque) {
  if (codigoDeHabitacion === 'DD') return TIPOS_RESIDENTE.DIRECTOR;
  if (bloque === BLOQUES.DEPARTAMENTOS_GRANDES) return TIPOS_RESIDENTE.MILITAR;
  if (bloque === BLOQUES.DEPARTAMENTOS_PEQUENOS) return TIPOS_RESIDENTE.ADMINISTRATIVO;
  if (formato === FORMATOS.ESTUDIANTES) return TIPOS_RESIDENTE.ESTUDIANTE;
  return TIPOS_RESIDENTE.ADMINISTRATIVO;
}

async function procesarFila({
  registro,
  numeroDeFila,
  hoja,
  bloqueDeLaHoja,
  formato,
  usuario,
  permitirSobreOcupacion,
  resultado,
  repositorioResidentes,
  repositorioMovimientos,
  cargarHabitaciones,
  cargarOcupacion,
  ocupacionPorHabitacion,
  claveHabitacion,
  buscarResidente,
  residentesPorCi,
}) {
  const nombre = aTexto(registro.nombre);
  const ciBruto = aTexto(registro.ci);

  if (!ciBruto) {
    resultado.errores.push({
      hoja,
      fila: numeroDeFila,
      mensaje: `La fila de "${nombre}" no tiene CI y no se puede identificar`,
    });
    return;
  }

  if (esVacio(nombre)) {
    resultado.errores.push({ hoja, fila: numeroDeFila, mensaje: `La fila con CI ${ciBruto} no tiene nombre` });
    return;
  }

  const codigoDeHabitacion = normalizarCodigoDeHabitacion(aTexto(registro.habitacionCodigo));
  let bloque =
    normalizarBloque(aTexto(registro.bloque)) || bloqueSegunCodigoDeHabitacion(codigoDeHabitacion) || bloqueDeLaHoja;

  if (!bloque && formato !== FORMATOS.ESTUDIANTES) {
    bloque =
      formato === FORMATOS.DEPARTAMENTOS_PEQUENOS ? BLOQUES.DEPARTAMENTOS_PEQUENOS : BLOQUES.DEPARTAMENTOS_GRANDES;
  }

  if (!bloque) {
    resultado.errores.push({
      hoja,
      fila: numeroDeFila,
      mensaje: `"${nombre}" no indica bloque (columna BLOQUE o una hoja llamada EST. VARONES / EST. DAMAS)`,
    });
    return;
  }

  let habitacion = null;
  if (codigoDeHabitacion) {
    habitacion = (await cargarHabitaciones(bloque)).get(codigoDeHabitacion) || null;

    if (!habitacion) {
      for (const bloqueAlternativo of [BLOQUES.DEPARTAMENTOS_PEQUENOS, BLOQUES.DEPARTAMENTOS_GRANDES]) {
        const alternativas = await cargarHabitaciones(bloqueAlternativo);
        if (alternativas.has(codigoDeHabitacion)) {
          habitacion = alternativas.get(codigoDeHabitacion);
          bloque = bloqueAlternativo;
          break;
        }
      }
    }

    if (!habitacion) {
      resultado.advertencias.push({
        hoja,
        fila: numeroDeFila,
        mensaje: `La habitacion "${codigoDeHabitacion}" no existe en el catalogo; "${nombre}" queda sin asignar`,
      });
    }
  }

  const habitacionCodigo = habitacion ? habitacion.codigo : null;
  // El tipo puede venir en su propia columna o deducirse del cargo
  // (por ejemplo: CARGO "DOCENTE" -> tipo DOCENTE).
  const tipo =
    normalizarTipoResidente(aTexto(registro.tipo)) ||
    normalizarTipoResidente(aTexto(registro.cargo)) ||
    tipoPorDefecto(formato, habitacionCodigo, bloque);

  const delArchivo = prepararResidente(
    {
      ci: ciBruto,
      nombre,
      tipo,
      celular: aTexto(registro.celular),
      carrera: aTexto(registro.carrera),
      semestre: aTexto(registro.semestre),
      codigo: aTexto(registro.codigo),
      tutorNombre: aTexto(registro.tutorNombre),
      tutorCelular: aTexto(registro.tutorCelular),
      cargo: aTexto(registro.cargo),
      observaciones: aTexto(registro.observaciones),
      fechaIngreso: aTexto(registro.fechaIngreso),
      fechaRetiro: aTexto(registro.fechaRetiro),
      bloque,
      habitacionCodigo,
    },
    { validar: true },
  );

  const existente = await buscarResidente(delArchivo.ci);

  // ---- Residentes que quedan (o siguen) sin habitacion ------------
  if (!habitacionCodigo && !(existente && existente.habitacionCodigo)) {
    resultado.sinHabitacion += 1;
  }

  // ---- Capacidad de la habitacion de destino ----------------------
  if (habitacion) {
    await cargarOcupacion(bloque);
    const clave = claveHabitacion(bloque, habitacion.codigo);
    const ocupacionActual = ocupacionPorHabitacion.get(clave) || 0;
    const yaOcupaEseLugar = Boolean(
      existente && existente.habitacionCodigo === habitacion.codigo && existente.bloque === bloque,
    );

    if (!yaOcupaEseLugar && ocupacionActual + 1 > habitacion.capacidad) {
      if (!permitirSobreOcupacion) {
        throw new Error(`La habitacion ${habitacion.codigo} ya alcanzo su capacidad de ${habitacion.capacidad}`);
      }
      if (resultado.advertencias.length < MAXIMO_MENSAJES) {
        resultado.advertencias.push({
          hoja,
          fila: numeroDeFila,
          mensaje: `La habitacion ${habitacion.codigo} supera su capacidad (${ocupacionActual + 1}/${
            habitacion.capacidad
          }): ${nombre}`,
        });
      }
    }

    if (!yaOcupaEseLugar) ocupacionPorHabitacion.set(clave, ocupacionActual + 1);
    resultado.habitacionesTocadas.push(`${bloque}:${habitacion.codigo}`);
  }

  // ---- Crear -------------------------------------------------------
  if (!existente) {
    const creado = await repositorioResidentes.crear(delArchivo);
    residentesPorCi.set(creado.ci, creado);
    resultado.creados += 1;
    return;
  }

  // ---- Actualizar --------------------------------------------------
  const fusionado = fusionarConLoExistente(existente, delArchivo);
  const camposCambiados = diferencias(existente, fusionado);

  if (camposCambiados.length === 0) {
    resultado.sinCambios += 1;
    return;
  }

  const actualizado = await repositorioResidentes.actualizar(existente.ci, fusionado);
  residentesPorCi.set(actualizado.ci, actualizado);
  resultado.actualizados += 1;

  const cambiaDeHabitacion =
    existente.habitacionCodigo !== fusionado.habitacionCodigo || existente.bloque !== fusionado.bloque;

  if (cambiaDeHabitacion) {
    resultado.movidos += 1;
    if (resultado.advertencias.length < MAXIMO_MENSAJES) {
      resultado.advertencias.push({
        hoja,
        fila: numeroDeFila,
        mensaje: `${nombre} pasa de ${existente.habitacionCodigo || 'sin habitacion'} a ${
          fusionado.habitacionCodigo || 'sin habitacion'
        }`,
      });
    }

    if (usuario && repositorioMovimientos) {
      await repositorioMovimientos.registrar(
        crearMovimiento({
          tipo: TIPOS_MOVIMIENTO.MOVIMIENTO,
          residenteCi: actualizado.ci,
          residenteNombre: actualizado.nombre,
          habitacionOrigen: existente.habitacionCodigo,
          habitacionDestino: actualizado.habitacionCodigo,
          detalle: 'Cambio de habitacion durante la importacion del Excel',
          usuario,
        }),
      );
    }
  }
}

export function fusionarConLoExistente(existente, delArchivo) {
  const fusionado = { ...existente };

  const camposDeTexto = [
    'nombre',
    'celular',
    'carrera',
    'semestre',
    'codigo',
    'tutorNombre',
    'tutorCelular',
    'cargo',
    'observaciones',
    'fechaIngreso',
    'fechaRetiro',
  ];

  for (const campo of camposDeTexto) {
    if (!esVacio(delArchivo[campo])) fusionado[campo] = delArchivo[campo];
  }

  if (delArchivo.tipo) fusionado.tipo = delArchivo.tipo;
  if (delArchivo.habitacionCodigo) {
    fusionado.habitacionCodigo = delArchivo.habitacionCodigo;
    fusionado.bloque = delArchivo.bloque;
  }

  fusionado.estado = delArchivo.estado || existente.estado || 'ACTIVO';
  return fusionado;
}

export function diferencias(antes = {}, despues = {}) {
  const campos = [
    'nombre',
    'tipo',
    'celular',
    'carrera',
    'semestre',
    'codigo',
    'tutorNombre',
    'tutorCelular',
    'cargo',
    'observaciones',
    'fechaIngreso',
    'fechaRetiro',
    'bloque',
    'habitacionCodigo',
    'estado',
  ];

  return campos.filter((campo) => {
    const valorAntes = antes[campo] === undefined || antes[campo] === null ? '' : String(antes[campo]);
    const valorDespues = despues[campo] === undefined || despues[campo] === null ? '' : String(despues[campo]);
    return valorAntes !== valorDespues;
  });
}
