// ==========================================================
//  caracteristicas/mapa/TarjetaHabitacion.jsx
//  Cada tarjeta muestra: codigo, tipo, residentes, ocupacion y
//  si hay activos que necesitan atencion.
// ==========================================================

import { BedDouble, TriangleAlert, UserRound, Wrench } from 'lucide-react';

import { etiquetaDeOcupacion, nombreCortoDe } from '../../utiles/formato.js';

const CLASES_POR_TIPO = {
  INDIVIDUAL: 'habitacion-individual',
  COMPARTIDA: 'habitacion-compartida',
  DEPARTAMENTO_PEQUENO: 'habitacion-departamento',
  DEPARTAMENTO_GRANDE: 'habitacion-departamento',
  DIRECTOR: 'habitacion-director',
};

const ETIQUETAS_POR_TIPO = {
  INDIVIDUAL: 'Individual',
  COMPARTIDA: 'Compartida',
  DEPARTAMENTO_PEQUENO: 'Depto. pequeno',
  DEPARTAMENTO_GRANDE: 'Depto. grande',
  DIRECTOR: 'Direccion',
};

export function TarjetaHabitacion({ habitacion, alSeleccionar, compacta = false }) {
  const { ocupacion, residentes, activos } = habitacion;
  const enMantenimiento = habitacion.estado === 'EN_MANTENIMIENTO';
  const clase = CLASES_POR_TIPO[habitacion.tipo] || 'habitacion-individual';
  const libres = Math.max(ocupacion.libres, 0);

  return (
    <button
      type="button"
      onClick={() => alSeleccionar(habitacion)}
      className={`habitacion ${clase} ${enMantenimiento ? 'habitacion-mantenimiento' : ''} ${compacta ? 'p-2' : 'p-2.5 sm:p-3'}`}
      title={`${habitacion.codigo} - ${ETIQUETAS_POR_TIPO[habitacion.tipo] || habitacion.tipo}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-bold leading-tight text-emi-azulProfundo ${compacta ? 'text-sm' : 'text-base'}`}>
            {habitacion.codigo}
          </p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {ETIQUETAS_POR_TIPO[habitacion.tipo] || habitacion.tipo}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {enMantenimiento ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-500" title="En mantenimiento">
              <Wrench size={13} />
            </span>
          ) : null}
          {activos?.conAtencion > 0 ? (
            <span
              className="flex h-6 items-center gap-1 rounded-lg bg-emi-rojoClaro px-1.5 text-[11px] font-bold text-emi-rojo"
              title={`${activos.conAtencion} activo(s) con problemas`}
            >
              <TriangleAlert size={12} />
              {activos.conAtencion}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-2 space-y-0.5">
        {residentes.length === 0 ? (
          <p className="text-[11px] font-medium text-slate-400">{enMantenimiento ? 'Fuera de servicio' : 'Disponible'}</p>
        ) : (
          residentes.slice(0, compacta ? 2 : 3).map((residente) => (
            <p key={residente.ci} className="flex items-center gap-1 truncate text-[11px] font-medium text-slate-600 sm:text-xs">
              <UserRound size={11} className="shrink-0 text-emi-azul/60" />
              <span className="truncate">{nombreCortoDe(residente.nombre)}</span>
            </p>
          ))
        )}
        {residentes.length > (compacta ? 2 : 3) ? (
          <p className="text-[10px] font-semibold text-emi-azul">+{residentes.length - (compacta ? 2 : 3)} mas</p>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-1.5">
        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
          <BedDouble size={11} />
          {ocupacion.cantidad}/{ocupacion.capacidad}
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${libres === 0 && ocupacion.cantidad > 0 ? 'text-emi-naranja' : 'text-emi-verde'}`}>
          {etiquetaDeOcupacion(ocupacion.estado)}
        </span>
      </div>
    </button>
  );
}

export default TarjetaHabitacion;
