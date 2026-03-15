const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/database');

// Importar rutas
const negocioRoutes = require('./routes/negocioRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/negocios', negocioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Inventario SaaS funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});