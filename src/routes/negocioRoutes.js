// src/routes/negocioRoutes.js - BACKEND
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registrarNegocio, getPerfil, actualizarPerfil, subirLogo } = require('../controllers/negocioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo_${req.usuario.id_negocio}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tipos = /jpeg|jpg|png|webp/;
    const valido = tipos.test(path.extname(file.originalname).toLowerCase());
    if (valido) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imagenes JPG, PNG o WEBP'));
    }
  }
});

router.post('/registro', registrarNegocio);
router.get('/perfil', verificarToken, getPerfil);
router.put('/perfil', verificarToken, soloAdmin, actualizarPerfil);
router.post('/logo', verificarToken, soloAdmin, upload.single('logo'), subirLogo);

module.exports = router;