// ==========================================================
//  infraestructura/seguridad/limitadorDeIntentos.js
//  Limita los intentos de una misma computadora (por ejemplo,
//  en la pantalla de ingreso) para frenar ataques de fuerza bruta.
//  Se guarda en memoria: se reinicia con el servidor.
// ==========================================================

export function crearLimitadorDeIntentos({ maximo = 10, ventanaMs = 60 * 1000 } = {}) {
  const registros = new Map();

  function limpiarVencidos(ahora) {
    for (const [clave, registro] of registros.entries()) {
      if (ahora - registro.inicio > ventanaMs) registros.delete(clave);
    }
  }

  return {
    permitir(clave = 'anonimo') {
      const ahora = Date.now();
      limpiarVencidos(ahora);

      const registro = registros.get(clave);
      if (!registro) {
        registros.set(clave, { inicio: ahora, intentos: 1 });
        return { permitido: true, restantes: maximo - 1 };
      }

      registro.intentos += 1;
      if (registro.intentos > maximo) {
        const esperaSegundos = Math.ceil((ventanaMs - (ahora - registro.inicio)) / 1000);
        return { permitido: false, restantes: 0, esperaSegundos };
      }

      return { permitido: true, restantes: maximo - registro.intentos };
    },

    reiniciar(clave) {
      registros.delete(clave);
    },
  };
}
