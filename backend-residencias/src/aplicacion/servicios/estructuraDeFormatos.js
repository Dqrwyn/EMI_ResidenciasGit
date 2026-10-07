// ==========================================================
//  aplicacion/servicios/estructuraDeFormatos.js
//  LOS TRES FORMATOS DE EXCEL: definicion unica que usan tanto
//  la importacion como la exportacion. Gracias a esto, un archivo
//  exportado se puede volver a importar sin cambiar nada.
// ==========================================================

export const FORMATOS = {
  ESTUDIANTES: 'ESTUDIANTES',
  DEPARTAMENTOS_PEQUENOS: 'DEPARTAMENTOS_PEQUENOS',
  DEPARTAMENTOS_GRANDES: 'DEPARTAMENTOS_GRANDES',
};

export const ETIQUETAS_FORMATO = {
  [FORMATOS.ESTUDIANTES]: 'Estudiantes (varones y damas)',
  [FORMATOS.DEPARTAMENTOS_PEQUENOS]: 'Departamentos pequenos (D-1 al D-20)',
  [FORMATOS.DEPARTAMENTOS_GRANDES]: 'Departamentos grandes (DG-1 al DG-4 y DD)',
};

export const COLUMNAS = {
  orden: { clave: 'orden', titulo: 'N', alias: ['N', 'N°', 'NRO', 'NUMERO', 'ITEM', 'TOTAL', 'NRO.'] },
  bloque: { clave: 'bloque', titulo: 'BLOQUE', alias: ['BLOQUE', 'BLOQUE RESIDENCIA', 'EDIFICIO'] },
  nombre: {
    clave: 'nombre',
    titulo: 'NOMBRE',
    alias: ['NOMBRE', 'NOMBRES', 'NOMBRE COMPLETO', 'APELLIDOS Y NOMBRES', 'PERSONA', 'RESIDENTE'],
  },
  ci: { clave: 'ci', titulo: 'CI', alias: ['CI', 'C.I.', 'CEDULA', 'CEDULA DE IDENTIDAD', 'CARNET', 'DOCUMENTO', 'CI2'] },
  celular: {
    clave: 'celular',
    titulo: 'CELULAR',
    alias: ['CELULAR', 'TELEFONO', 'TELEFONO CELULAR', 'NRO CELULAR', 'CEL', 'CONTACTO'],
  },
  carrera: { clave: 'carrera', titulo: 'CARRERA', alias: ['CARRERA', 'PROGRAMA', 'ESPECIALIDAD'] },
  semestre: { clave: 'semestre', titulo: 'SEMESTRE', alias: ['SEMESTRE', 'CURSO', 'NIVEL'] },
  codigo: { clave: 'codigo', titulo: 'CODIGO', alias: ['CODIGO', 'COD', 'MATRICULA', 'CODIGO ESTUDIANTE', 'REGISTRO'] },
  habitacion: {
    clave: 'habitacionCodigo',
    titulo: 'N° HABITACION',
    alias: ['N° HABITACION', 'N HABITACION', 'NRO HABITACION', 'HABITACION', 'CUARTO', 'N° DE HABITACION', 'DEPARTAMENTO'],
  },
  tipoHabitacion: {
    clave: 'tipoHabitacion',
    titulo: 'TIPO DE HABITACION',
    alias: ['TIPO DE HABITACION', 'TIPO HABITACION', 'TIPO'],
  },
  tutorNombre: {
    clave: 'tutorNombre',
    titulo: 'NOMBRE TUTOR',
    alias: ['NOMBRE TUTOR', 'TUTOR', 'APODERADO', 'NOMBRE DEL TUTOR', 'FAMILIAR'],
  },
  tutorCelular: {
    clave: 'tutorCelular',
    titulo: 'CELULAR TUTOR',
    alias: ['CELULAR TUTOR', 'TELEFONO TUTOR', 'CEL TUTOR', 'CELULAR DEL TUTOR'],
  },
  fechaIngreso: {
    clave: 'fechaIngreso',
    titulo: 'FECHA DE INGRESO',
    alias: ['FECHA DE INGRESO', 'FECHA INGRESO', 'INGRESO', 'FECHA DE ADMISION'],
  },
  fechaRetiro: {
    clave: 'fechaRetiro',
    titulo: 'FECHA DE RETIRO',
    alias: ['FECHA DE RETIRO', 'FECHA RETIRO', 'RETIRO', 'FECHA DE BAJA'],
  },
  cargo: { clave: 'cargo', titulo: 'CARGO', alias: ['CARGO', 'FUNCION', 'PUESTO', 'OCUPACION'] },
  costo: {
    clave: 'costo',
    titulo: 'COSTO HAB. (Bs.)',
    alias: ['COSTO HAB. (Bs.)', 'COSTO HAB (BS)', 'COSTO', 'COSTO HABITACION', 'COSTO HAB', 'PRECIO', 'MENSUALIDAD'],
  },
  tipoResidente: {
    clave: 'tipo',
    titulo: 'TIPO DE RESIDENTE',
    alias: ['TIPO DE RESIDENTE', 'TIPO RESIDENTE', 'CLASE', 'CATEGORIA'],
  },
  observaciones: {
    clave: 'observaciones',
    titulo: 'OBS',
    alias: ['OBS', 'OBSERVACIONES', 'OBSERVACION', 'NOTA', 'NOTAS', 'COMENTARIO'],
  },
};

