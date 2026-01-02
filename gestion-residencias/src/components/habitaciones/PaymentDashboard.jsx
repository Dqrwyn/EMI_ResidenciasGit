import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiSearch } from "react-icons/fi";
import { PAYMENT_STATUS, PAYMENT_MONTHS, ROOM_PRICES, ACADEMIC_YEARS } from "../utils/constants";
import { calculateStudentDebt, countPendingMonths } from "../utils/constants";

const PaymentDashboard = ({ roomsData, isOpen, onClose, darkMode }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!isOpen) return null;

  const allStudents = [];
  Object.entries(roomsData).forEach(([roomId, roomData]) => {
    if (roomData.students) {
      const roomType = roomId.includes('Individual') || parseInt(roomId.split('-').pop()) <= 4 ? 'INDIVIDUAL' : 'SHARED';
      
      roomData.students.forEach(student => {
        const debt = calculateStudentDebt(student, roomType);
        const pendingMonths = countPendingMonths(student, selectedYear);
        
        if (
          (filterStatus === 'TODOS') ||
          (filterStatus === 'CON_DEUDA' && debt > 0) ||
          (filterStatus === 'MOROSOS' && student.paymentHistory?.[selectedYear] && 
            Object.values(student.paymentHistory[selectedYear]).some(d => d.status === PAYMENT_STATUS.MOROSO))
        ) {
          if (
            searchTerm === '' ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.ci.includes(searchTerm)
          ) {
            allStudents.push({ 
              ...student, 
              debt,
              pendingMonths,
              roomId,
              roomType
            });
          }
        }
      });
    }
  });

  allStudents.sort((a, b) => b.debt - a.debt);

  return (
    <motion.div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={`rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Dashboard de Pagos
            </h2>
            <button 
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <FiX />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                Año Académico
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
              >
                {ACADEMIC_YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                Estado de Pago
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
              >
                <option value="TODOS">Todos los estudiantes</option>
                <option value="CON_DEUDA">Solo con deuda</option>
                <option value="MOROSOS">Solo morosos</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                Buscar (Nombre or CI)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className={`w-full p-2 pl-9 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            <table className="w-full">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className="p-3 text-left">Estudiante</th>
                  <th className="p-3 text-left">CI</th>
                  <th className="p-3 text-left">Habitación</th>
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-center">Meses Pendientes</th>
                  <th className="p-3 text-right">Deuda Total</th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map((student, index) => (
                  <tr key={student.id} className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-800' : 'bg-gray-50') : (darkMode ? 'bg-gray-700' : 'bg-white')}`}>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3">{student.ci}</td>
                    <td className="p-3">{student.roomId}</td>
                    <td className="p-3">{student.roomType === 'INDIVIDUAL' ? 'Individual' : 'Compartida'}</td>
                    <td className="p-3 text-center">
                      {student.pendingMonths}/{PAYMENT_MONTHS.length}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      Bs. {student.debt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
              Resumen General
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {allStudents.length}
                </div>
                <div className="text-sm">Total Estudiantes</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Bs. {allStudents.reduce((sum, student) => sum + student.debt, 0)}
                </div>
                <div className="text-sm">Deuda Total</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {allStudents.filter(s => s.debt > 0).length}
                </div>
                <div className="text-sm">Con Deuda</div>
              </div>
              <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {allStudents.filter(s => 
                    s.paymentHistory?.[selectedYear] && 
                    Object.values(s.paymentHistory[selectedYear]).some(d => d.status === PAYMENT_STATUS.MOROSO)
                  ).length}
                </div>
                <div className="text-sm">Morosos</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentDashboard;