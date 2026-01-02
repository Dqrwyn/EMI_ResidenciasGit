const express = require("express");
const analizadorCuerpo = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const app = express();
const PUERTO = 3001;

// ================================
// CONFIGURACION
// ================================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(analizadorCuerpo.json({ limit: '50mb' }));
app.use(analizadorCuerpo.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, "public")));

// Configuracion de MongoDB
const URI_MONGODB = process.env.URI_MONGODB || "mongodb://127.0.0.1:27017";
const NOMBRE_BD = "residencias_db";
let bd;

// Conectar a MongoDB
async function conectarAMongoDB() {
  try {
    const cliente = new MongoClient(URI_MONGODB);
    await cliente.connect();
    console.log("✅ Conectado a MongoDB");
    bd = cliente.db(NOMBRE_BD);
    
    // Crear indices para mejorar rendimiento
    await bd.collection('tokens').createIndex({ email: 1 });
    await bd.collection('tokens').createIndex({ creado_en: 1 }, { expireAfterSeconds: 300 });
    await bd.collection('habitaciones').createIndex({ idHabitacion: 1 }, { unique: true });
    await bd.collection('habitaciones_administrativas').createIndex({ idHabitacion: 1 }, { unique: true });
    
    console.log("📦 Indices de MongoDB creados correctamente.");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
  }
}

conectarAMongoDB();

// ================================
// AUTENTICACION
// ================================
const CORREOS_VALIDOS = [
  "darwintorricofernandez@gmail.com",
  "dtorricof@est.emi.edu.bo",
  "jbarrosoa@est.emi.edu.bo",
  "mramoslz@adm.emi.edu.bo",
  "resisistema@gmail.com",
];

const CORREO_EMISOR = "darwintorricofernandez@gmail.com";

const transportador = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: CORREO_EMISOR,
    pass: "rtvs acwo qfkm pjjs",
  },
});

function generarToken() {
  return crypto.randomBytes(3).toString("hex");
}

async function enviarToken(email, token) {
  const opcionesCorreo = {
    from: CORREO_EMISOR,
    to: email,
    subject: "Tu token de acceso a RESI",
    text: `Tu token de acceso es: ${token}. Es valido por 5 minutos.`,
  };
  await transportador.sendMail(opcionesCorreo);
}

function esCorreoValido(email) {
  return CORREOS_VALIDOS.includes(email);
}

// ================================
// ENDPOINTS PRINCIPALES
// ================================

// Servir HTML principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Solicitar token
app.post("/solicitar-token", async (req, res) => {
  const { email } = req.body;
  if (!esCorreoValido(email))
    return res.status(403).json({ mensaje: "Correo no autorizado" });

  const token = generarToken();
  const marcaTiempo = Date.now();

  try {
    await bd.collection('tokens').updateOne(
      { email },
      { $set: { token, creado_en: marcaTiempo } },
      { upsert: true }
    );

    await enviarToken(email, token);
    res.json({ mensaje: "Token enviado al correo autorizado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error guardando token", error: error.toString() });
  }
});

