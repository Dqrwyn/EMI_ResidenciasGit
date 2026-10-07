// ==========================================================
//  contexto/ContextoCatalogo.jsx
//  Trae una sola vez el catalogo del backend (bloques, tipos,
//  estados y formatos) y lo reparte a toda la interfaz.
// ==========================================================

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clienteHttp } from '../servicios/clienteHttp.js';
import { usarAutenticacion } from './ContextoAutenticacion.jsx';

const ContextoCatalogo = createContext(null);

const CATALOGO_VACIO = {
  bloques: [],
  bloqueDeEstudiantes: [],
  pisos: [],
  lados: [],
  tiposHabitacion: [],
  estadosHabitacion: [],
  estadosOcupacion: {},
  tiposResidente: [],
  estadosResidente: [],
  estadosActivo: [],
  tiposMovimiento: [],
  roles: [],
  formatos: [],
};

export function ProveedorCatalogo({ children }) {
  const { autenticado } = usarAutenticacion();
  const [catalogo, setCatalogo] = useState(CATALOGO_VACIO);

  useEffect(() => {
    if (!autenticado) {
      setCatalogo(CATALOGO_VACIO);
      return;
    }
    let activo = true;
    clienteHttp
      .obtener('/catalogo')
      .then((datos) => {
        if (activo) setCatalogo({ ...CATALOGO_VACIO, ...datos });
      })
      .catch(() => {
        // Si el catalogo falla, la interfaz sigue con etiquetas por defecto.
      });
    return () => {
      activo = false;
    };
  }, [autenticado]);

  const valor = useMemo(() => {
    const porClave = (lista) => new Map(lista.map((elemento) => [elemento.bloque || elemento.tipo || elemento.estado || elemento.rol || elemento.formato || elemento.lado, elemento.etiqueta]));

    const etiquetasBloque = porClave(catalogo.bloques);
    const etiquetasHabitacion = porClave(catalogo.tiposHabitacion);
    const etiquetasResidente = porClave(catalogo.tiposResidente);
    const etiquetasEstadoResidente = porClave(catalogo.estadosResidente);
    const etiquetasActivo = porClave(catalogo.estadosActivo);
    const etiquetasMovimiento = porClave(catalogo.tiposMovimiento);
    const etiquetasRol = porClave(catalogo.roles);
    const etiquetasFormato = porClave(catalogo.formatos);

    return {
      catalogo,
      etiquetaBloque: (bloque) => etiquetasBloque.get(bloque) || bloque,
      etiquetaTipoHabitacion: (tipo) => etiquetasHabitacion.get(tipo) || tipo,
      etiquetaTipoResidente: (tipo) => etiquetasResidente.get(tipo) || tipo,
      etiquetaEstadoResidente: (estado) => etiquetasEstadoResidente.get(estado) || estado,
      etiquetaEstadoActivo: (estado) => etiquetasActivo.get(estado) || estado,
      etiquetaMovimiento: (tipo) => etiquetasMovimiento.get(tipo) || tipo,
      etiquetaRol: (rol) => etiquetasRol.get(rol) || rol,
      etiquetaFormato: (formato) => etiquetasFormato.get(formato) || formato,
    };
  }, [catalogo]);

  return <ContextoCatalogo.Provider value={valor}>{children}</ContextoCatalogo.Provider>;
}

export function usarCatalogo() {
  const contexto = useContext(ContextoCatalogo);
  if (!contexto) throw new Error('usarCatalogo debe usarse dentro de ProveedorCatalogo');
  return contexto;
}
