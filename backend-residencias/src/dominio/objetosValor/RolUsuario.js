// ==========================================================
//  dominio/objetosValor/RolUsuario.js
//  Roles del sistema.
// ==========================================================

export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  RESPONSABLE: 'RESPONSABLE',
};

export const ETIQUETAS_ROL = {
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.RESPONSABLE]: 'Responsable de residencia',
};

export function esRolValido(rol) {
  return Object.values(ROLES).includes(rol);
}

export function normalizarRol(valor) {
  if (!valor) return ROLES.RESPONSABLE;
  const texto = String(valor).trim().toUpperCase();
  if (texto === ROLES.ADMINISTRADOR) return ROLES.ADMINISTRADOR;
  return ROLES.RESPONSABLE;
}
