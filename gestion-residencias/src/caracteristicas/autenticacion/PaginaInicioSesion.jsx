// ==========================================================
//  caracteristicas/autenticacion/PaginaInicioSesion.jsx
// ==========================================================

import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, User } from 'lucide-react';

import { usarAutenticacion } from '../../contexto/ContextoAutenticacion.jsx';

export function PaginaInicioSesion() {
  const { iniciarSesion, autenticado, verificando } = usarAutenticacion();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Ingreso - Residencias EMI';
  }, []);

  if (!verificando && autenticado) {
    return <Navigate to={ubicacion.state?.desde || '/'} replace />;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await iniciarSesion(usuario, contrasena);
      navegar(ubicacion.state?.desde || '/', { replace: true });
    } catch (fallo) {
      setError(fallo.message || 'No se pudo iniciar sesion');
      setContrasena('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emi-azulOscuro via-emi-azul to-emi-azulProfundo">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10 lg:flex-row lg:gap-16">
        <section className="w-full max-w-lg text-center lg:text-left">
          <img src="/emilogin.png" alt="Escuela Militar de Ingenieria" className="mx-auto h-24 w-auto object-contain lg:mx-0" />
          <h1 className="mt-6 text-2xl font-bold leading-tight text-white sm:text-3xl">
            Sistema de Gestion de Residencias Universitarias
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-emi-azulClaro sm:text-base">
            Mapa de habitaciones de varones y damas, departamentos pequenos, departamentos grandes y direccion. Importe y
            exporte la relacion nominal en Excel, busque por carnet de identidad y cambie de habitacion sin perder datos.
          </p>

          <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left text-sm text-emi-azulClaro lg:mx-0">
            {[
              'Planta baja, primer y segundo piso con 8 individuales y 6 compartidas',
              'Departamentos D-1 al D-20, DG-1 al DG-4 y el departamento del director',
              'Buscador por CI y cambio de habitacion con todos los datos',
              'Los activos pertenecen a la habitacion, no al residente',
            ].map((texto) => (
              <li key={texto} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emi-amarillo" />
                {texto}
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full max-w-md">
          <form onSubmit={enviar} className="tarjeta p-6 shadow-flotante sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emi-azulClaro text-emi-azul">
                <LockKeyhole size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-emi-azulProfundo">Ingreso al sistema</h2>
                <p className="text-xs text-slate-500">Use la cuenta que le entrego el administrador</p>
              </div>
            </div>

            {error ? (
              <p className="mb-4 rounded-xl border border-emi-rojo/30 bg-emi-rojoClaro px-3 py-2.5 text-sm font-medium text-emi-rojo">
                {error}
              </p>
            ) : null}

            <label className="mb-4 block">
              <span className="etiqueta">Usuario</span>
              <span className="relative block">
                <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="campo pl-9"
                  value={usuario}
                  onChange={(evento) => setUsuario(evento.target.value)}
                  autoComplete="username"
                  placeholder="administrador"
                  required
                />
              </span>
            </label>

            <label className="mb-6 block">
              <span className="etiqueta">Contrasena</span>
              <span className="relative block">
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  className="campo pr-11"
                  value={contrasena}
                  onChange={(evento) => setContrasena(evento.target.value)}
                  autoComplete="current-password"
                  placeholder="Minimo 8 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-emi-azulClaro hover:text-emi-azul"
                  aria-label={mostrarContrasena ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {mostrarContrasena ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            <button type="submit" className="boton-primario w-full py-3" disabled={enviando}>
              {enviando ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
              {enviando ? 'Verificando...' : 'Entrar'}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Escuela Militar de Ingenieria - Unidad Academica del Tropico
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default PaginaInicioSesion;
