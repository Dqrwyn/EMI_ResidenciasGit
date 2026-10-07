// ==========================================================
//  contexto/ContextoAvisos.jsx
//  Avisos flotantes (exito, error, aviso, informacion).
// ==========================================================

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ContextoAvisos = createContext(null);

const ESTILOS = {
  exito: { contenedor: 'border-emi-verde/40 bg-emi-verdeClaro text-emi-verde', Icono: CheckCircle2 },
  error: { contenedor: 'border-emi-rojo/40 bg-emi-rojoClaro text-emi-rojo', Icono: XCircle },
  aviso: { contenedor: 'border-emi-amarilloOscuro/40 bg-emi-amarilloClaro text-emi-naranja', Icono: AlertTriangle },
  info: { contenedor: 'border-emi-azul/30 bg-emi-azulClaro text-emi-azul', Icono: Info },
};

let contadorAvisos = 0;

export function ProveedorAvisos({ children }) {
  const [avisos, setAvisos] = useState([]);

  const cerrar = useCallback((id) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback(
    (mensaje, tipo = 'info', detalle = null) => {
      contadorAvisos += 1;
      const id = contadorAvisos;
      setAvisos((actuales) => [...actuales.slice(-3), { id, mensaje, tipo, detalle }]);
      window.setTimeout(() => cerrar(id), tipo === 'error' ? 7000 : 4500);
      return id;
    },
    [cerrar],
  );

  const valor = useMemo(
    () => ({
      avisar,
      exito: (mensaje, detalle) => avisar(mensaje, 'exito', detalle),
      error: (mensaje, detalle) => avisar(mensaje, 'error', detalle),
      aviso: (mensaje, detalle) => avisar(mensaje, 'aviso', detalle),
      info: (mensaje, detalle) => avisar(mensaje, 'info', detalle),
      cerrar,
    }),
    [avisar, cerrar],
  );

  return (
    <ContextoAvisos.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed inset-x-3 bottom-20 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[380px]">
        {avisos.map((aviso) => {
          const { contenedor, Icono } = ESTILOS[aviso.tipo] || ESTILOS.info;
          return (
            <div
              key={aviso.id}
              className={`pointer-events-auto flex animate-aparecer items-start gap-3 rounded-xl border px-3.5 py-3 shadow-flotante backdrop-blur ${contenedor}`}
              role="status"
            >
              <Icono size={18} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{aviso.mensaje}</p>
                {aviso.detalle ? <p className="mt-0.5 text-xs opacity-80">{aviso.detalle}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => cerrar(aviso.id)}
                className="rounded-md p-1 opacity-60 transition hover:bg-white/40 hover:opacity-100"
                aria-label="Cerrar aviso"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ContextoAvisos.Provider>
  );
}

export function usarAvisos() {
  const contexto = useContext(ContextoAvisos);
  if (!contexto) throw new Error('usarAvisos debe usarse dentro de ProveedorAvisos');
  return contexto;
}
