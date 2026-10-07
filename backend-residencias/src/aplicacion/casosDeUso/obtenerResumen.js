// ==========================================================
//  aplicacion/casosDeUso/obtenerResumen.js
//  Panel general: cuantas personas viven en cada bloque, cuantos
//  puestos quedan libres y que activos necesitan atencion.
// ==========================================================

import { ETIQUETAS_BLOQUE, TODOS_LOS_BLOQUES } from '../../dominio/objetosValor/Bloque.js';
import { ETIQUETAS_TIPO_RESIDENTE } from '../../dominio/objetosValor/TipoResidente.js';
import { calcularOcupacion } from '../../dominio/entidades/Habitacion.js';

export function crearObtenerResumen({
  repositorioHabitaciones,
  repositorioResidentes,
  repositorioActivos,
  repositorioMovimientos,
}) {
  return async function obtenerResumen() {
    const bloques = [];

    let residentesActivos = 0;
    let habitacionesTotales = 0;
    let capacidadTotal = 0;
    let habitacionesLlenas = 0;
    let habitacionesVacias = 0;
    let habitacionesEnMantenimiento = 0;
    let activosTotales = 0;
    let activosConAtencion = 0;
    const conteoPorTipo = new Map();

    for (const bloque of TODOS_LOS_BLOQUES) {
      const [habitaciones, residentes, resumenDeActivos] = await Promise.all([
        repositorioHabitaciones.listar(bloque),
        repositorioResidentes.listarActivos({ bloque }),
        repositorioActivos.resumenPorHabitacion(bloque),
      ]);

      const porHabitacion = new Map();
      for (const residente of residentes) {
        if (!residente.habitacionCodigo) continue;
        porHabitacion.set(residente.habitacionCodigo, (porHabitacion.get(residente.habitacionCodigo) || 0) + 1);
        conteoPorTipo.set(residente.tipo, (conteoPorTipo.get(residente.tipo) || 0) + 1);
      }

      let capacidadDelBloque = 0;
      let llenas = 0;
      let vacias = 0;
      let enMantenimiento = 0;

      for (const habitacion of habitaciones) {
        const ocupacion = calcularOcupacion(habitacion, porHabitacion.get(habitacion.codigo) || 0);
        capacidadDelBloque += ocupacion.capacidad;
        if (ocupacion.estado === 'LLENA' || ocupacion.estado === 'EXCEDIDA') llenas += 1;
        if (ocupacion.estado === 'VACIA') vacias += 1;
        if (habitacion.estado === 'EN_MANTENIMIENTO') enMantenimiento += 1;
      }

      const activosDelBloque = resumenDeActivos.reduce(
        (acumulado, fila) => ({
          total: acumulado.total + (fila.total || 0),
          conAtencion: acumulado.conAtencion + (fila.conAtencion || 0),
        }),
        { total: 0, conAtencion: 0 },
      );

      bloques.push({
        bloque,
        etiqueta: ETIQUETAS_BLOQUE[bloque],
        habitaciones: habitaciones.length,
        residentes: residentes.length,
        capacidad: capacidadDelBloque,
        puestosLibres: Math.max(capacidadDelBloque - residentes.length, 0),
        llenas,
        vacias,
        enMantenimiento,
        activos: activosDelBloque,
      });

      residentesActivos += residentes.length;
      habitacionesTotales += habitaciones.length;
      capacidadTotal += capacidadDelBloque;
      habitacionesLlenas += llenas;
      habitacionesVacias += vacias;
      habitacionesEnMantenimiento += enMantenimiento;
      activosTotales += activosDelBloque.total;
      activosConAtencion += activosDelBloque.conAtencion;
    }

    const sinHabitacion = await repositorioResidentes.contar({ estado: 'ACTIVO', sinHabitacion: true });
    const retirados = await repositorioResidentes.contar({ estado: 'RETIRADO' });
    const movimientosRecientes = repositorioMovimientos ? await repositorioMovimientos.listar({ limite: 8 }) : [];

    return {
      residentesActivos,
      residentesSinHabitacion: sinHabitacion,
      residentesRetirados: retirados,
      habitaciones: {
        total: habitacionesTotales,
        llenas: habitacionesLlenas,
        vacias: habitacionesVacias,
        enMantenimiento: habitacionesEnMantenimiento,
        capacidad: capacidadTotal,
        puestosLibres: Math.max(capacidadTotal - residentesActivos, 0),
      },
      activos: { total: activosTotales, conAtencion: activosConAtencion },
      porTipo: [...conteoPorTipo.entries()].map(([tipo, cantidad]) => ({
        tipo,
        etiqueta: ETIQUETAS_TIPO_RESIDENTE[tipo] || tipo,
        cantidad,
      })),
      bloques,
      movimientosRecientes,
      generadoEn: new Date().toISOString(),
    };
  };
}
