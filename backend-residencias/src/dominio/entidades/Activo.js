// ==========================================================
//  dominio/entidades/Activo.js
//  Los activos (bienes) pertenecen a la HABITACION, nunca al
//  residente: si una persona se muda, el activo se queda en su
//  habitacion.
// ==========================================================

import { ErrorDeValidacion } from '../errores/erroresDeDominio.js';
import { normalizarEstadoActivo } from '../objetosValor/EstadoActivo.js';

export function prepararActivo(datos = {}, opciones = {}) {
  const activo = {
    nombre: String(datos.nombre || '').replace(/\s+/g, ' ').trim().toUpperCase(),
    codigo: String(datos.codigo || '').replace(/\s+/g, ' ').trim().toUpperCase(),
    estado: normalizarEstadoActivo(datos.estado),
    observacion: String(datos.observacion || '').replace(/\s+/g, ' ').trim(),
    habitacionCodigo: datos.habitacionCodigo ? String(datos.habitacionCodigo).trim().toUpperCase() : null,
  };

  if (!opciones.permitirIncompleto && activo.nombre.length < 2) {
    throw new ErrorDeValidacion('El nombre del activo es obligatorio (minimo 2 caracteres)');
  }

  return activo;
}

// ----------------------------------------------------------
//  Cambios parciales: solo se toca lo que llega, para que una
//  edicion no borre el resto de los datos del activo.
// ----------------------------------------------------------
export function prepararCambiosDeActivo(datos = {}) {
  const cambios = {};

  if (datos.nombre !== undefined) {
    const nombre = String(datos.nombre).replace(/\s+/g, ' ').trim().toUpperCase();
    if (nombre.length < 2) throw new ErrorDeValidacion('El nombre del activo es obligatorio (minimo 2 caracteres)');
    cambios.nombre = nombre;
  }

  if (datos.codigo !== undefined) cambios.codigo = String(datos.codigo || '').replace(/\s+/g, ' ').trim().toUpperCase();
  if (datos.estado !== undefined) cambios.estado = normalizarEstadoActivo(datos.estado);
  if (datos.observacion !== undefined) cambios.observacion = String(datos.observacion || '').replace(/\s+/g, ' ').trim();

  if (Object.keys(cambios).length === 0) {
    throw new ErrorDeValidacion('No se envio ningun cambio para el activo');
  }

  return cambios;
}

export function requiereAtencion(activo) {
  return activo?.estado && activo.estado !== 'OPTIMO';
}
