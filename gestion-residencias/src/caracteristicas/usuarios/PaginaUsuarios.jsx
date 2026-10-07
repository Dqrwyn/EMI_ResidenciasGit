// ==========================================================
//  caracteristicas/usuarios/PaginaUsuarios.jsx
//  Solo para el rol ADMINISTRADOR: cuentas con acceso al
//  sistema, roles, contrasenas y bajas.
// ==========================================================

import { useEffect, useState } from 'react';
import { KeyRound, Pencil, Save, ShieldCheck, Trash2, UserPlus } from 'lucide-react';

import Modal from '../../componentesComunes/Modal.jsx';
import ModalConfirmacion from '../../componentesComunes/ModalConfirmacion.jsx';
import { usarAvisos } from '../../contexto/ContextoAvisos.jsx';
import { usarCatalogo } from '../../contexto/ContextoCatalogo.jsx';
import { usarAutenticacion } from '../../contexto/ContextoAutenticacion.jsx';
import { Cargando, ErrorDeCarga, EstadoVacio } from '../../componentesComunes/Estados.jsx';
import { usarPeticion } from '../../utiles/usarPeticion.js';
import { servicioUsuarios } from './servicioUsuarios.js';
import { formatearFechaHora } from '../../utiles/formato.js';

function FormularioDeUsuario({ usuario, roles, alGuardar, alCancelar, ocupado }) {
  const esEdicion = Boolean(usuario);
  const [formulario, setFormulario] = useState({
    usuario: usuario?.usuario || '',
    nombre: usuario?.nombre || '',
    rol: usuario?.rol || 'RESPONSABLE',
    activo: usuario?.activo !== false,
    contrasena: '',
  });
  const [error, setError] = useState('');

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  }

  function enviar(evento) {
    evento.preventDefault();
    setError('');
    if (!esEdicion && formulario.contrasena.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    if (esEdicion) {
      alGuardar({ nombre: formulario.nombre, rol: formulario.rol, activo: formulario.activo });
    } else {
      alGuardar(formulario);
    }
  }

  return (
    <form
      id="formulario-usuario"
      onSubmit={enviar}
      className="space-y-4"
    >
      {error ? (
        <p className="rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">{error}</p>
      ) : null}

      <label>
        <span className="etiqueta">Nombre de usuario *</span>
        <input
          className="campo"
          value={formulario.usuario}
          onChange={(evento) => cambiar('usuario', evento.target.value)}
          disabled={esEdicion}
          placeholder="juan.perez"
          autoComplete="off"
          required
        />
        <span className="mt-1 block text-[11px] text-slate-400">
          {esEdicion
            ? 'El nombre de usuario no se puede cambiar.'
            : 'Solo letras, numeros, punto, guion y guion bajo (minimo 3 caracteres).'}
        </span>
      </label>

      <label>
        <span className="etiqueta">Nombre completo *</span>
        <input
          className="campo"
          value={formulario.nombre}
          onChange={(evento) => cambiar('nombre', evento.target.value)}
          placeholder="Juan Perez Mamani"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="etiqueta">Rol *</span>
          <select className="campo" value={formulario.rol} onChange={(evento) => cambiar('rol', evento.target.value)}>
            {roles.map((opcion) => (
              <option key={opcion.rol} value={opcion.rol}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>

        {esEdicion ? (
          <label className="flex items-end">
            <span className="flex w-full items-center gap-2 rounded-xl border border-emi-grisBorde bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emi-azul focus:ring-emi-azul"
                checked={formulario.activo}
                onChange={(evento) => cambiar('activo', evento.target.checked)}
              />
              <span className="text-slate-600">Cuenta habilitada</span>
            </span>
          </label>
        ) : (
          <label>
            <span className="etiqueta">Contrasena *</span>
            <input
              type="password"
              className="campo"
              value={formulario.contrasena}
              onChange={(evento) => cambiar('contrasena', evento.target.value)}
              placeholder="Minimo 8 caracteres"
              autoComplete="new-password"
              required
            />
          </label>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="boton-secundario" onClick={alCancelar} disabled={ocupado}>
          Cancelar
        </button>
        <button type="submit" className="boton-primario" disabled={ocupado}>
          <Save size={16} />
          {ocupado ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
        </button>
      </div>
    </form>
  );
}

function FormularioDeContrasena({ usuario, alGuardar, alCancelar, ocupado }) {
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');

  function enviar(evento) {
    evento.preventDefault();
    setError('');
    if (contrasena.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    if (contrasena !== confirmacion) {
      setError('Las dos contrasenas no coinciden');
      return;
    }
    alGuardar(contrasena);
  }

  return (
    <form id="formulario-contrasena" onSubmit={enviar} className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">{error}</p>
      ) : null}

      <p className="rounded-xl bg-emi-gris px-3 py-2.5 text-sm text-slate-600">
        Se cambiara la contrasena de <strong>{usuario?.usuario}</strong>. La persona debera usar la nueva en su proximo ingreso.
      </p>

      <label>
        <span className="etiqueta">Nueva contrasena *</span>
        <input
          type="password"
          className="campo"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          placeholder="Minimo 8 caracteres"
          autoComplete="new-password"
          required
        />
      </label>

      <label>
        <span className="etiqueta">Repetir contrasena *</span>
        <input
          type="password"
          className="campo"
          value={confirmacion}
          onChange={(evento) => setConfirmacion(evento.target.value)}
          autoComplete="new-password"
          required
        />
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="boton-secundario" onClick={alCancelar} disabled={ocupado}>
          Cancelar
        </button>
        <button type="submit" className="boton-primario" disabled={ocupado}>
          <KeyRound size={16} />
          {ocupado ? 'Guardando...' : 'Cambiar contrasena'}
        </button>
      </div>
    </form>
  );
}

export function PaginaUsuarios() {
  const avisos = usarAvisos();
  const { catalogo, etiquetaRol } = usarCatalogo();
  const { usuario: usuarioActual } = usarAutenticacion();

  const { datos, cargando, error, recargar } = usarPeticion(() => servicioUsuarios.listar(), []);

  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);
  const [creando, setCreando] = useState(false);
  const [usuarioParaContrasena, setUsuarioParaContrasena] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    document.title = 'Usuarios - Residencias EMI';
  }, []);

  async function crear(formulario) {
    setOcupado(true);
    try {
      await servicioUsuarios.crear(formulario);
      avisos.exito('Usuario creado', formulario.usuario);
      setCreando(false);
      await recargar();
    } catch (fallo) {
      avisos.error('No se pudo crear el usuario', fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function actualizar(cambios) {
    setOcupado(true);
    try {
      await servicioUsuarios.actualizar(usuarioParaEditar.usuario, cambios);
      avisos.exito('Usuario actualizado', usuarioParaEditar.usuario);
      setUsuarioParaEditar(null);
      await recargar();
    } catch (fallo) {
      avisos.error('No se pudo actualizar el usuario', fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function cambiarContrasena(contrasena) {
    setOcupado(true);
    try {
      await servicioUsuarios.cambiarContrasena(usuarioParaContrasena.usuario, contrasena);
      avisos.exito('Contrasena cambiada', usuarioParaContrasena.usuario);
      setUsuarioParaContrasena(null);
    } catch (fallo) {
      avisos.error('No se pudo cambiar la contrasena', fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  async function eliminar() {
    setOcupado(true);
    try {
      await servicioUsuarios.eliminar(usuarioAEliminar.usuario);
      avisos.exito('Usuario eliminado', usuarioAEliminar.usuario);
      setUsuarioAEliminar(null);
      await recargar();
    } catch (fallo) {
      avisos.error('No se pudo eliminar el usuario', fallo.message);
    } finally {
      setOcupado(false);
    }
  }

  const usuarios = datos || [];

  return (
    <div className="seccion space-y-4">
      <section className="tarjeta flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emi-azulClaro text-emi-azul">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h2 className="text-base font-bold text-emi-azulProfundo">Cuentas con acceso al sistema</h2>
            <p className="text-xs text-slate-500">
              Los <strong>administradores</strong> gestionan usuarios y datos; los <strong>responsables</strong> trabajan con el
              mapa, los residentes y el Excel.
            </p>
          </div>
        </div>

        <button type="button" className="boton-primario" onClick={() => setCreando(true)}>
          <UserPlus size={16} />
          Nuevo usuario
        </button>
      </section>

      {cargando && !datos ? <Cargando mensaje="Cargando usuarios..." /> : null}
      {error ? <ErrorDeCarga mensaje={error.message} alReintentar={recargar} /> : null}

      {datos && usuarios.length === 0 ? (
        <div className="tarjeta">
          <EstadoVacio icono={ShieldCheck} titulo="Sin usuarios" mensaje="Cree la primera cuenta de acceso." />
        </div>
      ) : null}

      {usuarios.length > 0 ? (
        <div className="tarjeta hidden overflow-hidden md:block">
          <table className="tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre completo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((cuenta) => (
                <tr key={cuenta.usuario}>
                  <td className="font-semibold text-emi-azulProfundo">{cuenta.usuario}</td>
                  <td>{cuenta.nombre}</td>
                  <td>
                    <span className={cuenta.rol === 'ADMINISTRADOR' ? 'insignia-azul' : 'insignia-gris'}>
                      {etiquetaRol(cuenta.rol)}
                    </span>
                  </td>
                  <td>
                    <span className={cuenta.activo === false ? 'insignia-roja' : 'insignia-verde'}>
                      {cuenta.activo === false ? 'Deshabilitada' : 'Habilitada'}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className="boton-icono" title="Editar" onClick={() => setUsuarioParaEditar(cuenta)}>
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="boton-icono"
                        title="Cambiar contrasena"
                        onClick={() => setUsuarioParaContrasena(cuenta)}
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        type="button"
                        className="boton-icono hover:border-emi-rojo hover:bg-emi-rojoClaro hover:text-emi-rojo"
                        title={cuenta.usuario === usuarioActual?.usuario ? 'No puede eliminar su propia cuenta' : 'Eliminar'}
                        onClick={() => setUsuarioAEliminar(cuenta)}
                        disabled={cuenta.usuario === usuarioActual?.usuario}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {usuarios.length > 0 ? (
        <div className="space-y-3 md:hidden">
          {usuarios.map((cuenta) => (
            <article key={cuenta.usuario} className="tarjeta p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-emi-azulProfundo">{cuenta.nombre}</p>
                  <p className="text-xs text-slate-500">{cuenta.usuario}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={cuenta.rol === 'ADMINISTRADOR' ? 'insignia-azul' : 'insignia-gris'}>
                    {etiquetaRol(cuenta.rol)}
                  </span>
                  <span className={cuenta.activo === false ? 'insignia-roja' : 'insignia-verde'}>
                    {cuenta.activo === false ? 'Deshabilitada' : 'Habilitada'}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-emi-grisBorde pt-3">
                <button type="button" className="boton-secundario flex-1 py-2 text-xs" onClick={() => setUsuarioParaEditar(cuenta)}>
                  <Pencil size={14} />
                  Editar
                </button>
                <button
                  type="button"
                  className="boton-secundario flex-1 py-2 text-xs"
                  onClick={() => setUsuarioParaContrasena(cuenta)}
                >
                  <KeyRound size={14} />
                  Contrasena
                </button>
                <button
                  type="button"
                  className="boton-peligro flex-1 py-2 text-xs"
                  onClick={() => setUsuarioAEliminar(cuenta)}
                  disabled={cuenta.usuario === usuarioActual?.usuario}
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>

              {cuenta.actualizadoEn ? (
                <p className="mt-2 text-[11px] text-slate-400">Ultima actualizacion: {formatearFechaHora(cuenta.actualizadoEn)}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      <Modal
        abierto={creando || Boolean(usuarioParaEditar)}
        alCerrar={() => {
          if (ocupado) return;
          setCreando(false);
          setUsuarioParaEditar(null);
        }}
        titulo={usuarioParaEditar ? 'Editar usuario' : 'Nuevo usuario'}
        subtitulo={usuarioParaEditar ? usuarioParaEditar.usuario : 'Cree una cuenta de acceso al sistema'}
        icono={ShieldCheck}
        tamanos="mediano"
      >
        <FormularioDeUsuario
          usuario={usuarioParaEditar}
          roles={catalogo.roles}
          ocupado={ocupado}
          alGuardar={usuarioParaEditar ? actualizar : crear}
          alCancelar={() => {
            setCreando(false);
            setUsuarioParaEditar(null);
          }}
        />
      </Modal>

      <Modal
        abierto={Boolean(usuarioParaContrasena)}
        alCerrar={() => {
          if (!ocupado) setUsuarioParaContrasena(null);
        }}
        titulo="Cambiar contrasena"
        subtitulo={usuarioParaContrasena?.nombre}
        icono={KeyRound}
        tamanos="chico"
      >
        <FormularioDeContrasena
          usuario={usuarioParaContrasena}
          ocupado={ocupado}
          alGuardar={cambiarContrasena}
          alCancelar={() => setUsuarioParaContrasena(null)}
        />
      </Modal>

      <ModalConfirmacion
        abierto={Boolean(usuarioAEliminar)}
        alCerrar={() => setUsuarioAEliminar(null)}
        alConfirmar={eliminar}
        ocupado={ocupado}
        titulo="Eliminar usuario"
        mensaje={`Se eliminara la cuenta "${usuarioAEliminar?.usuario}". El historial conservara el registro de esta accion.`}
        textoConfirmar="Eliminar"
      />
    </div>
  );
}

export default PaginaUsuarios;
