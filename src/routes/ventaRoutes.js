// src/routes/ventaRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getVentas, getDetalleVenta, crearVenta, getTicket } = require('../controllers/ventaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getVentas);
router.get('/:id', verificarToken, getDetalleVenta);
router.post('/', verificarToken, crearVenta);
router.get('/:id/ticket', verificarToken, getTicket);

module.exports = router;