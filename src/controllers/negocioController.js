const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarNegocio = async (req, res) => {
  const { nombre, tipo_negocio, email, password, telefono, direccion } = req.body;

  try {
    // Verificar si el email ya existe
    const [existe] = await db.query(
      'SELECT id_negocio FROM negocios WHERE email = ?', [email]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'Ya existe un negocio con ese email' });
    }

    // Crear el negocio
    const [negocio] = await db.query(
      `INSERT INTO negocios (nombre, tipo_negocio, email, telefono, direccion) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, tipo_negocio, email, telefono, direccion]
    );

    const id_negocio = negocio.insertId;

    // Encriptar contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario admin del negocio
    await db.query(
      `INSERT INTO usuarios (id_negocio, nombre, email, password_hash, rol) 
       VALUES (?, ?, ?, ?, 'admin')`,
      [id_negocio, nombre, email, password_hash]
    );

    res.status(201).json({
      mensaje: 'Negocio registrado exitosamente',
      id_negocio
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el negocio' });
  }
};

module.exports = { registrarNegocio };