import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiFileText, FiUser, FiCalendar, FiHash, FiEdit3 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const GeneradorNotasServicio = ({ modoOscuro }) => {
  const [generando, setGenerando] = useState(false);
  const [datos, setDatos] = useState({
    num_doc: "160 / 2025",
    fecha_actual: "Septiembre 11 de 2025",
    nombre: "JIMENA COSSIO SILVA",
    nro_cuotas: "Una",
    fecha_limite: "12-SEP-2025",
  });

  const clasesTema = {
    fondo: modoOscuro ? "bg-gray-800" : "bg-white",
    texto: modoOscuro ? "text-gray-100" : "text-gray-800",
    tarjetaFondo: modoOscuro ? "bg-gray-700" : "bg-blue-50",
    borde: modoOscuro ? "border-gray-600" : "border-blue-200",
    botonPrincipal: modoOscuro ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600",
    entradaFondo: modoOscuro ? "bg-gray-600 text-white border-gray-500" : "bg-white text-gray-800 border-gray-300",
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const generarDocumento = async () => {
    if (generando) return;
    setGenerando(true);

    try {
      const respuesta = await fetch("/Nota_Servicio_Formato_2023.docx");
      if (!respuesta.ok) {
        throw new Error("Plantilla no encontrada. Asegurate de que este en la carpeta 'public'.");
      }

      const bufferArray = await respuesta.arrayBuffer();
      const zip = new PizZip(bufferArray);
      const documento = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      documento.render(datos);

      const blob = documento.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const nombreArchivo = `Nota_Servicio_${datos.nombre.replace(/\s+/g, "_")}.docx`;
      saveAs(blob, nombreArchivo);
      toast.success("✅ Nota de servicio generada y descargada con exito");
    } catch (error) {
      console.error("Error al generar documento:", error);
      toast.error(`❌ ${error.message || "Error inesperado al generar el documento"}`);
    } finally {
      setGenerando(false);
    }
  };

  const campos = [
    { id: "num_doc", etiqueta: "Numero de Documento", icono: <FiHash className="text-blue-500" />, placeholder: "Ej. 160 / 2025" },
    { id: "fecha_actual", etiqueta: "Fecha Actual", icono: <FiCalendar className="text-blue-500" />, placeholder: "Ej. Septiembre 11 de 2025" },
    { id: "nombre", etiqueta: "Nombre del Destinatario", icono: <FiUser className="text-blue-500" />, placeholder: "Ej. JIMENA COSSIO SILVA" },
    { id: "nro_cuotas", etiqueta: "Numero de Cuotas (en texto)", icono: <FiEdit3 className="text-blue-500" />, placeholder: "Ej. Una, Dos, Tres" },
    { id: "fecha_limite", etiqueta: "Fecha Limite", icono: <FiCalendar className="text-blue-500" />, placeholder: "Ej. 12-SEP-2025" },
  ];

  return (
    <div className={`p-6 rounded-xl shadow-lg ${clasesTema.fondo} ${clasesTema.texto}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Generador de Notas de Servicio</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">
          Personaliza y descarga documentos oficiales con formato institucional
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {campos.map((campo) => (
          <motion.div
            key={campo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <label className="flex items-center gap-2 text-sm font-medium">
              {campo.icono}
              {campo.etiqueta}
            </label>
            <input
              type="text"
              name={campo.id}
              value={datos[campo.id]}
              onChange={manejarCambio}
              placeholder={campo.placeholder}
              className={`w-full p-3 rounded-lg border ${clasesTema.entradaFondo} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition`}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-center"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={generarDocumento}
          disabled={generando}
          className={`px-8 py-4 rounded-lg text-white font-semibold text-lg transition-all flex items-center gap-3 mx-auto ${
            generando
              ? "bg-gray-400 cursor-not-allowed"
              : clasesTema.botonPrincipal
          }`}
        >
          {generando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generando documento...
            </>
          ) : (
            <>
              <FiDownload size={20} />
              Generar y Descargar Nota de Servicio
            </>
          )}
        </motion.button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          El documento se descargara en formato .docx con el formato institucional oficial
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-8 p-5 rounded-lg ${modoOscuro ? "bg-gray-700 border-gray-600" : "bg-indigo-50 border-indigo-200"} border`}
      >
        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
          <FiFileText />
          Vista previa del cuerpo del mensaje
        </h4>
        <p className="text-sm leading-relaxed">
          Habiendo realizado la revision de la base de datos de la Unidad de Extension y Bienestar Universitario se pudo verificar que su persona tiene{" "}
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">{datos.nro_cuotas}</span> cuota(s) pendiente(s) de Residencia Universitaria de la Gestion 2025, por el cual usted debera regularizar sus cuotas pendientes hasta el{" "}
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">{datos.fecha_limite}</span> impostergablemente.
        </p>
      </motion.div>
    </div>
  );
};

export default GeneradorNotasServicio;