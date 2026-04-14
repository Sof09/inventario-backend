// src/routes/categoriaRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getCategorias, crearCategoria, editarCategoria, eliminarCategoria } = require('../controllers/categoriaController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getCategorias);
router.post('/', verificarToken, soloAdmin, crearCategoria);
router.put('/:id', verificarToken, soloAdmin, editarCategoria);
router.delete('/:id', verificarToken, soloAdmin, eliminarCategoria);

module.exports = router;