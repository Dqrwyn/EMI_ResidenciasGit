// ==========================================================
//  caracteristicas/actividad/PaginaActividad.jsx
//  Historial completo (auditoria) de la residencia:
//  ingresos, cambios de habitacion, retiros, activos, usuarios.
// ==========================================================

import { useState } from 'react';
import {
  ArrowRight,
  ClipboardList,
  Filter,
  History,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import { usarPeticion } from '../../utiles/usarPeticion.js';
import { servicioPanel } from '../panel/servicioPanel.js';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { Cargando, ErrorDeCarga, EstadoVacio } from '../../componentesComunes/Estados.jsx';
import { formatearFechaHora, formatearNumero } from '../../utiles/formato.js';

const ESTILOS_POR_TIPO = {
  INGRESO: { clase: 'bg-emi-verdeClaro text-emi-verde', Icono: UserPlus },
  MOVIMIENTO: { clase: 'bg-emi-azulClaro text-emi-azul', Icono: ArrowRight },
  RETIRO: { clase: 'bg-emi-rojoClaro text-emi-rojo', Icono: Users },
  REINGRESO: { clase: 'bg-emi-amarilloClaro text-emi-naranja', Icono: UserPlus },
  ACTUALIZACION: { clase: 'bg-emi-azulClaro text-emi-azul', Icono: ClipboardList },
  HABITACION: { clase: 'bg-emi-azulClaro text-emi-azul', Icono: ClipboardList },
  ACTIVO: { clase: 'bg-emi-amarilloClaro text-emi-naranja', Icono: Wrench },
  IMPORTACION: { clase: 'bg-emi-verdeClaro text-emi-verde', Icono: ClipboardList },
  USUARIO: { clase: 'bg-slate-100 text-slate-500', Icono: ShieldCheck },
};

const FILTROS_INICIALES = { tipo: '', desde: '', hasta: '', texto: '', pagina: 1 };

function FilaDeMovimiento({ movimiento, etiquetaMovimiento }) {
  const estilo = ESTILOS_POR_TIPO[movimiento.tipo] || { clase: 'bg-slate-100 text-slate-500', Icono: History };
  const { Icono } = estilo;

  const ruta =
    movimiento.habitacionOrigen || movimiento.habitacionDestino
      ? `${movimiento.habitacionOrigen || 'Sin habitacion'} -> ${movimiento.habitacionDestino || 'Sin habitacion'}`
      : null;

  return (
    <li className="flex gap-3 rounded-xl border border-emi-grisBorde bg-white p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${estilo.clase}`}>
        <Icono size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-emi-azul">{etiquetaMovimiento(movimiento.tipo)}</span>
          <span className="text-[11px] text-slate-400">{formatearFechaHora(movimiento.fecha)}</span>
        </div>

        <p className="mt-0.5 truncate text-sm font-semibold text-emi-azulProfundo">
          {movimiento.residenteNombre || movimiento.detalle || 'Movimiento del sistema'}
        </p>

        {ruta ? (
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {movimiento.habitacionOrigen || 'Sin habitacion'}
            <ArrowRight size={12} className="mx-1 inline align-middle text-emi-azul" />
            {movimiento.habitacionDestino || 'Sin habitacion'}
          </p>
        ) : null}

        {movimiento.residenteNombre && movimiento.detalle ? (
          <p className="mt-0.5 text-xs text-slate-500">{movimiento.detalle}</p>
        ) : null}

        <p className="mt-1 text-[11px] text-slate-400">
          {movimiento.residenteCi ? `CI ${movimiento.residenteCi} - ` : ''}
          {movimiento.usuario ? `Registrado por ${movimiento.usuario}` : 'Registrado por el sistema'}
        </p>
      </div>
    </li>
  );
}

export function PaginaActividad() {
  const { catalogo, etiquetaMovimiento } = usarCatalogo();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [textoEscrito, setTextoEscrito] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const { datos, cargando, error, recargar } = usarPeticion(
    () => servicioPanel.listarMovimientos({ ...filtros }),
    [filtros.tipo, filtros.desde, filtros.hasta, filtros.texto, filtros.pagina],
  );

  function aplicarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor, pagina: 1 }));
  }

  function buscar(evento) {
    evento.preventDefault();
    aplicarFiltro('texto', textoEscrito.trim());
  }

  function limpiarTodo() {
    setFiltros(FILTROS_INICIALES);
    setTextoEscrito('');
  }

  const hayFiltros = Boolean(filtros.tipo) || Boolean(filtros.desde) || Boolean(filtros.hasta) || Boolean(filtros.texto);
  const total = datos?.total ?? 0;
  const pagina = datos?.pagina ?? filtros.pagina;
  const paginas = datos?.paginas ?? 1;

  return (
    <div className="seccion space-y-4">
      <form onSubmit={buscar} className="tarjeta space-y-3 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="campo pl-9"
              value={textoEscrito}
              onChange={(evento) => setTextoEscrito(evento.target.value)}
              placeholder="Buscar por nombre, CI, habitacion o detalle..."
              aria-label="Buscar en el historial"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="boton-primario flex-1 sm:flex-none">
              <Search size={16} />
              Buscar
            </button>
            <button
              type="button"
              className="boton-secundario lg:hidden"
              onClick={() => setMostrarFiltros((valor) => !valor)}
              aria-expanded={mostrarFiltros}
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className={`${mostrarFiltros ? 'grid' : 'hidden'} gap-3 sm:grid sm:grid-cols-3`}>
          <label>
            <span className="etiqueta">Tipo de movimiento</span>
            <select className="campo" value={filtros.tipo} onChange={(evento) => aplicarFiltro('tipo', evento.target.value)}>
              <option value="">Todos los tipos</option>
              {catalogo.tiposMovimiento.map((opcion) => (
                <option key={opcion.tipo} value={opcion.tipo}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="etiqueta">Desde</span>
            <input
              type="date"
              className="campo"
              value={filtros.desde}
              onChange={(evento) => aplicarFiltro('desde', evento.target.value)}
            />
          </label>

          <label>
            <span className="etiqueta">Hasta</span>
            <input
              type="date"
              className="campo"
              value={filtros.hasta}
              onChange={(evento) => aplicarFiltro('hasta', evento.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            {cargando && !datos ? 'Cargando historial...' : `${formatearNumero(total)} movimiento(s) registrado(s)`}
          </p>
          {hayFiltros ? (
            <button type="button" className="boton-suave py-1.5 text-xs" onClick={limpiarTodo}>
              <X size={14} />
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </form>

      {cargando && !datos ? <Cargando mensaje="Cargando el historial de movimientos..." /> : null}
      {error ? <ErrorDeCarga mensaje={error.message} alReintentar={recargar} /> : null}

      {datos && datos.movimientos.length === 0 ? (
        <div className="tarjeta">
          <EstadoVacio
            icono={History}
            titulo="Sin movimientos"
            mensaje={
              hayFiltros
                ? 'No hay movimientos con esos filtros. Pruebe con otro rango de fechas.'
                : 'Aun no se registro ningun ingreso, cambio de habitacion ni retiro.'
            }
          />
        </div>
      ) : null}

      {datos && datos.movimientos.length > 0 ? (
        <ul className="space-y-2">
          {datos.movimientos.map((movimiento) => (
            <FilaDeMovimiento key={movimiento.id} movimiento={movimiento} etiquetaMovimiento={etiquetaMovimiento} />
          ))}
        </ul>
      ) : null}

      {datos && paginas > 1 ? (
        <nav className="flex items-center justify-between gap-2" aria-label="Paginacion">
          <button
            type="button"
            className="boton-secundario"
            disabled={pagina <= 1}
            onClick={() => setFiltros((actual) => ({ ...actual, pagina: actual.pagina - 1 }))}
          >
            Anterior
          </button>
          <p className="text-xs font-semibold text-slate-500">
            Pagina {pagina} de {paginas}
          </p>
          <button
            type="button"
            className="boton-secundario"
            disabled={pagina >= paginas}
            onClick={() => setFiltros((actual) => ({ ...actual, pagina: actual.pagina + 1 }))}
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </div>
  );
}

export default PaginaActividad;
