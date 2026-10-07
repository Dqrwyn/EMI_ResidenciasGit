// ==========================================================
//  caracteristicas/datos/PaginaDatos.jsx
//  Los tres formatos de Excel de la residencia:
//   - Importar (crea por CI, actualiza datos y asigna habitacion)
//   - Exportar (relacion real por habitaciones)
//   - Descargar plantilla (archivo vacio listo para llenar)
// ==========================================================

import { useRef, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Crown,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  TriangleAlert,
  Upload,
  Users,
} from 'lucide-react';

import Modal from '../../componentesComunes/Modal.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { servicioDatos } from './servicioDatos.js';
import { formatearNumero } from '../../utiles/formato.js';

const DETALLES_POR_FORMATO = {
  ESTUDIANTES: {
    Icono: Users,
    tono: 'bg-emi-azulClaro text-emi-azul',
    descripcion: 'Una hoja por bloque (EST. VARONES y EST. DAMAS). Es el formato para registrar estudiantes.',
    columnas:
      'N, BLOQUE, NOMBRE, CI, CELULAR, CARRERA, SEMESTRE, CODIGO, N° HABITACION, TIPO DE HABITACION, NOMBRE TUTOR, CELULAR TUTOR, FECHA DE INGRESO, OBS',
  },
  DEPARTAMENTOS_PEQUENOS: {
    Icono: Building2,
    tono: 'bg-emi-verdeClaro text-emi-verde',
    descripcion: 'Una sola hoja para el bloque de departamentos pequenos, del D-1 al D-20.',
    columnas:
      'N, NOMBRE, CI, CELULAR, CARGO, N° HABITACION, TIPO DE HABITACION, COSTO HAB. (Bs.), FECHA DE INGRESO, FECHA DE RETIRO, OBS',
  },
  DEPARTAMENTOS_GRANDES: {
    Icono: Crown,
    tono: 'bg-emi-amarilloClaro text-emi-naranja',
    descripcion: 'Una sola hoja para los departamentos grandes (DG-1 al DG-4) y el departamento del director (DD).',
    columnas:
      'N, NOMBRE, CI, CELULAR, CARGO, N° HABITACION, TIPO DE HABITACION, COSTO HAB. (Bs.), FECHA DE INGRESO, FECHA DE RETIRO, OBS',
  },
};

