// src/routes/reporteRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getReporteVentas, getReporteInventario } = require('../controllers/reporteController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/ventas', verificarToken, soloAdmin, getReporteVentas);
router.get('/inventario', verificarToken, soloAdmin, getReporteInventario);

module.exports = router;