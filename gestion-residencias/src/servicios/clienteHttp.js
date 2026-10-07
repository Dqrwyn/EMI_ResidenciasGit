// ==========================================================
//  servicios/clienteHttp.js
//  Un solo lugar para hablar con la API: agrega el token, traduce
//  los errores a espanol y descarga archivos.
// ==========================================================

const BASE = import.meta.env.VITE_API_URL || '/api';
const CLAVE_TOKEN = 'residencias.token';

export function leerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function guardarToken(token) {
  if (token) localStorage.setItem(CLAVE_TOKEN, token);
  else localStorage.removeItem(CLAVE_TOKEN);
}

export class ErrorApi extends Error {
  constructor(mensaje, codigo, detalles) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.detalles = detalles || [];
  }
}

async function interpretarRespuesta(respuesta) {
  const tipo = respuesta.headers.get('content-type') || '';
  const esJson = tipo.includes('application/json');
  const cuerpo = esJson ? await respuesta.json() : null;

  if (!respuesta.ok || (cuerpo && cuerpo.exito === false)) {
    const mensaje = cuerpo?.mensaje || `Error ${respuesta.status} al comunicarse con el servidor`;
    const error = new ErrorApi(mensaje, respuesta.status, cuerpo?.detalles);
    if (respuesta.status === 401) {
      guardarToken(null);
      window.dispatchEvent(new CustomEvent('sesion-expirada'));
    }
    throw error;
  }

  return cuerpo ? cuerpo.datos : null;
}

function construirEncabezados(extra = {}) {
  const encabezados = { ...extra };
  const token = leerToken();
  if (token) encabezados.Authorization = `Bearer ${token}`;
  return encabezados;
}

export const clienteHttp = {
  async obtener(ruta, parametros = null) {
    const url = new URL(`${BASE}${ruta}`, window.location.origin);
    if (parametros) {
      for (const [clave, valor] of Object.entries(parametros)) {
        if (valor === undefined || valor === null || valor === '') continue;
        url.searchParams.set(clave, valor);
      }
    }

    const respuesta = await fetch(`${url.pathname}${url.search}`, { headers: construirEncabezados() });
    return interpretarRespuesta(respuesta);
  },

  async enviar(ruta, cuerpo, metodo = 'POST') {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: construirEncabezados({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(cuerpo ?? {}),
    });
    return interpretarRespuesta(respuesta);
  },

  async crear(ruta, cuerpo) {
    return this.enviar(ruta, cuerpo, 'POST');
  },

  async actualizar(ruta, cuerpo) {
    return this.enviar(ruta, cuerpo, 'PATCH');
  },

  async eliminar(ruta) {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      method: 'DELETE',
      headers: construirEncabezados(),
    });
    return interpretarRespuesta(respuesta);
  },

  async subirArchivo(ruta, formulario) {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      method: 'POST',
      headers: construirEncabezados(),
      body: formulario,
    });
    return interpretarRespuesta(respuesta);
  },

  async descargar(ruta, parametros = null) {
    const url = new URL(`${BASE}${ruta}`, window.location.origin);
    if (parametros) {
      for (const [clave, valor] of Object.entries(parametros)) {
        if (valor === undefined || valor === null || valor === '') continue;
        url.searchParams.set(clave, valor);
      }
    }

    const respuesta = await fetch(`${url.pathname}${url.search}`, { headers: construirEncabezados() });

    if (!respuesta.ok) {
      let mensaje = `Error ${respuesta.status} al descargar el archivo`;
      try {
        const cuerpo = await respuesta.json();
        mensaje = cuerpo?.mensaje || mensaje;
      } catch {
        // la respuesta no era JSON: se usa el mensaje generico
      }
      throw new ErrorApi(mensaje, respuesta.status);
    }

    const disposicion = respuesta.headers.get('content-disposition') || '';
    const coincidencia = disposicion.match(/filename="?([^";]+)"?/);
    const nombreArchivo = coincidencia ? coincidencia[1] : 'archivo.xlsx';

    return { blob: await respuesta.blob(), nombreArchivo };
  },
};

export function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
