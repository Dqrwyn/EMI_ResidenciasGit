// ==========================================================
//  presentacion/utilidades.js
//  Ayudas para responder HTTP. Sin reglas de negocio.
// ==========================================================

export function envolverAsync(manejador) {
  return (peticion, respuesta, siguiente) => {
    Promise.resolve(manejador(peticion, respuesta, siguiente)).catch(siguiente);
  };
}

export function responderExito(respuesta, datos, codigo = 200) {
  respuesta.status(codigo).json({ exito: true, datos });
}

export function responderArchivo(respuesta, { buffer, nombreArchivo, tipoDeContenido }) {
  respuesta.setHeader('Content-Type', tipoDeContenido);
  respuesta.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  respuesta.setHeader('Content-Length', buffer.length);
  respuesta.end(buffer);
}

export function obtenerIp(peticion) {
  return (
    peticion.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    peticion.socket?.remoteAddress ||
    peticion.ip ||
    'desconocida'
  );
}

export function datosDeSesion(peticion) {
  return peticion.sesion || null;
}
