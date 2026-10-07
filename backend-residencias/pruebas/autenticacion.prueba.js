// ==========================================================
//  pruebas/autenticacion.prueba.js
// ==========================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { crearCifradoFalso, crearRepositoriosFalsos, crearServicioTokenFalso } from './ayudas/falsos.js';
import { crearIniciarSesion } from '../src/aplicacion/casosDeUso/iniciarSesion.js';
import { crearGestionarUsuarios } from '../src/aplicacion/casosDeUso/gestionarUsuarios.js';

function armarCasos() {
  const falsos = crearRepositoriosFalsos();
  const cifradoContrasena = crearCifradoFalso();
  const servicioToken = crearServicioTokenFalso();

  return {
    ...falsos,
    cifradoContrasena,
    iniciarSesion: crearIniciarSesion({
      repositorioUsuarios: falsos.repositorioUsuarios,
      cifradoContrasena,
      servicioToken,
      repositorioMovimientos: falsos.repositorioMovimientos,
    }),
    usuarios: crearGestionarUsuarios({
      repositorioUsuarios: falsos.repositorioUsuarios,
      cifradoContrasena,
      repositorioMovimientos: falsos.repositorioMovimientos,
    }),
  };
}

test('se crean usuarios con la contrasena cifrada y se puede iniciar sesion', async () => {
  const casos = armarCasos();

  const creado = await casos.usuarios.crear({
    datos: { usuario: 'Administrador', nombre: 'Ana Rojas', rol: 'ADMINISTRADOR', contrasena: 'Residencias2026' },
  });

  assert.equal(creado.usuario, 'administrador');
  assert.equal(creado.rol, 'ADMINISTRADOR');
  assert.equal(creado.hashContrasena, undefined, 'la contrasena nunca se devuelve');
  assert.equal(casos.estado.usuarios.get('administrador').hashContrasena, 'cifrado:Residencias2026');

  const sesion = await casos.iniciarSesion({ usuario: 'ADMINISTRADOR', contrasena: 'Residencias2026' });
  assert.equal(sesion.token.startsWith('token:'), true);
  assert.equal(sesion.usuario.nombre, 'Ana Rojas');
  assert.equal(sesion.usuario.rol, 'ADMINISTRADOR');
});

test('no se ingresa con la contrasena equivocada ni con una cuenta deshabilitada', async () => {
  const casos = armarCasos();
  await casos.usuarios.crear({
    datos: { usuario: 'responsable', nombre: 'Luis Choque', rol: 'RESPONSABLE', contrasena: 'Residencias2026' },
  });

  await assert.rejects(
    () => casos.iniciarSesion({ usuario: 'responsable', contrasena: 'incorrecta' }),
    /Usuario o contrasena incorrectos/,
  );

  await casos.usuarios.actualizar({ usuario: 'responsable', cambios: { activo: false } });
  await assert.rejects(
    () => casos.iniciarSesion({ usuario: 'responsable', contrasena: 'Residencias2026' }),
    /La cuenta esta deshabilitada/,
  );
});

test('la contrasena debe tener al menos 8 caracteres y el usuario minimo 3', async () => {
  const casos = armarCasos();

  await assert.rejects(
    () => casos.usuarios.crear({ datos: { usuario: 'ana', nombre: 'Ana Rojas', rol: 'RESPONSABLE', contrasena: 'corta' } }),
    /al menos 8 caracteres/,
  );

  await assert.rejects(
    () => casos.usuarios.crear({ datos: { usuario: 'an', nombre: 'Ana Rojas', rol: 'RESPONSABLE', contrasena: 'Residencias2026' } }),
    /al menos 3 caracteres/,
  );
});

test('no se puede quedar sin administradores ni eliminar la propia cuenta', async () => {
  const casos = armarCasos();
  await casos.usuarios.crear({
    datos: { usuario: 'jefe', nombre: 'Ana Rojas', rol: 'ADMINISTRADOR', contrasena: 'Residencias2026' },
  });

  await assert.rejects(
    () => casos.usuarios.actualizar({ usuario: 'jefe', cambios: { activo: false } }),
    /unico administrador/,
  );

  await assert.rejects(() => casos.usuarios.eliminar({ usuario: 'jefe', usuarioEjecutor: 'jefe' }), /su propia cuenta/);

  // Con dos administradores si se puede degradar a uno
  await casos.usuarios.crear({
    datos: { usuario: 'segundo', nombre: 'Luis Choque', rol: 'ADMINISTRADOR', contrasena: 'Residencias2026' },
  });
  const degradado = await casos.usuarios.actualizar({ usuario: 'jefe', cambios: { rol: 'RESPONSABLE' } });
  assert.equal(degradado.rol, 'RESPONSABLE');
});

test('el cambio de contrasena reemplaza la anterior', async () => {
  const casos = armarCasos();
  await casos.usuarios.crear({
    datos: { usuario: 'responsable', nombre: 'Luis Choque', rol: 'RESPONSABLE', contrasena: 'Residencias2026' },
  });

  await casos.usuarios.cambiarContrasena({ usuario: 'responsable', contrasena: 'NuevaClave2026' });

  await assert.rejects(
    () => casos.iniciarSesion({ usuario: 'responsable', contrasena: 'Residencias2026' }),
    /Usuario o contrasena incorrectos/,
  );
  const sesion = await casos.iniciarSesion({ usuario: 'responsable', contrasena: 'NuevaClave2026' });
  assert.equal(sesion.usuario.usuario, 'responsable');
});
