// ==========================================================
//  servidor.js
//  Arranque del Sistema de Gestion de Residencias (EMI):
//   1. Conecta a MongoDB.
//   2. Sincroniza el catalogo oficial de habitaciones.
//   3. Levanta la API.
// ==========================================================

import { variablesDeEntorno } from './config/variablesDeEntorno.js';
import { conectarAMongo, desconectarDeMongo } from './src/infraestructura/basedatos/conexionMongo.js';
import { crearRegistrador } from './src/infraestructura/registro/registrador.js';
import { crearContenedor } from './src/presentacion/contenedor.js';
import { crearAplicacion } from './src/presentacion/aplicacionExpress.js';

async function iniciar() {
  const registrador = crearRegistrador(variablesDeEntorno.nivelRegistro);

  await conectarAMongo({ uri: variablesDeEntorno.mongoUri, registrador });

  const contenedor = crearContenedor({ registrador });

  const catalogo = await contenedor.casos.sembrarCatalogo();
  registrador.info(`Catalogo de habitaciones listo (${catalogo.total} en total, ${catalogo.creadas} nuevas)`);

  const aplicacion = crearAplicacion({ contenedor });

  const servidor = aplicacion.listen(variablesDeEntorno.puerto, () => {
    registrador.info(`Servidor de residencias escuchando en http://localhost:${variablesDeEntorno.puerto}`);
    registrador.info(`Diagnostico: http://localhost:${variablesDeEntorno.puerto}/api/salud`);
  });

  async function cerrar(senal) {
    registrador.info(`Se recibio ${senal}: cerrando el servidor...`);
    servidor.close(async () => {
      await desconectarDeMongo();
      registrador.info('Servidor cerrado correctamente');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => cerrar('SIGINT'));
  process.on('SIGTERM', () => cerrar('SIGTERM'));
}

iniciar().catch((error) => {
  console.error(`No se pudo iniciar el servidor: ${error.message}`);
  process.exit(1);
});
