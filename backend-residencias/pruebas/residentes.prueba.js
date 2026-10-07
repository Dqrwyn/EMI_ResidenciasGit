// ==========================================================
//  pruebas/residentes.prueba.js
// ==========================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import { crearRepositoriosFalsos } from './ayudas/falsos.js';
import { crearRegistrarResidente } from '../src/aplicacion/casosDeUso/registrarResidente.js';
import { crearActualizarResidente } from '../src/aplicacion/casosDeUso/actualizarResidente.js';
import { crearMoverResidente } from '../src/aplicacion/casosDeUso/moverResidente.js';
import { crearRetirarResidente, crearReactivarResidente } from '../src/aplicacion/casosDeUso/retirarResidente.js';
import { crearBuscarResidentePorCi } from '../src/aplicacion/casosDeUso/buscarResidentePorCi.js';
import { crearListarResidentes } from '../src/aplicacion/casosDeUso/listarResidentes.js';
import { crearGestionarActivos } from '../src/aplicacion/casosDeUso/gestionarActivos.js';
import { crearListarHabitaciones } from '../src/aplicacion/casosDeUso/listarHabitaciones.js';

function armarCasos() {
  const falsos = crearRepositoriosFalsos();
  const dependencias = {
    repositorioHabitaciones: falsos.repositorioHabitaciones,
    repositorioResidentes: falsos.repositorioResidentes,
    repositorioActivos: falsos.repositorioActivos,
    repositorioMovimientos: falsos.repositorioMovimientos,
  };

  return {
    ...falsos,
    registrar: crearRegistrarResidente(dependencias),
    actualizar: crearActualizarResidente(dependencias),
    mover: crearMoverResidente(dependencias),
    retirar: crearRetirarResidente(dependencias),
    reactivar: crearReactivarResidente(dependencias),
    buscar: crearBuscarResidentePorCi(dependencias),
    listar: crearListarResidentes(dependencias),
    listarHabitaciones: crearListarHabitaciones(dependencias),
    activos: crearGestionarActivos(dependencias),
  };
}

const ESTUDIANTE = {
  nombre: 'Juan Perez Mamani',
  ci: '1234567',
  tipo: 'ESTUDIANTE',
  celular: '77712345',
  carrera: 'Ing. Sistemas',
  semestre: '3RO',
  bloque: 'VARONES',
  habitacionCodigo: 'P1-3',
  fechaIngreso: '2026-01-20',
};

test('registrar un residente lo asigna a su habitacion y deja el historial', async () => {
  const casos = armarCasos();
  const creado = await casos.registrar({ datos: ESTUDIANTE, usuario: 'administrador' });

  assert.equal(creado.ci, '1234567');
  assert.equal(creado.habitacionCodigo, 'P1-3');
  assert.equal(creado.bloque, 'VARONES');
  assert.match(creado.nombre, /JUAN PEREZ/);
  assert.equal(casos.estado.movimientos[0].tipo, 'INGRESO');
});

test('no se puede registrar dos veces el mismo CI', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });

  await assert.rejects(() => casos.registrar({ datos: { ...ESTUDIANTE, habitacionCodigo: 'P2-1' } }), /Ya existe un residente/);
});

test('no se puede pasar de la capacidad de la habitacion', async () => {
  const casos = armarCasos();

  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '1111111' } });
  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '2222222', nombre: 'Pedro Quispe' } });
  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '3333333', nombre: 'Luis Choque' } });

  await assert.rejects(
    () => casos.registrar({ datos: { ...ESTUDIANTE, ci: '4444444', nombre: 'Mario Vargas' } }),
    /ya alcanzo su capacidad de 3/,
  );

  // En una habitacion individual no entra nadie mas que el titular
  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '5555555', nombre: 'Ana Rojas', bloque: 'DAMAS', habitacionCodigo: 'P1-1' } });
  await assert.rejects(
    () => casos.registrar({ datos: { ...ESTUDIANTE, ci: '6666666', nombre: 'Eva Lima', bloque: 'DAMAS', habitacionCodigo: 'P1-1' } }),
    /capacidad de 1/,
  );
});

