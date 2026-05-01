// src/routes/cotizacionRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getCotizaciones, crearCotizacion, getDetalleCotizacion, eliminarCotizacion } = require('../controllers/cotizacionController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getCotizaciones);
router.post('/', verificarToken, crearCotizacion);
router.get('/:id', verificarToken, getDetalleCotizacion);
router.delete('/:id', verificarToken, eliminarCotizacion);

module.exports = router;