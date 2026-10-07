// ==========================================================
//  scripts/verificarSintaxis.js
//  Revisa la sintaxis de todos los archivos .js del backend y,
//  ademas, intenta importarlos para detectar rutas mal escritas.
//  Uso: npm run verificar
// ==========================================================

import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ejecutar = promisify(execFile);
const raiz = fileURLToPath(new URL('..', import.meta.url));
const OMITIR = ['node_modules', '.git', 'temporal'];

const MODULOS_QUE_EXIGEN_BASE_DE_DATOS = [
  'servidor.js',
  'HabitacionRepositorioMongo',
  'ResidenteRepositorioMongo',
  'ActivoRepositorioMongo',
  'UsuarioRepositorioMongo',
  'MovimientoRepositorioMongo',
  'contenedor.js',
  'aplicacionExpress.js',
  'semillaInicial.js',
  'verificarIntegracion.js',
];

async function buscarArchivos(directorio) {
  const encontrados = [];
  const entradas = await readdir(directorio);

  for (const entrada of entradas) {
    if (OMITIR.includes(entrada)) continue;
    const ruta = join(directorio, entrada);
    const informacion = await stat(ruta);
    if (informacion.isDirectory()) encontrados.push(...(await buscarArchivos(ruta)));
    else if (entrada.endsWith('.js')) encontrados.push(ruta);
  }

  return encontrados;
}

async function principal() {
  const archivos = (await buscarArchivos(raiz)).sort();
  let errores = 0;

  for (const archivo of archivos) {
    const rutaRelativa = relative(raiz, archivo);
    try {
      await ejecutar(process.execPath, ['--check', archivo]);
    } catch (error) {
      errores += 1;
      console.error(`SINTAXIS  ${rutaRelativa}`);
      console.error(String(error.stderr).split('\n').slice(0, 6).join('\n'));
      continue;
    }

    const omitirImportacion = MODULOS_QUE_EXIGEN_BASE_DE_DATOS.some((nombre) => rutaRelativa.includes(nombre));
    if (!omitirImportacion) {
      try {
        await import(pathToFileURL(archivo).href);
      } catch (error) {
        errores += 1;
        console.error(`IMPORT    ${rutaRelativa}\n${error.message}`);
      }
    }
  }

  console.log(
    errores === 0
      ? `Verificacion completa: ${archivos.length} archivos revisados sin problemas.`
      : `Verificacion terminada con ${errores} problema(s) en ${archivos.length} archivos.`,
  );

  if (errores > 0) process.exitCode = 1;
}

principal().catch((error) => {
  console.error(`No se pudo ejecutar la verificacion: ${error.message}`);
  process.exitCode = 1;
});
