// src/SistemaReportes.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiFileText, FiBarChart2, FiUsers, FiUserCheck, FiDollarSign, FiCalendar, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";

const SistemaReportes = ({ modoOscuro }) => {
  const [generandoReporte, setGenerandoReporte] = useState(false);
  const [tipoReporte, setTipoReporte] = useState('completo');
  const [formatoReporte, setFormatoReporte] = useState('excel');
  const [anoReporte, setAnoReporte] = useState(new Date().getFullYear());

  const clasesTema = {
    fondo: modoOscuro ? "bg-gray-800" : "bg-white",
    texto: modoOscuro ? "text-gray-100" : "text-gray-800",
    tarjetaFondo: modoOscuro ? "bg-gray-700" : "bg-blue-50",
    borde: modoOscuro ? "border-gray-600" : "border-blue-200",
    botonPrincipal: modoOscuro ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600",
    botonSecundario: modoOscuro ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"
  };

  const generarReporte = async () => {
    if (generandoReporte) return;
    
    setGenerandoReporte(true);
    toast.loading('Generando reporte...');
    
    try {
      // URL CORREGIDA - Usando parámetros correctos
      const url = `http://localhost:3001/api/reportes/${formatoReporte}?tipo=${tipoReporte}&ano=${anoReporte}`;
      console.log('🔗 Solicitando reporte:', url);
      
      const respuesta = await fetch(url);
      
      if (!respuesta.ok) {
        const errorText = await respuesta.text();
        console.error('❌ Error respuesta:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`Error ${respuesta.status}: ${errorJson.mensaje || errorJson.message}`);
        } catch {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
      }
      
      // Verificar tipo de contenido
      const contentType = respuesta.headers.get('content-type');
      
      if (!contentType) {
        throw new Error('No se pudo determinar el tipo de archivo');
      }

      // Obtener el blob
      const blob = await respuesta.blob();
      
      if (blob.size === 0) {
        throw new Error('El archivo generado está vacío');
      }
      
      // Crear URL para descarga
      const urlDescarga = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = urlDescarga;
      
      // Obtener nombre del archivo
      const contentDisposition = respuesta.headers.get('Content-Disposition');
      let nombreArchivo = `reporte_${tipoReporte}_${anoReporte}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          nombreArchivo = filenameMatch[1];
        } else {
          const extension = formatoReporte === 'excel' ? '.xlsx' : '.pdf';
          nombreArchivo += extension;
        }
      } else {
        const extension = formatoReporte === 'excel' ? '.xlsx' : '.pdf';
        nombreArchivo += extension;
      }
      
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      
      // Limpiar
      window.URL.revokeObjectURL(urlDescarga);
      document.body.removeChild(enlace);
      
      toast.dismiss();
      toast.success(`✅ Reporte "${tipoReporte}" generado exitosamente`);
      
    } catch (error) {
      console.error('❌ Error detallado generando reporte:', error);
      toast.dismiss();
      toast.error(`❌ ${error.message || 'Error al generar el reporte'}`);
    } finally {
      setGenerandoReporte(false);
    }
  };

  const opcionesReporte = [
    {
      id: 'completo',
      nombre: 'Reporte Completo',
      descripcion: 'Incluye estudiantes y personal administrativo',
      icono: <FiBarChart2 className="text-blue-500" size={24} />,
      color: 'blue',
      campos: ['Nombre', 'CI', 'Celular', 'Habitacion/Area', 'Carrera/Cargo', 'Semestre', 'Fecha Ingreso', 'Observaciones']
    },
    {
      id: 'estudiantes',
      nombre: 'Solo Estudiantes',
      descripcion: 'Listado completo con todos los datos de estudiantes',
      icono: <FiUsers className="text-green-500" size={24} />,
      color: 'green',
      campos: ['Nombre', 'CI', 'Celular', 'Carrera', 'Semestre', 'Codigo', 'Habitacion', 'Tipo Habitacion', 'Tutor', 'Fecha Ingreso', 'Observaciones']
    },
    {
      id: 'personal',
      nombre: 'Solo Personal',
      descripcion: 'Listado del personal administrativo y militar',
      icono: <FiUserCheck className="text-purple-500" size={24} />,
      color: 'purple',
      campos: ['Nombre', 'CI', 'Cargo', 'Departamento', 'Celular', 'Email', 'Area', 'Observaciones']
    },
    {
      id: 'pagos',
      nombre: 'Reporte de Pagos',
      descripcion: 'Estado de pagos mensuales con códigos de factura y total de deudas',
      icono: <FiDollarSign className="text-yellow-500" size={24} />,
      color: 'yellow',
      campos: ['Nombre', 'CI', 'Carrera', 'Tipo Habitacion', 'Habitacion', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Total Deudas']
    }
  ];

  const formatosDisponibles = [
    { 
      id: 'excel', 
      nombre: 'Excel (.xlsx)', 
      icono: '📊', 
      descripcion: 'Formato editable para análisis detallado',
      recomendado: true 
    },
    { 
      id: 'pdf', 
      nombre: 'PDF (.pdf)', 
      icono: '📄', 
      descripcion: 'Formato para impresión y presentación',
      recomendado: false 
    }
  ];

  const anosDisponibles = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  const reporteSeleccionado = opcionesReporte.find(r => r.id === tipoReporte);

  return (
    <div id="reportes" className={`min-h-screen p-4 md:p-6 ${clasesTema.fondo}`}>
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className={`text-3xl md:text-4xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'} mb-3`}>
            Sistema de Reportes
          </h1>
          <p className={`text-lg ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
            Genera reportes completos del sistema de residencias universitarias
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Panel de selección de tipo de reporte */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl shadow-lg ${clasesTema.tarjetaFondo} border ${clasesTema.borde} lg:col-span-2`}
          >
            <h3 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${modoOscuro ? 'text-blue-300' : 'text-blue-700'}`}>
              <FiFileText className="text-blue-500" />
              Selecciona el Tipo de Reporte
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opcionesReporte.map((opcion) => (
                <motion.div
                  key={opcion.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-5 rounded-xl cursor-pointer transition-all border-2 ${
                    tipoReporte === opcion.id
                      ? modoOscuro 
                        ? 'border-blue-500 bg-blue-900/20 shadow-lg' 
                        : 'border-blue-500 bg-blue-100 shadow-lg'
                      : modoOscuro 
                        ? 'border-gray-600 hover:border-gray-500 hover:shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setTipoReporte(opcion.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
                      {opcion.icono}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-2 ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                        {opcion.nombre}
                      </h4>
                      <p className={`text-sm ${modoOscuro ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        {opcion.descripcion}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {opcion.campos.slice(0, 3).map((campo, idx) => (
                          <span 
                            key={idx}
                            className={`text-xs px-2 py-1 rounded ${
                              modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {campo}
                          </span>
                        ))}
                        {opcion.campos.length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            modoOscuro ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            +{opcion.campos.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      tipoReporte === opcion.id 
                        ? 'bg-blue-500 text-white' 
                        : modoOscuro 
                          ? 'bg-gray-600' 
                          : 'bg-gray-300'
                    }`}>
                      {tipoReporte === opcion.id && '✓'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Panel de configuración */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl shadow-lg ${clasesTema.tarjetaFondo} border ${clasesTema.borde}`}
          >
            <h3 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${modoOscuro ? 'text-green-300' : 'text-green-700'}`}>
              <FiDownload className="text-green-500" />
              Configuración del Reporte
            </h3>
            
            <div className="space-y-6">
              {/* Año del reporte */}
              <div>
                <label className={`block text-sm font-semibold mb-3 flex items-center gap-2 ${modoOscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                  <FiCalendar className="text-blue-500" size={16} />
                  Año del Reporte
                </label>
                <select
                  value={anoReporte}
                  onChange={(e) => setAnoReporte(parseInt(e.target.value))}
                  className={`w-full p-3 rounded-lg border ${
                    modoOscuro 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {anosDisponibles.map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>

              {/* Formato de salida */}
              <div>
                <label className={`block text-sm font-semibold mb-3 ${modoOscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                  Formato de Salida
                </label>
                <div className="space-y-3">
                  {formatosDisponibles.map((formato) => (
                    <motion.div
                      key={formato.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        formatoReporte === formato.id
                          ? modoOscuro 
                            ? 'border-green-500 bg-green-900/20 shadow-md' 
                            : 'border-green-500 bg-green-100 shadow-md'
                          : modoOscuro 
                            ? 'border-gray-600 hover:border-gray-500' 
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormatoReporte(formato.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{formato.icono}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${modoOscuro ? 'text-white' : 'text-gray-800'}`}>
                              {formato.nombre}
                            </span>
                            {formato.recomendado && (
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                modoOscuro ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                              }`}>
                                Recomendado
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formato.descripcion}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          formatoReporte === formato.id 
                            ? 'bg-green-500 text-white' 
                            : modoOscuro 
                              ? 'bg-gray-600' 
                              : 'bg-gray-300'
                        }`}>
                          {formatoReporte === formato.id && '✓'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Botón de generación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generarReporte}
            disabled={generandoReporte}
            className={`px-10 py-4 rounded-xl text-white font-bold text-lg transition-all ${
              generandoReporte
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
            } flex items-center gap-4 mx-auto`}
          >
            {generandoReporte ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Generando Reporte...
              </>
            ) : (
              <>
                <FiDownload size={24} />
                Generar Reporte {tipoReporte.toUpperCase()} {anoReporte}
              </>
            )}
          </motion.button>
          
          <p className={`text-sm mt-3 ${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>
            El reporte se descargará automáticamente cuando esté listo
          </p>
        </motion.div>

        {/* Información del reporte seleccionado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl ${modoOscuro ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className={`text-xl ${modoOscuro ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <h4 className={`text-lg font-bold ${modoOscuro ? 'text-yellow-400' : 'text-yellow-700'}`}>
              Información del Reporte Seleccionado
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
              <h5 className={`font-semibold mb-2 ${modoOscuro ? 'text-blue-300' : 'text-blue-700'}`}>
                Detalles del Reporte
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>Tipo:</span>
                  <span className="font-semibold">{reporteSeleccionado?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>Año:</span>
                  <span className="font-semibold">{anoReporte}</span>
                </div>
                <div className="flex justify-between">
                  <span className={modoOscuro ? 'text-gray-400' : 'text-gray-600'}>Formato:</span>
                  <span className="font-semibold">
                    {formatosDisponibles.find(f => f.id === formatoReporte)?.nombre}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
              <h5 className={`font-semibold mb-2 ${modoOscuro ? 'text-green-300' : 'text-green-700'}`}>
                Descripción
              </h5>
              <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                {reporteSeleccionado?.descripcion}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'}`}>
              <h5 className={`font-semibold mb-2 ${modoOscuro ? 'text-purple-300' : 'text-purple-700'}`}>
                Campos Incluidos
              </h5>
              <div className="flex flex-wrap gap-1">
                {reporteSeleccionado?.campos.slice(0, 8).map((campo, indice) => (
                  <span 
                    key={indice}
                    className={`text-xs px-2 py-1 rounded mb-1 ${
                      modoOscuro ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {campo}
                  </span>
                ))}
                {reporteSeleccionado?.campos.length > 8 && (
                  <span className={`text-xs px-2 py-1 rounded mb-1 ${
                    modoOscuro ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    +{reporteSeleccionado.campos.length - 8} más
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SistemaReportes;