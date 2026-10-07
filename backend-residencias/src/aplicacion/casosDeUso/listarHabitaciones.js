// ==========================================================
//  aplicacion/casosDeUso/listarHabitaciones.js
//  Arma todo lo que el mapa necesita: habitaciones del bloque,
//  sus residentes, sus activos y los totales del bloque.
// ==========================================================

import { ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';
import { ETIQUETAS_BLOQUE, esBloqueValido } from '../../dominio/objetosValor/Bloque.js';
import { calcularOcupacion } from '../../dominio/entidades/Habitacion.js';
import { ordenarHabitaciones } from '../servicios/ordenDeHabitaciones.js';

function indexarResidentes(residentes = []) {
  const indice = new Map();
  for (const residente of residentes) {
    if (!residente.habitacionCodigo) continue;
    if (!indice.has(residente.habitacionCodigo)) indice.set(residente.habitacionCodigo, []);
    indice.get(residente.habitacionCodigo).push(residente);
  }
  for (const lista of indice.values()) {
    lista.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }
  return indice;
}

function indexarActivos(resumen = []) {
  const indice = new Map();
  for (const fila of resumen) {
    indice.set(fila.habitacionCodigo, fila);
  }
  return indice;
}

function extraerResidente(residente) {
  return {
    ci: residente.ci,
    nombre: residente.nombre,
    tipo: residente.tipo,
    celular: residente.celular,
    carrera: residente.carrera,
    semestre: residente.semestre,
    codigo: residente.codigo,
    tutorNombre: residente.tutorNombre,
    tutorCelular: residente.tutorCelular,
    fechaIngreso: residente.fechaIngreso,
    estado: residente.estado,
    observaciones: residente.observaciones,
  };
}

export function crearListarHabitaciones({
  repositorioHabitaciones,
  repositorioResidentes,
  repositorioActivos,
}) {
  return async function listarHabitaciones({ bloque } = {}) {
    if (!esBloqueValido(bloque)) {
      throw new ErrorDeValidacion('El bloque indicado no es valido');
    }

    const [habitaciones, residentes, resumenDeActivos] = await Promise.all([
      repositorioHabitaciones.listar(bloque),
      repositorioResidentes.listarActivos({ bloque }),
      repositorioActivos.resumenPorHabitacion(bloque),
    ]);

    const residentesPorHabitacion = indexarResidentes(residentes);
    const activosPorHabitacion = indexarActivos(resumenDeActivos);

    const resumen = {
      totalHabitaciones: habitaciones.length,
      individuales: 0,
      compartidas: 0,
      departamentos: 0,
      residentesActivos: residentes.length,
      capacidadTotal: 0,
      puestosLibres: 0,
      habitacionesVacias: 0,
      habitacionesLlenas: 0,
      habitacionesEnMantenimiento: 0,
      activosTotales: 0,
      activosConAtencion: 0,
    };

    const habitacionesArmadas = ordenarHabitaciones(habitaciones).map((habitacion) => {
      const residentesDeLaHabitacion = residentesPorHabitacion.get(habitacion.codigo) || [];
      const activosDeLaHabitacion = activosPorHabitacion.get(habitacion.codigo) || { total: 0, conAtencion: 0 };
      const ocupacion = calcularOcupacion(habitacion, residentesDeLaHabitacion.length);

      if (habitacion.tipo === 'INDIVIDUAL') resumen.individuales += 1;
      else if (habitacion.tipo === 'COMPARTIDA') resumen.compartidas += 1;
      else resumen.departamentos += 1;

      resumen.capacidadTotal += ocupacion.capacidad;
      resumen.puestosLibres += Math.max(ocupacion.libres, 0);
      if (ocupacion.estado === 'VACIA') resumen.habitacionesVacias += 1;
      if (ocupacion.estado === 'LLENA' || ocupacion.estado === 'EXCEDIDA') resumen.habitacionesLlenas += 1;
      if (habitacion.estado === 'EN_MANTENIMIENTO') resumen.habitacionesEnMantenimiento += 1;
      resumen.activosTotales += activosDeLaHabitacion.total || 0;
      resumen.activosConAtencion += activosDeLaHabitacion.conAtencion || 0;

      return {
        codigo: habitacion.codigo,
        bloque: habitacion.bloque,
        piso: habitacion.piso,
        lado: habitacion.lado,
        orden: habitacion.orden,
        posicion: habitacion.posicion,
        tipo: habitacion.tipo,
        capacidad: habitacion.capacidad,
        costo: habitacion.costo,
        estado: habitacion.estado,
        observaciones: habitacion.observaciones || '',
        ocupacion,
        residentes: residentesDeLaHabitacion.map(extraerResidente),
        activos: {
          total: activosDeLaHabitacion.total || 0,
          conAtencion: activosDeLaHabitacion.conAtencion || 0,
        },
      };
    });

    return {
      bloque,
      etiquetaBloque: ETIQUETAS_BLOQUE[bloque],
      habitaciones: habitacionesArmadas,
      resumen,
      generadoEn: new Date().toISOString(),
    };
  };
}
