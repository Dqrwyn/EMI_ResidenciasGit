// ==========================================================
//  caracteristicas/datos/servicioDatos.js
// ==========================================================

import { clienteHttp, descargarBlob } from '../../servicios/clienteHttp.js';

export const servicioDatos = {
  importar(archivo, { formato = null, permitirSobreOcupacion = true } = {}) {
    const formulario = new FormData();
    formulario.append('archivo', archivo);
    if (formato) formulario.append('formato', formato);
    formulario.append('permitirSobreOcupacion', String(permitirSobreOcupacion));
    return clienteHttp.subirArchivo('/excel/importar', formulario);
  },

  async exportar(formato, { plantilla = false } = {}) {
    const { blob, nombreArchivo } = await clienteHttp.descargar('/excel/exportar', { formato, plantilla });
    descargarBlob(blob, nombreArchivo);
    return nombreArchivo;
  },
};
