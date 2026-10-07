// ==========================================================
//  componentesComunes/TarjetaResumen.jsx
// ==========================================================

const TONOS = {
  azul: 'bg-emi-azulClaro text-emi-azul',
  verde: 'bg-emi-verdeClaro text-emi-verde',
  amarillo: 'bg-emi-amarilloClaro text-emi-naranja',
  rojo: 'bg-emi-rojoClaro text-emi-rojo',
  gris: 'bg-slate-100 text-slate-500',
};

export function TarjetaResumen({ icono: Icono, titulo, valor, detalle, tono = 'azul', alPulsar }) {
  const contenido = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONOS[tono]}`}>
          {Icono ? <Icono size={19} /> : null}
        </span>
        {alPulsar ? <span className="text-[11px] font-semibold uppercase tracking-wide text-emi-azul">Ver</span> : null}
      </div>
      <p className="mt-3 text-2xl font-bold leading-none text-emi-azulProfundo">{valor}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      {detalle ? <p className="mt-1 text-xs text-slate-400">{detalle}</p> : null}
    </>
  );

  if (alPulsar) {
    return (
      <button type="button" onClick={alPulsar} className="tarjeta w-full p-4 text-left transition hover:-translate-y-0.5 hover:shadow-flotante">
        {contenido}
      </button>
    );
  }

  return <div className="tarjeta p-4">{contenido}</div>;
}

export function BarraDeProgreso({ valor, maximo, tono = 'azul', texto }) {
  const porcentaje = maximo > 0 ? Math.min(Math.round((valor / maximo) * 100), 100) : 0;
  const colores = { azul: 'bg-emi-azul', verde: 'bg-emi-verde', amarillo: 'bg-emi-amarilloOscuro', rojo: 'bg-emi-rojo' };

  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all ${colores[tono] || colores.azul}`} style={{ width: `${porcentaje}%` }} />
      </div>
      {texto ? <p className="mt-1 text-xs text-slate-500">{texto}</p> : null}
    </div>
  );
}

export default TarjetaResumen;
