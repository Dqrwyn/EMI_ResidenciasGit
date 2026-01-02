import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export default function BarraNavegacion({ modoOscuro, alternarModoOscuro }) {
  return (
    <div className={`${modoOscuro ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow px-6 py-4 flex justify-between items-center transition-colors duration-300`}>
      <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Sistema de Gestion de Residencias</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={alternarModoOscuro}
          className={`p-2 rounded-full ${modoOscuro ? 'bg-yellow-400 text-gray-900' : 'bg-gray-200 text-gray-700'} transition-colors`}
          title={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {modoOscuro ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}