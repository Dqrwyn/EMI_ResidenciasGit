// ==========================================================
//  dominio/entidades/Residente.js
//  Persona que vive en la residencia (estudiante, administrativo,
//  docente o personal militar). El CI es la clave de busqueda.
// ==========================================================

import { ErrorDeValidacion } from '../errores/erroresDeDominio.js';
import { ESTADOS_RESIDENTE } from '../objetosValor/EstadoResidente.js';
import { normalizarTipoResidente, TIPOS_RESIDENTE } from '../objetosValor/TipoResidente.js';
import { normalizarCodigoDeHabitacion } from '../objetosValor/CatalogoHabitaciones.js';

export const CAMPOS_DE_TEXTO = [
  'nombre',
  'celular',
  'carrera',
  'semestre',
  'codigo',
  'tutorNombre',
  'tutorCelular',
  'cargo',
  'observaciones',
  'correo',
];

// ----------------------------------------------------------
//  Normalizacion del CI: "1.234.567 lp" -> "1234567LP"
// ----------------------------------------------------------
export function normalizarCi(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9-]/g, '');
}

export function esCiValido(ci) {
  const normalizado = normalizarCi(ci);
  if (!normalizado) return false;
  const soloDigitos = normalizado.replace(/\D/g, '');
  return soloDigitos.length >= 4 && normalizado.length <= 20;
}

export function normalizarNombre(valor) {
  return String(valor || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function normalizarTexto(valor) {
  return String(valor ?? '').replace(/\s+/g, ' ').trim();
}

export function normalizarFecha(valor) {
  if (!valor) return '';
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? '' : valor.toISOString().slice(0, 10);
  }
  const texto = String(valor).trim();
  const coincidencia = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (coincidencia) return `${coincidencia[1]}-${coincidencia[2]}-${coincidencia[3]}`;

  const boliviana = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (boliviana) {
    const dia = boliviana[1].padStart(2, '0');
    const mes = boliviana[2].padStart(2, '0');
    const anio = boliviana[3].length === 2 ? `20${boliviana[3]}` : boliviana[3];
    return `${anio}-${mes}-${dia}`;
  }

  const fecha = new Date(texto);
  return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString().slice(0, 10);
}

export function validarDatosDeResidente(datos = {}) {
  const errores = [];

  if (!datos.nombre || normalizarNombre(datos.nombre).length < 3) {
    errores.push('El nombre completo es obligatorio (minimo 3 caracteres)');
  }

  if (!datos.ci || !esCiValido(datos.ci)) {
    errores.push('El carnet de identidad es obligatorio y debe tener al menos 4 digitos');
  }

  if (!datos.tipo || !normalizarTipoResidente(datos.tipo)) {
    errores.push('El tipo de residente no es valido (ESTUDIANTE, ADMINISTRATIVO, DOCENTE, MILITAR, DIRECTOR, OTRO)');
  }

  if (datos.estado !== undefined && !Object.values(ESTADOS_RESIDENTE).includes(datos.estado)) {
    errores.push('El estado debe ser ACTIVO o RETIRADO');
  }

  if (errores.length > 0) {
    throw new ErrorDeValidacion('Revise los datos del residente', errores);
  }
}

export function prepararResidente(datos = {}, opciones = {}) {
  const tipo = normalizarTipoResidente(datos.tipo) || TIPOS_RESIDENTE.ESTUDIANTE;
  const estado = datos.estado || ESTADOS_RESIDENTE.ACTIVO;

  const residente = {
    ci: normalizarCi(datos.ci),
    nombre: normalizarNombre(datos.nombre),
    tipo,
    estado,
    celular: normalizarTexto(datos.celular),
    carrera: normalizarTexto(datos.carrera),
    semestre: normalizarTexto(datos.semestre).toUpperCase(),
    codigo: normalizarTexto(datos.codigo),
    tutorNombre: normalizarNombre(datos.tutorNombre),
    tutorCelular: normalizarTexto(datos.tutorCelular),
    cargo: normalizarTexto(datos.cargo),
    correo: normalizarTexto(datos.correo),
    observaciones: normalizarTexto(datos.observaciones),
    fechaIngreso: normalizarFecha(datos.fechaIngreso),
    fechaRetiro: normalizarFecha(datos.fechaRetiro),
    habitacionCodigo: normalizarCodigoDeHabitacion(datos.habitacionCodigo),
    bloque: datos.bloque || null,
  };

  if (opciones.validar !== false) {
    validarDatosDeResidente(residente);
  }

  if (tipo === TIPOS_RESIDENTE.ESTUDIANTE && !residente.carrera) {
    residente.carrera = '';
  }

  return residente;
}

export function nombreCorto(residente = {}) {
  const partes = normalizarNombre(residente.nombre).split(' ').filter(Boolean);
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1]}`;
}

export function iniciales(residente = {}) {
  const partes = normalizarNombre(residente.nombre).split(' ').filter(Boolean);
  return partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join('');
}
