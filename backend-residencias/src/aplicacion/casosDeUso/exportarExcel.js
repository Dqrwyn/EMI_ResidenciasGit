// ==========================================================
//  aplicacion/casosDeUso/exportarExcel.js
//  Genera la relacion nominal COMPLETA por habitaciones en los
//  tres formatos. El documento que produce esta capa es solo
//  datos + encabezados: la infraestructura lo convierte en .xlsx.
// ==========================================================

import { ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';
import { BLOQUES, ETIQUETAS_CORTAS_BLOQUE } from '../../dominio/objetosValor/Bloque.js';
import { ETIQUETAS_TIPO_HABITACION } from '../../dominio/objetosValor/TipoHabitacion.js';
import { ordenarHabitaciones } from '../servicios/ordenDeHabitaciones.js';
import { FORMATOS, NOMBRES_DE_HOJA, obtenerDefinicionDeFormato } from '../servicios/estructuraDeFormatos.js';

function fechaCorta() {
  return new Date().toISOString().slice(0, 10);
}

function armarFila(definicion, valores) {
  return definicion.columnas.map((columna) => {
    const valor = valores[columna.clave];
    return valor === undefined || valor === null ? '' : valor;
  });
}

function valoresDeResidente(residente) {
  return {
    nombre: residente.nombre,
    ci: residente.ci,
    celular: residente.celular,
    carrera: residente.carrera,
    semestre: residente.semestre,
    codigo: residente.codigo,
    tutorNombre: residente.tutorNombre,
    tutorCelular: residente.tutorCelular,
    cargo: residente.cargo,
    fechaIngreso: residente.fechaIngreso,
    fechaRetiro: residente.fechaRetiro,
    observaciones: residente.observaciones,
  };
}

export function crearExportarExcel({ repositorioHabitaciones, repositorioResidentes }) {
  return async function exportarExcel({ formato, soloPlantilla = false } = {}) {
    const definicion = obtenerDefinicionDeFormato(formato);
    if (!definicion) throw new ErrorDeValidacion('El formato indicado no es valido');

    if (formato === FORMATOS.ESTUDIANTES) {
      const hojas = [];
      for (const bloque of [BLOQUES.VARONES, BLOQUES.DAMAS]) {
        hojas.push(await armarHoja({ definicion, bloque, soloPlantilla, repositorioHabitaciones, repositorioResidentes }));
      }

      return {
        formato,
        nombreArchivo: `${soloPlantilla ? 'plantilla' : 'relacion'}-estudiantes-${fechaCorta()}.xlsx`,
        documento: { titulo: definicion.titulo, hojas },
      };
    }

    const bloque =
      formato === FORMATOS.DEPARTAMENTOS_PEQUENOS ? BLOQUES.DEPARTAMENTOS_PEQUENOS : BLOQUES.DEPARTAMENTOS_GRANDES;

    const hoja = await armarHoja({ definicion, bloque, soloPlantilla, repositorioHabitaciones, repositorioResidentes });
    const nombreDeHoja =
      formato === FORMATOS.DEPARTAMENTOS_PEQUENOS
        ? NOMBRES_DE_HOJA.DEPARTAMENTOS_PEQUENOS
        : NOMBRES_DE_HOJA.DEPARTAMENTOS_GRANDES;

    return {
      formato,
      nombreArchivo: `${soloPlantilla ? 'plantilla' : 'relacion'}-${nombreDeHoja.toLowerCase().replace(/\s+/g, '-')}-${fechaCorta()}.xlsx`,
      documento: { titulo: definicion.titulo, hojas: [{ ...hoja, nombre: nombreDeHoja }] },
    };
  };
}

async function armarHoja({ definicion, bloque, soloPlantilla, repositorioHabitaciones, repositorioResidentes }) {
  const [habitaciones, residentes] = await Promise.all([
    repositorioHabitaciones.listar(bloque),
    repositorioResidentes.listarActivos({ bloque }),
  ]);

  const porHabitacion = new Map();
  for (const residente of residentes) {
    if (!residente.habitacionCodigo) continue;
    if (!porHabitacion.has(residente.habitacionCodigo)) porHabitacion.set(residente.habitacionCodigo, []);
    porHabitacion.get(residente.habitacionCodigo).push(residente);
  }
  for (const lista of porHabitacion.values()) {
    lista.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }

  const filas = [];
  let contador = 0;

  for (const habitacion of ordenarHabitaciones(habitaciones)) {
    const ocupantes = soloPlantilla ? [] : porHabitacion.get(habitacion.codigo) || [];
    const datosDeLaHabitacion = {
      habitacionCodigo: habitacion.codigo,
      tipoHabitacion: ETIQUETAS_TIPO_HABITACION[habitacion.tipo] || habitacion.tipo,
      costo: habitacion.costo || '',
      bloque: ETIQUETAS_CORTAS_BLOQUE[bloque],
    };

    if (ocupantes.length === 0) {
      contador += 1;
      filas.push(armarFila(definicion, { orden: contador, ...datosDeLaHabitacion }));
      continue;
    }

    for (const residente of ocupantes) {
      contador += 1;
      filas.push(
        armarFila(definicion, {
          orden: contador,
          ...datosDeLaHabitacion,
          ...valoresDeResidente(residente),
          estado: residente.estado,
        }),
      );
    }
  }

  // Residentes activos todavia sin habitacion: se exportan al final
  // para que ningun dato se pierda en el ciclo exportar -> importar.
  if (!soloPlantilla) {
    const sinAsignar = residentes
      .filter((residente) => !residente.habitacionCodigo)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));

    for (const residente of sinAsignar) {
      contador += 1;
      filas.push(
        armarFila(definicion, {
          orden: contador,
          bloque: ETIQUETAS_CORTAS_BLOQUE[bloque],
          ...valoresDeResidente(residente),
        }),
      );
    }
  }

  return {
    nombre: bloque === BLOQUES.VARONES ? NOMBRES_DE_HOJA.VARONES : bloque === BLOQUES.DAMAS ? NOMBRES_DE_HOJA.DAMAS : NOMBRES_DE_HOJA.DEPARTAMENTOS_PEQUENOS,
    subtitulo: `BLOQUE ${ETIQUETAS_CORTAS_BLOQUE[bloque].toUpperCase()}`,
    bloque,
    encabezados: definicion.columnas.map((columna) => columna.titulo),
    filas,
    totalColumnas: definicion.columnas.length,
  };
}
