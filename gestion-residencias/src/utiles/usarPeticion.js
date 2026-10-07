// ==========================================================
//  utiles/usarPeticion.js
//  Hook chico para cargar datos de la API con estado de carga,
//  error y opcion de recargar.
// ==========================================================

import { useCallback, useEffect, useRef, useState } from 'react';

export function usarPeticion(peticion, dependencias = [], opciones = {}) {
  const { activa = true, valorInicial = null } = opciones;
  const [datos, setDatos] = useState(valorInicial);
  const [cargando, setCargando] = useState(Boolean(activa));
  const [error, setError] = useState(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const cargar = useCallback(async () => {
    if (!activa) return;
    setCargando(true);
    setError(null);
    try {
      const resultado = await peticion();
      if (montado.current) setDatos(resultado);
    } catch (fallo) {
      if (montado.current) setError(fallo);
    } finally {
      if (montado.current) setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activa, ...dependencias]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { datos, cargando, error, recargar: cargar, setDatos };
}
