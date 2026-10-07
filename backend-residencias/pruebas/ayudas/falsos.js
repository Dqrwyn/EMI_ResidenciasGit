// ==========================================================
//  pruebas/ayudas/falsos.js
//  Repositorios de mentira, en memoria. Gracias a la arquitectura
//  de cebolla, las reglas de negocio se prueban sin MongoDB.
// ==========================================================

import { generarCatalogoHabitaciones } from '../../src/dominio/objetosValor/CatalogoHabitaciones.js';

let contadorId = 0;
function nuevoId(prefijo) {
  contadorId += 1;
  return `${prefijo}-${contadorId}`;
}

export function crearRepositoriosFalsos({ catalogo = null } = {}) {
  const definiciones = catalogo || generarCatalogoHabitaciones();

  const habitaciones = new Map();
  for (const definicion of definiciones) {
    habitaciones.set(`${definicion.bloque}|${definicion.codigo}`, {
      ...definicion,
      estado: 'ACTIVA',
      observaciones: '',
    });
  }

  const residentes = new Map();
  const activos = new Map();
  const usuarios = new Map();
  const movimientos = [];

  const repositorioHabitaciones = {
    async listar(bloque) {
      const lista = [...habitaciones.values()].filter((habitacion) => !bloque || habitacion.bloque === bloque);
      return lista.map((habitacion) => ({ ...habitacion }));
    },

    async obtenerPorCodigo(bloque, codigo) {
      const habitacion = habitaciones.get(`${bloque}|${codigo}`);
      return habitacion ? { ...habitacion } : null;
    },

    async obtenerVarias(bloque, codigos = []) {
      return codigos.map((codigo) => habitaciones.get(`${bloque}|${codigo}`)).filter(Boolean).map((h) => ({ ...h }));
    },

    async actualizar(bloque, codigo, cambios) {
      const clave = `${bloque}|${codigo}`;
      const habitacion = habitaciones.get(clave);
      if (!habitacion) return null;
      Object.assign(habitacion, cambios);
      return { ...habitacion };
    },

    async sincronizarCatalogo(nuevasDefiniciones = []) {
      let creadas = 0;
      for (const definicion of nuevasDefiniciones) {
        const clave = `${definicion.bloque}|${definicion.codigo}`;
        if (!habitaciones.has(clave)) {
          habitaciones.set(clave, { ...definicion, estado: 'ACTIVA', observaciones: '' });
          creadas += 1;
        }
      }
      return { creadas, existentes: habitaciones.size - creadas };
    },
  };

  const repositorioResidentes = {
    async buscarPorCi(ci) {
      return residentes.get(ci) ? { ...residentes.get(ci) } : null;
    },

    async listar(filtros = {}) {
      let lista = [...residentes.values()];

      if (filtros.bloque) lista = lista.filter((r) => r.bloque === filtros.bloque);
      if (filtros.estado) lista = lista.filter((r) => r.estado === filtros.estado);
      if (filtros.tipo) lista = lista.filter((r) => r.tipo === filtros.tipo);
      if (filtros.habitacionCodigo) lista = lista.filter((r) => r.habitacionCodigo === filtros.habitacionCodigo);
      if (filtros.sinHabitacion) lista = lista.filter((r) => !r.habitacionCodigo);
      if (filtros.texto) {
        const texto = filtros.texto.toUpperCase();
        lista = lista.filter(
          (r) =>
            r.nombre.includes(texto) ||
            r.ci.includes(texto) ||
            (r.celular || '').includes(texto) ||
            (r.codigo || '').toUpperCase().includes(texto),
        );
      }

      if (filtros.orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
      else
        lista.sort(
          (a, b) =>
            String(a.bloque).localeCompare(String(b.bloque)) |
            String(a.habitacionCodigo).localeCompare(String(b.habitacionCodigo)) |
            a.nombre.localeCompare(b.nombre, 'es'),
        );

      if (filtros.salto) lista = lista.slice(filtros.salto);
      if (filtros.limite) lista = lista.slice(0, filtros.limite);
      return lista.map((r) => ({ ...r }));
    },

    async contar(filtros = {}) {
      const lista = await this.listar({ ...filtros, limite: 0, salto: 0 });
      return lista.length;
    },

    async listarPorHabitacion(bloque, codigo) {
      return [...residentes.values()]
        .filter((r) => r.bloque === bloque && r.habitacionCodigo === codigo && r.estado === 'ACTIVO')
        .map((r) => ({ ...r }));
    },

    async listarActivos(filtros = {}) {
      return [...residentes.values()]
        .filter((r) => r.estado === 'ACTIVO' && (!filtros.bloque || r.bloque === filtros.bloque))
        .map((r) => ({ ...r }));
    },

    async crear(residente) {
      const creado = { ...residente, id: nuevoId('residente') };
      residentes.set(creado.ci, creado);
      return { ...creado };
    },

    async actualizar(ci, cambios) {
      const actual = residentes.get(ci);
      if (!actual) return null;
      const actualizado = { ...actual, ...cambios, ci };
      residentes.set(ci, actualizado);
      return { ...actualizado };
    },

    async eliminar(ci) {
      const actual = residentes.get(ci);
      residentes.delete(ci);
      return actual ? { ...actual } : null;
    },

    async resumenPorHabitacion(bloque) {
      const conteo = new Map();
      for (const residente of residentes.values()) {
        if (residente.bloque !== bloque || residente.estado !== 'ACTIVO' || !residente.habitacionCodigo) continue;
        conteo.set(residente.habitacionCodigo, (conteo.get(residente.habitacionCodigo) || 0) + 1);
      }
      return [...conteo.entries()].map(([habitacionCodigo, cantidad]) => ({ habitacionCodigo, cantidad }));
    },
  };

  const repositorioActivos = {
    async listarPorHabitacion(bloque, codigo) {
      return [...activos.values()].filter((a) => a.bloque === bloque && a.habitacionCodigo === codigo).map((a) => ({ ...a }));
    },

    async listarPorBloque(bloque) {
      return [...activos.values()].filter((a) => a.bloque === bloque).map((a) => ({ ...a }));
    },

    async crear(activo) {
      const creado = { ...activo, id: nuevoId('activo') };
      activos.set(creado.id, creado);
      return { ...creado };
    },

    async actualizar(id, cambios) {
      const actual = activos.get(id);
      if (!actual) return null;
      const actualizado = { ...actual, ...cambios };
      activos.set(id, actualizado);
      return { ...actualizado };
    },

    async eliminar(id) {
      const actual = activos.get(id);
      activos.delete(id);
      return actual ? { ...actual } : null;
    },

    async contarConAtencion() {
      return [...activos.values()].filter((a) => a.estado !== 'OPTIMO').length;
    },

    async resumenPorHabitacion(bloque) {
      const conteo = new Map();
      for (const activo of activos.values()) {
        if (activo.bloque !== bloque) continue;
        const registro = conteo.get(activo.habitacionCodigo) || { total: 0, conAtencion: 0 };
        registro.total += 1;
        if (activo.estado !== 'OPTIMO') registro.conAtencion += 1;
        conteo.set(activo.habitacionCodigo, registro);
      }
      return [...conteo.entries()].map(([habitacionCodigo, registro]) => ({ habitacionCodigo, ...registro }));
    },
  };

  const repositorioUsuarios = {
    async buscarPorUsuario(usuario) {
      return usuarios.get(usuario) ? { ...usuarios.get(usuario) } : null;
    },

    async listar() {
      return [...usuarios.values()].map((u) => ({ ...u }));
    },

    async crear(usuario) {
      const creado = { ...usuario, id: nuevoId('usuario') };
      usuarios.set(creado.usuario, creado);
      return { ...creado };
    },

    async actualizar(usuario, cambios) {
      const actual = usuarios.get(usuario);
      if (!actual) return null;
      const actualizado = { ...actual, ...cambios };
      usuarios.set(usuario, actualizado);
      return { ...actualizado };
    },

    async eliminar(usuario) {
      const actual = usuarios.get(usuario);
      usuarios.delete(usuario);
      return actual ? { ...actual } : null;
    },
  };

  const repositorioMovimientos = {
    async registrar(movimiento) {
      const creado = { ...movimiento, id: nuevoId('movimiento') };
      movimientos.push(creado);
      return { ...creado };
    },

    async listar(filtros = {}) {
      let lista = [...movimientos];
      if (filtros.tipo) lista = lista.filter((m) => m.tipo === filtros.tipo);
      if (filtros.texto) {
        const texto = filtros.texto.toUpperCase();
        lista = lista.filter((m) => JSON.stringify(m).toUpperCase().includes(texto));
      }
      if (filtros.salto) lista = lista.slice(filtros.salto);
      if (filtros.limite) lista = lista.slice(0, filtros.limite);
      return lista.map((m) => ({ ...m }));
    },

    async contar(filtros = {}) {
      const lista = await this.listar({ ...filtros, limite: 0, salto: 0 });
      return lista.length;
    },

    async listarPorResidente(ci, limite = 20) {
      return movimientos.filter((m) => m.residenteCi === ci).slice(-limite).map((m) => ({ ...m }));
    },
  };

  return {
    repositorioHabitaciones,
    repositorioResidentes,
    repositorioActivos,
    repositorioUsuarios,
    repositorioMovimientos,
    estado: { habitaciones, residentes, activos, usuarios, movimientos },
  };
}

export function crearCifradoFalso() {
  return {
    async cifrar(contrasena) {
      return `cifrado:${contrasena}`;
    },
    async verificar(contrasena, hash) {
      return hash === `cifrado:${contrasena}`;
    },
  };
}

export function crearServicioTokenFalso() {
  return {
    firmar(datos) {
      return `token:${Buffer.from(JSON.stringify(datos)).toString('base64')}`;
    },
    verificar(token) {
      return JSON.parse(Buffer.from(token.replace('token:', ''), 'base64').toString('utf8'));
    },
    obtenerDeEncabezado(encabezado) {
      if (!encabezado) return null;
      const [tipo, token] = String(encabezado).split(' ');
      return tipo === 'Bearer' ? token : null;
    },
  };
}
