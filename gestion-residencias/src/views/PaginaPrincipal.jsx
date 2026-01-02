// src/views/PaginaPrincipal.jsx
import React, { useEffect } from "react";
import MapaHabitaciones from "./MapaHabitaciones";
import SistemaReportes from "../SistemaReportes";
import GeneradorNotasServicio from "../GeneradorNotasServicio";

const PaginaPrincipal = ({ modoOscuro, alternarModoOscuro }) => {
  
  // Efecto para manejar el scroll a secciones basado en hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const offset = 80; // Ajuste para el header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    };

    // Ejecutar al cargar si hay hash
    setTimeout(handleHashChange, 100);
    
    // Escuchar cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* SECCIÓN 1: Mapa de Habitaciones */}
      <section id="mapa" className="scroll-mt-20">
        <div className="mb-6">
          <h2 className={`text-2xl md:text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} mb-2 text-center`}>
            Mapa de Habitaciones
          </h2>
          <div className={`h-1 w-20 md:w-24 ${modoOscuro ? 'bg-yellow-500' : 'bg-blue-500'} mx-auto`} />
        </div>
        <MapaHabitaciones 
          modoOscuro={modoOscuro} 
          alternarModoOscuro={alternarModoOscuro} 
        />
      </section>

      {/* SECCIÓN 2: Sistema de Reportes */}
      <section id="reportes" className="scroll-mt-20">
        <div className="mb-6">
          <h2 className={`text-2xl md:text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} mb-2 text-center`}>
            Sistema de Reportes
          </h2>
          <div className={`h-1 w-20 md:w-24 ${modoOscuro ? 'bg-yellow-500' : 'bg-blue-500'} mx-auto`} />
        </div>
        <SistemaReportes modoOscuro={modoOscuro} />
      </section>

      {/* SECCIÓN 3: Notas de Servicio */}
      <section id="notas" className="scroll-mt-20">
        <div className="mb-6">
          <h2 className={`text-2xl md:text-3xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} mb-2 text-center`}>
            Generador de Notas de Servicio
          </h2>
          <div className={`h-1 w-20 md:w-24 ${modoOscuro ? 'bg-yellow-500' : 'bg-blue-500'} mx-auto`} />
        </div>
        <GeneradorNotasServicio modoOscuro={modoOscuro} />
      </section>
    </div>
  );
};

export default PaginaPrincipal;