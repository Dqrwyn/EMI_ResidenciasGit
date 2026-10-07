// ==========================================================
//  rutas/RutaProtegida.jsx
// ==========================================================

import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

import { usarAutenticacion } from '../contexto/ContextoAutenticacion.jsx';
import { Cargando } from '../componentesComunes/Estados.jsx';

export function RutaProtegida({ children, soloAdministrador = false }) {
  const { autenticado, verificando, esAdministrador } = usarAutenticacion();
  const ubicacion = useLocation();

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Cargando mensaje="Verificando su sesion..." />
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/ingresar" state={{ desde: ubicacion.pathname }} replace />;
  }

  if (soloAdministrador && !esAdministrador) {
    return (
      <div className="seccion">
        <div className="tarjeta flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emi-rojoClaro text-emi-rojo">
            <ShieldAlert size={26} />
          </span>
          <h2 className="text-lg font-bold text-emi-azulProfundo">Solo para administradores</h2>
          <p className="max-w-md text-sm text-slate-500">
            Su cuenta no tiene permiso para ver esta pantalla. Si necesita acceso, pida al administrador del sistema que
            cambie su rol.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default RutaProtegida;
