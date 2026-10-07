// ==========================================================
//  dominio/entidades/Usuario.js
//  Cuentas de acceso al sistema.
// ==========================================================

import { ErrorDeValidacion } from '../errores/erroresDeDominio.js';
import { normalizarRol, ROLES } from '../objetosValor/RolUsuario.js';

export const LONGITUD_MINIMA_CONTRASENA = 8;

export function normalizarUsuario(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '');
}

export function validarContrasena(contrasena = '') {
  const texto = String(contrasena);
  if (texto.length < LONGITUD_MINIMA_CONTRASENA) {
    throw new ErrorDeValidacion(`La contrasena debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres`);
  }
}

export function prepararUsuario(datos = {}, opciones = {}) {
  const usuario = normalizarUsuario(datos.usuario);
  const nombre = String(datos.nombre || '').replace(/\s+/g, ' ').trim();
  const rol = normalizarRol(datos.rol);

  if (usuario.length < 3) {
    throw new ErrorDeValidacion('El usuario debe tener al menos 3 caracteres (letras, numeros, punto, guion)');
  }
  if (nombre.length < 3) {
    throw new ErrorDeValidacion('El nombre completo es obligatorio (minimo 3 caracteres)');
  }
  if (opciones.exigirContrasena !== false) {
    validarContrasena(datos.contrasena);
  }

  return {
    usuario,
    nombre,
    rol: rol || ROLES.RESPONSABLE,
    activo: datos.activo === undefined ? true : Boolean(datos.activo),
  };
}

export function esAdministrador(usuario) {
  return usuario?.rol === ROLES.ADMINISTRADOR;
}
