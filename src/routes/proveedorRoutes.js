const express = require('express');
const router = express.Router();
const { getProveedores, crearProveedor, editarProveedor, eliminarProveedor } = require('../controllers/proveedorController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, getProveedores);
router.post('/', verificarToken, crearProveedor);
router.put('/:id', verificarToken, editarProveedor);
router.delete('/:id', verificarToken, eliminarProveedor);

module.exports = router;