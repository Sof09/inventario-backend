// src/routes/proveedorRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const { getProveedores, crearProveedor, editarProveedor, eliminarProveedor } = require('../controllers/proveedorController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, soloAdmin, getProveedores);
router.post('/', verificarToken, soloAdmin, crearProveedor);
router.put('/:id', verificarToken, soloAdmin, editarProveedor);
router.delete('/:id', verificarToken, soloAdmin, eliminarProveedor);

module.exports = router;