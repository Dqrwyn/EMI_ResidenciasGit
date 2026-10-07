// ==========================================================
//  aplicacion/servicios/normalizadorTexto.js
//  Comparaciones tolerantes: "Habitación", "HABITACION" y
//  "habitacion" se consideran el mismo texto.
// ==========================================================

export function sinTildes(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizarClave(valor) {
  return sinTildes(valor)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function normalizarEspacios(valor) {
  return String(valor ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compararSinTildes(a, b) {
  return normalizarClave(a) === normalizarClave(b);
}

export function contieneSinTildes(texto, busqueda) {
  return normalizarClave(texto).includes(normalizarClave(busqueda));
}

export function esVacio(valor) {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'string') return valor.trim() === '';
  return false;
}

export function aTexto(valor) {
  if (valor === null || valor === undefined) return '';
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  if (typeof valor === 'object') {
    if (Array.isArray(valor.richText)) return valor.richText.map((parte) => parte.text).join('');
    if (valor.text !== undefined) return String(valor.text);
    if (valor.result !== undefined) return String(valor.result);
    return '';
  }
  return String(valor).replace(/\s+/g, ' ').trim();
}
