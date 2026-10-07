// ==========================================================
//  dominio/errores/erroresDeDominio.js
//  Errores con mensaje en espanol y codigo HTTP asociado.
// ==========================================================

export class ErrorDeDominio extends Error {
  constructor(mensaje, codigoHttp = 400, detalles = null) {
    super(mensaje);
    this.name = this.constructor.name;
    this.codigoHttp = codigoHttp;
    this.detalles = detalles;
  }
}

export class ErrorDeValidacion extends ErrorDeDominio {
  constructor(mensaje, detalles = null, codigoHttp = 400) {
    super(mensaje, codigoHttp, detalles);
  }
}

export class ErrorNoEncontrado extends ErrorDeDominio {
  constructor(mensaje = 'No se encontro el registro solicitado') {
    super(mensaje, 404);
  }
}

export class ErrorDeConflicto extends ErrorDeDominio {
  constructor(mensaje = 'La operacion no se puede completar por un conflicto de datos') {
    super(mensaje, 409);
  }
}

export class ErrorNoAutorizado extends ErrorDeDominio {
  constructor(mensaje = 'Debe iniciar sesion para continuar') {
    super(mensaje, 401);
  }
}

export class ErrorProhibido extends ErrorDeDominio {
  constructor(mensaje = 'No tiene permisos para realizar esta operacion') {
    super(mensaje, 403);
  }
}

export class ErrorDeImportacion extends ErrorDeDominio {
  constructor(mensaje, detalles = null) {
    super(mensaje, 400, detalles);
  }
}
