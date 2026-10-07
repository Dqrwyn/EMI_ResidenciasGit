// ==========================================================
//  caracteristicas/residentes/ModalMover.jsx
//  Cambia al residente de habitacion conservando TODOS sus datos.
// ==========================================================

import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, MapPin } from 'lucide-react';

import Modal from '../../componentesComunes/Modal.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { servicioResidentes } from './servicioResidentes.js';
import { servicioMapa } from '../mapa/servicioMapa.js';

export function ModalMover({ abierto, alCerrar, residente, alMover }) {
  const avisos = usarAvisos();
  const { catalogo } = usarCatalogo();

  const [bloqueDestino, setBloqueDestino] = useState(residente?.bloque || '');
  const [habitacionDestino, setHabitacionDestino] = useState('');
  const [motivo, setMotivo] = useState('Cambio de habitacion');
  const [permitirSobreOcupacion, setPermitirSobreOcupacion] = useState(false);
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (abierto) {
      setBloqueDestino(residente?.bloque || '');
      setHabitacionDestino('');
      setMotivo('Cambio de habitacion');
      setPermitirSobreOcupacion(false);
      setError('');
    }
  }, [abierto, residente]);

  useEffect(() => {
    if (!abierto || !bloqueDestino) {
      setHabitaciones([]);
      return undefined;
    }

    let activo = true;
    setCargando(true);
    servicioMapa
      .listarHabitaciones(bloqueDestino)
      .then((datos) => {
        if (!activo) return;
        setHabitaciones(
          [...datos.habitaciones].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true })),
        );
      })
      .catch((fallo) => activo && setError(fallo.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [abierto, bloqueDestino]);

  const destino = useMemo(
    () => habitaciones.find((habitacion) => habitacion.codigo === habitacionDestino) || null,
    [habitaciones, habitacionDestino],
  );

  const destinosDisponibles = habitaciones.filter(
    (habitacion) => !(habitacion.codigo === residente?.habitacionCodigo && bloqueDestino === residente?.bloque),
  );

  async function mover(evento) {
    evento.preventDefault();
    setMoviendo(true);
    setError('');

    try {
      const resultado = await servicioResidentes.mover(residente.ci, {
        bloqueDestino,
        habitacionDestino,
        motivo,
        permitirSobreOcupacion,
      });
      avisos.exito(
        'Cambio de habitacion realizado',
        `${residente.nombre}: ${resultado.habitacionOrigen || 'sin habitacion'} -> ${resultado.habitacionDestino.codigo}`,
      );
      alMover?.(resultado);
      alCerrar?.();
    } catch (fallo) {
      setError(fallo.message || 'No se pudo cambiar de habitacion');
    } finally {
      setMoviendo(false);
    }
  }

  if (!residente) return null;

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo="Cambiar de habitacion"
      subtitulo={`${residente.nombre} - CI ${residente.ci}`}
      icono={ArrowRightLeft}
      tamanos="mediano"
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="boton-secundario" onClick={() => alCerrar?.()} disabled={moviendo}>
            Cancelar
          </button>
          <button type="submit" form="formulario-mover" className="boton-primario" disabled={moviendo || !habitacionDestino}>
            <ArrowRightLeft size={16} />
            {moviendo ? 'Moviendo...' : 'Confirmar cambio'}
          </button>
        </div>
      }
    >
      <form id="formulario-mover" onSubmit={mover} className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emi-grisBorde bg-emi-gris p-3 text-sm">
          <MapPin size={16} className="text-emi-azul" />
          <span className="font-semibold text-emi-azulProfundo">Habitacion actual:</span>
          <span className="insignia-azul">{residente.habitacionCodigo || 'Sin habitacion'}</span>
          {residente.bloque ? <span className="insignia-gris">{residente.bloque}</span> : null}
        </div>

        {error ? (
          <p className="rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">{error}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="etiqueta">Bloque de destino *</span>
            <select className="campo" value={bloqueDestino} onChange={(evento) => { setBloqueDestino(evento.target.value); setHabitacionDestino(''); }} required>
              <option value="">Seleccione un bloque</option>
              {catalogo.bloques.map((opcion) => (
                <option key={opcion.bloque} value={opcion.bloque}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="etiqueta">Habitacion de destino *</span>
            <select className="campo" value={habitacionDestino} onChange={(evento) => setHabitacionDestino(evento.target.value)} disabled={!bloqueDestino || cargando} required>
              <option value="">{cargando ? 'Cargando habitaciones...' : 'Seleccione la habitacion'}</option>
              {destinosDisponibles.map((habitacion) => {
                const llena = habitacion.ocupacion.cantidad >= habitacion.capacidad;
                return (
                  <option key={habitacion.codigo} value={habitacion.codigo}>
                    {habitacion.codigo} - {habitacion.ocupacion.cantidad}/{habitacion.capacidad}
                    {llena ? ' (llena)' : ''}
                    {habitacion.estado === 'EN_MANTENIMIENTO' ? ' (mantenimiento)' : ''}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="etiqueta">Motivo del cambio</span>
            <input className="campo" value={motivo} onChange={(evento) => setMotivo(evento.target.value)} placeholder="Reubicacion por mantenimiento, cambio de semestre..." />
          </label>
        </div>

        {destino ? (
          <div className="rounded-xl border border-emi-azul/25 bg-emi-azulClaro/60 p-3 text-sm">
            <p className="font-semibold text-emi-azulProfundo">
              {destino.codigo} - {destino.tipo === 'INDIVIDUAL' ? 'Individual' : destino.tipo === 'COMPARTIDA' ? 'Compartida' : 'Departamento'}
            </p>
            <p className="mt-1 text-slate-600">
              Ocupacion actual: {destino.ocupacion.cantidad} de {destino.ocupacion.capacidad}. Puestos libres:{' '}
              {Math.max(destino.ocupacion.libres, 0)}.
            </p>
            {destino.residentes.length > 0 ? (
              <p className="mt-1 text-slate-500">Compartiria con: {destino.residentes.map((r) => r.nombre).join(', ')}</p>
            ) : null}
          </div>
        ) : null}

        <label className="flex items-start gap-3 rounded-xl border border-emi-amarilloOscuro/40 bg-emi-amarilloClaro/40 p-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emi-azul focus:ring-emi-azul"
            checked={permitirSobreOcupacion}
            onChange={(evento) => setPermitirSobreOcupacion(evento.target.checked)}
          />
          <span className="text-xs text-slate-600">
            <strong className="block text-emi-azulProfundo">Permitir sobre-ocupacion</strong>
            Marque esta casilla solo si la habitacion de destino ya esta llena y la institucion autorizo ubicar una persona
            mas. El sistema dejara constancia en el historial.
          </span>
        </label>
      </form>
    </Modal>
  );
}

export default ModalMover;
