const express = require('express');
const router = express.Router();
const { getCategorias, crearCategoria, editarCategoria, eliminarCategoria } = require('../controllers/categoriaController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getCategorias);
router.post('/', verificarToken, crearCategoria);
router.put('/:id', verificarToken, editarCategoria);
router.delete('/:id', verificarToken, eliminarCategoria);

module.exports = router;