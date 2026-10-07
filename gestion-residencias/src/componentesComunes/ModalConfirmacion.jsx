// ==========================================================
//  componentesComunes/ModalConfirmacion.jsx
// ==========================================================

import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export function ModalConfirmacion({
  abierto,
  alCerrar,
  alConfirmar,
  titulo = 'Confirmar accion',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tono = 'peligro',
  ocupado = false,
  children,
}) {
  const clasesConfirmar = tono === 'peligro' ? 'boton-peligro' : tono === 'amarillo' ? 'boton-amarillo' : 'boton-primario';

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      icono={AlertTriangle}
      tamanos="chico"
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="boton-secundario" onClick={() => alCerrar?.()} disabled={ocupado}>
            {textoCancelar}
          </button>
          <button type="button" className={clasesConfirmar} onClick={() => alConfirmar?.()} disabled={ocupado}>
            {ocupado ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600">{mensaje}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </Modal>
  );
}

export default ModalConfirmacion;
