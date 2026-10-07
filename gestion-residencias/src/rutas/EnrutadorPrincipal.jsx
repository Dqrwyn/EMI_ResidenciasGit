// ==========================================================
//  rutas/EnrutadorPrincipal.jsx
// ==========================================================

import { Navigate, Route, Routes } from 'react-router-dom';

import DisposicionPrincipal from './DisposicionPrincipal.jsx';
import RutaProtegida from './RutaProtegida.jsx';

import PaginaInicioSesion from '../caracteristicas/autenticacion/PaginaInicioSesion.jsx';
import PaginaPanel from '../caracteristicas/panel/PaginaPanel.jsx';
import PaginaMapa from '../caracteristicas/mapa/PaginaMapa.jsx';
import PaginaResidentes from '../caracteristicas/residentes/PaginaResidentes.jsx';
import PaginaDatos from '../caracteristicas/datos/PaginaDatos.jsx';
import PaginaActividad from '../caracteristicas/actividad/PaginaActividad.jsx';
import PaginaUsuarios from '../caracteristicas/usuarios/PaginaUsuarios.jsx';

export function EnrutadorPrincipal() {
  return (
    <Routes>
      <Route path="/ingresar" element={<PaginaInicioSesion />} />

      <Route
        element={
          <RutaProtegida>
            <DisposicionPrincipal />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<PaginaPanel />} />
        <Route path="/mapa" element={<PaginaMapa />} />
        <Route path="/residentes" element={<PaginaResidentes />} />
        <Route path="/actividad" element={<PaginaActividad />} />
        <Route path="/datos" element={<PaginaDatos />} />
        <Route
          path="/usuarios"
          element={
            <RutaProtegida soloAdministrador>
              <PaginaUsuarios />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default EnrutadorPrincipal;
