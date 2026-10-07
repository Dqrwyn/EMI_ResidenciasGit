// ==========================================================
//  presentacion/middlewares/cargaDeArchivos.js
//  Los Excel se reciben en memoria: no se guardan en disco.
// ==========================================================

import multer from 'multer';

const TIPOS_ACEPTADOS = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/octet-stream',
  'text/csv',
  'application/csv',
];

const EXTENSIONES_ACEPTADAS = ['.xlsx', '.xls', '.csv'];

export function crearCargaDeArchivos({ limiteMb = 10 } = {}) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: limiteMb * 1024 * 1024, files: 1 },
    fileFilter: (_peticion, archivo, aceptar) => {
      const nombre = String(archivo.originalname || '').toLowerCase();
      const extensionValida = EXTENSIONES_ACEPTADAS.some((extension) => nombre.endsWith(extension));
      const tipoValido = TIPOS_ACEPTADOS.includes(archivo.mimetype);
      if (extensionValida || tipoValido) return aceptar(null, true);
      return aceptar(new Error('Solo se aceptan archivos de Excel (.xlsx) o CSV (.csv)'));
    },
  }).single('archivo');
}
