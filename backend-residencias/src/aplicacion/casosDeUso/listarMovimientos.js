// ==========================================================
//  aplicacion/casosDeUso/listarMovimientos.js
//  Historial (auditoria) con filtros de fecha, tipo y texto.
// ==========================================================

export function crearListarMovimientos({ repositorioMovimientos }) {
  return async function listarMovimientos(filtrosEntrada = {}) {
    const pagina = Math.max(Number.parseInt(filtrosEntrada.pagina, 10) || 1, 1);
    const limite = Math.min(Math.max(Number.parseInt(filtrosEntrada.limite, 10) || 25, 1), 200);

    const filtros = {
      tipo: filtrosEntrada.tipo || null,
      texto: filtrosEntrada.texto ? String(filtrosEntrada.texto).trim() : '',
      desde: filtrosEntrada.desde || null,
      hasta: filtrosEntrada.hasta || null,
      pagina,
      limite,
      salto: (pagina - 1) * limite,
    };

    const [movimientos, total] = await Promise.all([
      repositorioMovimientos.listar(filtros),
      repositorioMovimientos.contar(filtros),
    ]);

    return {
      movimientos,
      total,
      pagina,
      limite,
      paginas: Math.max(Math.ceil(total / limite), 1),
    };
  };
}
