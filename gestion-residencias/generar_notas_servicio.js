import fs from "fs";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const contenido = fs.readFileSync("Nota_Servicio_Formato 2023.docx", "binary");

const zip = new PizZip(contenido);

const documento = new Docxtemplater(zip, {
  paragraphLoop: true,
  linebreaks: true,
});

documento.render({
  num_doc: "160 / 2025",
  fecha_actual: "Septiembre 11 de 2025",
  nombre: "JIMENA COSSIO SILVA",
  nro_cuotas: "Una",
  fecha_limite: "12-SEP-2025",
});

const buffer = documento.getZip().generate({
  type: "nodebuffer",
  mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
});

fs.writeFileSync("Nota_Generada.docx", buffer);
console.log("✅ Documento generado con exito.");