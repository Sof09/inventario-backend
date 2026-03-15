const express = require('express');
const router = express.Router();
const { registrarNegocio } = require('../controllers/negocioController');

// Ruta para registrar un nuevo negocio
router.post('/registro', registrarNegocio);

module.exports = router;