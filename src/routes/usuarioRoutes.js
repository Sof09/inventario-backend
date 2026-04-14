// src/routes/usuarioRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { login, getUsuarios, crearUsuario, eliminarUsuario } = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/', verificarToken, soloAdmin, getUsuarios);
router.post('/', verificarToken, soloAdmin, crearUsuario);
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);

module.exports = router;