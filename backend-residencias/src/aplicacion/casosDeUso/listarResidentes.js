// ==========================================================
//  aplicacion/casosDeUso/listarResidentes.js
//  Listado con filtros y paginacion, enriquecido con los datos
//  de la habitacion de cada residente.
// ==========================================================

import { esBloqueValido } from '../../dominio/objetosValor/Bloque.js';

const LIMITE_POR_DEFECTO = 25;
const LIMITE_MAXIMO = 200;

function normalizarFiltros(filtros = {}) {
  const pagina = Math.max(Number.parseInt(filtros.pagina, 10) || 1, 1);
  const limite = Math.min(Math.max(Number.parseInt(filtros.limite, 10) || LIMITE_POR_DEFECTO, 1), LIMITE_MAXIMO);

  return {
    texto: filtros.texto ? String(filtros.texto).trim() : '',
    ci: filtros.ci ? String(filtros.ci).trim() : '',
    bloque: filtros.bloque && esBloqueValido(filtros.bloque) ? filtros.bloque : null,
    habitacionCodigo: filtros.habitacionCodigo ? String(filtros.habitacionCodigo).trim().toUpperCase() : null,
    tipo: filtros.tipo || null,
    estado: filtros.estado || null,
    sinHabitacion: filtros.sinHabitacion === 'true' || filtros.sinHabitacion === true,
    soloConActivosConAtencion: filtros.soloConActivosConAtencion === true,
    pagina,
    limite,
    salto: (pagina - 1) * limite,
    orden: filtros.orden === 'nombre' ? 'nombre' : filtros.orden === 'habitacion' ? 'habitacion' : 'habitacion',
  };
}

export function crearListarResidentes({ repositorioResidentes, repositorioHabitaciones, repositorioActivos }) {
  return async function listarResidentes(filtrosEntrada = {}) {
    const filtros = normalizarFiltros(filtrosEntrada);

    const [residentes, total] = await Promise.all([
      repositorioResidentes.listar(filtros),
      repositorioResidentes.contar(filtros),
    ]);

    const bloquesInvolucrados = [...new Set(residentes.map((residente) => residente.bloque).filter(Boolean))];
    const habitacionesPorBloque = {};
    for (const bloque of bloquesInvolucrados) {
      const habitaciones = await repositorioHabitaciones.listar(bloque);
      habitacionesPorBloque[bloque] = new Map(habitaciones.map((habitacion) => [habitacion.codigo, habitacion]));
    }

    const residentesArmados = [];
    for (const residente of residentes) {
      const habitacion = residente.bloque
        ? habitacionesPorBloque[residente.bloque]?.get(residente.habitacionCodigo) || null
        : null;

      const activosDeLaHabitacion =
        habitacion && repositorioActivos
          ? await repositorioActivos.listarPorHabitacion(residente.bloque, habitacion.codigo)
          : [];

      residentesArmados.push({
        ...residente,
        habitacion: habitacion
          ? {
              codigo: habitacion.codigo,
              tipo: habitacion.tipo,
              piso: habitacion.piso,
              lado: habitacion.lado,
              capacidad: habitacion.capacidad,
              estado: habitacion.estado,
            }
          : null,
        activosEnHabitacion: activosDeLaHabitacion.length,
      });
    }

    return {
      residentes: residentesArmados,
      total,
      pagina: filtros.pagina,
      limite: filtros.limite,
      paginas: Math.max(Math.ceil(total / filtros.limite), 1),
    };
  };
}
