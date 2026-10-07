// ==========================================================
//  infraestructura/basedatos/conexionMongo.js
// ==========================================================

import mongoose from 'mongoose';

const REINTENTOS = 5;
const ESPERA_BASE_MS = 1500;

export async function conectarAMongo({ uri, registrador = console, reintentos = REINTENTOS } = {}) {
  for (let intento = 1; intento <= reintentos; intento += 1) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      registrador.info?.(`MongoDB conectado (${mongoose.connection.name})`);
      return mongoose.connection;
    } catch (error) {
      const ultimo = intento === reintentos;
      registrador.warn?.(
        `No se pudo conectar a MongoDB (intento ${intento}/${reintentos}): ${error.message}${ultimo ? '' : ' - reintentando'}`,
      );
      if (ultimo) throw new Error(`No se pudo conectar a MongoDB en ${uri}`);
      await new Promise((resolver) => setTimeout(resolver, ESPERA_BASE_MS * intento));
    }
  }
  return null;
}

export async function desconectarDeMongo() {
  await mongoose.disconnect();
}

export async function borrarBaseDeDatos(nombre) {
  await mongoose.connection.dropDatabase(nombre);
}

export { mongoose };
