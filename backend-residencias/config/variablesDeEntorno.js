// ==========================================================
//  config/variablesDeEntorno.js
//  Unico archivo del backend autorizado a leer process.env.
//  El resto del sistema recibe estos valores ya resueltos.
// ==========================================================

import 'dotenv/config';

function texto(nombre, valorPorDefecto = '') {
  const valor = process.env[nombre];
  return valor === undefined || valor === '' ? valorPorDefecto : valor;
}

function entero(nombre, valorPorDefecto) {
  const valor = Number.parseInt(texto(nombre, ''), 10);
  return Number.isNaN(valor) ? valorPorDefecto : valor;
}

export const variablesDeEntorno = {
  puerto: entero('PUERTO', 4100),
  entorno: texto('ENTORNO', 'desarrollo'),
  origenesPermitidos: texto('ORIGENES_PERMITIDOS', 'http://localhost:5180,http://127.0.0.1:5180')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean),
  mongoUri: texto('MONGO_URI', 'mongodb://127.0.0.1:27017/residencias_emi'),
  baseDeDatosVerificacion: texto('BD_VERIFICACION', 'residencias_emi_verificacion'),
  jwtSecreto: texto('JWT_SECRETO', ''),
  jwtVigencia: texto('JWT_VIGENCIA', '12h'),
  administradorInicial: {
    usuario: texto('ADMIN_USUARIO', 'administrador'),
    nombre: texto('ADMIN_NOMBRE', 'Administrador del sistema'),
    contrasena: texto('ADMIN_CONTRASENA', ''),
  },
  nivelRegistro: texto('NIVEL_REGISTRO', 'info'),
  limiteIntentosIngreso: entero('LIMITE_INTENTOS_INGRESO', 10),
};

export function esEntornoDeProduccion() {
  return variablesDeEntorno.entorno === 'produccion';
}
