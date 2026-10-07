// ==========================================================
//  scripts/semillaInicial.js
//  1. Copia el catalogo oficial de habitaciones a MongoDB.
//  2. Crea la cuenta de administrador definida en el .env.
//  No borra nada: se puede ejecutar las veces que haga falta.
//  Uso: npm run semilla
// ==========================================================

import { variablesDeEntorno } from '../config/variablesDeEntorno.js';
import { conectarAMongo, desconectarDeMongo } from '../src/infraestructura/basedatos/conexionMongo.js';
import { crearRegistrador } from '../src/infraestructura/registro/registrador.js';
import { crearContenedor } from '../src/presentacion/contenedor.js';
import { ROLES } from '../src/dominio/objetosValor/RolUsuario.js';

async function principal() {
  const registrador = crearRegistrador(variablesDeEntorno.nivelRegistro);

  await conectarAMongo({ uri: variablesDeEntorno.mongoUri, registrador });
  const contenedor = crearContenedor({ registrador });

  console.log('--- Catalogo de habitaciones ---');
  const catalogo = await contenedor.casos.sembrarCatalogo();
  console.log(`Total en el catalogo: ${catalogo.total} habitaciones (${catalogo.creadas} nuevas en esta corrida)`);

  console.log('--- Cuenta de administrador ---');
  const administrador = variablesDeEntorno.administradorInicial;
  if (!administrador.contrasena) {
    throw new Error('Defina ADMIN_CONTRASENA en el archivo .env antes de ejecutar la semilla');
  }

  const repositorioUsuarios = contenedor.repositorios.repositorioUsuarios;
  const existente = await repositorioUsuarios.buscarPorUsuario(administrador.usuario);

  if (existente) {
    console.log(`La cuenta "${administrador.usuario}" ya existe; no se modifico su contrasena.`);
  } else {
    const hashContrasena = await contenedor.servicios.cifradoContrasena.cifrar(administrador.contrasena);
    await repositorioUsuarios.crear({
      usuario: administrador.usuario,
      nombre: administrador.nombre,
      rol: ROLES.ADMINISTRADOR,
      activo: true,
      hashContrasena,
    });
    console.log(`Cuenta creada: ${administrador.usuario} (rol ADMINISTRADOR)`);
  }

  await desconectarDeMongo();
  console.log('Semilla terminada correctamente.');
}

principal().catch(async (error) => {
  console.error(`La semilla fallo: ${error.message}`);
  try {
    await desconectarDeMongo();
  } catch {
    // sin conexion: nada que cerrar
  }
  process.exit(1);
});
