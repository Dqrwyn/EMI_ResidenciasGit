// ==========================================================
//  presentacion/controladores/controladorExcel.js
// ==========================================================

import { ErrorDeValidacion } from '../../dominio/errores/erroresDeDominio.js';
import { responderArchivo, responderExito } from '../utilidades.js';

const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function crearControladorExcel({ casos, escritorExcel }) {
  return {
    async importar(peticion, respuesta) {
      if (!peticion.file) {
        throw new ErrorDeValidacion('Adjunte el archivo de Excel que desea importar (campo "archivo")');
      }

      const resultado = await casos.importarDesdeExcel({
        buffer: peticion.file.buffer,
        nombreArchivo: peticion.file.originalname,
        formato: peticion.body?.formato || peticion.query?.formato || null,
        usuario: peticion.sesion?.usuario,
        permitirSobreOcupacion: peticion.body?.permitirSobreOcupacion !== 'false',
      });

      responderExito(respuesta, resultado);
    },

    async exportar(peticion, respuesta) {
      const formato = peticion.query?.formato || peticion.params?.formato;
      const soloPlantilla = peticion.query?.plantilla === 'true' || peticion.query?.plantilla === true;

      const { nombreArchivo, documento } = await casos.exportarExcel({ formato, soloPlantilla });
      const buffer = await escritorExcel.escribir(documento);

      responderArchivo(respuesta, { buffer, nombreArchivo, tipoDeContenido: TIPO_XLSX });
    },
  };
}
