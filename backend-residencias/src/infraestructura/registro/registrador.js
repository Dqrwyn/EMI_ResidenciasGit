// ==========================================================
//  infraestructura/registro/registrador.js
//  Registro de sucesos en espanol, sin dependencias externas.
// ==========================================================

const NIVELES = { debug: 10, info: 20, warn: 30, error: 40 };

export function crearRegistrador(nivelMinimo = 'info') {
  const minimo = NIVELES[nivelMinimo] ?? NIVELES.info;

  function emitir(nivel, mensaje, datos) {
    if (NIVELES[nivel] < minimo) return;
    const marca = new Date().toISOString();
    const linea = `[${marca}] ${nivel.toUpperCase()} - ${mensaje}`;
    const salida = nivel === 'error' ? console.error : nivel === 'warn' ? console.warn : console.log;
    if (datos === undefined) salida(linea);
    else salida(`${linea} ${formatearDatos(datos)}`);
  }

  return {
    debug: (mensaje, datos) => emitir('debug', mensaje, datos),
    info: (mensaje, datos) => emitir('info', mensaje, datos),
    warn: (mensaje, datos) => emitir('warn', mensaje, datos),
    error: (mensaje, datos) => emitir('error', mensaje, datos),
    hijo: (contexto) => crearRegistradorConContexto(minimo, contexto),
  };
}

function crearRegistradorConContexto(minimo, contexto) {
  const base = crearRegistrador(Object.keys(NIVELES).find((nivel) => NIVELES[nivel] === minimo) || 'info');
  return {
    debug: (mensaje, datos) => base.debug(`[${contexto}] ${mensaje}`, datos),
    info: (mensaje, datos) => base.info(`[${contexto}] ${mensaje}`, datos),
    warn: (mensaje, datos) => base.warn(`[${contexto}] ${mensaje}`, datos),
    error: (mensaje, datos) => base.error(`[${contexto}] ${mensaje}`, datos),
  };
}

function formatearDatos(datos) {
  if (datos instanceof Error) return datos.message;
  try {
    return JSON.stringify(datos);
  } catch {
    return String(datos);
  }
}
