import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiDownload } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { PAYMENT_STATUS } from "../utils/constants";

const PaymentMonthDetail = ({ month, year, data, onUpdate, onInvoiceUpload, darkMode, monthlyFee, studentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleStatusChange = (newStatus) => {
    onUpdate({ ...data, status: newStatus });
    toast.success('Estado de pago actualizado');
  };

  const handleInvoiceCodeChange = (code) => {
    onUpdate({ ...data, invoiceCode: code });
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onInvoiceUpload(file);
    }
  };

  return (
    <>
      <button 
        onClick={handleButtonClick}
        className="mt-1 text-xs underline hover:no-underline focus:outline-none"
        type="button"
      >
        Detalles
      </button>
      
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            className={`rounded-xl shadow-2xl w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={handleModalClick}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Pago de {month} {year}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                type="button"
              >
                <FiX />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                  Estado de Pago
                </label>
                <select
                  value={data.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
                >
                  <option value={PAYMENT_STATUS.PAGADO}>Pagado</option>
                  <option value={PAYMENT_STATUS.PENDIENTE}>Pendiente</option>
                  <option value={PAYMENT_STATUS.MOROSO}>Moroso</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                  Código de Factura
                </label>
                <input
                  type="text"
                  value={data.invoiceCode}
                  onChange={(e) => handleInvoiceCodeChange(e.target.value)}
                  placeholder="Ej: NIT:1263123-001"
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                  Subir Factura (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-blue-300'}`}
                />
                {data.invoiceFile && (
                  <div className="mt-2 flex items-center">
                    <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Factura subida</span>
                    <a 
                      href={data.invoiceFile} 
                      download={`factura-${month}-${year}.pdf`}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <FiDownload />
                    </a>
                  </div>
                )}
              </div>
              
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                  <span className="font-medium">Monto a pagar:</span> Bs. {monthlyFee}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>
                  Vencimiento: 5 de cada mes
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2 rounded font-medium ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                type="button"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default PaymentMonthDetail;