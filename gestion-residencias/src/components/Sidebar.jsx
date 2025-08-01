import React, { useState, useEffect, useRef } from "react";
import { Home, Map, UserPlus, Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className={`fixed z-50 p-2 rounded-md bg-blue-800 text-white md:hidden ${isMobile ? 'block' : 'hidden'}`}
        style={{ top: '16px', left: '16px' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-40 bg-blue-800 text-white h-full p-4
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isOpen ? 'w-64' : 'w-0 md:w-64 overflow-hidden'}
        `}
      >
        <h2 className="text-2xl font-bold mb-6">Residencias UAT</h2>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => scrollToSection('dashboard')}
            className="flex items-center gap-3 hover:text-blue-300 p-3 rounded hover:bg-blue-700 transition-colors text-left w-full"
          >
            <Home size={20} /> Dashboard
          </button>
          <button 
            onClick={() => scrollToSection('estudiantes')}
            className="flex items-center gap-3 hover:text-blue-300 p-3 rounded hover:bg-blue-700 transition-colors text-left w-full"
          >
            <Map size={20} /> Mapa Habitaciones de Estudiantes
          </button>
          <button 
            onClick={() => scrollToSection('administrativos')}
            className="flex items-center gap-3 hover:text-blue-300 p-3 rounded hover:bg-blue-700 transition-colors text-left w-full"
          >
            <UserPlus size={20} /> Mapa Habitaciones de Administrativos y Militares
          </button>
        </nav>
      </div>

      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}