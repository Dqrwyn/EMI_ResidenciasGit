// ==========================================================
//  caracteristicas/mapa/PaginaMapa.jsx
//  El mapa completo: varones, damas, departamentos pequenos,
//  departamentos grandes y el departamento del director.
// ==========================================================

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Crown, Hotel, Info, Users } from 'lucide-react';

import { usarPeticion } from '../../utiles/usarPeticion.js';
import { servicioMapa } from './servicioMapa.js';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { Cargando, ErrorDeCarga } from '../../componentesComunes/Estados.jsx';
import { formatearNumero } from '../../utiles/formato.js';
import MapaDePiso from './MapaDePiso.jsx';
import TarjetaHabitacion from './TarjetaHabitacion.jsx';
import ModalHabitacion from './ModalHabitacion.jsx';

function ResumenDelBloque({ resumen }) {
  const datos = [
    { etiqueta: 'Habitaciones', valor: resumen.totalHabitaciones },
    { etiqueta: 'Residentes', valor: resumen.residentesActivos },
    { etiqueta: 'Puestos libres', valor: resumen.puestosLibres },
    { etiqueta: 'Activos', valor: resumen.activosTotales },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {datos.map((dato) => (
        <div key={dato.etiqueta} className="rounded-xl border border-emi-grisBorde bg-white px-3 py-2">
          <p className="text-lg font-bold leading-none text-emi-azulProfundo">{formatearNumero(dato.valor)}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{dato.etiqueta}</p>
        </div>
      ))}
    </div>
  );
}

function LeyendaDelMapa() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emi-grisBorde bg-white px-3 py-2 text-[11px] font-medium text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border-2 border-emi-azul/50 bg-white" /> Individual
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border-2 border-emi-amarilloOscuro/70 bg-emi-amarilloClaro" /> Compartida
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border-2 border-emi-verde/60 bg-white" /> Departamento
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border-2 border-emi-amarilloOscuro bg-emi-amarilloClaro" /> Direccion
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border-2 border-slate-300 bg-slate-100" /> Mantenimiento
      </span>
    </div>
  );
}

