const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/database');

// Importar rutas
const negocioRoutes = require('./routes/negocioRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const productoRoutes = require('./routes/productoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/negocios', negocioRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);


// Ruta principal
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Inventario SaaS funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});