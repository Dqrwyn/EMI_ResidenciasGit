// src/layout/LayoutPrincipal.jsx
import React, { useState, useEffect } from "react";
import { 
  FiHome, 
  FiFileText, 
  FiCalendar,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMenu
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import emilogin from "../assets/02.png";

const LayoutPrincipal = ({ children, cerrarSesion, modoOscuro, alternarModoOscuro }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('mapa');

  const menuItems = [
    { 
      id: 'mapa', 
      icon: <FiHome size={20} />, 
      label: "Mapa de Habitaciones",
      hash: '#mapa'
    },
    { 
      id: 'reportes', 
      icon: <FiFileText size={20} />, 
      label: "Sistema de Reportes",
      hash: '#reportes'
    },
    { 
      id: 'notas', 
      icon: <FiCalendar size={20} />, 
      label: "Notas de Servicio",
      hash: '#notas'
    },
  ];

  useEffect(() => {
    // Ajustar sidebar en dispositivos móviles
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarAbierto(false);
      } else {
        setSidebarAbierto(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detectar sección activa basada en scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['mapa', 'reportes', 'notas'];
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
          setSeccionActiva(sections[i]);
          window.location.hash = `#${sections[i]}`;
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Función para navegar a secciones
  const navegarASeccion = (hash) => {
    if (window.innerWidth < 768) {
      setSidebarAbierto(false);
    }
    
    window.location.hash = hash;
  };

  return (
    <div className={`flex min-h-screen ${modoOscuro ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Botón móvil para abrir sidebar - SOLO MENÚ */}
      {!sidebarAbierto && (
        <button
          onClick={() => setSidebarAbierto(true)}
          className={`fixed top-4 left-4 z-50 md:hidden p-3 rounded-full shadow-lg ${
            modoOscuro ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
          }`}
        >
          <FiMenu size={20} />
        </button>
      )}

      {/* Overlay para móviles - CIERRA AL TOCAR FUERA */}
      <AnimatePresence>
        {sidebarAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarAbierto(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - FIJO Y ESTÁTICO */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarAbierto ? 0 : -280,
          width: sidebarAbierto ? 280 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:sticky md:top-0 h-screen bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 text-white shadow-2xl z-40 flex flex-col overflow-y-auto"
        style={{
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
        }}
      >
        {/* ENCABEZADO - SOLO LOGO GRANDE */}
        <div className="pt-8 pb-4 flex justify-center">
          <img
            src={emilogin}
            alt="Logo Universidad EMI"
            className="w-48 h-auto object-contain"
            style={{ 
              maxWidth: "200px"
            }}
          />
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3 px-2">
              Navegación
            </h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => navegarASeccion(item.hash)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      seccionActiva === item.id
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                    }`}
                  >
                    <span className="text-blue-200">
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm">{item.label}</span>
                    {seccionActiva === item.id && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-yellow-400"></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          
        </nav>

        {/* Pie del Sidebar */}
        <div className="mt-auto p-4 border-t border-blue-700 space-y-3">
          {/* Botón modo oscuro/claro */}
          <button
            onClick={alternarModoOscuro}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl transition-colors bg-blue-600 hover:bg-blue-700 text-white"
          >
            {modoOscuro ? (
              <>
                <FiSun size={18} />
                <span className="font-medium">Modo Claro</span>
              </>
            ) : (
              <>
                <FiMoon size={18} />
                <span className="font-medium">Modo Oscuro</span>
              </>
            )}
          </button>
          
          {/* Botón cerrar sesión */}
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl transition-colors bg-red-500 hover:bg-red-600 text-white"
          >
            <FiLogOut size={18} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
          
          {/* Información de usuario */}

        </div>
      </motion.aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto h-screen">
        <div className="min-h-screen pb-20">
          {children}
        </div>
        
        {/* Footer */}
        <footer className={`fixed bottom-0 left-0 right-0 p-4 text-center ${modoOscuro ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
          <p className="text-sm">
            © {new Date().getFullYear()} Sistema de Gestión de Residencias - Escuela Militar de Ingeniería
          </p>
          <p className="text-xs mt-1">
            Unidad Académica del Trópico • Todos los derechos reservados
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LayoutPrincipal;