// Validar token
app.post("/validar-token", async (req, res) => {
  const { email, token } = req.body;
  if (!esCorreoValido(email))
    return res.status(403).json({ mensaje: "Correo no autorizado" });

  try {
    const datosToken = await bd.collection('tokens').findOne({ email });
    if (!datosToken) return res.status(400).json({ mensaje: "Token no encontrado" });

    const tiempoValido = 5 * 60 * 1000; // 5 minutos
    if (datosToken.token === token && Date.now() - datosToken.creado_en < tiempoValido)
      res.json({ mensaje: "✅ Token valido, acceso permitido" });
    else
      res.status(400).json({ mensaje: "Token invalido o expirado" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error validando token" });
  }
});

// ================================
// ENDPOINTS DE HABITACIONES
// ================================

// Obtener datos de habitaciones
app.get("/api/rooms", async (req, res) => {
  try {
    console.log("📡 Obteniendo datos de habitaciones...");
    
    const habitaciones = await bd.collection('habitaciones').find({}).toArray();
    const habitacionesAdmin = await bd.collection('habitaciones_administrativas').find({}).toArray();
    
    console.log(`📊 Habitaciones encontradas: ${habitaciones.length}`);
    console.log(`📊 Habitaciones admin encontradas: ${habitacionesAdmin.length}`);
    
    const datosHabitaciones = {};
    const datosHabitacionesAdmin = {};
    
    habitaciones.forEach(habitacion => {
      datosHabitaciones[habitacion.idHabitacion] = {
        students: habitacion.datos?.students || []
      };
    });
    
    habitacionesAdmin.forEach(habitacion => {
      datosHabitacionesAdmin[habitacion.idHabitacion] = {
        staff: habitacion.datos?.staff || []
      };
    });
    
    res.json({ 
      rooms: datosHabitaciones, 
      adminRooms: datosHabitacionesAdmin 
    });
  } catch (error) {
    console.error('❌ Error obteniendo habitaciones:', error);
    res.status(500).json({ 
      mensaje: "Error obteniendo datos", 
      error: error.message 
    });
  }
});

// Guardar datos de habitacion
app.post("/api/rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const datos = req.body;

  console.log(`💾 Guardando habitación ${roomId}`, datos);

  try {
    if (!datos || typeof datos !== 'object') {
      return res.status(400).json({ mensaje: "Datos invalidos" });
    }

    // Validar estructura
    if (!datos.students || !Array.isArray(datos.students)) {
      return res.status(400).json({ mensaje: "Estructura de estudiantes invalida" });
    }

    // Procesar datos de estudiantes
    const estudiantesProcesados = datos.students.map(estudiante => {
      // Convertir semestre texto a número si es necesario
      if (estudiante.semester && typeof estudiante.semester === 'string') {
        const semestresMap = {
          'Primer': 1, 'Segundo': 2, 'Tercer': 3, 'Cuarto': 4,
          'Quinto': 5, 'Sexto': 6, 'Séptimo': 7, 'Octavo': 8,
          'Noveno': 9, 'Décimo': 10, 'Decimo': 10
        };
        
        estudiante.semester = semestresMap[estudiante.semester] || 
                              parseInt(estudiante.semester) || 
                              estudiante.semester;
      }
      
      // Generar ID si no existe
      if (!estudiante.id || estudiante.id.startsWith('temp-')) {
        estudiante.id = `est-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      return estudiante;
    });

    const datosActualizados = {
      ...datos,
      students: estudiantesProcesados
    };

    const resultado = await bd.collection('habitaciones').updateOne(
      { idHabitacion: roomId },
      { 
        $set: { 
          idHabitacion: roomId, 
          datos: datosActualizados,
          ultimaActualizacion: new Date()
        } 
      },
      { upsert: true }
    );
    
    console.log(`✅ Habitación ${roomId} guardada:`, resultado);
    
    res.json({ 
      success: true,
      message: "Habitacion guardada exitosamente" 
    });
  } catch (error) {
    console.error('❌ Error guardando habitacion:', error);
    res.status(500).json({ 
      success: false,
      message: "Error guardando habitacion", 
      error: error.message 
    });
  }
});

// Guardar datos de habitacion administrativa
app.post("/api/admin-rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const datos = req.body;

  try {
    // Validar estructura
    if (!datos.staff || !Array.isArray(datos.staff)) {
      return res.status(400).json({ 
        success: false,
        message: "Estructura de personal invalida" 
      });
    }

    await bd.collection('habitaciones_administrativas').updateOne(
      { idHabitacion: roomId },
      { 
        $set: { 
          idHabitacion: roomId, 
          datos: datos,
          ultimaActualizacion: new Date()
        } 
      },
      { upsert: true }
    );
    
    res.json({ 
      success: true,
      message: "Habitacion administrativa guardada exitosamente" 
    });
  } catch (error) {
    console.error('Error guardando habitacion administrativa:', error);
    res.status(500).json({ 
      success: false,
      message: "Error guardando habitacion administrativa", 
      error: error.message 
    });
  }
});

// Obtener estado de habitaciones
app.get("/api/rooms-status", async (req, res) => {
  try {
    const habitaciones = await bd.collection('habitaciones').find({}).toArray();
    const habitacionesAdmin = await bd.collection('habitaciones_administrativas').find({}).toArray();
    
    const roomsStatus = {};
    const adminRoomsStatus = {};
    
    habitaciones.forEach(habitacion => {
      const tieneEstudiantes = habitacion.datos?.students?.some(estudiante => 
        estudiante && estudiante.name && estudiante.name.trim() !== ''
      );
      roomsStatus[habitacion.idHabitacion] = tieneEstudiantes || false;
    });
    
    habitacionesAdmin.forEach(habitacion => {
      const tienePersonal = habitacion.datos?.staff?.some(persona => 
        persona && persona.name && persona.name.trim() !== ''
      );
      adminRoomsStatus[habitacion.idHabitacion] = tienePersonal || false;
    });
    
    res.json({ 
      roomsStatus, 
      adminRoomsStatus 
    });
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    res.status(500).json({ 
      message: "Error obteniendo estados", 
      error: error.message 
    });
  }
});

// Vaciar habitacion
app.delete("/api/rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const resultado = await bd.collection('habitaciones').deleteOne({ idHabitacion: roomId });
    
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Habitacion no encontrada" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Habitacion vaciada exitosamente" 
    });
  } catch (error) {
    console.error('Error vaciando habitacion:', error);
    res.status(500).json({ 
      success: false,
      message: "Error vaciando habitacion", 
      error: error.message 
    });
  }
});

// Vaciar habitacion administrativa
app.delete("/api/admin-rooms/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const resultado = await bd.collection('habitaciones_administrativas').deleteOne({ idHabitacion: roomId });
    
    if (resultado.deletedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Habitacion administrativa no encontrada" 
      });
    }
    
    res.json({ 
      success: true,
      message: "Habitacion administrativa vaciada exitosamente" 
    });
  } catch (error) {
    console.error('Error vaciando habitacion administrativa:', error);
    res.status(500).json({ 
      success: false,
      message: "Error vaciando habitacion administrativa", 
      error: error.message 
    });
  }
});

// ================================
// ENDPOINTS PARA COMPATIBILIDAD
// ================================

app.get("/api/habitaciones", async (req, res) => {
  try {
    const habitaciones = await bd.collection('habitaciones').find({}).toArray();
    const habitacionesAdmin = await bd.collection('habitaciones_administrativas').find({}).toArray();
    
    const datosHabitaciones = {};
    const datosHabitacionesAdmin = {};
    
    habitaciones.forEach(habitacion => {
      datosHabitaciones[habitacion.idHabitacion] = habitacion.datos;
    });
    
    habitacionesAdmin.forEach(habitacion => {
      datosHabitacionesAdmin[habitacion.idHabitacion] = habitacion.datos;
    });
    
    res.json({ 
      habitaciones: datosHabitaciones, 
      habitacionesAdmin: datosHabitacionesAdmin 
    });
  } catch (error) {
    console.error('Error obteniendo habitaciones:', error);
    res.status(500).json({ 
      mensaje: "Error obteniendo datos", 
      error: error.message 
    });
  }
});

// ================================
// SISTEMA DE REPORTES MEJORADO
// ================================

// Funcion auxiliar para obtener valor seguro
function obtenerValorSeguro(valor, valorPorDefecto = '') {
  if (valor === undefined || valor === null || valor === '') {
    return valorPorDefecto;
  }
  return valor;
}

// Funcion para calcular deudas
function calcularDeudasEstudiante(paymentHistory, anoActual) {
  if (!paymentHistory || !paymentHistory[anoActual]) {
    return 11; // Todos los meses pendientes si no hay historial
  }

  const mesesPago = ['Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  let deudas = 0;

  mesesPago.forEach(mes => {
    const pago = paymentHistory[anoActual][mes];
    if (!pago || pago.status === 'pendiente' || pago.status === 'moroso') {
      deudas++;
    }
  });

  return deudas;
}

// Funcion para obtener estado de pago formateado
function obtenerEstadoPago(paymentHistory, mes, ano) {
  if (!paymentHistory || !paymentHistory[ano] || !paymentHistory[ano][mes]) {
    return 'Pendiente';
  }
  
  const pago = paymentHistory[ano][mes];
  let estado = pago.status || 'Pendiente';
  
  estado = estado.charAt(0).toUpperCase() + estado.slice(1);
  
  if (pago.invoiceCode) {
    return `${estado} (${pago.invoiceCode})`;
  }
  
  return estado;
}

// Funcion para convertir numero a texto de semestre
function obtenerSemestreTexto(semestreNumero) {
  const semestres = {
    1: 'Primer', 2: 'Segundo', 3: 'Tercer', 4: 'Cuarto',
    5: 'Quinto', 6: 'Sexto', 7: 'Séptimo', 8: 'Octavo',
    9: 'Noveno', 10: 'Décimo'
  };
  return semestres[semestreNumero] || semestreNumero;
}

// Endpoint principal de reportes - CORREGIDO
app.get("/api/reportes/:formato", async (req, res) => {
  const { formato } = req.params;
  const { tipo = 'completo', ano = new Date().getFullYear() } = req.query;

  console.log(`📊 Generando reporte: tipo=${tipo}, formato=${formato}, ano=${ano}`);

  try {
    const habitaciones = await bd.collection('habitaciones').find({}).toArray();
    const habitacionesAdmin = await bd.collection('habitaciones_administrativas').find({}).toArray();

    console.log(`📊 Total habitaciones: ${habitaciones.length}`);
    console.log(`📊 Total habitaciones admin: ${habitacionesAdmin.length}`);

    const estudiantes = [];
    const personal = [];
    
    // Procesar estudiantes
    habitaciones.forEach(habitacion => {
      if (habitacion.datos?.students) {
        habitacion.datos.students.forEach((est, indice) => {
          if (est && est.name && est.name.trim() !== '') {
            // Convertir semestre a texto si es número
            let semestreTexto = est.semester;
            if (typeof est.semester === 'number') {
              semestreTexto = obtenerSemestreTexto(est.semester);
            }
            
            estudiantes.push({
              indice: estudiantes.length + 1,
              tipo: 'Estudiante',
              habitacion: habitacion.idHabitacion || 'N/A',
              nombre: obtenerValorSeguro(est.name),
              ci: obtenerValorSeguro(est.ci),
              celular: obtenerValorSeguro(est.cellphone),
              carrera: obtenerValorSeguro(est.career),
              semestre: obtenerValorSeguro(semestreTexto),
              codigo: obtenerValorSeguro(est.code),
              tipoHabitacion: obtenerValorSeguro(est.roomType),
              nombreTutor: obtenerValorSeguro(est.tutorName),
              celularTutor: obtenerValorSeguro(est.tutorCellphone),
              fechaIngreso: obtenerValorSeguro(est.admissionDate),
              observaciones: obtenerValorSeguro(est.observation),
              email: obtenerValorSeguro(est.email),
              paymentHistory: est.paymentHistory || {},
              deudas: calcularDeudasEstudiante(est.paymentHistory, parseInt(ano))
            });
          }
        });
      }
    });

    // Procesar personal
    habitacionesAdmin.forEach(habitacion => {
      if (habitacion.datos?.staff) {
        habitacion.datos.staff.forEach((persona, indice) => {
          if (persona && persona.name && persona.name.trim() !== '') {
            personal.push({
              indice: personal.length + 1,
              tipo: 'Personal',
              area: habitacion.idHabitacion || 'N/A',
              nombre: obtenerValorSeguro(persona.name),
              ci: obtenerValorSeguro(persona.ci),
              cargo: obtenerValorSeguro(persona.position),
              departamento: obtenerValorSeguro(persona.department),
              celular: obtenerValorSeguro(persona.cellphone),
              email: obtenerValorSeguro(persona.email),
              observaciones: obtenerValorSeguro(persona.observation)
            });
          }
        });
      }
    });

    console.log(`📊 Estudiantes encontrados: ${estudiantes.length}`);
    console.log(`📊 Personal encontrado: ${personal.length}`);

    let datosReporte = [];
    const anoReporte = parseInt(ano);

    switch (tipo) {
      case 'estudiantes':
        datosReporte = estudiantes.map(est => ({
          '#': est.indice,
          'Nombre': est.nombre,
          'CI': est.ci,
          'Celular': est.celular,
          'Carrera': est.carrera,
          'Semestre': est.semestre,
          'Codigo': est.codigo,
          'Habitacion': est.habitacion,
          'Tipo Habitacion': est.tipoHabitacion,
          'Tutor': est.nombreTutor,
          'Celular Tutor': est.celularTutor,
          'Fecha Ingreso': est.fechaIngreso,
          'Observaciones': est.observaciones
        }));
        break;

      case 'personal':
        datosReporte = personal.map(pers => ({
          '#': pers.indice,
          'Nombre': pers.nombre,
          'CI': pers.ci,
          'Cargo': pers.cargo,
          'Departamento': pers.departamento,
          'Celular': pers.celular,
          'Email': pers.email,
          'Area': pers.area,
          'Observaciones': pers.observaciones
        }));
        break;

      case 'pagos':
        datosReporte = estudiantes.map(est => ({
          '#': est.indice,
          'Nombre': est.nombre,
          'CI': est.ci,
          'Carrera': est.carrera,
          'Tipo Habitacion': est.tipoHabitacion,
          'Habitacion': est.habitacion,
          'Febrero': obtenerEstadoPago(est.paymentHistory, 'Febrero', anoReporte),
          'Marzo': obtenerEstadoPago(est.paymentHistory, 'Marzo', anoReporte),
          'Abril': obtenerEstadoPago(est.paymentHistory, 'Abril', anoReporte),
          'Mayo': obtenerEstadoPago(est.paymentHistory, 'Mayo', anoReporte),
          'Junio': obtenerEstadoPago(est.paymentHistory, 'Junio', anoReporte),
          'Julio': obtenerEstadoPago(est.paymentHistory, 'Julio', anoReporte),
          'Agosto': obtenerEstadoPago(est.paymentHistory, 'Agosto', anoReporte),
          'Septiembre': obtenerEstadoPago(est.paymentHistory, 'Septiembre', anoReporte),
          'Octubre': obtenerEstadoPago(est.paymentHistory, 'Octubre', anoReporte),
          'Noviembre': obtenerEstadoPago(est.paymentHistory, 'Noviembre', anoReporte),
          'Diciembre': obtenerEstadoPago(est.paymentHistory, 'Diciembre', anoReporte),
          'Total Deudas': est.deudas
        }));
        break;

      case 'completo':
      default:
        datosReporte = [
          ...estudiantes.map(est => ({
            '#': est.indice,
            'Tipo': 'Estudiante',
            'Nombre': est.nombre,
            'CI': est.ci,
            'Celular': est.celular,
            'Habitacion/Area': est.habitacion,
            'Carrera/Cargo': est.carrera,
            'Semestre': est.semestre,
            'Fecha Ingreso': est.fechaIngreso,
            'Observaciones': est.observaciones
          })),
          ...personal.map(pers => ({
            '#': pers.indice + estudiantes.length,
            'Tipo': 'Personal',
            'Nombre': pers.nombre,
            'CI': pers.ci,
            'Celular': pers.celular,
            'Habitacion/Area': pers.area,
            'Carrera/Cargo': pers.cargo,
            'Semestre': '-',
            'Fecha Ingreso': '-',
            'Observaciones': pers.observaciones
          }))
        ];
        break;
    }

    console.log(`📊 Registros para reporte: ${datosReporte.length}`);

    if (formato === 'excel') {
      await generarExcel(res, datosReporte, tipo, anoReporte);
    } else if (formato === 'pdf') {
      await generarPDF(res, datosReporte, tipo, anoReporte);
    } else {
      res.status(400).json({ 
        success: false,
        mensaje: 'Formato no soportado. Use "excel" o "pdf".' 
      });
    }

  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error al generar el reporte', 
      error: error.message 
    });
  }
});

// Funcion para generar Excel
async function generarExcel(res, datos, tipo, ano) {
  try {
    const libroTrabajo = new ExcelJS.Workbook();
    const hojaTrabajo = libroTrabajo.addWorksheet('Reporte Residencias');

    // Agregar titulo
    hojaTrabajo.mergeCells('A1:M1');
    const tituloCelda = hojaTrabajo.getCell('A1');
    tituloCelda.value = `Reporte de Residencias - ${tipo.toUpperCase()} - Año ${ano}`;
    tituloCelda.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    tituloCelda.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004F9F' }
    };
    tituloCelda.alignment = { vertical: 'middle', horizontal: 'center' };

    if (datos.length > 0) {
      const columnas = Object.keys(datos[0]).map(key => ({
        header: key,
        key: key,
        width: 15
      }));
      hojaTrabajo.columns = columnas;
    }

    // Agregar datos
    datos.forEach(fila => {
      hojaTrabajo.addRow(fila);
    });

    // Formatear encabezados
    const filaEncabezado = hojaTrabajo.getRow(3);
    filaEncabezado.eachCell(celda => {
      celda.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      celda.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2E5BFF' }
      };
      celda.alignment = { vertical: 'middle', horizontal: 'center' };
      celda.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Formatear filas de datos
    hojaTrabajo.eachRow((fila, numeroFila) => {
      if (numeroFila > 3) {
        fila.eachCell(celda => {
          celda.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          celda.alignment = { vertical: 'middle', horizontal: 'left' };
        });
        
        // Resaltar filas alternas
        if (numeroFila % 2 === 0) {
          fila.eachCell(celda => {
            celda.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF0F8FF' }
            };
          });
        }
      }
    });

    // Configurar respuesta
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_${tipo}_${ano}_${new Date().toISOString().split('T')[0]}.xlsx"`
    );

    await libroTrabajo.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error generando Excel:', error);
    throw error;
  }
}

// Funcion para generar PDF
async function generarPDF(res, datos, tipo, ano) {
  try {
    const documento = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Configurar headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte_${tipo}_${ano}_${new Date().toISOString().split('T')[0]}.pdf"`
    );

    documento.pipe(res);
    
    // Encabezado
    documento.fontSize(20).text('Escuela Militar de Ingeniería', { align: 'center' });
    documento.fontSize(16).text('Sistema de Gestión de Residencias', { align: 'center' });
    documento.moveDown();
    documento.fontSize(14).text(`Reporte: ${tipo.toUpperCase()} - Año ${ano}`, { align: 'center' });
    documento.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    documento.moveDown(2);

    if (datos.length === 0) {
      documento.fontSize(12).text('No hay datos disponibles para el reporte seleccionado.', { align: 'center' });
      documento.end();
      return;
    }

    // Obtener columnas
    const columnas = Object.keys(datos[0]);
    const anchoPagina = documento.page.width - 100;
    const anchoColumna = anchoPagina / columnas.length;

    // Encabezados de tabla
    let yPos = documento.y;
    documento.fontSize(10).font('Helvetica-Bold');
    
    columnas.forEach((columna, i) => {
      documento.text(
        columna,
        50 + (i * anchoColumna),
        yPos,
        { width: anchoColumna - 10, align: 'left' }
      );
    });

    yPos += 20;
    documento.moveTo(50, yPos).lineTo(anchoPagina + 50, yPos).stroke();

    // Datos
    documento.font('Helvetica').fontSize(9);
    
    datos.forEach((fila, indice) => {
      if (yPos > documento.page.height - 100) {
        documento.addPage();
        yPos = 50;
        
        // Repetir encabezados en nueva página
        documento.font('Helvetica-Bold').fontSize(10);
        columnas.forEach((columna, i) => {
          documento.text(
            columna,
            50 + (i * anchoColumna),
            yPos,
            { width: anchoColumna - 10, align: 'left' }
          );
        });
        yPos += 20;
        documento.moveTo(50, yPos).lineTo(anchoPagina + 50, yPos).stroke();
        documento.font('Helvetica').fontSize(9);
        yPos += 10;
      }

      columnas.forEach((columna, i) => {
        const valor = fila[columna] !== undefined ? String(fila[columna]) : '';
        documento.text(
          valor,
          50 + (i * anchoColumna),
          yPos,
          { width: anchoColumna - 10, align: 'left' }
        );
      });

      yPos += 15;
      
      // Línea separadora cada 5 filas
      if ((indice + 1) % 5 === 0) {
        documento.moveTo(50, yPos - 5).lineTo(anchoPagina + 50, yPos - 5).stroke();
      }
    });

    // Pie de página
    documento.fontSize(8).text(
      `Total registros: ${datos.length} • Generado: ${new Date().toLocaleString()}`,
      50,
      documento.page.height - 50,
      { align: 'center', width: anchoPagina }
    );

    documento.end();
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

// ================================
// ENDPOINTS PARA DATOS DE PRUEBA
// ================================

// Endpoint para poblar datos de prueba
app.post("/api/poblar-datos-prueba", async (req, res) => {
  try {
    // Datos de prueba para estudiantes
    const datosPruebaEstudiantes = {
      "Varones-Piso 1-Izquierda-1": {
        students: [
          {
            id: "est-1",
            name: "Juan Pérez",
            ci: "1234567",
            cellphone: "77712345",
            career: "Ingeniería de Sistemas",
            semester: "Quinto",
            code: "2023001",
            roomType: "INDIVIDUAL",
            tutorName: "María Pérez",
            tutorCellphone: "77754321",
            admissionDate: "2023-01-15",
            observation: "Estudiante destacado",
            paymentHistory: {
              2024: {
                Febrero: { status: "pagado", invoiceCode: "FAC-001" },
                Marzo: { status: "pagado", invoiceCode: "FAC-002" },
                Abril: { status: "pendiente" }
              }
            }
          }
        ]
      }
    };

    // Insertar datos de prueba
    for (const [roomId, datos] of Object.entries(datosPruebaEstudiantes)) {
      await bd.collection('habitaciones').updateOne(
        { idHabitacion: roomId },
        { 
          $set: { 
            idHabitacion: roomId, 
            datos: datos,
            ultimaActualizacion: new Date()
          } 
        },
        { upsert: true }
      );
    }

    res.json({ 
      success: true,
      message: "Datos de prueba insertados correctamente" 
    });
  } catch (error) {
    console.error('Error insertando datos de prueba:', error);
    res.status(500).json({ 
      success: false,
      message: "Error insertando datos de prueba", 
      error: error.message 
    });
  }
});

// ================================
// INICIAR SERVIDOR
// ================================
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PUERTO}`);
  console.log(`📊 Sistema de reportes disponible en /api/reportes/{excel|pdf}`);
  console.log(`📁 Archivos estáticos en /public`);
  console.log(`✅ Endpoints principales activados:`);
  console.log(`   - GET  /api/rooms`);
  console.log(`   - POST /api/rooms/:roomId`);
  console.log(`   - GET  /api/rooms-status`);
  console.log(`   - GET  /api/reportes/:formato`);
});