test('cambiar de habitacion conserva todos los datos del residente', async () => {
  const casos = armarCasos();
  const original = await casos.registrar({ datos: ESTUDIANTE });

  const resultado = await casos.mover({
    ci: original.ci,
    bloqueDestino: 'VARONES',
    habitacionDestino: 'P2-10',
    motivo: 'Reubicacion por mantenimiento',
    usuario: 'administrador',
  });

  assert.equal(resultado.habitacionOrigen, 'P1-3');
  assert.equal(resultado.habitacionDestino.codigo, 'P2-10');
  assert.equal(resultado.residente.celular, original.celular);
  assert.equal(resultado.residente.carrera, original.carrera);
  assert.equal(resultado.residente.fechaIngreso, original.fechaIngreso);
  assert.equal(resultado.residente.tipo, 'ESTUDIANTE');

  const movimiento = casos.estado.movimientos.at(-1);
  assert.equal(movimiento.tipo, 'MOVIMIENTO');
  assert.equal(movimiento.habitacionOrigen, 'P1-3');
  assert.equal(movimiento.habitacionDestino, 'P2-10');
  assert.equal(movimiento.detalle, 'Reubicacion por mantenimiento');
});

test('no se puede mover a una habitacion inexistente ni al mismo lugar', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });

  await assert.rejects(
    () => casos.mover({ ci: '1234567', bloqueDestino: 'VARONES', habitacionDestino: 'P9-99' }),
    /no existe en el bloque/,
  );
  await assert.rejects(
    () => casos.mover({ ci: '1234567', bloqueDestino: 'VARONES', habitacionDestino: 'P1-3' }),
    /ya se encuentra/,
  );
});

test('el retiro libera la habitacion y el reingreso lo puede volver a ubicar', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });
  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '7654321', nombre: 'Pedro Quispe' } });

  const retirado = await casos.retirar({ ci: '1234567', motivo: 'Termino sus estudios' });
  assert.equal(retirado.estado, 'RETIRADO');
  assert.ok(retirado.fechaRetiro);
  assert.match(retirado.observaciones, /RETIRO: Termino sus estudios/);

  await assert.rejects(
    () => casos.mover({ ci: '1234567', bloqueDestino: 'VARONES', habitacionDestino: 'P2-1' }),
    /figura como RETIRADO/,
  );

  const reingresado = await casos.reactivar({
    ci: '1234567',
    bloqueDestino: 'VARONES',
    habitacionDestino: 'P2-1',
    motivo: 'Volvio al semestre II',
  });
  assert.equal(reingresado.estado, 'ACTIVO');
  assert.equal(reingresado.habitacionCodigo, 'P2-1');
});

test('la busqueda por CI devuelve la ficha con habitacion, companeros e historial', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });
  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '7654321', nombre: 'Pedro Quispe' } });
  await casos.mover({ ci: '7654321', bloqueDestino: 'VARONES', habitacionDestino: 'P2-2' });

  const encontrado = await casos.buscar({ ci: '1234567' });
  assert.equal(encontrado.residente.ci, '1234567');
  assert.equal(encontrado.habitacion.codigo, 'P1-3');
  assert.equal(encontrado.companerosDeHabitacion.length, 0);
  assert.ok(encontrado.historial.length >= 1);

  await assert.rejects(() => casos.buscar({ ci: '9999999' }), /No se encontro ningun residente/);
});

test('el listado permite buscar por CI, filtrar por bloque y ver los que no tienen habitacion', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });
  await casos.registrar({ datos: { ...ESTUDIANTE, ci: '8888888', nombre: 'Sin Cuarto', habitacionCodigo: null, bloque: 'VARONES' } });

  const porTexto = await casos.listar({ texto: '1234567' });
  assert.equal(porTexto.total, 1);

  const sinHabitacion = await casos.listar({ sinHabitacion: true });
  assert.equal(sinHabitacion.total, 1);
  assert.equal(sinHabitacion.residentes[0].ci, '8888888');

  const porBloque = await casos.listar({ bloque: 'VARONES' });
  assert.equal(porBloque.total, 2);

  const conHabitacion = await casos.listar({ texto: '1234567' });
  assert.equal(conHabitacion.residentes[0].habitacion.codigo, 'P1-3');
  assert.equal(conHabitacion.residentes[0].habitacion.tipo, 'COMPARTIDA');
});

