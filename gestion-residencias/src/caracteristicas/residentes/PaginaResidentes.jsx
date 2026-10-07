// ==========================================================
//  caracteristicas/residentes/PaginaResidentes.jsx
//  Buscador por CI o nombre + listado con filtros.
//  Desde aqui se edita, se cambia de habitacion, se retira y se
//  reactiva a cualquier persona de la residencia.
// ==========================================================

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRightLeft,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Filter,
  LogOut,
  Pencil,
  RotateCcw,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import { usarPeticion } from '../../utiles/usarPeticion.js';
import { servicioResidentes } from './servicioResidentes.js';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { Cargando, ErrorDeCarga, EstadoVacio } from '../../componentesComunes/Estados.jsx';
import { formatearFecha, formatearNumero } from '../../utiles/formato.js';
import ModalResidente from './ModalResidente.jsx';
import ModalMover from './ModalMover.jsx';
import ModalRetirar, { ModalReactivar } from './ModalRetirar.jsx';

const FILTROS_INICIALES = {
  texto: '',
  bloque: '',
  tipo: '',
  estado: '',
  sinHabitacion: false,
  pagina: 1,
};

function DatosDeResidente({ residente, etiquetaTipo }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="truncate text-sm font-bold text-emi-azulProfundo">{residente.nombre}</p>
        <span className={residente.tipo === 'ESTUDIANTE' ? 'insignia-azul' : 'insignia-gris'}>{etiquetaTipo(residente.tipo)}</span>
        {residente.estado === 'RETIRADO' ? <span className="insignia-roja">Retirado</span> : null}
      </div>

      <p className="text-xs text-slate-500">
        CI {residente.ci}
        {residente.celular ? ` - Cel. ${residente.celular}` : ''}
        {residente.cargo ? ` - ${residente.cargo}` : ''}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <BedDouble size={13} className="text-emi-azul" />
          {residente.habitacionCodigo ? (
            <>
              <strong className="font-semibold text-emi-azulProfundo">{residente.habitacionCodigo}</strong>
              {residente.habitacion ? <span className="text-slate-400">({residente.habitacion.capacidad} puestos)</span> : null}
            </>
          ) : (
            <span className="font-semibold text-emi-naranja">Sin habitacion asignada</span>
          )}
        </span>
        {residente.carrera ? <span className="truncate">Carrera: {residente.carrera}</span> : null}
        {residente.semestre ? <span>Semestre: {residente.semestre}</span> : null}
        {residente.fechaIngreso ? <span>Ingreso: {formatearFecha(residente.fechaIngreso)}</span> : null}
      </div>
    </div>
  );
}

