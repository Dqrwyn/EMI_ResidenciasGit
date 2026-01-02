import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";
import PaymentMonthDetail from "./PaymentMonthDetail";
import { PAYMENT_MONTHS, PAYMENT_STATUS, ROOM_PRICES } from "../utils/constants";

const PaymentHistory = ({ paymentHistory, onPaymentUpdate, editable = false, roomType, darkMode, studentId }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const monthlyFee = ROOM_PRICES[roomType];
  
  useEffect(() => {
    const loadAvailableYears = () => {
      try {
        const yearsFromHistory = Object.keys(paymentHistory || {}).map(Number);
        const defaultYears = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4, currentYear + 5];
        const allYears = [...new Set([...yearsFromHistory, ...defaultYears])].sort((a, b) => b - a);
        setAvailableYears(allYears);
      } catch (error) {
        console.error('Error cargando años:', error);
        const defaultYears = [currentYear, currentYear + 1, currentYear + 2];
        setAvailableYears(defaultYears);
      }
    };

    loadAvailableYears();
  }, [paymentHistory, currentYear]);

  const addNewYear = (year) => {
    if (year < 1900 || year > 2100) {
      toast.error('Por favor ingrese un año válido (1900-2100)');
      return;
    }

    if (availableYears.includes(year)) {
      setSelectedYear(year);
      toast.info(`Año ${year} ya existe`);
      return;
    }

    const newYears = [...availableYears, year].sort((a, b) => b - a);
    setAvailableYears(newYears);
    setSelectedYear(year);
    
    const newYearData = {};
    PAYMENT_MONTHS.forEach(month => {
      newYearData[month] = { 
        status: PAYMENT_STATUS.PENDIENTE, 
        invoiceCode: "", 
        invoiceFile: null 
      };
    });

    Object.keys(newYearData).forEach(month => {
      onPaymentUpdate(year, month, newYearData[month]);
    });
    
    toast.success(`Año académico ${year} agregado`);
  };

  const navigateYears = (direction, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const newYear = selectedYear + direction;
    if (!availableYears.includes(newYear)) {
      addNewYear(newYear);
    } else {
      setSelectedYear(newYear);
    }
  };

  const calculateDebt = () => {
    let totalDebt = 0;
    Object.entries(paymentHistory || {}).forEach(([year, months]) => {
      Object.entries(months).forEach(([month, data]) => {
        if (data.status === PAYMENT_STATUS.PENDIENTE || data.status === PAYMENT_STATUS.MOROSO) {
          totalDebt += monthlyFee;
        }
      });
    });
    return totalDebt;
  };

  const totalDebt = calculateDebt();

  const handleInvoiceUpload = (year, month, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onPaymentUpdate(year, month, { 
        ...paymentHistory[year][month], 
        invoiceFile: reader.result 
      });
      toast.success('Factura subida exitosamente');
    };
    reader.readAsDataURL(file);
  };

  const handleYearChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    setShowYearPicker(false);
  };

  const handleAddCustomYear = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setShowYearPicker(false);
    
    setTimeout(() => {
      const newYear = parseInt(prompt('Ingrese el año académico:'));
      if (newYear && !isNaN(newYear)) {
        addNewYear(newYear);
      }
    }, 100);
  };

  return (
    <div className="mt-4 p-4 bg-opacity-20 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(0, 79, 159, 0.1)' : 'rgba(0, 79, 159, 0.05)' }}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          Historial de Pagos
        </h4>
        {totalDebt > 0 && (
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${darkMode ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'}`}>
            Deuda: Bs. {totalDebt}
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
            Año Académico
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => navigateYears(-1, e)}
              className={`p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
              title="Año anterior"
            >
              <FiChevronLeft />
            </button>

            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setShowYearPicker(!showYearPicker)}
                className={`w-full p-2 border rounded flex justify-between items-center ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'} transition-colors`}
              >
                <span>{selectedYear}</span>
                <FiChevronDown className={`transform transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
              </button>

              {showYearPicker && (
                <motion.div 
                  className={`absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto z-50 rounded-lg shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="p-2">
                    {availableYears.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={(e) => handleYearChange(e)}
                        value={year}
                        className={`w-full p-2 text-left rounded hover:bg-blue-100 hover:text-blue-800 transition-colors ${
                          year === selectedYear 
                            ? darkMode 
                              ? 'bg-blue-700 text-white' 
                              : 'bg-blue-500 text-white'
                            : darkMode 
                              ? 'text-gray-300 hover:bg-gray-700' 
                              : 'text-gray-700'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                    
                    <div className="border-t my-2 border-gray-300"></div>
                    
                    <button
                      type="button"
                      onClick={handleAddCustomYear}
                      className={`w-full p-2 text-left rounded flex items-center gap-2 ${
                        darkMode 
                          ? 'text-green-400 hover:bg-gray-700' 
                          : 'text-green-600 hover:bg-gray-100'
                      } transition-colors`}
                    >
                      <FiPlus size={14} />
                      Agregar año personalizado...
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => navigateYears(1, e)}
              className={`p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
              title="Año siguiente"
            >
              <FiChevronRight />
            </button>

            {editable && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newYear = currentYear + 1;
                  if (!availableYears.includes(newYear)) {
                    addNewYear(newYear);
                  } else {
                    setSelectedYear(newYear);
                    toast.info(`Año ${newYear} ya existe`);
                  }
                }}
                className={`p-2 rounded ${darkMode ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-green-600 hover:bg-green-500 text-white'} transition-colors`}
                title="Agregar próximo año"
              >
                <FiPlus />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
        {PAYMENT_MONTHS.map(month => {
          const data = paymentHistory?.[selectedYear]?.[month] || { status: PAYMENT_STATUS.PENDIENTE, invoiceCode: "", invoiceFile: null };
          const getStatusColor = () => {
            switch (data.status) {
              case PAYMENT_STATUS.PAGADO:
                return darkMode ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800 border border-green-300';
              case PAYMENT_STATUS.MOROSO:
                return darkMode ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800 border border-red-300';
              default:
                return darkMode ? 'bg-yellow-700 text-white' : 'bg-yellow-100 text-yellow-800 border border-yellow-300';
            }
          };

          return (
            <div
              key={month}
              className={`p-2 rounded text-center text-xs font-medium transition-all cursor-default ${getStatusColor()}`}
              title={`${month} ${selectedYear}: ${data.status}`}
            >
              {month.substring(0, 3)}
              {data.status === PAYMENT_STATUS.MOROSO && "!"}
              
              {editable && (
                <PaymentMonthDetail 
                  month={month}
                  year={selectedYear}
                  data={data}
                  onUpdate={(newData) => onPaymentUpdate(selectedYear, month, newData)}
                  onInvoiceUpload={(file) => handleInvoiceUpload(selectedYear, month, file)}
                  darkMode={darkMode}
                  monthlyFee={monthlyFee}
                  studentId={studentId}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-between mt-2 text-xs">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-sm mr-1 ${darkMode ? 'bg-green-700' : 'bg-green-100 border border-green-300'}`}></div>
          <span className={darkMode ? 'text-green-400' : 'text-green-600'}>Pagado</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-sm mr-1 ${darkMode ? 'bg-yellow-700' : 'bg-yellow-100 border border-yellow-300'}`}></div>
          <span className={darkMode ? 'text-yellow-400' : 'text-yellow-600'}>Pendiente</span>
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-sm mr-1 ${darkMode ? 'bg-red-700' : 'bg-red-100 border border-red-300'}`}></div>
          <span className={darkMode ? 'text-red-400' : 'text-red-600'}>Moroso</span>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)' }}>
        <h5 className={`text-sm font-medium mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          Resumen {selectedYear}
        </h5>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`text-center p-1 rounded ${darkMode ? 'bg-green-800' : 'bg-green-100'}`}>
            <div className="font-bold">{Object.values(paymentHistory?.[selectedYear] || {}).filter(d => d.status === PAYMENT_STATUS.PAGADO).length}</div>
            <div>Pagados</div>
          </div>
          <div className={`text-center p-1 rounded ${darkMode ? 'bg-yellow-800' : 'bg-yellow-100'}`}>
            <div className="font-bold">{Object.values(paymentHistory?.[selectedYear] || {}).filter(d => d.status === PAYMENT_STATUS.PENDIENTE).length}</div>
            <div>Pendientes</div>
          </div>
          <div className={`text-center p-1 rounded ${darkMode ? 'bg-red-800' : 'bg-red-100'}`}>
            <div className="font-bold">{Object.values(paymentHistory?.[selectedYear] || {}).filter(d => d.status === PAYMENT_STATUS.MOROSO).length}</div>
            <div>Morosos</div>
          </div>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className={`text-center p-1 rounded ${darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
            <div className="font-bold">Bs. {monthlyFee}</div>
            <div>Mensualidad</div>
          </div>
          <div className={`text-center p-1 rounded ${darkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
            <div className="font-bold">Bs. {monthlyFee * 11}</div>
            <div>Total anual</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;