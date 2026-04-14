// src/controllers/usuarioController.js - BACKEND
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [usuarios] = await db.query(
      `SELECT u.*, n.nombre AS nombre_negocio 
       FROM usuarios u
       INNER JOIN negocios n ON u.id_negocio = n.id_negocio
       WHERE u.email = ? AND u.activo = 1`,
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        id_negocio: usuario.id_negocio,
        rol: usuario.rol,
        nombre: usuario.nombre,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        id_negocio: usuario.id_negocio,
        nombre_negocio: usuario.nombre_negocio
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
};

// Obtener usuarios del negocio
const getUsuarios = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const [usuarios] = await db.query(
      `SELECT id_usuario, nombre, email, rol, activo, fecha_registro
       FROM usuarios
       WHERE id_negocio = ?
       ORDER BY fecha_registro DESC`,
      [id_negocio]
    );
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear usuario empleado
const crearUsuario = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contrasena son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres' });
    }

    const [existe] = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existe.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [resultado] = await db.query(
      `INSERT INTO usuarios (id_negocio, nombre, email, password_hash, rol)
       VALUES (?, ?, ?, ?, ?)`,
      [id_negocio, nombre, email, password_hash, rol || 'empleado']
    );

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      id_usuario: resultado.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Desactivar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { id } = req.params;

    if (parseInt(id) === req.usuario.id_usuario) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    await db.query(
      `UPDATE usuarios SET activo = 0
       WHERE id_usuario = ? AND id_negocio = ?`,
      [id, id_negocio]
    );

    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

module.exports = { login, getUsuarios, crearUsuario, eliminarUsuario };