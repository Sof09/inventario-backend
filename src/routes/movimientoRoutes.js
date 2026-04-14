// src/routes/movimientoRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { crearMovimiento, getMovimientos, getMovimientosPorProducto } = require('../controllers/movimientoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getMovimientos);
router.get('/producto/:id', verificarToken, getMovimientosPorProducto);
router.post('/', verificarToken, crearMovimiento);

module.exports = router;