export function PaginaMapa() {
  const { catalogo } = usarCatalogo();
  const [parametros, setParametros] = useSearchParams();

  const bloque = parametros.get('bloque') || catalogo.bloqueDeEstudiantes[0] || 'VARONES';
  const [piso, setPiso] = useState('PB');
  const [habitacionAbierta, setHabitacionAbierta] = useState(null);

  const { datos, cargando, error, recargar } = usarPeticion(() => servicioMapa.listarHabitaciones(bloque), [bloque]);

  const esBloqueDeEstudiantes = catalogo.bloqueDeEstudiantes.includes(bloque);

  useEffect(() => {
    setHabitacionAbierta(null);
  }, [bloque]);


  const habitacionesVisibles = useMemo(() => {
    if (!datos) return [];
    if (esBloqueDeEstudiantes) return datos.habitaciones.filter((habitacion) => habitacion.piso === piso);
    return datos.habitaciones;
  }, [datos, esBloqueDeEstudiantes, piso]);

  const departamentosPequenosA = habitacionesVisibles.filter((habitacion) => habitacion.codigo.match(/^D-(\d+)$/) && Number(habitacion.codigo.match(/^D-(\d+)$/)[1]) <= 10);
  const departamentosPequenosB = habitacionesVisibles.filter((habitacion) => habitacion.codigo.match(/^D-(\d+)$/) && Number(habitacion.codigo.match(/^D-(\d+)$/)[1]) > 10);
  const departamentoDirector = habitacionesVisibles.find((habitacion) => habitacion.tipo === 'DIRECTOR');
  const departamentosGrandes = habitacionesVisibles.filter((habitacion) => habitacion.tipo === 'DEPARTAMENTO_GRANDE');

  return (
    <div className="seccion space-y-4">
      {/* Selector de bloques */}
      <div className="flex flex-wrap gap-2">
        {catalogo.bloques.map((opcion) => {
          const activo = opcion.bloque === bloque;
          return (
            <button
              key={opcion.bloque}
              type="button"
              onClick={() => setParametros({ bloque: opcion.bloque })}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                activo
                  ? 'border-emi-azul bg-emi-azul text-white shadow-tarjeta'
                  : 'border-emi-grisBorde bg-white text-emi-azul hover:border-emi-azul hover:bg-emi-azulClaro'
              }`}
            >
              {opcion.bloque === 'DEPARTAMENTOS_GRANDES' ? <Crown size={16} /> : opcion.bloque.startsWith('DEPARTAMENTOS') ? <Hotel size={16} /> : <Users size={16} />}
              {opcion.etiquetaCorta}
            </button>
          );
        })}
      </div>

      {cargando && !datos ? <Cargando mensaje="Cargando el mapa de habitaciones..." /> : null}
      {error ? <ErrorDeCarga mensaje={error.message} alReintentar={recargar} /> : null}

      {datos ? (
        <>
          <div className="tarjeta space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emi-azulClaro text-emi-azul">
                  <Building2 size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-emi-azulProfundo">{datos.etiquetaBloque}</h2>
                  <p className="text-xs text-slate-500">
                    {esBloqueDeEstudiantes
                      ? 'Cada piso: 8 habitaciones individuales y 6 compartidas, en dos lados'
                      : 'Departamentos D-1 al D-20, DG-1 al DG-4 y el departamento del director'}
                  </p>
                </div>
              </div>

              {esBloqueDeEstudiantes ? (
                <div className="flex rounded-xl border border-emi-grisBorde bg-emi-gris p-1">
                  {catalogo.pisos.map((opcionPiso) => (
                    <button
                      key={opcionPiso.codigo}
                      type="button"
                      onClick={() => setPiso(opcionPiso.codigo)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition sm:text-sm ${
                        piso === opcionPiso.codigo ? 'bg-white text-emi-azul shadow-sm' : 'text-slate-500 hover:text-emi-azul'
                      }`}
                    >
                      {opcionPiso.nombre}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <ResumenDelBloque resumen={datos.resumen} />
            <LeyendaDelMapa />
          </div>

          {esBloqueDeEstudiantes ? (
            <MapaDePiso habitaciones={habitacionesVisibles} alSeleccionar={setHabitacionAbierta} />
          ) : null}

          {bloque === 'DEPARTAMENTOS_PEQUENOS' ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {[departamentosPequenosA, departamentosPequenosB].map((grupo, indice) => (
                <section key={indice} className="tarjeta p-3 sm:p-4">
                  <header className="mb-3 flex items-center justify-between border-b border-emi-grisBorde pb-2">
                    <p className="text-sm font-bold text-emi-azulProfundo">{indice === 0 ? 'D-1 al D-10' : 'D-11 al D-20'}</p>
                    <span className="insignia-gris">{grupo.length} departamentos</span>
                  </header>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-2">
                    {grupo.map((habitacion) => (
                      <TarjetaHabitacion key={habitacion.codigo} habitacion={habitacion} alSeleccionar={setHabitacionAbierta} compacta />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {bloque === 'DEPARTAMENTOS_GRANDES' ? (
            <div className="space-y-4">
              {departamentoDirector ? (
                <section className="tarjeta border-emi-amarilloOscuro/60 bg-emi-amarilloClaro/40 p-3 sm:p-4">
                  <header className="mb-3 flex items-center gap-2">
                    <Crown size={18} className="text-emi-amarilloOscuro" />
                    <div>
                      <p className="text-sm font-bold text-emi-azulProfundo">Departamento del Director</p>
                      <p className="text-[11px] text-slate-500">Habitacion DD - Escuela Militar de Ingenieria</p>
                    </div>
                  </header>
                  <div className="grid gap-2 sm:max-w-sm">
                    <TarjetaHabitacion habitacion={departamentoDirector} alSeleccionar={setHabitacionAbierta} />
                  </div>
                </section>
              ) : null}

              <section className="tarjeta p-3 sm:p-4">
                <header className="mb-3 flex items-center justify-between border-b border-emi-grisBorde pb-2">
                  <p className="text-sm font-bold text-emi-azulProfundo">Departamentos grandes (DG-1 al DG-4)</p>
                  <span className="insignia-gris">{departamentosGrandes.length} departamentos</span>
                </header>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {departamentosGrandes.map((habitacion) => (
                    <TarjetaHabitacion key={habitacion.codigo} habitacion={habitacion} alSeleccionar={setHabitacionAbierta} />
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          <p className="flex items-start gap-2 rounded-xl border border-emi-grisBorde bg-white px-3 py-2.5 text-xs text-slate-500">
            <Info size={14} className="mt-0.5 shrink-0 text-emi-azul" />
            Toque una habitacion para ver sus residentes, editar su capacidad o costo y administrar sus activos. Los activos
            pertenecen a la habitacion: si un residente se muda, se quedan donde estan.
          </p>
        </>
      ) : null}

      <ModalHabitacion
        abierto={Boolean(habitacionAbierta)}
        alCerrar={() => setHabitacionAbierta(null)}
        bloque={bloque}
        codigo={habitacionAbierta?.codigo}
        alCambiar={recargar}
      />
    </div>
  );
}

export default PaginaMapa;
