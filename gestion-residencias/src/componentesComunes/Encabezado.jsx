// ==========================================================
//  componentesComunes/Encabezado.jsx
//  Titulo de la pantalla + buscador por CI o nombre.
// ==========================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search } from 'lucide-react';

import { usarAutenticacion } from '../contexto/ContextoAutenticacion.jsx';

export function Encabezado({ titulo, subtitulo, alAbrirMenu }) {
  const navegar = useNavigate();
  const { usuario, cerrarSesion } = usarAutenticacion();
  const [busqueda, setBusqueda] = useState('');

  function buscar(evento) {
    evento.preventDefault();
    const texto = busqueda.trim();
    if (!texto) return;
    navegar(`/residentes?texto=${encodeURIComponent(texto)}`);
    setBusqueda('');
  }

  return (
    <header className="sticky top-0 z-20 border-b border-emi-grisBorde bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={alAbrirMenu} className="boton-icono lg:hidden" aria-label="Abrir menu">
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="titulo-pagina truncate">{titulo}</h1>
            {subtitulo ? <p className="subtitulo-pagina truncate">{subtitulo}</p> : null}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button type="button" onClick={cerrarSesion} className="boton-icono" aria-label="Cerrar sesion">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <form onSubmit={buscar} role="search" className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por CI o nombre..."
              className="campo pl-9"
              aria-label="Buscar residente por carnet de identidad o nombre"
            />
          </form>

          <div className="hidden items-center gap-2 rounded-xl border border-emi-grisBorde px-3 py-2 lg:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emi-azulClaro text-[11px] font-bold text-emi-azul">
              {String(usuario?.nombre || '?')
                .split(' ')
                .slice(0, 2)
                .map((parte) => parte[0])
                .join('')
                .toUpperCase()}
            </span>
            <div className="leading-tight">
              <p className="max-w-[160px] truncate text-xs font-semibold text-emi-azulProfundo">{usuario?.nombre}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {usuario?.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Responsable'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Encabezado;
