// ==========================================================
//  presentacion/middlewares/manejadorDeErrores.js
//  Convierte cualquier error en una respuesta clara en espanol.
// ==========================================================

import { ErrorDeDominio } from '../../dominio/errores/erroresDeDominio.js';

export function crearManejadorDeErrores({ registrador }) {
  // eslint-disable-next-line no-unused-vars
  return (error, peticion, respuesta, _siguiente) => {
    let codigo = error.codigoHttp || 500;
    let mensaje = error.message || 'Ocurrio un error inesperado en el servidor';
    let detalles = error.detalles || null;

    if (error.name === 'ValidationError') {
      codigo = 400;
      mensaje = 'Los datos enviados no son validos';
      detalles = Object.values(error.errors || {}).map((detalle) => detalle.message);
    }

    if (error.name === 'CastError') {
      codigo = 400;
      mensaje = 'El identificador enviado no tiene el formato esperado';
    }

    if (error.code === 11000) {
      codigo = 409;
      mensaje = 'Ya existe un registro con esos datos';
      detalles = error.keyValue ? Object.keys(error.keyValue) : null;
    }

    if (error.name === 'MulterError') {
      codigo = 400;
      mensaje =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'El archivo supera el tamano maximo permitido (10 MB)'
          : 'No se pudo recibir el archivo enviado';
    }

    if (codigo >= 500 && !(error instanceof ErrorDeDominio)) {
      registrador.error(`Error no controlado en ${peticion.method} ${peticion.originalUrl}`, error);
    }

    respuesta.status(codigo).json({
      exito: false,
      mensaje,
      detalles,
    });
  };
}

export function manejadorDeRutaNoEncontrada(peticion, respuesta) {
  respuesta.status(404).json({
    exito: false,
    mensaje: `La direccion ${peticion.method} ${peticion.originalUrl} no existe en este servidor`,
  });
}
