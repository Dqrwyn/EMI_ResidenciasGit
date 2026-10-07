// ==========================================================
//  contexto/ContextoAutenticacion.jsx
// ==========================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clienteHttp, guardarToken, leerToken } from '../servicios/clienteHttp.js';

const ContextoAutenticacion = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function recuperarSesion() {
      if (!leerToken()) {
        setVerificando(false);
        return;
      }
      try {
        const datos = await clienteHttp.obtener('/autenticacion/yo');
        if (activo) setUsuario(datos.usuario);
      } catch {
        guardarToken(null);
      } finally {
        if (activo) setVerificando(false);
      }
    }

    recuperarSesion();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    function alExpirar() {
      setUsuario(null);
    }
    window.addEventListener('sesion-expirada', alExpirar);
    return () => window.removeEventListener('sesion-expirada', alExpirar);
  }, []);

  const iniciarSesion = useCallback(async (usuarioEscrito, contrasena) => {
    const datos = await clienteHttp.crear('/autenticacion/iniciar-sesion', {
      usuario: usuarioEscrito,
      contrasena,
    });
    guardarToken(datos.token);
    setUsuario(datos.usuario);
    return datos.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    guardarToken(null);
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      verificando,
      autenticado: Boolean(usuario),
      esAdministrador: usuario?.rol === 'ADMINISTRADOR',
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, verificando, iniciarSesion, cerrarSesion],
  );

  return <ContextoAutenticacion.Provider value={valor}>{children}</ContextoAutenticacion.Provider>;
}

export function usarAutenticacion() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) throw new Error('usarAutenticacion debe usarse dentro de ProveedorAutenticacion');
  return contexto;
}
