// ==========================================================
//  componentesComunes/BarraLateral.jsx
//  Navegacion principal: fija en escritorio y deslizable en
//  celular y tablet.
// ==========================================================

import { NavLink } from 'react-router-dom';
import {
  Building2,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

import { usarAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

const ENLACES = [
  { a: '/', etiqueta: 'Panel general', Icono: LayoutDashboard, exacto: true },
  { a: '/mapa', etiqueta: 'Mapa de habitaciones', Icono: Building2 },
  { a: '/residentes', etiqueta: 'Residentes y buscador', Icono: Users },
  { a: '/actividad', etiqueta: 'Movimientos', Icono: History },
  { a: '/datos', etiqueta: 'Importar y exportar', Icono: FileSpreadsheet },
];

function claseEnlace(activo) {
  return [
    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
    activo
      ? 'bg-emi-amarillo text-emi-azulProfundo shadow-sm'
      : 'text-emi-azulClaro/90 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

export function BarraLateral({ abierta, alCerrar }) {
  const { usuario, cerrarSesion, esAdministrador } = usarAutenticacion();

  const enlaces = esAdministrador ? [...ENLACES, { a: '/usuarios', etiqueta: 'Usuarios', Icono: ShieldCheck }] : ENLACES;

  return (
    <>
      {abierta ? (
        <button
          type="button"
          aria-label="Cerrar menu"
          className="fixed inset-0 z-30 bg-emi-azulProfundo/50 backdrop-blur-sm lg:hidden"
          onClick={alCerrar}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-gradient-to-b from-emi-azulOscuro via-emi-azul to-emi-azulOscuro transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          abierta ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-3 pt-5">
          <div className="flex items-center gap-3">
            <img src="/emi.png" alt="Escudo EMI" className="h-11 w-11 rounded-lg bg-white/95 p-1 object-contain" />
            <div>
              <p className="text-sm font-bold leading-tight text-white">Residencias EMI</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-emi-amarillo">Escuela Militar de Ingenieria</p>
            </div>
          </div>
          <button type="button" onClick={alCerrar} className="rounded-lg p-1.5 text-emi-azulClaro hover:bg-white/10 lg:hidden" aria-label="Cerrar menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {enlaces.map(({ a, etiqueta, Icono, exacto }) => (
            <NavLink key={a} to={a} end={exacto} onClick={alCerrar} className={({ isActive }) => claseEnlace(isActive)}>
              <Icono size={18} className="shrink-0" />
              <span className="truncate">{etiqueta}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <div className="mb-2 rounded-xl bg-white/10 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">{usuario?.nombre}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emi-amarillo">
              {usuario?.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Responsable de residencia'}
            </p>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emi-azulClaro transition hover:bg-emi-rojo/90 hover:text-white"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
}

export default BarraLateral;
