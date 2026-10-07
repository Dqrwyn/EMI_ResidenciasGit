// ==========================================================
//  componentesComunes/Estados.jsx
//  Cargando, EstadoVacio y ErrorDeCarga.
// ==========================================================

import { Inbox, Loader2, RefreshCw, TriangleAlert } from 'lucide-react';

export function Cargando({ mensaje = 'Cargando informacion...', compacto = false }) {
  if (compacto) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" />
        {mensaje}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 size={28} className="animate-spin text-emi-azul" />
      <p className="text-sm font-medium">{mensaje}</p>
    </div>
  );
}

export function EstadoVacio({ titulo = 'No hay datos todavia', mensaje, icono: Icono = Inbox, accion }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emi-azulClaro text-emi-azul">
        <Icono size={24} />
      </span>
      <div>
        <p className="text-base font-semibold text-emi-azulProfundo">{titulo}</p>
        {mensaje ? <p className="mt-1 max-w-md text-sm text-slate-500">{mensaje}</p> : null}
      </div>
      {accion}
    </div>
  );
}

export function ErrorDeCarga({ mensaje, alReintentar }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emi-rojoClaro text-emi-rojo">
        <TriangleAlert size={24} />
      </span>
      <div>
        <p className="text-base font-semibold text-emi-azulProfundo">No se pudo cargar la informacion</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">{mensaje}</p>
      </div>
      {alReintentar ? (
        <button type="button" className="boton-secundario" onClick={alReintentar}>
          <RefreshCw size={16} />
          Volver a intentar
        </button>
      ) : null}
    </div>
  );
}

export function Esqueleto({ filas = 3, alto = 'h-16' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: filas }).map((_, indice) => (
        <div key={indice} className={`animate-pulsoSuave rounded-xl bg-slate-100 ${alto}`} />
      ))}
    </div>
  );
}
