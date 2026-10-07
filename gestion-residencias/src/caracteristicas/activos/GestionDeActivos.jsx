// ==========================================================
//  caracteristicas/activos/GestionDeActivos.jsx
//  Los activos son de la HABITACION: aqui se dan de alta, se
//  editan y se dan de baja.
// ==========================================================

import { useEffect, useState } from 'react';
import { PackagePlus, Pencil, Save, Trash2, X } from 'lucide-react';

import ModalConfirmacion from '../../componentesComunes/ModalConfirmacion.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { servicioActivos } from './servicioActivos.js';
import { colorDeEstadoActivo } from '../../utiles/formato.js';

const ACTIVO_VACIO = { nombre: '', codigo: '', estado: 'OPTIMO', observacion: '' };

function FormularioDeActivo({ activo, estados, alGuardar, alCancelar, guardando }) {
  const [formulario, setFormulario] = useState(activo || ACTIVO_VACIO);

  useEffect(() => {
    setFormulario(activo || ACTIVO_VACIO);
  }, [activo]);

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        alGuardar(formulario);
      }}
      className="mt-2 space-y-2 rounded-xl border border-emi-azul/25 bg-emi-azulClaro/50 p-3"
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <label>
          <span className="etiqueta">Nombre del activo *</span>
          <input className="campo" value={formulario.nombre} onChange={(evento) => cambiar('nombre', evento.target.value)} placeholder="Cama de una plaza" required />
        </label>
        <label>
          <span className="etiqueta">Codigo / inventario</span>
          <input className="campo" value={formulario.codigo} onChange={(evento) => cambiar('codigo', evento.target.value)} placeholder="CAM-01" />
        </label>
        <label>
          <span className="etiqueta">Estado</span>
          <select className="campo" value={formulario.estado} onChange={(evento) => cambiar('estado', evento.target.value)}>
            {estados.map((opcion) => (
              <option key={opcion.estado} value={opcion.estado}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="etiqueta">Observacion</span>
          <input className="campo" value={formulario.observacion} onChange={(evento) => cambiar('observacion', evento.target.value)} placeholder="Tiene un barrote suelto" />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="boton-secundario" onClick={alCancelar} disabled={guardando}>
          <X size={15} />
          Cancelar
        </button>
        <button type="submit" className="boton-primario" disabled={guardando}>
          <Save size={15} />
          {guardando ? 'Guardando...' : 'Guardar activo'}
        </button>
      </div>
    </form>
  );
}

export function GestionDeActivos({ bloque, habitacionCodigo, activos = [], alCambiar }) {
  const avisos = usarAvisos();
  const { catalogo } = usarCatalogo();

  const [enEdicion, setEnEdicion] = useState(null);
  const [agregando, setAgregando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  async function crear(formulario) {
    setGuardando(true);
    try {
      await servicioActivos.crear({ ...formulario, bloque, habitacionCodigo });
      avisos.exito('Activo registrado', `${formulario.nombre} se agrego a ${habitacionCodigo}`);
      setAgregando(false);
      alCambiar?.();
    } catch (fallo) {
      avisos.error('No se pudo registrar el activo', fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  async function actualizar(formulario) {
    setGuardando(true);
    try {
      await servicioActivos.actualizar(formulario.id, {
        nombre: formulario.nombre,
        codigo: formulario.codigo,
        estado: formulario.estado,
        observacion: formulario.observacion,
      });
      avisos.exito('Activo actualizado', formulario.nombre);
      setEnEdicion(null);
      alCambiar?.();
    } catch (fallo) {
      avisos.error('No se pudo actualizar el activo', fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    setEliminando(true);
    try {
      await servicioActivos.eliminar(porEliminar.id);
      avisos.exito('Activo dado de baja', porEliminar.nombre);
      setPorEliminar(null);
      alCambiar?.();
    } catch (fallo) {
      avisos.error('No se pudo dar de baja el activo', fallo.message);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <section>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-emi-azulProfundo">Activos de la habitacion</h3>
          <p className="text-[11px] text-slate-500">
            Los bienes pertenecen a {habitacionCodigo}, no a la persona: si alguien se muda, aqui se quedan.
          </p>
        </div>
        <button type="button" className="boton-suave" onClick={() => { setAgregando(true); setEnEdicion(null); }} disabled={agregando}>
          <PackagePlus size={15} />
          Agregar activo
        </button>
      </header>

      {agregando ? (
        <FormularioDeActivo
          activo={null}
          estados={catalogo.estadosActivo}
          guardando={guardando}
          alGuardar={crear}
          alCancelar={() => setAgregando(false)}
        />
      ) : null}

      {activos.length === 0 && !agregando ? (
        <p className="mt-3 rounded-xl border border-dashed border-emi-grisBorde px-3 py-4 text-center text-xs text-slate-400">
          Todavia no hay activos registrados en esta habitacion.
        </p>
      ) : null}

      <ul className="mt-3 space-y-2">
        {activos.map((activo) => (
          <li key={activo.id}>
            {enEdicion?.id === activo.id ? (
              <FormularioDeActivo
                activo={enEdicion}
                estados={catalogo.estadosActivo}
                guardando={guardando}
                alGuardar={actualizar}
                alCancelar={() => setEnEdicion(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-3 rounded-xl border border-emi-grisBorde bg-white px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-emi-azulProfundo">
                    {activo.nombre}
                    {activo.codigo ? <span className="ml-2 text-xs font-medium text-slate-400">{activo.codigo}</span> : null}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className={colorDeEstadoActivo(activo.estado)}>{activo.estado}</span>
                    {activo.observacion ? <span className="text-xs text-slate-500">{activo.observacion}</span> : null}
                  </div>
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    className="boton-icono"
                    onClick={() => { setEnEdicion(activo); setAgregando(false); }}
                    title="Editar activo"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="boton-icono hover:border-emi-rojo hover:bg-emi-rojoClaro hover:text-emi-rojo"
                    onClick={() => setPorEliminar(activo)}
                    title="Dar de baja"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ModalConfirmacion
        abierto={Boolean(porEliminar)}
        alCerrar={() => setPorEliminar(null)}
        alConfirmar={eliminar}
        ocupado={eliminando}
        titulo="Dar de baja el activo"
        mensaje={`Se eliminara "${porEliminar?.nombre}" del inventario de ${habitacionCodigo}. Esta accion queda en el historial.`}
        textoConfirmar="Dar de baja"
      />
    </section>
  );
}

export default GestionDeActivos;
