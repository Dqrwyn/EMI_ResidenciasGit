// src/App.jsx
import React, { useState, useEffect } from "react";
import LayoutPrincipal from "./layout/LayoutPrincipal";
import PaginaPrincipal from "./views/PaginaPrincipal"; // NUEVO COMPONENTE
import InicioSesion from "./views/InicioSesion";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(() => {
    const preferenciaGuardada = localStorage.getItem("modoOscuro");
    return preferenciaGuardada ? JSON.parse(preferenciaGuardada) : false;
  });

  useEffect(() => {
    const tokenValido = localStorage.getItem("tokenValido");
    if (tokenValido === "true") {
      setAutenticado(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("modoOscuro", JSON.stringify(modoOscuro));
    if (modoOscuro) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [modoOscuro]);

  const manejarInicioSesionExitoso = () => {
    localStorage.setItem("tokenValido", "true");
    setAutenticado(true);
  };

  const alternarModoOscuro = () => {
    setModoOscuro(!modoOscuro);
  };

  const manejarCerrarSesion = () => {
    localStorage.removeItem("tokenValido");
    setAutenticado(false);
  };

  return (
    <div className={modoOscuro ? "dark" : ""}>
      <Toaster position="top-right" />
      
      {autenticado ? (
        <LayoutPrincipal
          cerrarSesion={manejarCerrarSesion}
          modoOscuro={modoOscuro}
          alternarModoOscuro={alternarModoOscuro}
        >
          {/* USAMOS UN SOLO COMPONENTE QUE CONTIENE TODAS LAS SECCIONES */}
          <PaginaPrincipal modoOscuro={modoOscuro} alternarModoOscuro={alternarModoOscuro} />
        </LayoutPrincipal>
      ) : (
        <InicioSesion
          onInicioSesionExitoso={manejarInicioSesionExitoso}
          modoOscuro={modoOscuro}
        />
      )}
    </div>
  );
}