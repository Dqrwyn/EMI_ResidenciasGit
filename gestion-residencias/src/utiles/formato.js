// ==========================================================
//  utiles/formato.js
//  Formateo de fechas, nombres y colores de estado.
// ==========================================================

export function formatearFecha(valor) {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(`${valor}`.length <= 10 ? `${valor}T12:00:00` : valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatearFechaHora(valor) {
  if (!valor) return '-';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearHora(valor) {
  if (!valor) return '-';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
}

export function inicialesDe(nombre = '') {
  const partes = String(nombre).trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
}

export function nombreCortoDe(nombre = '') {
  const partes = String(nombre).trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[1]}`;
}

export function nombreApellidoDe(nombre = '') {
  const partes = String(nombre).trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 2) return partes.join(' ');
  return `${partes[0]} ${partes[partes.length - 2]}`;
}

export function formatearNumero(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString('es-BO');
}

export function formatearCosto(valor) {
  if (valor === null || valor === undefined || valor === '') return 'Sin definir';
  return `Bs. ${Number(valor).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function colorDeOcupacion(estado) {
  switch (estado) {
    case 'LLENA':
      return 'insignia-amarilla';
    case 'EXCEDIDA':
      return 'insignia-roja';
    case 'PARCIAL':
      return 'insignia-azul';
    default:
      return 'insignia-gris';
  }
}

export function etiquetaDeOcupacion(estado) {
  switch (estado) {
    case 'LLENA':
      return 'Llena';
    case 'EXCEDIDA':
      return 'Excedida';
    case 'PARCIAL':
      return 'Con espacio';
    default:
      return 'Vacia';
  }
}

export function colorDeEstadoActivo(estado) {
  switch (estado) {
    case 'OPTIMO':
      return 'insignia-verde';
    case 'DETERIORADO':
      return 'insignia-amarilla';
    case 'EN_REPARACION':
      return 'insignia-azul';
    case 'NO_UBICADO':
      return 'insignia-roja';
    default:
      return 'insignia-gris';
  }
}

export function etiquetaDeTipoResidente(tipo) {
  const etiquetas = {
    ESTUDIANTE: 'Estudiante',
    ADMINISTRATIVO: 'Administrativo',
    DOCENTE: 'Docente',
    MILITAR: 'Personal militar',
    DIRECTOR: 'Director',
    OTRO: 'Otro',
  };
  return etiquetas[tipo] || tipo || '';
}

export function etiquetaDeTipoHabitacion(tipo) {
  const etiquetas = {
    INDIVIDUAL: 'Individual',
    COMPARTIDA: 'Compartida',
    DEPARTAMENTO_PEQUENO: 'Depto. pequeno',
    DEPARTAMENTO_GRANDE: 'Depto. grande',
    DIRECTOR: 'Direccion',
  };
  return etiquetas[tipo] || tipo || '';
}

export function esPantallaChica() {
  return window.innerWidth < 768;
}
