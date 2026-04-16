// src/routes/productoRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getProductos, crearProducto, editarProducto, eliminarProducto, getStockBajo, getResumen } = require('../controllers/productoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getProductos);
router.get('/stock-bajo', verificarToken, getStockBajo);
router.get('/resumen', verificarToken, getResumen);
router.post('/', verificarToken, soloAdmin, crearProducto);
router.put('/:id', verificarToken, soloAdmin, editarProducto);
router.delete('/:id', verificarToken, soloAdmin, eliminarProducto);

module.exports = router;