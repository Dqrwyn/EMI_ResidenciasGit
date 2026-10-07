// ==========================================================
//  caracteristicas/mapa/MapaDePiso.jsx
//
//  Distribucion oficial de CADA LADO del piso:
//    arriba  -> 2 habitaciones individuales
//    medio   -> 3 habitaciones compartidas
//    abajo   -> 2 habitaciones individuales
//  Total por lado: 4 individuales + 3 compartidas.
//  Total por piso: 8 individuales + 6 compartidas.
// ==========================================================

import { ArrowLeft, ArrowRight } from 'lucide-react';

import TarjetaHabitacion from './TarjetaHabitacion.jsx';

function ordenar(habitaciones) {
  return [...habitaciones].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}

function LadoDelPiso({ lado, habitaciones, alSeleccionar }) {
  const superiores = ordenar(habitaciones.filter((habitacion) => habitacion.posicion === 'SUPERIOR'));
  const delMedio = ordenar(habitaciones.filter((habitacion) => habitacion.posicion === 'MEDIO'));
  const inferiores = ordenar(habitaciones.filter((habitacion) => habitacion.posicion === 'INFERIOR'));
  const esIzquierdo = lado === 'IZQUIERDO';

  return (
    <section className="rounded-2xl border border-emi-grisBorde bg-white p-3 shadow-tarjeta sm:p-4">
      <header className="mb-3 flex items-center justify-between gap-2 border-b border-emi-grisBorde pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emi-azulClaro text-emi-azul">
            {esIzquierdo ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
          </span>
          <div>
            <p className="text-sm font-bold text-emi-azulProfundo">{esIzquierdo ? 'Lado izquierdo' : 'Lado derecho'}</p>
            <p className="text-[11px] text-slate-400">4 individuales y 3 compartidas</p>
          </div>
        </div>
        <span className="insignia-gris">{habitaciones.length} habitaciones</span>
      </header>

      {/* Extremo superior: 2 individuales */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {superiores.map((habitacion) => (
          <TarjetaHabitacion key={habitacion.codigo} habitacion={habitacion} alSeleccionar={alSeleccionar} />
        ))}
      </div>

      {/* Medio: 3 compartidas */}
      <div className="my-3 rounded-xl border border-dashed border-emi-amarilloOscuro/60 bg-emi-amarilloClaro/35 p-2 sm:p-2.5">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-emi-naranja">
          Habitaciones compartidas del medio
        </p>
        <div className="space-y-2">
          {delMedio.map((habitacion) => (
            <TarjetaHabitacion key={habitacion.codigo} habitacion={habitacion} alSeleccionar={alSeleccionar} compacta />
          ))}
        </div>
      </div>

      {/* Extremo inferior: 2 individuales */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {inferiores.map((habitacion) => (
          <TarjetaHabitacion key={habitacion.codigo} habitacion={habitacion} alSeleccionar={alSeleccionar} />
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {habitaciones.map((habitacion) => habitacion.codigo).join(' - ')}
      </p>
    </section>
  );
}

export function MapaDePiso({ habitaciones, alSeleccionar }) {
  const izquierda = habitaciones.filter((habitacion) => habitacion.lado === 'IZQUIERDO');
  const derecha = habitaciones.filter((habitacion) => habitacion.lado === 'DERECHO');

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <LadoDelPiso lado="IZQUIERDO" habitaciones={izquierda} alSeleccionar={alSeleccionar} />
      <LadoDelPiso lado="DERECHO" habitaciones={derecha} alSeleccionar={alSeleccionar} />
    </div>
  );
}

export default MapaDePiso;
