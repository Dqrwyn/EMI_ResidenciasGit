// ==========================================================
//  caracteristicas/residentes/ModalResidente.jsx
//  Se usa tanto desde el mapa (dentro de una habitacion) como
//  desde la pantalla de residentes.
// ==========================================================

import { useEffect, useMemo, useState } from 'react';
import { Save, UserPlus, UserRoundPen } from 'lucide-react';

import Modal from '../../componentesComunes/Modal.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { servicioResidentes } from './servicioResidentes.js';
import { servicioMapa } from '../mapa/servicioMapa.js';

const CAMPOS_VACIOS = {
  nombre: '',
  ci: '',
  tipo: 'ESTUDIANTE',
  celular: '',
  carrera: '',
  semestre: '',
  codigo: '',
  tutorNombre: '',
  tutorCelular: '',
  cargo: '',
  correo: '',
  fechaIngreso: new Date().toISOString().slice(0, 10),
  observaciones: '',
  bloque: '',
  habitacionCodigo: '',
};

export function ModalResidente({ abierto, alCerrar, alGuardar, residente = null, bloqueInicial = '', habitacionInicial = '' }) {
  const avisos = usarAvisos();
  const { catalogo } = usarCatalogo();
  const [formulario, setFormulario] = useState(CAMPOS_VACIOS);
  const [habitaciones, setHabitaciones] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const esEdicion = Boolean(residente);

  useEffect(() => {
    if (!abierto) return;
    if (residente) {
      setFormulario({
        ...CAMPOS_VACIOS,
        ...residente,
        habitacionCodigo: residente.habitacionCodigo || '',
        bloque: residente.bloque || '',
      });
    } else {
      setFormulario({ ...CAMPOS_VACIOS, bloque: bloqueInicial, habitacionCodigo: habitacionInicial });
    }
    setError('');
  }, [abierto, residente, bloqueInicial, habitacionInicial]);

  useEffect(() => {
    if (!abierto || !formulario.bloque) {
      setHabitaciones([]);
      return undefined;
    }

    let activo = true;
    servicioMapa
      .listarHabitaciones(formulario.bloque)
      .then((datos) => {
        if (activo) setHabitaciones(datos.habitaciones);
      })
      .catch(() => {
        if (activo) setHabitaciones([]);
      });

    return () => {
      activo = false;
    };
  }, [abierto, formulario.bloque]);

  const esEstudiante = formulario.tipo === 'ESTUDIANTE';
  const habitacionesDisponibles = useMemo(
    () => [...habitaciones].sort((a, b) => a.codigo.localeCompare(b.codigo, 'es', { numeric: true })),
    [habitaciones],
  );

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');

    try {
      if (esEdicion) {
        await servicioResidentes.actualizar(residente.ci, formulario);
        avisos.exito('Datos actualizados', `${formulario.nombre} quedo actualizado`);
      } else {
        await servicioResidentes.crear(formulario);
        avisos.exito('Residente registrado', `${formulario.nombre} fue registrado`);
      }
      alGuardar?.();
      alCerrar?.();
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar el residente');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={esEdicion ? 'Editar residente' : 'Registrar residente'}
      subtitulo={esEdicion ? `CI ${residente.ci}` : 'Complete los datos de la persona'}
      icono={esEdicion ? UserRoundPen : UserPlus}
      tamanos="grande"
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">Los campos con * son obligatorios.</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" className="boton-secundario" onClick={() => alCerrar?.()} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" form="formulario-residente" className="boton-primario" disabled={guardando}>
              <Save size={16} />
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </div>
      }
    >
      <form id="formulario-residente" onSubmit={guardar} className="space-y-4">
        {error ? (
          <p className="rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">{error}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="etiqueta">Nombre completo *</span>
            <input className="campo" value={formulario.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} required />
          </label>

          <label>
            <span className="etiqueta">Carnet de identidad *</span>
            <input
              className="campo"
              value={formulario.ci}
              onChange={(evento) => cambiar('ci', evento.target.value)}
              disabled={esEdicion}
              required
            />
            {esEdicion ? <span className="mt-1 block text-[11px] text-slate-400">El CI no se puede cambiar</span> : null}
          </label>

          <label>
            <span className="etiqueta">Tipo de residente *</span>
            <select className="campo" value={formulario.tipo} onChange={(evento) => cambiar('tipo', evento.target.value)}>
              {catalogo.tiposResidente.map((opcion) => (
                <option key={opcion.tipo} value={opcion.tipo}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="etiqueta">Celular</span>
            <input className="campo" value={formulario.celular} onChange={(evento) => cambiar('celular', evento.target.value)} inputMode="tel" />
          </label>

          <label>
            <span className="etiqueta">Correo</span>
            <input className="campo" type="email" value={formulario.correo} onChange={(evento) => cambiar('correo', evento.target.value)} />
          </label>

          {esEstudiante ? (
            <>
              <label>
                <span className="etiqueta">Carrera</span>
                <input className="campo" value={formulario.carrera} onChange={(evento) => cambiar('carrera', evento.target.value)} />
              </label>

              <label>
                <span className="etiqueta">Semestre</span>
                <input className="campo" value={formulario.semestre} onChange={(evento) => cambiar('semestre', evento.target.value)} placeholder="Ej.: 3RO" />
              </label>

              <label>
                <span className="etiqueta">Codigo de estudiante</span>
                <input className="campo" value={formulario.codigo} onChange={(evento) => cambiar('codigo', evento.target.value)} />
              </label>

              <label>
                <span className="etiqueta">Fecha de ingreso</span>
                <input className="campo" type="date" value={formulario.fechaIngreso || ''} onChange={(evento) => cambiar('fechaIngreso', evento.target.value)} />
              </label>

              <label>
                <span className="etiqueta">Nombre del tutor</span>
                <input className="campo" value={formulario.tutorNombre} onChange={(evento) => cambiar('tutorNombre', evento.target.value)} />
              </label>

              <label>
                <span className="etiqueta">Celular del tutor</span>
                <input className="campo" value={formulario.tutorCelular} onChange={(evento) => cambiar('tutorCelular', evento.target.value)} inputMode="tel" />
              </label>
            </>
          ) : (
            <>
              <label>
                <span className="etiqueta">Cargo</span>
                <input className="campo" value={formulario.cargo} onChange={(evento) => cambiar('cargo', evento.target.value)} />
              </label>

              <label>
                <span className="etiqueta">Fecha de ingreso</span>
                <input className="campo" type="date" value={formulario.fechaIngreso || ''} onChange={(evento) => cambiar('fechaIngreso', evento.target.value)} />
              </label>
            </>
          )}
        </div>

        <div className="rounded-xl border border-emi-grisBorde bg-emi-gris/70 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Ubicacion</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="etiqueta">Bloque</span>
              <select className="campo" value={formulario.bloque || ''} onChange={(evento) => setFormulario((actual) => ({ ...actual, bloque: evento.target.value, habitacionCodigo: '' }))}>
                <option value="">Sin bloque</option>
                {catalogo.bloques.map((opcion) => (
                  <option key={opcion.bloque} value={opcion.bloque}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="etiqueta">Habitacion</span>
              <select
                className="campo"
                value={formulario.habitacionCodigo || ''}
                onChange={(evento) => cambiar('habitacionCodigo', evento.target.value)}
                disabled={!formulario.bloque}
              >
                <option value="">Sin habitacion asignada</option>
                {habitacionesDisponibles.map((habitacion) => {
                  const lleno = habitacion.ocupacion.cantidad >= habitacion.capacidad;
                  return (
                    <option key={habitacion.codigo} value={habitacion.codigo}>
                      {habitacion.codigo} - {habitacion.ocupacion.cantidad}/{habitacion.capacidad}
                      {lleno ? ' (llena)' : ''}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
        </div>

        <label>
          <span className="etiqueta">Observaciones</span>
          <textarea className="campo min-h-[80px]" value={formulario.observaciones} onChange={(evento) => cambiar('observaciones', evento.target.value)} />
        </label>
      </form>
    </Modal>
  );
}

export default ModalResidente;
