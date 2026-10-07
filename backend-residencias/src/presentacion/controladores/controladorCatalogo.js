// ==========================================================
//  presentacion/controladores/controladorCatalogo.js
//  Un solo llamado entrega todo lo que la interfaz necesita
//  para armar formularios y filtros.
// ==========================================================

import {
  BLOQUES,
  ETIQUETAS_BLOQUE,
  ETIQUETAS_CORTAS_BLOQUE,
  TODOS_LOS_BLOQUES,
} from '../../dominio/objetosValor/Bloque.js';
import {
  ETIQUETAS_TIPO_HABITACION,
  TIPOS_HABITACION,
} from '../../dominio/objetosValor/TipoHabitacion.js';
import {
  ETIQUETAS_ESTADO_ACTIVO,
  LISTA_ESTADOS_ACTIVO,
} from '../../dominio/objetosValor/EstadoActivo.js';
import { ETIQUETAS_TIPO_RESIDENTE, TIPOS_RESIDENTE } from '../../dominio/objetosValor/TipoResidente.js';
import { ETIQUETAS_ESTADO_RESIDENTE, ESTADOS_RESIDENTE } from '../../dominio/objetosValor/EstadoResidente.js';
import { ETIQUETAS_ROL, ROLES } from '../../dominio/objetosValor/RolUsuario.js';
import {
  ETIQUETAS_ESTADO_HABITACION,
  ESTADOS_HABITACION,
  ETIQUETAS_OCUPACION,
} from '../../dominio/entidades/Habitacion.js';
import { ETIQUETAS_MOVIMIENTO, TIPOS_MOVIMIENTO } from '../../dominio/entidades/Movimiento.js';
import { LADOS, ETIQUETAS_LADO, PISOS_ESTUDIANTES } from '../../dominio/objetosValor/CatalogoHabitaciones.js';
import { ETIQUETAS_FORMATO, FORMATOS } from '../../aplicacion/servicios/estructuraDeFormatos.js';
import { responderExito } from '../utilidades.js';

export function crearControladorCatalogo() {
  return {
    async obtener(_peticion, respuesta) {
      responderExito(respuesta, {
        bloques: TODOS_LOS_BLOQUES.map((bloque) => ({
          bloque,
          etiqueta: ETIQUETAS_BLOQUE[bloque],
          etiquetaCorta: ETIQUETAS_CORTAS_BLOQUE[bloque],
        })),
        bloqueDeEstudiantes: [BLOQUES.VARONES, BLOQUES.DAMAS],
        pisos: PISOS_ESTUDIANTES,
        lados: Object.values(LADOS).map((lado) => ({ lado, etiqueta: ETIQUETAS_LADO[lado] })),
        tiposHabitacion: Object.values(TIPOS_HABITACION).map((tipo) => ({
          tipo,
          etiqueta: ETIQUETAS_TIPO_HABITACION[tipo],
        })),
        estadosHabitacion: Object.values(ESTADOS_HABITACION).map((estado) => ({
          estado,
          etiqueta: ETIQUETAS_ESTADO_HABITACION[estado],
        })),
        estadosOcupacion: ETIQUETAS_OCUPACION,
        tiposResidente: Object.values(TIPOS_RESIDENTE).map((tipo) => ({
          tipo,
          etiqueta: ETIQUETAS_TIPO_RESIDENTE[tipo],
        })),
        estadosResidente: Object.values(ESTADOS_RESIDENTE).map((estado) => ({
          estado,
          etiqueta: ETIQUETAS_ESTADO_RESIDENTE[estado],
        })),
        estadosActivo: LISTA_ESTADOS_ACTIVO.map((estado) => ({
          estado,
          etiqueta: ETIQUETAS_ESTADO_ACTIVO[estado],
        })),
        tiposMovimiento: Object.values(TIPOS_MOVIMIENTO).map((tipo) => ({
          tipo,
          etiqueta: ETIQUETAS_MOVIMIENTO[tipo],
        })),
        roles: Object.values(ROLES).map((rol) => ({ rol, etiqueta: ETIQUETAS_ROL[rol] })),
        formatos: Object.values(FORMATOS).map((formato) => ({ formato, etiqueta: ETIQUETAS_FORMATO[formato] })),
      });
    },
  };
}
