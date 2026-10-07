// ==========================================================
//  infraestructura/excel/lectorExcel.js
//  Convierte un .xlsx (o .csv) en una estructura simple:
//    { hojas: [{ nombre, filas: [ [celda, celda...], ... ] }] }
//  La interpretacion de los encabezados es tarea de la capa de
//  aplicacion, no de este archivo.
// ==========================================================

import ExcelJS from 'exceljs';

export function crearLectorExcel() {
  return {
    async leer(buffer) {
      const libro = new ExcelJS.Workbook();
      await libro.xlsx.load(buffer);
      return { hojas: extraerHojas(libro) };
    },

    async leerArchivo(ruta) {
      const libro = new ExcelJS.Workbook();
      await libro.xlsx.readFile(ruta);
      return { hojas: extraerHojas(libro) };
    },
  };
}

function extraerHojas(libro) {
  const hojas = [];

  libro.eachSheet((hoja) => {
    const filas = [];
    hoja.eachRow({ includeEmpty: false }, (fila) => {
      const valores = Array.isArray(fila.values) ? fila.values.slice(1) : [];
      filas.push(valores.map(normalizarCelda));
    });

    if (filas.some((fila) => fila.some((celda) => celda !== '' && celda !== null && celda !== undefined))) {
      hojas.push({ nombre: hoja.name, filas });
    }
  });

  return hojas;
}

function normalizarCelda(valor) {
  if (valor === undefined || valor === null) return '';
  if (valor instanceof Date) return valor;
  if (typeof valor === 'object') {
    if (Array.isArray(valor.richText)) return valor.richText.map((parte) => parte.text).join('');
    if (valor.text !== undefined) return valor.text;
    if (valor.result !== undefined) return valor.result;
    if (valor.hyperlink !== undefined && valor.text !== undefined) return valor.text;
    return '';
  }
  return valor;
}
