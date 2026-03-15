const express = require('express');
const router = express.Router();
const { getProductos, crearProducto, editarProducto, eliminarProducto, getStockBajo } = require('../controllers/productoController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Todas las rutas de productos requieren token
router.get('/', verificarToken, getProductos);
router.get('/stock-bajo', verificarToken, getStockBajo);
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, editarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

module.exports = router;