function ResultadoDeImportacion({ resultado }) {
  const resumen = [
    { etiqueta: 'Filas leidas', valor: resultado.filasLeidas },
    { etiqueta: 'Creados', valor: resultado.creados, tono: 'text-emi-verde' },
    { etiqueta: 'Actualizados', valor: resultado.actualizados, tono: 'text-emi-azul' },
    { etiqueta: 'Sin cambios', valor: resultado.sinCambios },
    { etiqueta: 'Cambios de habitacion', valor: resultado.movidos, tono: 'text-emi-naranja' },
    { etiqueta: 'Sin habitacion', valor: resultado.sinHabitacion, tono: 'text-emi-naranja' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-emi-verde/40 bg-emi-verdeClaro px-3 py-2.5">
        <CheckCircle2 size={18} className="shrink-0 text-emi-verde" />
        <p className="text-sm font-semibold text-emi-verde">
          Importacion terminada: {formatearNumero(resultado.creados + resultado.actualizados)} persona(s) procesada(s) en{' '}
          {formatearNumero(resultado.duracionMs)} ms.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {resumen.map((dato) => (
          <div key={dato.etiqueta} className="rounded-xl border border-emi-grisBorde bg-white px-3 py-2">
            <p className={`text-lg font-bold leading-none ${dato.tono || 'text-emi-azulProfundo'}`}>{formatearNumero(dato.valor)}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{dato.etiqueta}</p>
          </div>
        ))}
      </div>

      {resultado.errores.length > 0 ? (
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-emi-rojo">
            <TriangleAlert size={16} />
            {formatearNumero(resultado.errores.length)} fila(s) con error
          </h4>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro/50 p-3">
            {resultado.errores.map((error, indice) => (
              <li key={`${error.hoja}-${error.fila}-${indice}`} className="text-xs text-emi-rojo">
                {error.hoja ? `${error.hoja} - ` : ''}
                Fila {error.fila}: {error.mensaje}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {resultado.advertencias.length > 0 ? (
        <section>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-emi-naranja">
            <Info size={16} />
            {formatearNumero(resultado.advertencias.length)} advertencia(s)
          </h4>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto rounded-xl border border-emi-amarilloOscuro/40 bg-emi-amarilloClaro/50 p-3">
            {resultado.advertencias.map((aviso, indice) => (
              <li key={`${aviso.hoja}-${aviso.fila}-${indice}`} className="text-xs text-emi-naranja">
                {aviso.hoja ? `${aviso.hoja} - ` : ''}
                Fila {aviso.fila}: {aviso.mensaje}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {resultado.errores.length === 0 && resultado.advertencias.length === 0 ? (
        <p className="rounded-xl bg-emi-gris px-3 py-2.5 text-xs text-slate-500">
          Todas las filas se procesaron sin errores ni advertencias.
        </p>
      ) : null}
    </div>
  );
}

export function PaginaDatos() {
  const avisos = usarAvisos();
  const { catalogo, etiquetaFormato } = usarCatalogo();
  const entradaDeArchivo = useRef(null);

  const [formatoPendiente, setFormatoPendiente] = useState(null);
  const [seleccion, setSeleccion] = useState(null);
  const [permitirSobreOcupacion, setPermitirSobreOcupacion] = useState(true);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorImportacion, setErrorImportacion] = useState('');
  const [exportando, setExportando] = useState('');

  function abrirSelectorDeArchivo(formato) {
    setFormatoPendiente(formato || '');
    if (entradaDeArchivo.current) {
      entradaDeArchivo.current.value = '';
      entradaDeArchivo.current.click();
    }
  }

  function alElegirArchivo(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setSeleccion({ formato: formatoPendiente || null, archivo });
    setResultado(null);
    setErrorImportacion('');
    setPermitirSobreOcupacion(true);
  }

  async function importar(evento) {
    evento.preventDefault();
    if (!seleccion) return;

    setImportando(true);
    setErrorImportacion('');

    try {
      const datos = await servicioDatos.importar(seleccion.archivo, {
        formato: seleccion.formato,
        permitirSobreOcupacion,
      });
      setResultado(datos);
      avisos.exito(
        'Importacion completada',
        `${formatearNumero(datos.creados)} creado(s) y ${formatearNumero(datos.actualizados)} actualizado(s)`,
      );
    } catch (fallo) {
      const detalles = Array.isArray(fallo.detalles) && fallo.detalles.length > 0 ? `: ${fallo.detalles.join('; ')}` : '';
      setErrorImportacion(`${fallo.message}${detalles}`);
    } finally {
      setImportando(false);
    }
  }

  async function exportar(formato, plantilla) {
    const clave = `${plantilla ? 'plantilla' : 'exportar'}:${formato}`;
    setExportando(clave);
    try {
      const nombre = await servicioDatos.exportar(formato, { plantilla });
      avisos.exito(plantilla ? 'Plantilla descargada' : 'Excel exportado', nombre);
    } catch (fallo) {
      avisos.error('No se pudo generar el archivo', fallo.message);
    } finally {
      setExportando('');
    }
  }

  return (
    <div className="seccion space-y-5">
      <input
        ref={entradaDeArchivo}
        type="file"
        accept=".xlsx,.xls"
        onChange={alElegirArchivo}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <section className="tarjeta p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emi-azulClaro text-emi-azul">
            <FileSpreadsheet size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-emi-azulProfundo">Importar y exportar la relacion nominal</h2>
            <p className="mt-1 text-sm text-slate-500">
              Los tres formatos son los mismos de siempre: un archivo exportado se puede volver a importar sin cambiar nada. Al
              importar, si el CI no existe la persona se crea; si ya existe solo se actualizan las celdas con datos (una celda
              vacia nunca borra lo que ya estaba) y los cambios de habitacion quedan en el historial.
            </p>

            <button
              type="button"
              className="boton-suave mt-3"
              onClick={() => abrirSelectorDeArchivo(null)}
              disabled={importando}
            >
              <Upload size={16} />
              Importar detectando el formato automaticamente
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {catalogo.formatos.map((opcion) => {
          const detalle = DETALLES_POR_FORMATO[opcion.formato] || { Icono: FileSpreadsheet, tono: 'bg-slate-100 text-slate-500', descripcion: '', columnas: '' };
          const { Icono } = detalle;

          return (
            <section key={opcion.formato} className="tarjeta flex flex-col p-4">
              <header className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${detalle.tono}`}>
                  <Icono size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-emi-azulProfundo">{etiquetaFormato(opcion.formato)}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{detalle.descripcion}</p>
                </div>
              </header>

              <div className="mt-3 flex-1 rounded-xl border border-emi-grisBorde bg-emi-gris/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Columnas</p>
                <p className="mt-1 break-words text-[11px] leading-relaxed text-slate-600">{detalle.columnas}</p>
              </div>

              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  className="boton-primario w-full"
                  onClick={() => abrirSelectorDeArchivo(opcion.formato)}
                  disabled={importando}
                >
                  <Upload size={16} />
                  Importar Excel
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => exportar(opcion.formato, false)}
                    disabled={Boolean(exportando)}
                  >
                    {exportando === `exportar:${opcion.formato}` ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Exportar
                  </button>
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => exportar(opcion.formato, true)}
                    disabled={Boolean(exportando)}
                  >
                    {exportando === `plantilla:${opcion.formato}` ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                    Plantilla
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="tarjeta p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-emi-azulProfundo">
          <Info size={18} className="text-emi-azul" />
          Como se aplican los datos
        </h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          {[
            'El CI es la clave: no se duplican personas.',
            'Las celdas vacias no borran la informacion existente.',
            'Si el archivo asigna otra habitacion, se registra el cambio.',
            'Si una habitacion no existe o ya esta llena, se avisa y no se pierde el dato.',
            'Los codigos antiguos (p2-2, PB4, P1-09) se reconocen automaticamente.',
            'El tipo de residente se deduce de la columna TIPO DE RESIDENTE o del CARGO.',
          ].map((texto) => (
            <li key={texto} className="flex items-start gap-2 rounded-lg bg-emi-gris px-3 py-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emi-azul" />
              {texto}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          En la carpeta <strong>ejemplos</strong> del proyecto hay archivos de muestra y la relacion 2025 ya convertida, lista
          para importar desde aqui.
        </p>
      </section>

      <Modal
        abierto={Boolean(seleccion)}
        alCerrar={() => {
          if (importando) return;
          setSeleccion(null);
          setResultado(null);
          setErrorImportacion('');
        }}
        titulo={resultado ? 'Resultado de la importacion' : 'Confirmar importacion'}
        subtitulo={
          resultado
            ? `${resultado.archivo} - formato ${etiquetaFormato(resultado.formato)}`
            : seleccion?.archivo?.name
        }
        icono={FileSpreadsheet}
        tamanos="grande"
        pie={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => {
                setSeleccion(null);
                setResultado(null);
                setErrorImportacion('');
              }}
              disabled={importando}
            >
              {resultado ? 'Cerrar' : 'Cancelar'}
            </button>
            {!resultado ? (
              <button type="submit" form="formulario-importar" className="boton-primario" disabled={importando}>
                {importando ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {importando ? 'Importando...' : 'Importar ahora'}
              </button>
            ) : null}
          </div>
        }
      >
        {errorImportacion ? (
          <p className="mb-4 rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">
            {errorImportacion}
          </p>
        ) : null}

        {resultado ? (
          <ResultadoDeImportacion resultado={resultado} />
        ) : (
          <form id="formulario-importar" onSubmit={importar} className="space-y-4">
            <div className="rounded-xl border border-emi-grisBorde bg-emi-gris px-3 py-3 text-sm">
              <p className="font-semibold text-emi-azulProfundo">Archivo seleccionado</p>
              <p className="mt-0.5 break-all text-slate-600">{seleccion?.archivo?.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                Formato:{' '}
                <strong>{seleccion?.formato ? etiquetaFormato(seleccion.formato) : 'deteccion automatica'}</strong>
              </p>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>- Si el CI no existe, la persona se crea con los datos del archivo.</li>
              <li>- Si el CI ya existe, solo se actualizan las celdas con datos.</li>
              <li>- Los cambios de habitacion quedan registrados en el historial.</li>
            </ul>

            <label className="flex items-start gap-3 rounded-xl border border-emi-amarilloOscuro/40 bg-emi-amarilloClaro/40 p-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emi-azul focus:ring-emi-azul"
                checked={permitirSobreOcupacion}
                onChange={(evento) => setPermitirSobreOcupacion(evento.target.checked)}
              />
              <span className="text-xs text-slate-600">
                <strong className="block text-emi-azulProfundo">Permitir sobre-ocupacion</strong>
                Marque esta casilla si el Excel trae mas personas de las que caben en una habitacion y la institucion lo
                autoriza. Si la desmarca, esas filas se reportan como advertencia y no se asignan.
              </span>
            </label>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default PaginaDatos;
