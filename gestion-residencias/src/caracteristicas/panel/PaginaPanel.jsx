// ==========================================================
//  caracteristicas/panel/PaginaPanel.jsx
//  Lo primero que se ve al entrar: cuantas personas viven en
//  cada bloque, cuanto espacio queda y que necesita atencion.
// ==========================================================

import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Building2,
  ClipboardList,
  DoorOpen,
  FileSpreadsheet,
  History,
  Search,
  TriangleAlert,
  Users,
} from 'lucide-react';

import { usarPeticion } from '../../utiles/usarPeticion.js';
import { servicioPanel } from './servicioPanel.js';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { Cargando, ErrorDeCarga } from '../../componentesComunes/Estados.jsx';
import { BarraDeProgreso, TarjetaResumen } from '../../componentesComunes/TarjetaResumen.jsx';
import { formatearFechaHora, formatearNumero } from '../../utiles/formato.js';

export function PaginaPanel() {
  const navegar = useNavigate();
  const { etiquetaBloque, etiquetaMovimiento } = usarCatalogo();
  const { datos, cargando, error, recargar } = usarPeticion(() => servicioPanel.obtenerResumen(), []);

  if (cargando && !datos) return <Cargando mensaje="Cargando el resumen de la residencia..." />;
  if (error) return <ErrorDeCarga mensaje={error.message} alReintentar={recargar} />;
  if (!datos) return null;

  return (
    <div className="seccion space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          icono={Users}
          titulo="Residentes activos"
          valor={formatearNumero(datos.residentesActivos)}
          detalle={`${formatearNumero(datos.residentesSinHabitacion)} sin habitacion asignada`}
          tono="azul"
          alPulsar={() => navegar('/residentes')}
        />
        <TarjetaResumen
          icono={BedDouble}
          titulo="Puestos libres"
          valor={formatearNumero(datos.habitaciones.puestosLibres)}
          detalle={`de ${formatearNumero(datos.habitaciones.capacidad)} puestos en total`}
          tono="verde"
          alPulsar={() => navegar('/mapa')}
        />
        <TarjetaResumen
          icono={DoorOpen}
          titulo="Habitaciones"
          valor={formatearNumero(datos.habitaciones.total)}
          detalle={`${formatearNumero(datos.habitaciones.llenas)} llenas - ${formatearNumero(datos.habitaciones.vacias)} vacias`}
          tono="amarillo"
          alPulsar={() => navegar('/mapa')}
        />
        <TarjetaResumen
          icono={TriangleAlert}
          titulo="Activos por atender"
          valor={formatearNumero(datos.activos.conAtencion)}
          detalle={`de ${formatearNumero(datos.activos.total)} activos registrados`}
          tono={datos.activos.conAtencion > 0 ? 'rojo' : 'gris'}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="tarjeta p-4 sm:p-5">
          <header className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-emi-azul" />
            <h2 className="text-base font-bold text-emi-azulProfundo">Ocupacion por bloque</h2>
          </header>

          <div className="space-y-4">
            {datos.bloques.map((bloque) => {
              const ocupacion = bloque.capacidad > 0 ? Math.round((bloque.residentes / bloque.capacidad) * 100) : 0;
              return (
                <button
                  key={bloque.bloque}
                  type="button"
                  onClick={() => navegar(`/mapa?bloque=${bloque.bloque}`)}
                  className="w-full rounded-xl border border-emi-grisBorde p-3 text-left transition hover:border-emi-azul hover:bg-emi-azulClaro/40"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-emi-azulProfundo">{etiquetaBloque(bloque.bloque)}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {formatearNumero(bloque.residentes)}/{formatearNumero(bloque.capacidad)} puestos - {ocupacion}%
                    </p>
                  </div>
                  <BarraDeProgreso
                    valor={bloque.residentes}
                    maximo={bloque.capacidad}
                    tono={ocupacion > 95 ? 'rojo' : ocupacion > 75 ? 'amarillo' : 'verde'}
                    texto={`${formatearNumero(bloque.habitaciones)} habitaciones - ${formatearNumero(bloque.puestosLibres)} puestos libres`}
                  />
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          <section className="tarjeta p-4 sm:p-5">
            <header className="mb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-emi-azul" />
              <h2 className="text-base font-bold text-emi-azulProfundo">Personas por tipo</h2>
            </header>

            <ul className="space-y-2">
              {datos.porTipo.length === 0 ? <li className="text-sm text-slate-500">Todavia no hay residentes registrados.</li> : null}
              {datos.porTipo.map((fila) => (
                <li key={fila.tipo} className="flex items-center justify-between rounded-lg bg-emi-gris px-3 py-2 text-sm">
                  <span className="font-medium text-emi-azulProfundo">{fila.etiqueta}</span>
                  <span className="font-bold text-emi-azul">{formatearNumero(fila.cantidad)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="tarjeta p-4 sm:p-5">
            <header className="mb-3 flex items-center gap-2">
              <History size={18} className="text-emi-azul" />
              <h2 className="text-base font-bold text-emi-azulProfundo">Ultimos movimientos</h2>
            </header>

            <ul className="space-y-2">
              {datos.movimientosRecientes.length === 0 ? (
                <li className="text-sm text-slate-500">Sin movimientos registrados.</li>
              ) : null}
              {datos.movimientosRecientes.map((movimiento) => (
                <li key={movimiento.id} className="rounded-lg border border-emi-grisBorde px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emi-azul">
                    {etiquetaMovimiento(movimiento.tipo)}
                  </p>
                  <p className="text-sm text-emi-azulProfundo">{movimiento.residenteNombre || movimiento.detalle}</p>
                  <p className="text-[11px] text-slate-400">
                    {formatearFechaHora(movimiento.fecha)}
                    {movimiento.usuario ? ` - ${movimiento.usuario}` : ''}
                  </p>
                </li>
              ))}
            </ul>

            <button type="button" className="boton-suave mt-3 w-full" onClick={() => navegar('/actividad')}>
              Ver todo el historial
            </button>
          </section>
        </div>
      </div>

      <section className="tarjeta p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-emi-azulProfundo">Accesos rapidos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { etiqueta: 'Buscar por CI', Icono: Search, destino: '/residentes', ayuda: 'Ver y editar la ficha' },
            { etiqueta: 'Mapa de habitaciones', Icono: Building2, destino: '/mapa', ayuda: 'Varones, damas y departamentos' },
            { etiqueta: 'Importar Excel', Icono: FileSpreadsheet, destino: '/datos', ayuda: 'Relacion nominal del semestre' },
            { etiqueta: 'Exportar Excel', Icono: ClipboardList, destino: '/datos', ayuda: 'Descargar por habitaciones' },
          ].map(({ etiqueta, Icono, destino, ayuda }) => (
            <button
              key={etiqueta}
              type="button"
              onClick={() => navegar(destino)}
              className="tarjeta-simple flex items-center gap-3 p-3 text-left transition hover:-translate-y-0.5 hover:border-emi-azul hover:shadow-tarjeta"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emi-azulClaro text-emi-azul">
                <Icono size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-emi-azulProfundo">{etiqueta}</span>
                <span className="block text-xs text-slate-500">{ayuda}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PaginaPanel;
