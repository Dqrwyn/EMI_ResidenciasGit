// ==========================================================
//  caracteristicas/residentes/ModalRetirar.jsx
//  Retiro de la residencia (libera la habitacion) y reingreso.
// ==========================================================

import { useEffect, useState } from 'react';
import { LogOut, RotateCcw } from 'lucide-react';

import Modal from '../../componentesComunes/Modal.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { servicioResidentes } from './servicioResidentes.js';
import { servicioMapa } from '../mapa/servicioMapa.js';

export function ModalRetirar({ abierto, alCerrar, residente, alRetirar }) {
  const avisos = usarAvisos();
  const [motivo, setMotivo] = useState('');
  const [fechaRetiro, setFechaRetiro] = useState(new Date().toISOString().slice(0, 10));
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (abierto) {
      setMotivo('');
      setFechaRetiro(new Date().toISOString().slice(0, 10));
      setError('');
    }
  }, [abierto]);

  async function retirar(evento) {
    evento.preventDefault();
    setProcesando(true);
    setError('');

    try {
      await servicioResidentes.retirar(residente.ci, { motivo, fechaRetiro });
      avisos.exito('Retiro registrado', `${residente.nombre} ya no ocupa ${residente.habitacionCodigo || 'ninguna habitacion'}`);
      alRetirar?.();
      alCerrar?.();
    } catch (fallo) {
      setError(fallo.message || 'No se pudo registrar el retiro');
    } finally {
      setProcesando(false);
    }
  }

  if (!residente) return null;

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Retirar de la residencia"
      subtitulo={`${residente.nombre} - CI ${residente.ci}`}
      icono={LogOut}
      tamanos="chico"
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="boton-secundario" onClick={() => alCerrar?.()} disabled={procesando}>
            Cancelar
          </button>
          <button type="submit" form="formulario-retiro" className="boton-peligro" disabled={procesando}>
            <LogOut size={16} />
            {procesando ? 'Registrando...' : 'Registrar retiro'}
          </button>
        </div>
      }
    >
      <form id="formulario-retiro" onSubmit={retirar} className="space-y-4">
        {error ? (
          <p className="rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">{error}</p>
        ) : null}

        <p className="rounded-xl bg-emi-gris px-3 py-2.5 text-sm text-slate-600">
          La habitacion <strong>{residente.habitacionCodigo || 'sin asignar'}</strong> quedara libre y el historial guardara el
          movimiento. La ficha del residente no se borra: se puede reactivar despues.
        </p>

        <label>
          <span className="etiqueta">Fecha de retiro</span>
          <input className="campo" type="date" value={fechaRetiro} onChange={(evento) => setFechaRetiro(evento.target.value)} />
        </label>

        <label>
          <span className="etiqueta">Motivo</span>
          <textarea
            className="campo min-h-[80px]"
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
            placeholder="Termino sus estudios, cambio de universidad, sancion..."
          />
        </label>
      </form>
    </Modal>
  );
}

export function ModalReactivar({ abierto, alCerrar, residente, alReactivar }) {
  const avisos = usarAvisos();
  const { catalogo } = usarCatalogo();

  const [bloqueDestino, setBloqueDestino] = useState(residente?.bloque || '');
  const [habitacionDestino, setHabitacionDestino] = useState('');
  const [motivo, setMotivo] = useState('');
  const [todasLasHabitaciones, setTodasLasHabitaciones] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (abierto) {
      setBloqueDestino(residente?.bloque || '');
      setHabitacionDestino('');
      setMotivo('');
      setError('');
      setTodasLasHabitaciones([]);
    }
  }, [abierto, residente]);

  useEffect(() => {
    if (!abierto || !bloqueDestino) return undefined;
    let activo = true;
    servicioMapa
      .listarHabitaciones(bloqueDestino)
      .then((datos) => {
        if (!activo) return;
        setTodasLasHabitaciones(
          [...datos.habitaciones].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true })),
        );
      })
      .catch((fallo) => activo && setError(fallo.message));

    return () => {
      activo = false;
    };
  }, [abierto, bloqueDestino]);

  async function reactivar(evento) {
    evento.preventDefault();
    setProcesando(true);
    setError('');
    try {
      await servicioResidentes.reactivar(residente.ci, { bloqueDestino, habitacionDestino: habitacionDestino || null, motivo });
      avisos.exito('Residente reactivado', `${residente.nombre} vuelve a figurar como activo`);
      alReactivar?.();
      alCerrar?.();
    } catch (fallo) {
      setError(fallo.message || 'No se pudo reactivar al residente');
    } finally {
      setProcesando(false);
    }
  }

  if (!residente) return null;

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Reactivar residente"
      subtitulo={`${residente.nombre} - CI ${residente.ci}`}
      icono={RotateCcw}
      tamanos="chico"
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="boton-secundario" onClick={() => alCerrar?.()} disabled={procesando}>
            Cancelar
          </button>
          <button type="submit" form="formulario-reactivar" className="boton-exito" disabled={procesando}>
            <RotateCcw size={16} />
            {procesando ? 'Reactivando...' : 'Reactivar'}
          </button>
        </div>
      }
    >
      <form id="formulario-reactivar" onSubmit={reactivar} className="space-y-4">
        {error ? (
          <p className="rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">{error}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="etiqueta">Bloque</span>
            <select className="campo" value={bloqueDestino} onChange={(evento) => { setBloqueDestino(evento.target.value); setHabitacionDestino(''); }}>
              <option value="">Sin bloque</option>
              {catalogo.bloques.map((opcion) => (
                <option key={opcion.bloque} value={opcion.bloque}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="etiqueta">Habitacion (opcional)</span>
            <select className="campo" value={habitacionDestino} onChange={(evento) => setHabitacionDestino(evento.target.value)} disabled={!bloqueDestino}>
              <option value="">Sin asignar por ahora</option>
              {todasLasHabitaciones.map((habitacion) => {
                const llena = habitacion.ocupacion.cantidad >= habitacion.capacidad;
                return (
                  <option key={habitacion.codigo} value={habitacion.codigo}>
                    {habitacion.codigo} - {habitacion.ocupacion.cantidad}/{habitacion.capacidad}
                    {llena ? ' (llena)' : ''}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <label>
          <span className="etiqueta">Motivo del reingreso</span>
          <input className="campo" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Vuelve al semestre II" />
        </label>
      </form>
    </Modal>
  );
}

export default ModalRetirar;
