// ==========================================================
//  rutas/DisposicionPrincipal.jsx
//  Marco de todas las pantallas con sesion iniciada.
//  En celular agrega una barra inferior para navegar con el
//  pulgar entre las cuatro areas de trabajo.
// ==========================================================

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Building2, FileSpreadsheet, LayoutDashboard, Users } from 'lucide-react';

import BarraLateral from '../componentesComunes/BarraLateral.jsx';
import Encabezado from '../componentesComunes/Encabezado.jsx';

const ENLACES_INFERIORES = [
  { a: '/', etiqueta: 'Panel', Icono: LayoutDashboard, exacto: true },
  { a: '/mapa', etiqueta: 'Mapa', Icono: Building2 },
  { a: '/residentes', etiqueta: 'Personas', Icono: Users },
  { a: '/datos', etiqueta: 'Datos', Icono: FileSpreadsheet },
];

export function DisposicionPrincipal() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const ubicacion = useLocation();

  useEffect(() => {
    setMenuAbierto(false);
  }, [ubicacion.pathname]);

  const titulos = {
    '/': { titulo: 'Panel general', subtitulo: 'Resumen de ocupacion, residentes y activos' },
    '/mapa': { titulo: 'Mapa de habitaciones', subtitulo: 'Varones, damas, departamentos pequenos, grandes y direccion' },
    '/residentes': { titulo: 'Residentes', subtitulo: 'Busque por CI, edite datos y cambie de habitacion' },
    '/actividad': { titulo: 'Movimientos', subtitulo: 'Historial de ingresos, cambios y retiros' },
    '/datos': { titulo: 'Importar y exportar', subtitulo: 'Los tres formatos de Excel de la residencia' },
    '/usuarios': { titulo: 'Usuarios', subtitulo: 'Cuentas con acceso al sistema' },
  };

  const encabezado = titulos[ubicacion.pathname] || { titulo: 'Residencias EMI', subtitulo: '' };

  return (
    <div className="flex min-h-screen bg-emi-gris">
      <BarraLateral abierta={menuAbierto} alCerrar={() => setMenuAbierto(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Encabezado titulo={encabezado.titulo} subtitulo={encabezado.subtitulo} alAbrirMenu={() => setMenuAbierto(true)} />

        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>

        <footer className="hidden border-t border-emi-grisBorde bg-white px-6 py-4 text-center text-xs text-slate-400 lg:block">
          Escuela Militar de Ingenieria - Sistema de Gestion de Residencias - {new Date().getFullYear()}
        </footer>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-emi-grisBorde bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1">
          {ENLACES_INFERIORES.map(({ a, etiqueta, Icono, exacto }) => (
            <NavLink
              key={a}
              to={a}
              end={exacto}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-emi-azul' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-7 w-12 items-center justify-center rounded-full transition ${isActive ? 'bg-emi-azulClaro' : ''}`}>
                    <Icono size={18} />
                  </span>
                  {etiqueta}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default DisposicionPrincipal;
