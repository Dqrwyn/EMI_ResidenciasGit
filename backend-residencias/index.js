const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Crear o abrir base de datos SQLite
const db = new sqlite3.Database('./cuartos.db', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS cuartos (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  semestre TEXT,
  activos TEXT,
  ocupado INTEGER
)`);

// Obtener todos los cuartos
app.get('/cuartos', (req, res) => {
  db.all('SELECT * FROM cuartos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Convertir activos de texto JSON a array
    const cuartos = rows.map(row => ({
      ...row,
      activos: JSON.parse(row.activos),
      ocupado: Boolean(row.ocupado),
    }));
    res.json(cuartos);
  });
});

// Crear o actualizar un cuarto
app.post('/cuartos', (req, res) => {
  const { id, nombre, semestre, activos, ocupado } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'El campo id es obligatorio' });
  }

  const activosStr = JSON.stringify(activos || []);
  const ocupadoNum = ocupado ? 1 : 0;

  const query = `
    INSERT INTO cuartos (id, nombre, semestre, activos, ocupado)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      nombre=excluded.nombre,
      semestre=excluded.semestre,
      activos=excluded.activos,
      ocupado=excluded.ocupado
  `;

  db.run(query, [id, nombre || '', semestre || '', activosStr, ocupadoNum], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Cuarto guardado', id });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
