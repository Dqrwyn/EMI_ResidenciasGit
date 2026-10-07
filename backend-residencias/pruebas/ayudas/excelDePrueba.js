// ==========================================================
//  pruebas/ayudas/excelDePrueba.js
//  Arma libros de Excel en memoria para probar la importacion
//  sin necesidad de archivos en disco.
// ==========================================================

import ExcelJS from 'exceljs';

export async function crearLibroDePrueba(hojas) {
  const libro = new ExcelJS.Workbook();

  for (const hoja of hojas) {
    const worksheet = libro.addWorksheet(hoja.nombre);

    if (hoja.titulo) worksheet.addRow([hoja.titulo]);
    if (hoja.encabezados) worksheet.addRow(hoja.encabezados);
    for (const fila of hoja.filas || []) worksheet.addRow(fila);
  }

  const buffer = await libro.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export const ENCABEZADOS_ESTUDIANTES = [
  'TOTAL',
  'N°',
  'NOMBRE',
  'CI',
  'CELULAR',
  'CARRERA',
  'SEMESTRE',
  'CODIGO',
  'N° HABITACIÓN',
  'TIPO DE HABITACIÓN',
  'NOMBRE TUTOR',
  'CELULAR TUTOR',
  'FECHA DE INGRESO',
  'OBS',
];

export const ENCABEZADOS_DEPARTAMENTOS = [
  'N°',
  'NOMBRE',
  'CI',
  'CELULAR',
  'CARGO',
  'N° HABITACION',
  'TIPO DE HABITACION',
  'COSTO HAB. (Bs.)',
  'FECHA DE INGRESO',
  'FECHA DE RETIRO',
  'OBS',
];
