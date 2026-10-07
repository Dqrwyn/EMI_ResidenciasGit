// ==========================================================
//  App.jsx
//  Orden de los proveedores:
//    avisos -> autenticacion -> catalogo -> rutas
// ==========================================================

import { ProveedorAvisos } from './contexto/ContextoAvisos.jsx';
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion.jsx';
import { ProveedorCatalogo } from './contexto/ContextoCatalogo.jsx';
import EnrutadorPrincipal from './rutas/EnrutadorPrincipal.jsx';

export default function App() {
  return (
    <ProveedorAvisos>
      <ProveedorAutenticacion>
        <ProveedorCatalogo>
          <EnrutadorPrincipal />
        </ProveedorCatalogo>
      </ProveedorAutenticacion>
    </ProveedorAvisos>
  );
}