test('la edicion de datos no cambia la habitacion si no se pide', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });

  const actualizado = await casos.actualizar({
    ci: '1234567',
    cambios: { celular: '70000000', semestre: '5TO' },
    usuario: 'administrador',
  });

  assert.equal(actualizado.celular, '70000000');
  assert.equal(actualizado.semestre, '5TO');
  assert.equal(actualizado.habitacionCodigo, 'P1-3');
  assert.equal(casos.estado.movimientos.at(-1).tipo, 'ACTUALIZACION');
});

test('los activos pertenecen a la habitacion: al mover al residente, el activo se queda', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });

  const activo = await casos.activos.crear({
    bloque: 'VARONES',
    habitacionCodigo: 'P1-3',
    datos: { nombre: 'Cama de una plaza', codigo: 'CAM-01', estado: 'DETERIORADO', observacion: 'Barrote suelto' },
    usuario: 'administrador',
  });

  assert.equal(activo.habitacionCodigo, 'P1-3');
  assert.equal(activo.estado, 'DETERIORADO');

  await casos.mover({ ci: '1234567', bloqueDestino: 'VARONES', habitacionDestino: 'P2-14' });

  const activosEnP1 = await casos.repositorioActivos.listarPorHabitacion('VARONES', 'P1-3');
  const activosEnP2 = await casos.repositorioActivos.listarPorHabitacion('VARONES', 'P2-14');
  assert.equal(activosEnP1.length, 1);
  assert.equal(activosEnP2.length, 0);
  assert.equal(activosEnP1[0].nombre, 'CAMA DE UNA PLAZA');
});

test('editar solo el estado de un activo no borra su nombre ni su codigo', async () => {
  const casos = armarCasos();
  const activo = await casos.activos.crear({
    bloque: 'VARONES',
    habitacionCodigo: 'P1-3',
    datos: { nombre: 'Cama de una plaza', codigo: 'CAM-01', estado: 'OPTIMO' },
  });

  const actualizado = await casos.activos.actualizar({ id: activo.id, datos: { estado: 'EN_REPARACION' } });

  assert.equal(actualizado.estado, 'EN_REPARACION');
  assert.equal(actualizado.nombre, 'CAMA DE UNA PLAZA');
  assert.equal(actualizado.codigo, 'CAM-01');
  assert.equal(actualizado.habitacionCodigo, 'P1-3');

  const enLaHabitacion = await casos.repositorioActivos.listarPorHabitacion('VARONES', 'P1-3');
  assert.equal(enLaHabitacion.length, 1);
});

test('no se puede crear un activo en una habitacion inexistente', async () => {
  const casos = armarCasos();
  await assert.rejects(
    () => casos.activos.crear({ bloque: 'VARONES', habitacionCodigo: 'P9-1', datos: { nombre: 'Foco' } }),
    /No existe la habitacion/,
  );
});

test('el mapa del bloque informa ocupacion, activos y totales', async () => {
  const casos = armarCasos();
  await casos.registrar({ datos: ESTUDIANTE });
  await casos.activos.crear({
    bloque: 'VARONES',
    habitacionCodigo: 'P1-3',
    datos: { nombre: 'Foco', estado: 'EN_REPARACION' },
  });

  const mapa = await casos.listarHabitaciones({ bloque: 'VARONES' });
  const habitacion = mapa.habitaciones.find((h) => h.codigo === 'P1-3');

  assert.equal(mapa.habitaciones.length, 42);
  assert.equal(habitacion.ocupacion.cantidad, 1);
  assert.equal(habitacion.ocupacion.libres, 2);
  assert.equal(habitacion.ocupacion.estado, 'PARCIAL');
  assert.equal(habitacion.residentes[0].ci, '1234567');
  assert.equal(habitacion.activos.total, 1);
  assert.equal(habitacion.activos.conAtencion, 1);
  assert.equal(mapa.resumen.residentesActivos, 1);
  assert.equal(mapa.resumen.activosConAtencion, 1);
});
