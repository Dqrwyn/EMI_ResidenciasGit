import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiSearch, FiArrowRight } from "react-icons/fi";
import { calculateStudentDebt, ROOM_PRICES, ROOM_TYPES } from "../utils/constants";

const SearchSystem = ({ roomsData, isOpen, onClose, darkMode, onRoomSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  if (!isOpen) return null;

  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const results = [];
    
    Object.entries(roomsData).forEach(([roomId, roomData]) => {
      if (roomData.students) {
        roomData.students.forEach(student => {
          if (
            student.name.toLowerCase().includes(term.toLowerCase()) ||
            student.ci.includes(term)
          ) {
            const roomParts = roomId.split('-');
            const building = roomParts[0];
            const floor = roomParts[1];
            const side = roomParts[2];
            const roomNumber = roomParts[3];
            
            results.push({
              ...student,
              roomId,
              building,
              floor,
              side,
              roomNumber,
              roomType: roomId.includes('Individual') || parseInt(roomId.split('-').pop()) <= 4 ? 'INDIVIDUAL' : 'SHARED'
            });
          }
        });
      }
    });
    
    setSearchResults(results);
  };

  const handleGoToRoom = (roomId) => {
    const roomParts = roomId.split('-');
    const building = roomParts[0];
    const floor = roomParts[1];
    const side = roomParts[2];
    const roomNumber = roomParts[3];
    
    const room = {
      id: roomId,
      type: roomId.includes('Individual') || parseInt(roomNumber) <= 4 ? ROOM_TYPES.INDIVIDUAL : ROOM_TYPES.SHARED,
      label: `${building}-${floor}`,
      number: roomNumber,
    };
    
    onClose();
    
    setTimeout(() => {
      onRoomSelect(room);
      
      const estudiantesSection = document.getElementById('estudiantes-section');
      if (estudiantesSection) {
        estudiantesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={`rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Sistema de Búsqueda
            </h2>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <FiX />
            </button>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
              Buscar por Nombre o CI
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ingrese nombre o cédula de identidad..."
                className={`w-full p-3 pl-10 border rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
              />
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((student, index) => (
                  <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
                    <div className="flex items-start">
                      {student.photo && (
                        <img src={student.photo} alt={student.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-blue-800'}`}>{student.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>CI: {student.ci} | Celular: {student.cellphone}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>{student.career} - {student.semester}</p>
                        
                        <div className={`mt-2 p-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                          <h4 className={`font-medium ${darkMode ? 'text-yellow-400' : 'text-blue-800'} mb-1`}>Información del Cuarto</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Edificio:</span> 
                              <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.building}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Piso:</span> 
                              <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.floor}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lado:</span> 
                              <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.side}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Número:</span> 
                              <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.roomNumber}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tipo:</span> 
                              <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{student.roomType === 'INDIVIDUAL' ? 'Individual' : 'Compartida'}</span>
                            </div>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Precio:</span> 
                              <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Bs. {student.roomType === 'INDIVIDUAL' ? ROOM_PRICES.INDIVIDUAL : ROOM_PRICES.SHARED}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleGoToRoom(student.roomId)}
                            className={`mt-3 flex items-center gap-2 px-3 py-1 rounded ${darkMode ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-blue-900'} transition-colors`}
                          >
                            <FiArrowRight size={14} />
                            <span className="text-sm">Ir a información del cuarto</span>
                          </button>
                        </div>
                        
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>Tutor: {student.tutorName} - {student.tutorCellphone}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>Ingreso: {student.admissionDate}</p>
                        {student.observation && (
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>Observación: {student.observation}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className={`text-sm font-medium ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Deuda actual: Bs. {calculateStudentDebt(student, student.roomType)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No se encontraron resultados para "{searchTerm}"
              </p>
            ) : (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Ingrese al menos 2 caracteres para buscar
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchSystem;