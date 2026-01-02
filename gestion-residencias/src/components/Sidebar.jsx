import React, { useState, useEffect } from "react";
import { FiHome, FiFileText, FiCalendar, FiLogOut, FiMenu } from "react-icons/fi";
import emilogin from "../assets/emilogin.png";

export default function Sidebar({ cerrarSesion }) {
  const [abierto, setAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('mapa');

  useEffect(() => {
    const verificarSiEsMovil = () => {
      const movil = window.innerWidth < 768;
      setEsMovil(movil);
      setAbierto(!movil);
    };
    verificarSiEsMovil();
    window.addEventListener("resize", verificarSiEsMovil);
    return () => window.removeEventListener("resize", verificarSiEsMovil);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['mapa', 'reportes', 'notas'];
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
          setSeccionActiva(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navegarASeccion = (seccionId) => {
    const seccion = document.getElementById(seccionId);
    if (seccion) {
      const offset = 80;
      const elementPosition = seccion.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      window.location.hash = `#${seccionId}`;
      setSeccionActiva(seccionId);
    }
    
    if (esMovil) setAbierto(false);
  };

  const menuItems = [
    { id: 'mapa', icon: <FiHome size={24} />, label: "Mapa" },
    { id: 'reportes', icon: <FiFileText size={24} />, label: "Reportes" },
    { id: 'notas', icon: <FiCalendar size={24} />, label: "Notas" },
  ];

  return (
    <>
      {/* Botón móvil */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="fixed z-50 p-3 rounded-full shadow-lg bg-blue-600 text-white md:hidden"
          style={{ top: 16, left: 16 }}
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Overlay móvil */}
      {abierto && esMovil && (
        <div 
          onClick={() => setAbierto(false)} 
          className="fixed inset-0 bg-black/70 z-40 md:hidden" 
        />
      )}

      {/* Sidebar - Logo grande y limpio */}
      <aside
        className={`fixed md:sticky top-0 z-50 bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 text-white h-screen
          transition-transform duration-300 ease-in-out
          ${abierto ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-72 flex flex-col
          shadow-2xl
        `}
      >
        {/* LOGO GRANDE - Directamente en el sidebar, sin padding superior */}
        <div className="flex justify-center items-center pt-6 pb-4">
          <img
            src={emilogin}
            alt="Universidad EMI"
            className="w-52 h-auto max-h-32 object-contain"
            style={{ 
              filter: "brightness(0) invert(1)"
            }}
          />
        </div>
        
        {/* Navegación */}
        <nav className="flex-1 px-5 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navegarASeccion(item.id)}
              className={`w-full flex items-center gap-4 p-4 mb-2 rounded-xl transition-all ${
                seccionActiva === item.id
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
              {seccionActiva === item.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-yellow-400"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Pie del Sidebar */}
        <div className="mt-auto p-4 border-t border-blue-700">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <FiLogOut size={20} />
            <span className="font-medium">Salir</span>
          </button>
          <div className="text-center pt-4 text-blue-300 text-xs">
            Sistema v2.0
          </div>
        </div>
      </aside>
    </>
  );
}