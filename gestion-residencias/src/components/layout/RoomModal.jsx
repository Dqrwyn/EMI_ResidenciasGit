import React from "react";
import { motion } from "framer-motion";
import { FiX, FiEdit2, FiSave, FiTrash2 } from "react-icons/fi";
import { COLOR_PALETTE } from "../utils/constants.js";

const RoomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  editMode, 
  onToggleEdit, 
  darkMode,
  roomInfo,
  onToggleOccupied,
  onClearRoom,
  onSubmit,
  showSubmitButton = true
}) => {
  if (!isOpen) return null;

  const themeClasses = {
    modalBg: darkMode ? "bg-gray-800" : "bg-white",
    text: darkMode ? "text-gray-100" : "text-gray-800",
    cardBg: darkMode ? "bg-gray-700" : COLOR_PALETTE.primary.light,
    cardBorder: darkMode ? "border-gray-700" : `border-[${COLOR_PALETTE.primary.main}]`,
    inputBg: darkMode ? "bg-gray-700 text-white" : "bg-white",
    inputBorder: darkMode ? "border-gray-600" : `border-[${COLOR_PALETTE.primary.main}]`,
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={`${themeClasses.modalBg} rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-6xl max-h-[90vh] overflow-y-auto`}
        style={{ borderTop: `4px solid ${COLOR_PALETTE.secondary.main}` }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
      >
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-start mb-3 md:mb-4">
            <div>
              <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? `text-[${COLOR_PALETTE.secondary.main}]` : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                {title}
                {editMode && <span className="text-sm ml-2 text-yellow-600">(Editando)</span>}
              </h2>
              {roomInfo && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-x-4 md:gap-y-2 mt-1 md:mt-2">
                  <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                    <span className="font-medium">Número:</span>{" "}
                    <span className="font-semibold">
                      {roomInfo.label}-{roomInfo.number}
                    </span>
                  </p>
                  <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                    <span className="font-medium">Tipo:</span>{" "}
                    <span className="font-semibold">{roomInfo.type}</span>
                  </p>
                  <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                    <span className="font-medium">Estado:</span>{" "}
                    <span className={`font-semibold ${
                      roomInfo.isOccupied 
                        ? `text-[${COLOR_PALETTE.secondary.main}]` 
                        : "text-green-500"
                    }`}>
                      {roomInfo.isOccupied ? "Ocupado" : "Disponible"}
                    </span>
                  </p>
                  {roomInfo.price && (
                    <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                      <span className="font-medium">Precio:</span>{" "}
                      <span className="font-semibold">
                        Bs. {roomInfo.price}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {onToggleEdit && (
                <button 
                  onClick={onToggleEdit}
                  className={`p-2 rounded-full ${editMode ? 'bg-yellow-100 text-yellow-800' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                  title={editMode ? "Cancelar edición" : "Editar información"}
                >
                  <FiEdit2 />
                </button>
              )}
              <button 
                onClick={onClose}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                title="Cerrar"
              >
                <FiX />
              </button>
            </div>
          </div>

          {children}

          {editMode && onToggleOccupied && onClearRoom && (
            <div className="flex flex-wrap justify-between items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-blue-200">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onToggleOccupied}
                  className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                    roomInfo?.isOccupied
                       ? "bg-yellow-500 hover:bg-yellow-600 text-blue-900"
                       : "bg-blue-600 hover:bg-blue-700 text-white"

                  } transition-colors`}
                >
                  {roomInfo?.isOccupied ? "Marcar Disponible" : "Marcar Ocupado"}
                </button>
                <button
                  type="button"
                  onClick={onClearRoom}
                  className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                    darkMode 
                      ? "bg-red-700 hover:bg-red-600 text-white" 
                      : "bg-red-200 hover:bg-red-300 text-red-800"
                  } transition-colors flex items-center gap-1`}
                >
                  <FiTrash2 /> Vaciar
                </button>
              </div>

              {showSubmitButton && onSubmit && (
                <div className="flex gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-3 py-1 md:px-4 md:py-2 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded font-medium text-sm md:text-base transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    onClick={onSubmit}
                    className={`px-3 py-1 md:px-4 md:py-2 flex items-center gap-1 ${darkMode ? `bg-yellow-600 hover:bg-yellow-700` : `bg-yellow-500 hover:bg-yellow-600`} text-white rounded font-medium text-sm md:text-base transition-colors`}
                  >
                    <FiSave /> Guardar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoomModal;