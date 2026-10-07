// ==========================================================
//  componentesComunes/Modal.jsx
//  En celular ocupa toda la pantalla; en escritorio es una
//  ventana centrada. Se cierra con Escape o tocando el fondo.
// ==========================================================

import { useEffect } from 'react';
import { X } from 'lucide-react';

const TAMANOS = {
  chico: 'sm:max-w-md',
  mediano: 'sm:max-w-2xl',
  grande: 'sm:max-w-4xl',
  amplio: 'sm:max-w-6xl',
};

export function Modal({ abierto, alCerrar, titulo, subtitulo, icono: Icono, tamanos = 'mediano', children, pie }) {
  useEffect(() => {
    if (!abierto) return undefined;

    function alTeclear(evento) {
      if (evento.key === 'Escape') alCerrar?.();
    }

    document.addEventListener('keydown', alTeclear);
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = anterior;
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-emi-azulProfundo/50 backdrop-blur-sm sm:items-center sm:p-4">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 cursor-default" onClick={() => alCerrar?.()} />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 flex h-full w-full animate-aparecer flex-col overflow-hidden bg-white shadow-flotante sm:h-auto sm:max-h-[92vh] sm:rounded-2xl ${TAMANOS[tamanos]}`}
      >
        <header className="flex items-start gap-3 border-b border-emi-grisBorde bg-white px-4 py-3.5 sm:px-5">
          {Icono ? (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emi-azulClaro text-emi-azul">
              <Icono size={18} />
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-emi-azulProfundo sm:text-lg">{titulo}</h2>
            {subtitulo ? <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitulo}</p> : null}
          </div>

          <button type="button" onClick={() => alCerrar?.()} className="boton-icono" aria-label="Cerrar ventana">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {pie ? (
          <footer className="border-t border-emi-grisBorde bg-emi-gris/70 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            {pie}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

export default Modal;