export function PaginaResidentes() {
  const { catalogo, etiquetaTipoResidente } = usarCatalogo();
  const [parametros, setParametros] = useSearchParams();
  const textoDelUrl = parametros.get('texto') || parametros.get('ci') || '';

  const [filtros, setFiltros] = useState({ ...FILTROS_INICIALES, texto: textoDelUrl });
  const [textoEscrito, setTextoEscrito] = useState(textoDelUrl);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [residenteEnEdicion, setResidenteEnEdicion] = useState(null);
  const [residenteParaCrear, setResidenteParaCrear] = useState(null);
  const [residenteAMover, setResidenteAMover] = useState(null);
  const [residenteARetirar, setResidenteARetirar] = useState(null);
  const [residenteAReactivar, setResidenteAReactivar] = useState(null);

  const { datos, cargando, error, recargar } = usarPeticion(
    () => servicioResidentes.listar({ ...filtros }),
    [filtros.texto, filtros.bloque, filtros.tipo, filtros.estado, filtros.sinHabitacion, filtros.pagina],
  );

  // Si el buscador del encabezado manda ?texto= o ?ci=, se aplica aqui.
  useEffect(() => {
    if (textoDelUrl === filtros.texto) return;
    setFiltros((actual) => ({ ...actual, texto: textoDelUrl, pagina: 1 }));
    setTextoEscrito(textoDelUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoDelUrl]);

  function aplicarFiltro(campo, valor) {
    setFiltros((actual) => ({ ...actual, [campo]: valor, pagina: 1 }));
  }

  function buscar(evento) {
    evento.preventDefault();
    setFiltros((actual) => ({ ...actual, texto: textoEscrito.trim(), pagina: 1 }));
    // Se limpia el parametro de la direccion para no repetir la busqueda.
    if (parametros.get('texto') || parametros.get('ci')) {
      const siguientes = new URLSearchParams(parametros);
      siguientes.delete('texto');
      siguientes.delete('ci');
      setParametros(siguientes, { replace: true });
    }
  }

  function limpiarTodo() {
    setFiltros(FILTROS_INICIALES);
    setTextoEscrito('');
    setParametros({}, { replace: true });
  }

  const hayFiltros =
    Boolean(filtros.texto) || Boolean(filtros.bloque) || Boolean(filtros.tipo) || Boolean(filtros.estado) || filtros.sinHabitacion;
  const total = datos?.total ?? 0;
  const pagina = datos?.pagina ?? filtros.pagina;
  const paginas = datos?.paginas ?? 1;

  function refrescar() {
    return recargar();
  }

  return (
    <div className="seccion space-y-4">
      <form onSubmit={buscar} className="tarjeta space-y-3 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="campo pl-9"
              value={textoEscrito}
              onChange={(evento) => setTextoEscrito(evento.target.value)}
              placeholder="Buscar por CI, nombre, carrera o cargo..."
              aria-label="Buscar residente"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="boton-primario flex-1 sm:flex-none">
              <Search size={16} />
              Buscar
            </button>
            <button
              type="button"
              className="boton-secundario lg:hidden"
              onClick={() => setMostrarFiltros((valor) => !valor)}
              aria-expanded={mostrarFiltros}
            >
              <Filter size={16} />
              Filtros
            </button>
            <button type="button" className="boton-primario hidden sm:inline-flex" onClick={() => setResidenteParaCrear({})}>
              <UserPlus size={16} />
              Registrar
            </button>
          </div>
        </div>

        <div className={`${mostrarFiltros ? 'grid' : 'hidden'} gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4`}>
          <label>
            <span className="etiqueta">Bloque</span>
            <select className="campo" value={filtros.bloque} onChange={(evento) => aplicarFiltro('bloque', evento.target.value)}>
              <option value="">Todos los bloques</option>
              {catalogo.bloques.map((opcion) => (
                <option key={opcion.bloque} value={opcion.bloque}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="etiqueta">Tipo de residente</span>
            <select className="campo" value={filtros.tipo} onChange={(evento) => aplicarFiltro('tipo', evento.target.value)}>
              <option value="">Todos los tipos</option>
              {catalogo.tiposResidente.map((opcion) => (
                <option key={opcion.tipo} value={opcion.tipo}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="etiqueta">Estado</span>
            <select className="campo" value={filtros.estado} onChange={(evento) => aplicarFiltro('estado', evento.target.value)}>
              <option value="">Activos y retirados</option>
              {catalogo.estadosResidente.map((opcion) => (
                <option key={opcion.estado} value={opcion.estado}>
                  {opcion.etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end">
            <span className="flex w-full items-center gap-2 rounded-xl border border-emi-grisBorde bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emi-azul focus:ring-emi-azul"
                checked={filtros.sinHabitacion}
                onChange={(evento) => aplicarFiltro('sinHabitacion', evento.target.checked)}
              />
              <span className="text-slate-600">Solo personas sin habitacion</span>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            {cargando && !datos ? 'Buscando...' : `${formatearNumero(total)} residente(s) encontrado(s)`}
            {hayFiltros ? ' con los filtros aplicados' : ''}
          </p>

          <div className="flex gap-2">
            {hayFiltros ? (
              <button type="button" className="boton-suave py-1.5 text-xs" onClick={limpiarTodo}>
                <X size={14} />
                Limpiar filtros
              </button>
            ) : null}
            <button type="button" className="boton-primario py-1.5 text-xs sm:hidden" onClick={() => setResidenteParaCrear({})}>
              <UserPlus size={14} />
              Registrar
            </button>
          </div>
        </div>
      </form>

      {cargando && !datos ? <Cargando mensaje="Buscando residentes..." /> : null}
      {error ? <ErrorDeCarga mensaje={error.message} alReintentar={recargar} /> : null}

      {datos && datos.residentes.length === 0 ? (
        <div className="tarjeta">
          <EstadoVacio
            icono={Users}
            titulo="No se encontraron residentes"
            mensaje={
              hayFiltros
                ? 'Pruebe con otro CI, otro nombre o quite algunos filtros.'
                : 'Todavia no hay personas registradas. Registre una o importe un Excel desde la pantalla de datos.'
            }
          />
        </div>
      ) : null}

      {/* Tabla para pantallas grandes */}
      {datos && datos.residentes.length > 0 ? (
        <div className="tarjeta hidden overflow-hidden md:block">
          <table className="tabla">
            <thead>
              <tr>
                <th>Residente</th>
                <th>CI</th>
                <th>Tipo</th>
                <th>Habitacion</th>
                <th>Carrera / Cargo</th>
                <th>Ingreso</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.residentes.map((residente) => (
                <tr key={residente.ci}>
                  <td>
                    <span className="block font-semibold text-emi-azulProfundo">{residente.nombre}</span>
                    {residente.celular ? <span className="text-xs text-slate-400">Cel. {residente.celular}</span> : null}
                  </td>
                  <td className="whitespace-nowrap font-medium">{residente.ci}</td>
                  <td>
                    <span className={residente.tipo === 'ESTUDIANTE' ? 'insignia-azul' : 'insignia-gris'}>
                      {etiquetaTipoResidente(residente.tipo)}
                    </span>
                    {residente.estado === 'RETIRADO' ? <span className="insignia-roja mt-1 block w-fit">Retirado</span> : null}
                  </td>
                  <td>
                    {residente.habitacionCodigo ? (
                      <span className="insignia-verde">{residente.habitacionCodigo}</span>
                    ) : (
                      <span className="insignia-amarilla">Sin asignar</span>
                    )}
                  </td>
                  <td className="max-w-[220px]">
                    <span className="block truncate text-slate-600">{residente.carrera || residente.cargo || '-'}</span>
                    {residente.semestre ? <span className="text-xs text-slate-400">{residente.semestre}</span> : null}
                  </td>
                  <td className="whitespace-nowrap text-slate-500">{formatearFecha(residente.fechaIngreso)}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className="boton-icono" title="Editar datos" onClick={() => setResidenteEnEdicion(residente)}>
                        <Pencil size={14} />
                      </button>
                      {residente.estado === 'RETIRADO' ? (
                        <button
                          type="button"
                          className="boton-icono hover:border-emi-verde hover:bg-emi-verdeClaro hover:text-emi-verde"
                          title="Reactivar"
                          onClick={() => setResidenteAReactivar(residente)}
                        >
                          <RotateCcw size={14} />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="boton-icono"
                            title="Cambiar de habitacion"
                            onClick={() => setResidenteAMover(residente)}
                          >
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
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Tarjetas para celular y tablet */}
      {datos && datos.residentes.length > 0 ? (
        <div className="space-y-3 md:hidden">
          {datos.residentes.map((residente) => (
            <article key={residente.ci} className="tarjeta p-3.5">
              <DatosDeResidente residente={residente} etiquetaTipo={etiquetaTipoResidente} />

              <div className="mt-3 flex flex-wrap gap-2 border-t border-emi-grisBorde pt-3">
                <button type="button" className="boton-secundario flex-1 py-2 text-xs" onClick={() => setResidenteEnEdicion(residente)}>
                  <Pencil size={14} />
                  Editar
                </button>
                {residente.estado === 'RETIRADO' ? (
                  <button
                    type="button"
                    className="boton-exito flex-1 py-2 text-xs"
                    onClick={() => setResidenteAReactivar(residente)}
                  >
                    <RotateCcw size={14} />
                    Reactivar
                  </button>
                ) : (
                  <>
                    <button type="button" className="boton-secundario flex-1 py-2 text-xs" onClick={() => setResidenteAMover(residente)}>
                      <ArrowRightLeft size={14} />
                      Mover
                    </button>
                    <button type="button" className="boton-peligro flex-1 py-2 text-xs" onClick={() => setResidenteARetirar(residente)}>
                      <LogOut size={14} />
                      Retirar
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {datos && paginas > 1 ? (
        <nav className="flex items-center justify-between gap-2" aria-label="Paginacion">
          <button
            type="button"
            className="boton-secundario"
            disabled={pagina <= 1}
            onClick={() => setFiltros((actual) => ({ ...actual, pagina: actual.pagina - 1 }))}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <p className="text-xs font-semibold text-slate-500">
            Pagina {pagina} de {paginas}
          </p>

          <button
            type="button"
            className="boton-secundario"
            disabled={pagina >= paginas}
            onClick={() => setFiltros((actual) => ({ ...actual, pagina: actual.pagina + 1 }))}
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </nav>
      ) : null}

      <ModalResidente
        abierto={Boolean(residenteParaCrear) || Boolean(residenteEnEdicion)}
        alCerrar={() => {
          setResidenteParaCrear(null);
          setResidenteEnEdicion(null);
        }}
        alGuardar={refrescar}
        residente={residenteEnEdicion}
      />

      <ModalMover
        abierto={Boolean(residenteAMover)}
        alCerrar={() => setResidenteAMover(null)}
        residente={residenteAMover}
        alMover={refrescar}
      />

      <ModalRetirar
        abierto={Boolean(residenteARetirar)}
        alCerrar={() => setResidenteARetirar(null)}
        residente={residenteARetirar}
        alRetirar={refrescar}
      />

      <ModalReactivar
        abierto={Boolean(residenteAReactivar)}
        alCerrar={() => setResidenteAReactivar(null)}
        residente={residenteAReactivar}
        alReactivar={refrescar}
      />

      <p className="px-1 text-xs text-slate-400">
        Consejo: puede registrar a la persona, cambiarle de habitacion conservando todos sus datos y retirarla sin borrar su ficha.
        Los activos pertenecen a la habitacion, no a la persona.
      </p>

    </div>
  );
}

export default PaginaResidentes;