function columnasDe(claves) {
  return claves.map((clave) => COLUMNAS[clave]);
}

export const FORMATO_ESTUDIANTES = {
  formato: FORMATOS.ESTUDIANTES,
  titulo: 'RELACION NOMINAL DE RESIDENCIA - ESTUDIANTES',
  hojasPorBloque: true,
  columnas: columnasDe([
    'orden',
    'bloque',
    'nombre',
    'ci',
    'celular',
    'carrera',
    'semestre',
    'codigo',
    'habitacion',
    'tipoHabitacion',
    'tutorNombre',
    'tutorCelular',
    'fechaIngreso',
    'observaciones',
  ]),
  camposObligatorios: ['nombre', 'ci'],
};

export const FORMATO_DEPARTAMENTOS_PEQUENOS = {
  formato: FORMATOS.DEPARTAMENTOS_PEQUENOS,
  titulo: 'RELACION NOMINAL DE RESIDENCIA - DEPARTAMENTOS PEQUENOS',
  hojasPorBloque: false,
  columnas: columnasDe([
    'orden',
    'nombre',
    'ci',
    'celular',
    'cargo',
    'habitacion',
    'tipoHabitacion',
    'costo',
    'fechaIngreso',
    'fechaRetiro',
    'observaciones',
  ]),
  camposObligatorios: ['nombre', 'ci'],
};

export const FORMATO_DEPARTAMENTOS_GRANDES = {
  formato: FORMATOS.DEPARTAMENTOS_GRANDES,
  titulo: 'RELACION NOMINAL DE RESIDENCIA - DEPARTAMENTOS GRANDES',
  hojasPorBloque: false,
  columnas: columnasDe([
    'orden',
    'nombre',
    'ci',
    'celular',
    'cargo',
    'habitacion',
    'tipoHabitacion',
    'costo',
    'fechaIngreso',
    'fechaRetiro',
    'observaciones',
  ]),
  camposObligatorios: ['nombre', 'ci'],
};

export const DEFINICIONES_DE_FORMATO = {
  [FORMATOS.ESTUDIANTES]: FORMATO_ESTUDIANTES,
  [FORMATOS.DEPARTAMENTOS_PEQUENOS]: FORMATO_DEPARTAMENTOS_PEQUENOS,
  [FORMATOS.DEPARTAMENTOS_GRANDES]: FORMATO_DEPARTAMENTOS_GRANDES,
};

export const NOMBRES_DE_HOJA = {
  VARONES: 'EST. VARONES',
  DAMAS: 'EST. DAMAS',
  DEPARTAMENTOS_PEQUENOS: 'DEPARTAMENTOS PEQUENOS',
  DEPARTAMENTOS_GRANDES: 'DEPARTAMENTOS GRANDES',
};

export function obtenerDefinicionDeFormato(formato) {
  return DEFINICIONES_DE_FORMATO[formato] || null;
}
