// ==========================================================
//  caracteristicas/mapa/ModalHabitacion.jsx
//  Detalle completo de una habitacion:
//   - datos y edicion (capacidad, costo, estado, observaciones)
//   - residentes (registrar, editar, mover, retirar)
//   - activos (altas, cambios y bajas)
// ==========================================================

import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  BedDouble,
  DoorOpen,
  LogOut,
  Pencil,
  Save,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';

import Modal from '../../componentesComunes/Modal.jsx';
import { Cargando, ErrorDeCarga } from '../../componentesComunes/Estados.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { servicioMapa } from './servicioMapa.js';
import { colorDeOcupacion, etiquetaDeOcupacion, formatearCosto, formatearFecha } from '../../utiles/formato.js';
import ModalResidente from '../residentes/ModalResidente.jsx';
import ModalMover from '../residentes/ModalMover.jsx';
import ModalRetirar from '../residentes/ModalRetirar.jsx';
import GestionDeActivos from '../activos/GestionDeActivos.jsx';

function DatoDeResidente({ etiqueta, valor }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="truncate text-sm text-emi-azulProfundo">{valor || '-'}</p>
    </div>
  );
}

export function ModalHabitacion({ abierto, alCerrar, bloque, codigo, alCambiar }) {
  const avisos = usarAvisos();
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [edicion, setEdicion] = useState(null);
  const [guardandoHabitacion, setGuardandoHabitacion] = useState(false);

  const [modalResidente, setModalResidente] = useState(null);
  const [residenteAMover, setResidenteAMover] = useState(null);
  const [residenteARetirar, setResidenteARetirar] = useState(null);

  const cargar = useCallback(async () => {
    if (!abierto || !bloque || !codigo) return;
    setCargando(true);
    setError(null);
    try {
      const datos = await servicioMapa.obtenerHabitacion(bloque, codigo);
      setDetalle(datos);
      setEdicion({
        capacidad: datos.habitacion.capacidad,
        costo: datos.habitacion.costo,
        estado: datos.habitacion.estado,
        observaciones: datos.habitacion.observaciones || '',
      });
    } catch (fallo) {
      setError(fallo);
    } finally {
      setCargando(false);
    }
  }, [abierto, bloque, codigo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardarHabitacion(evento) {
    evento.preventDefault();
    setGuardandoHabitacion(true);
    try {
      await servicioMapa.actualizarHabitacion(bloque, codigo, edicion);
      avisos.exito('Habitacion actualizada', `${codigo} guardada correctamente`);
      await cargar();
      alCambiar?.();
    } catch (fallo) {
      avisos.error('No se pudo actualizar la habitacion', fallo.message);
    } finally {
      setGuardandoHabitacion(false);
    }
  }

  async function alternarMantenimiento() {
    const nuevoEstado = detalle.habitacion.estado === 'EN_MANTENIMIENTO' ? 'ACTIVA' : 'EN_MANTENIMIENTO';
    try {
      await servicioMapa.actualizarHabitacion(bloque, codigo, { estado: nuevoEstado });
      avisos.exito('Estado actualizado', `${codigo} quedo como ${nuevoEstado === 'ACTIVA' ? 'activa' : 'en mantenimiento'}`);
      await cargar();
      alCambiar?.();
    } catch (fallo) {
      avisos.error('No se pudo cambiar el estado', fallo.message);
    }
  }

  const habitacion = detalle?.habitacion;
  const ocupacion = detalle?.ocupacion;

  return (
    <>
      <Modal
        abierto={abierto}
        alCerrar={alCerrar}
        titulo={habitacion ? `Habitacion ${habitacion.codigo}` : 'Habitacion'}
        subtitulo={
          habitacion
            ? `${habitacion.tipo === 'INDIVIDUAL' ? 'Individual' : habitacion.tipo === 'COMPARTIDA' ? 'Compartida' : 'Departamento'} - ${
                habitacion.estado === 'EN_MANTENIMIENTO' ? 'En mantenimiento' : 'Activa'
              }`
            : 'Cargando datos...'
        }
        icono={DoorOpen}
        tamanos="grande"
        pie={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              {ocupacion ? `${ocupacion.cantidad} de ${ocupacion.capacidad} lugares ocupados` : ''}
            </p>
            <div className="flex gap-2">
              <button type="button" className="boton-secundario" onClick={() => setModalResidente({})} disabled={!habitacion}>
                <UserPlus size={16} />
                Registrar residente
              </button>
              <button type="button" className="boton-primario" onClick={() => alCerrar?.()}>
                Cerrar
              </button>
            </div>
          </div>
        }
      >
        {cargando && !detalle ? <Cargando mensaje="Cargando la habitacion..." /> : null}
        {error && !cargando ? <ErrorDeCarga mensaje={error.message} alReintentar={cargar} /> : null}

        {habitacion && edicion ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={colorDeOcupacion(ocupacion.estado)}>{etiquetaDeOcupacion(ocupacion.estado)}</span>
              <span className="insignia-azul">
                <BedDouble size={12} />
                {ocupacion.cantidad}/{ocupacion.capacidad}
              </span>
              <span className="insignia-gris">{formatearCosto(habitacion.costo)}</span>
              <span className="insignia-gris">
                {detalle.activos.length} activo(s)
                {detalle.activos.some((activo) => activo.estado !== 'OPTIMO') ? ' - con observaciones' : ''}
              </span>
            </div>

            <section>
              <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emi-azulProfundo">
                  <Users size={16} className="text-emi-azul" />
                  Residentes
                </h3>
                <button type="button" className="boton-secundario py-1.5 text-xs" onClick={alternarMantenimiento}>
                  <Wrench size={14} />
                  {habitacion.estado === 'EN_MANTENIMIENTO' ? 'Marcar como activa' : 'Marcar en mantenimiento'}
                </button>
              </header>

              {detalle.residentes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-emi-grisBorde px-3 py-4 text-center text-xs text-slate-400">
                  Habitacion libre. Use "Registrar residente" para asignar a alguien.
                </p>
              ) : (
                <ul className="space-y-2">
                  {detalle.residentes.map((residente) => (
                    <li key={residente.ci} className="rounded-xl border border-emi-grisBorde bg-white p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-emi-azulProfundo">{residente.nombre}</p>
                          <p className="text-xs text-slate-500">
                            CI {residente.ci}
                            {residente.celular ? ` - Cel. ${residente.celular}` : ''}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button type="button" className="boton-icono" title="Editar datos" onClick={() => setModalResidente(residente)}>
                            <Pencil size={14} />
                          </button>
                          <button type="button" className="boton-icono" title="Cambiar de habitacion" onClick={() => setResidenteAMover(residente)}>
                            <ArrowRightLeft size={14} />
                          </button>
                          <button
                            type="button"
                            className="boton-icono hover:border-emi-rojo hover:bg-emi-rojoClaro hover:text-emi-rojo"
                            title="Retirar de la residencia"
                            onClick={() => setResidenteARetirar(residente)}
                          >
                            <LogOut size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <DatoDeResidente etiqueta="Carrera" valor={residente.carrera} />
                        <DatoDeResidente etiqueta="Semestre" valor={residente.semestre} />
                        <DatoDeResidente etiqueta="Ingreso" valor={formatearFecha(residente.fechaIngreso)} />
                        <DatoDeResidente etiqueta="Tutor" valor={residente.tutorNombre} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-emi-grisBorde bg-emi-gris/60 p-3">
              <h3 className="mb-2 text-sm font-bold text-emi-azulProfundo">Datos de la habitacion</h3>
              <form onSubmit={guardarHabitacion} className="grid gap-3 sm:grid-cols-4">
                <label>
                  <span className="etiqueta">Capacidad</span>
                  <input
                    className="campo"
                    type="number"
                    min="1"
                    max="20"
                    value={edicion.capacidad}
                    onChange={(evento) => setEdicion((actual) => ({ ...actual, capacidad: evento.target.value }))}
                  />
                </label>
                <label>
                  <span className="etiqueta">Costo (Bs.)</span>
                  <input
                    className="campo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={edicion.costo}
                    onChange={(evento) => setEdicion((actual) => ({ ...actual, costo: evento.target.value }))}
                  />
                </label>
                <label>
                  <span className="etiqueta">Estado</span>
                  <select
                    className="campo"
                    value={edicion.estado}
                    onChange={(evento) => setEdicion((actual) => ({ ...actual, estado: evento.target.value }))}
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="EN_MANTENIMIENTO">En mantenimiento</option>
                  </select>
                </label>
                <label>
                  <span className="etiqueta">Observaciones</span>
                  <input
                    className="campo"
                    value={edicion.observaciones}
                    onChange={(evento) => setEdicion((actual) => ({ ...actual, observaciones: evento.target.value }))}
                    placeholder="Pintura nueva, falta un foco..."
                  />
                </label>

                <div className="sm:col-span-4 sm:flex sm:justify-end">
                  <button type="submit" className="boton-primario w-full sm:w-auto" disabled={guardandoHabitacion}>
                    <Save size={16} />
                    {guardandoHabitacion ? 'Guardando...' : 'Guardar datos de la habitacion'}
                  </button>
                </div>
              </form>
            </section>

            <GestionDeActivos
              bloque={bloque}
              habitacionCodigo={habitacion.codigo}
              activos={detalle.activos}
              alCambiar={async () => {
                await cargar();
                alCambiar?.();
              }}
            />
          </div>
        ) : null}
      </Modal>

      <ModalResidente
        abierto={Boolean(modalResidente)}
        alCerrar={() => setModalResidente(null)}
        alGuardar={async () => {
          await cargar();
          alCambiar?.();
        }}
        residente={modalResidente?.ci ? modalResidente : null}
        bloqueInicial={bloque}
        habitacionInicial={habitacion?.codigo || ''}
      />

      <ModalMover
        abierto={Boolean(residenteAMover)}
        alCerrar={() => setResidenteAMover(null)}
        residente={residenteAMover}
        alMover={async () => {
          await cargar();
          alCambiar?.();
        }}
      />

      <ModalRetirar
        abierto={Boolean(residenteARetirar)}
        alCerrar={() => setResidenteARetirar(null)}
        residente={residenteARetirar}
        alRetirar={async () => {
          await cargar();
          alCambiar?.();
        }}
      />
    </>
  );
}

export default ModalHabitacion;
