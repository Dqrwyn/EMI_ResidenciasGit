// ==========================================================
//  scripts/verificarIntegracion.js
//  Levanta el sistema real (Express + MongoDB) sobre una base de
//  datos TEMPORAL y recorre el flujo completo del personal:
//  ingresar -> ver el mapa -> registrar -> buscar -> mover ->
//  activos -> importar -> exportar -> panel -> usuarios -> retirar.
//  Al terminar BORRA la base temporal.
//  Uso: npm run verificar:integracion
// ==========================================================

process.env.MONGO_URI = process.env.MONGO_URI_VERIFICACION || 'mongodb://127.0.0.1:27017/residencias_emi_verificacion';
process.env.PUERTO = '0';
process.env.NIVEL_REGISTRO = 'warn';

import { crearLibroDePrueba, ENCABEZADOS_ESTUDIANTES } from '../pruebas/ayudas/excelDePrueba.js';

let comprobaciones = 0;
let fallas = 0;

function comprobar(condicion, mensaje) {
  comprobaciones += 1;
  if (condicion) {
    console.log(`  OK   ${mensaje}`);
  } else {
    fallas += 1;
    console.error(`  FALLA ${mensaje}`);
  }
}

async function principal() {
  const { conectarAMongo, desconectarDeMongo, mongoose } = await import(
    '../src/infraestructura/basedatos/conexionMongo.js'
  );
  const { crearRegistrador } = await import('../src/infraestructura/registro/registrador.js');
  const { crearContenedor } = await import('../src/presentacion/contenedor.js');
  const { crearAplicacion } = await import('../src/presentacion/aplicacionExpress.js');
  const { variablesDeEntorno } = await import('../config/variablesDeEntorno.js');

  const registrador = crearRegistrador('warn');

  console.log('--- Preparando la base de datos temporal ---');
  await conectarAMongo({ uri: variablesDeEntorno.mongoUri, registrador, reintentos: 2 });
  await mongoose.connection.dropDatabase();

  const contenedor = crearContenedor({ registrador });
  const catalogo = await contenedor.casos.sembrarCatalogo();
  comprobar(catalogo.total === 109, `el catalogo tiene las 109 habitaciones (${catalogo.total})`);

  const administrador = variablesDeEntorno.administradorInicial;
  await contenedor.repositorios.repositorioUsuarios.crear({
    usuario: administrador.usuario,
    nombre: administrador.nombre,
    rol: 'ADMINISTRADOR',
    activo: true,
    hashContrasena: await contenedor.servicios.cifradoContrasena.cifrar(administrador.contrasena),
  });

  const aplicacion = crearAplicacion({ contenedor });
  const servidor = await new Promise((resolver) => {
    const instancia = aplicacion.listen(0, () => resolver(instancia));
  });
  const base = `http://127.0.0.1:${servidor.address().port}/api`;
  console.log(`--- API de verificacion en ${base} ---`);

  let token = null;

  async function pedir(ruta, { metodo = 'GET', cuerpo, conToken = true, tipoDeCuerpo = 'json' } = {}) {
    const opciones = { method: metodo, headers: {} };
    if (conToken && token) opciones.headers.Authorization = `Bearer ${token}`;

    if (cuerpo !== undefined) {
      if (tipoDeCuerpo === 'form') {
        opciones.body = cuerpo;
      } else {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(cuerpo);
      }
    }

    const respuesta = await fetch(base + ruta, opciones);
    const tipo = respuesta.headers.get('content-type') || '';
    const datos = tipo.includes('application/json') ? await respuesta.json() : Buffer.from(await respuesta.arrayBuffer());
    return { estado: respuesta.status, datos, encabezados: respuesta.headers };
  }

  try {
    // ---- Diagnostico y sesion -------------------------------------
    console.log('--- Ingreso ---');
    const salud = await pedir('/salud', { conToken: false });
    comprobar(salud.estado === 200 && salud.datos.datos.baseDeDatos === 'conectada', 'el diagnostico responde');

    const sinToken = await pedir('/habitaciones?bloque=VARONES');
    comprobar(sinToken.estado === 401, 'sin token la API responde 401');

    const ingresoMal = await pedir('/autenticacion/iniciar-sesion', {
      metodo: 'POST',
      conToken: false,
      cuerpo: { usuario: administrador.usuario, contrasena: 'clave-equivocada' },
    });
    comprobar(ingresoMal.estado === 401, 'la contrasena equivocada es rechazada');

    const ingreso = await pedir('/autenticacion/iniciar-sesion', {
      metodo: 'POST',
      conToken: false,
      cuerpo: { usuario: administrador.usuario, contrasena: administrador.contrasena },
    });
    comprobar(ingreso.estado === 200 && Boolean(ingreso.datos.datos.token), 'el administrador ingresa y recibe su token');
    token = ingreso.datos.datos.token;

    const yo = await pedir('/autenticacion/yo');
    comprobar(yo.datos.datos.usuario.rol === 'ADMINISTRADOR', 'la sesion informa el rol');

    // ---- Mapa ------------------------------------------------------
    console.log('--- Mapa de habitaciones ---');
    const catalogoHttp = await pedir('/catalogo');
    comprobar(catalogoHttp.datos.datos.bloques.length === 4, 'el catalogo informa los 4 bloques');
    comprobar(catalogoHttp.datos.datos.formatos.length === 3, 'el catalogo informa los 3 formatos de Excel');

    const varones = await pedir('/habitaciones?bloque=VARONES');
    comprobar(varones.datos.datos.habitaciones.length === 42, 'el bloque de varones tiene 42 habitaciones');

    const piso1 = varones.datos.datos.habitaciones.filter((habitacion) => habitacion.piso === 'P1');
    comprobar(piso1.length === 14, 'el primer piso tiene 14 habitaciones');
    comprobar(piso1.filter((h) => h.tipo === 'INDIVIDUAL').length === 8, 'el primer piso tiene 8 individuales');
    comprobar(piso1.filter((h) => h.tipo === 'COMPARTIDA').length === 6, 'el primer piso tiene 6 compartidas');

    const derechaAbajo = piso1.find((h) => h.codigo === 'P1-13');
    comprobar(derechaAbajo.lado === 'DERECHO' && derechaAbajo.posicion === 'INFERIOR', 'P1-13 es la primera individual de abajo a la derecha');

    const grandes = await pedir('/habitaciones?bloque=DEPARTAMENTOS_GRANDES');
    comprobar(
      grandes.datos.datos.habitaciones.map((h) => h.codigo).join(',') === 'DG-1,DG-2,DG-3,DG-4,DD',
      'los departamentos grandes son DG-1..DG-4 mas DD',
    );

    const pequenos = await pedir('/habitaciones?bloque=DEPARTAMENTOS_PEQUENOS');
    comprobar(pequenos.datos.datos.habitaciones.length === 20, 'hay 20 departamentos pequenos (D-1..D-20)');

    // ---- Residentes ------------------------------------------------
    console.log('--- Residentes ---');
    const creado = await pedir('/residentes', {
      metodo: 'POST',
      cuerpo: {
        nombre: 'Juan Perez Mamani',
        ci: '1234567',
        tipo: 'ESTUDIANTE',
        celular: '77712345',
        carrera: 'Ing. Sistemas',
        semestre: '3RO',
        codigo: 'H819-2',
        tutorNombre: 'Maria Mamani',
        tutorCelular: '77700000',
        fechaIngreso: '2026-01-28',
        bloque: 'VARONES',
        habitacionCodigo: 'P2-3',
      },
    });
    comprobar(creado.estado === 201 && creado.datos.datos.habitacionCodigo === 'P2-3', 'se registra un residente en P2-3');

    const repetido = await pedir('/residentes', {
      metodo: 'POST',
      cuerpo: { nombre: 'Juan Perez Mamani', ci: '1234567', tipo: 'ESTUDIANTE', bloque: 'VARONES', habitacionCodigo: 'P2-4' },
    });
    comprobar(repetido.estado === 409, 'no se admite dos veces el mismo CI');

    const busqueda = await pedir('/residentes/buscar?ci=1234567');
    comprobar(busqueda.datos.datos.residente.nombre === 'JUAN PEREZ MAMANI', 'el buscador por CI encuentra al residente');
    comprobar(busqueda.datos.datos.habitacion.codigo === 'P2-3', 'la ficha informa su habitacion');

    const busquedaInexistente = await pedir('/residentes/buscar?ci=9999999');
    comprobar(busquedaInexistente.estado === 404, 'el buscador avisa cuando el CI no existe');

    const editado = await pedir('/residentes/1234567', { metodo: 'PATCH', cuerpo: { celular: '70000000', semestre: '5TO' } });
    comprobar(editado.datos.datos.celular === '70000000', 'se editan los datos del residente');

    const movimiento = await pedir('/residentes/1234567/mover', {
      metodo: 'POST',
      cuerpo: { bloqueDestino: 'VARONES', habitacionDestino: 'P2-10', motivo: 'Reubicacion' },
    });
    comprobar(
      movimiento.datos.datos.habitacionOrigen === 'P2-3' && movimiento.datos.datos.habitacionDestino.codigo === 'P2-10',
      'el cambio de habitacion conserva los datos y queda registrado',
    );

    const fichaMovida = await pedir('/residentes/buscar?ci=1234567');
    comprobar(fichaMovida.datos.datos.residente.carrera === 'Ing. Sistemas', 'al moverse, la carrera sigue intacta');
    comprobar(fichaMovida.datos.datos.residente.celular === '70000000', 'al moverse, el celular editado sigue intacto');
    comprobar(fichaMovida.datos.datos.historial.length >= 3, 'el historial del residente registra ingreso, edicion y movimiento');

    // ---- Capacidad y habitaciones ----------------------------------
    console.log('--- Capacidad de las habitaciones ---');
    const habitacion = await pedir('/habitaciones/VARONES/P2-3');
    comprobar(habitacion.datos.datos.ocupacion.estado === 'VACIA', 'P2-3 queda vacia despues del movimiento');

    const sinCapacidad = await pedir('/habitaciones/VARONES/P2-14', { metodo: 'PATCH', cuerpo: { capacidad: 0 } });
    comprobar(sinCapacidad.estado === 400, 'no se acepta una capacidad invalida');

    const capacidad = await pedir('/habitaciones/VARONES/P2-14', { metodo: 'PATCH', cuerpo: { capacidad: 2, costo: 350 } });
    comprobar(capacidad.datos.datos.capacidad === 2 && capacidad.datos.datos.costo === 350, 'se edita la capacidad y el costo');

    await pedir('/residentes', {
      metodo: 'POST',
      cuerpo: { nombre: 'Pedro Quispe Rojas', ci: '7654321', tipo: 'ESTUDIANTE', bloque: 'VARONES', habitacionCodigo: 'P2-14' },
    });
    await pedir('/residentes', {
      metodo: 'POST',
      cuerpo: { nombre: 'Luis Choque Nina', ci: '7654322', tipo: 'ESTUDIANTE', bloque: 'VARONES', habitacionCodigo: 'P2-14' },
    });
    const llenoLl = await pedir('/residentes', {
      metodo: 'POST',
      cuerpo: { nombre: 'Mario Vargas Luna', ci: '7654323', tipo: 'ESTUDIANTE', bloque: 'VARONES', habitacionCodigo: 'P2-14' },
    });
    comprobar(llenoLl.estado === 409, 'la habitacion llena rechaza un tercer residente');

    // ---- Activos ---------------------------------------------------
    console.log('--- Activos ligados a la habitacion ---');
    const activoCreado = await pedir('/activos', {
      metodo: 'POST',
      cuerpo: {
        bloque: 'VARONES',
        habitacionCodigo: 'P2-14',
        nombre: 'Cama de una plaza',
        codigo: 'CAM-01',
        estado: 'DETERIORADO',
        observacion: 'Barrote suelto',
      },
    });
    comprobar(activoCreado.estado === 201, 'se registra un activo en la habitacion');

    const activoId = activoCreado.datos.datos.id;
    const activoActualizado = await pedir(`/activos/${activoId}`, { metodo: 'PATCH', cuerpo: { estado: 'EN_REPARACION' } });
    comprobar(activoActualizado.datos.datos.estado === 'EN_REPARACION', 'se cambia el estado del activo');

    const detalleHabitacion = await pedir('/habitaciones/VARONES/P2-14');
    comprobar(detalleHabitacion.datos.datos.activos.length === 1, 'el activo aparece en el detalle de la habitacion');
    comprobar(detalleHabitacion.datos.datos.residentes.length === 2, 'la habitacion muestra sus dos residentes');

    // ---- Excel -----------------------------------------------------
    console.log('--- Importar y exportar ---');
    const libro = await crearLibroDePrueba([
      {
        nombre: 'EST. DAMAS',
        encabezados: ENCABEZADOS_ESTUDIANTES,
        filas: [
          [null, 1, 'Ruth Tania Condori Poma', 14511932, 74365182, 'Ing. Comercial', '1RO', 'H810-9', 'PB-1', 'TIPO C', 'Cristina Poma', 72729675, '2026-01-27', ''],
          [null, 2, 'Nelly Bejarano Condori', 13577935, 77447304, 'Ing. Comercial', '9NO', 'H465-0', 'PB-14', 'TIPO D', 'Sirilo Bejarano', 77401129, '2026-01-27', ''],
        ],
      },
    ]);

    const formulario = new FormData();
    formulario.append('archivo', new Blob([libro], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'relacion.xlsx');

    const importacion = await pedir('/excel/importar', { metodo: 'POST', cuerpo: formulario, tipoDeCuerpo: 'form' });
    comprobar(importacion.estado === 200 && importacion.datos.datos.creados === 2, 'se importan dos damas desde Excel');
    comprobar(importacion.datos.datos.formato === 'ESTUDIANTES', 'el formato se detecta por el nombre de la hoja');

    const exportacion = await pedir('/excel/exportar?formato=ESTUDIANTES');
    comprobar(exportacion.estado === 200 && exportacion.datos.length > 5000, 'se descarga la relacion de estudiantes en Excel');
    comprobar(
      String(exportacion.encabezados.get('content-disposition')).includes('relacion-estudiantes'),
      'el archivo lleva el nombre del formato',
    );

    const plantilla = await pedir('/excel/plantilla/DEPARTAMENTOS_PEQUENOS');
    comprobar(plantilla.estado === 200 && plantilla.datos.length > 5000, 'se descarga la plantilla de departamentos pequenos');

    const exportacionGrandes = await pedir('/excel/exportar?formato=DEPARTAMENTOS_GRANDES');
    comprobar(exportacionGrandes.estado === 200, 'se descarga la relacion de departamentos grandes');

    // ---- Panel y auditoria -----------------------------------------
    console.log('--- Panel y auditoria ---');
    const panel = await pedir('/panel');
    comprobar(panel.datos.datos.habitaciones.total === 109, 'el panel cuenta las 109 habitaciones');
    comprobar(panel.datos.datos.residentesActivos === 5, 'el panel cuenta los residentes activos');
    comprobar(panel.datos.datos.activos.conAtencion === 1, 'el panel informa los activos que necesitan atencion');
    comprobar(panel.datos.datos.bloques.length === 4, 'el panel informa los 4 bloques');

    const movimientos = await pedir('/movimientos?limite=50');
    comprobar(movimientos.datos.datos.total >= 5, 'el historial registra los movimientos');

    const movimientosPorTipo = await pedir('/movimientos?tipo=IMPORTACION');
    comprobar(movimientosPorTipo.datos.datos.total >= 1, 'el historial se puede filtrar por tipo');

    // ---- Usuarios y roles ------------------------------------------
    console.log('--- Usuarios y roles ---');
    const responsable = await pedir('/usuarios', {
      metodo: 'POST',
      cuerpo: { usuario: 'responsable', nombre: 'Luis Choque Nina', rol: 'RESPONSABLE', contrasena: 'Residencias2026' },
    });
    comprobar(responsable.estado === 201, 'el administrador crea un responsable');

    const tokenAdministrador = token;
    const ingresoResponsable = await pedir('/autenticacion/iniciar-sesion', {
      metodo: 'POST',
      conToken: false,
      cuerpo: { usuario: 'responsable', contrasena: 'Residencias2026' },
    });
    token = ingresoResponsable.datos.datos.token;
    const prohibido = await pedir('/usuarios');
    comprobar(prohibido.estado === 403, 'el responsable no puede administrar usuarios');

    const mapaComoResponsable = await pedir('/habitaciones?bloque=DAMAS');
    comprobar(mapaComoResponsable.estado === 200, 'el responsable si puede ver el mapa');

    token = tokenAdministrador;
    const cambioContrasena = await pedir('/usuarios/responsable/contrasena', {
      metodo: 'POST',
      cuerpo: { contrasena: 'OtraClave2026' },
    });
    comprobar(cambioContrasena.estado === 200, 'el administrador cambia la contrasena del responsable');

    const eliminacion = await pedir('/usuarios/responsable', { metodo: 'DELETE' });
    comprobar(eliminacion.estado === 200, 'el administrador elimina la cuenta del responsable');

    // ---- Retiro ----------------------------------------------------
    console.log('--- Retiro y reingreso ---');
    const retiro = await pedir('/residentes/1234567/retirar', { metodo: 'POST', cuerpo: { motivo: 'Fin de semestre' } });
    comprobar(retiro.datos.datos.estado === 'RETIRADO', 'se retira al residente');

    const reingreso = await pedir('/residentes/1234567/reactivar', {
      metodo: 'POST',
      cuerpo: { bloqueDestino: 'VARONES', habitacionDestino: 'PB-1', motivo: 'Vuelve al segundo semestre' },
    });
    comprobar(reingreso.datos.datos.estado === 'ACTIVO' && reingreso.datos.datos.habitacionCodigo === 'PB-1', 'el residente puede reingresar a otra habitacion');
  } finally {
    console.log('--- Limpieza ---');
    await new Promise((resolver) => servidor.close(resolver));
    await mongoose.connection.dropDatabase();
    await desconectarDeMongo();
    console.log('La base de datos temporal fue eliminada.');
  }

  console.log(`\nVerificacion de integracion: ${comprobaciones - fallas}/${comprobaciones} comprobaciones correctas`);
  if (fallas > 0) process.exitCode = 1;
}

principal().catch((error) => {
  console.error(`La verificacion fallo: ${error.stack || error.message}`);
  process.exitCode = 1;
});
