// ==========================================================
//  infraestructura/excel/escritorExcel.js
//  Convierte el documento (titulo + hojas + filas) que arma la
//  capa de aplicacion en un archivo .xlsx con el formato
//  institucional de la Escuela Militar de Ingenieria.
// ==========================================================

import ExcelJS from 'exceljs';

const AZUL_EMI = 'FF004F9F';
const AMARILLO_EMI = 'FFFFDD00';
const GRIS_FILA = 'FFF1F5FB';

export function crearEscritorExcel() {
  return {
    async escribir(documento) {
      const libro = new ExcelJS.Workbook();
      libro.creator = 'Sistema de Residencias - Escuela Militar de Ingenieria';
      libro.created = new Date();

      for (const hoja of documento.hojas) {
        agregarHoja(libro, documento.titulo, hoja);
      }

      const buffer = await libro.xlsx.writeBuffer();
      return Buffer.from(buffer);
    },
  };
}

function agregarHoja(libro, titulo, hoja) {
  const cantidadColumnas = Math.max(hoja.encabezados.length, 1);
  const worksheet = libro.addWorksheet(hoja.nombre.slice(0, 31), {
    views: [{ state: 'frozen', ySplit: 3 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  // ---- Fila 1: titulo general -------------------------------------
  worksheet.mergeCells(1, 1, 1, cantidadColumnas);
  const celdaTitulo = worksheet.getCell(1, 1);
  celdaTitulo.value = 'ESCUELA MILITAR DE INGENIERIA - SISTEMA DE RESIDENCIAS';
  celdaTitulo.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  celdaTitulo.alignment = { horizontal: 'center', vertical: 'middle' };
  celdaTitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_EMI } };
  worksheet.getRow(1).height = 26;

  // ---- Fila 2: subtitulo del bloque -------------------------------
  worksheet.mergeCells(2, 1, 2, cantidadColumnas);
  const celdaSubtitulo = worksheet.getCell(2, 1);
  celdaSubtitulo.value = `${titulo} - ${hoja.subtitulo || ''}`.trim();
  celdaSubtitulo.font = { bold: true, size: 11, color: { argb: 'FF003D7C' } };
  celdaSubtitulo.alignment = { horizontal: 'center', vertical: 'middle' };
  celdaSubtitulo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AMARILLO_EMI } };
  worksheet.getRow(2).height = 20;

  // ---- Fila 3: encabezados de columna -----------------------------
  const filaEncabezado = worksheet.getRow(3);
  hoja.encabezados.forEach((tituloDeColumna, indice) => {
    const celda = filaEncabezado.getCell(indice + 1);
    celda.value = tituloDeColumna;
    celda.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_EMI } };
    celda.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    celda.border = bordes();
  });
  filaEncabezado.height = 28;

  // ---- Filas de datos ---------------------------------------------
  hoja.filas.forEach((fila, indiceFila) => {
    const filaHoja = worksheet.getRow(4 + indiceFila);
    fila.forEach((valor, indiceColumna) => {
      const celda = filaHoja.getCell(indiceColumna + 1);
      celda.value = valor === undefined || valor === null ? '' : valor;
      celda.border = bordes();
      celda.font = { size: 10 };
      celda.alignment = {
        vertical: 'middle',
        horizontal: indiceColumna === 0 ? 'center' : 'left',
        wrapText: false,
      };
      if (indiceFila % 2 === 1) {
        celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GRIS_FILA } };
      }
    });
  });

  // ---- Anchos de columna ------------------------------------------
  worksheet.columns.forEach((columna, indice) => {
    const tituloDeColumna = hoja.encabezados[indice] || '';
    columna.width = anchoPara(tituloDeColumna);
  });

  if (hoja.filas.length > 0) {
    worksheet.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: 3, column: cantidadColumnas },
    };
  }
}

function bordes() {
  const linea = { style: 'thin', color: { argb: 'FFB9C7DA' } };
  return { top: linea, left: linea, bottom: linea, right: linea };
}

function anchoPara(tituloDeColumna) {
  const titulo = String(tituloDeColumna).toUpperCase();
  if (titulo.includes('NOMBRE') && !titulo.includes('TUTOR')) return 32;
  if (titulo.includes('TUTOR')) return 24;
  if (titulo.includes('OBS')) return 26;
  if (titulo.includes('CI')) return 14;
  if (titulo.includes('CELULAR')) return 14;
  if (titulo.includes('CARRERA')) return 20;
  if (titulo.includes('SEMESTRE')) return 12;
  if (titulo.includes('CODIGO')) return 14;
  if (titulo.includes('HABITACION')) return 16;
  if (titulo.includes('TIPO')) return 18;
  if (titulo.includes('FECHA')) return 16;
  if (titulo.includes('COSTO')) return 12;
  if (titulo.includes('CARGO')) return 20;
  if (titulo === 'N') return 6;
  if (titulo === 'BLOQUE') return 12;
  return 16;
}
