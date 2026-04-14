// src/routes/clienteRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getClientes, crearCliente, eliminarCliente } = require('../controllers/clienteController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getClientes);
router.post('/', verificarToken, crearCliente);
router.delete('/:id', verificarToken, soloAdmin, eliminarCliente);

module.exports = router;