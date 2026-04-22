// src/controllers/negocioController.js - BACKEND
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrarNegocio = async (req, res) => {
  const { nombre, tipo_negocio, email, password, telefono, direccion } = req.body;

  try {
    const [existe] = await db.query(
      'SELECT id_negocio FROM negocios WHERE email = ?', [email]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: 'Ya existe un negocio con ese email' });
    }

    const [negocio] = await db.query(
      `INSERT INTO negocios (nombre, tipo_negocio, email, telefono, direccion) 
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, tipo_negocio, email, telefono, direccion]
    );

    const id_negocio = negocio.insertId;
    const password_hash = await bcrypt.hash(password, 10);

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

const getPerfil = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const [negocios] = await db.query(
      `SELECT id_negocio, nombre, tipo_negocio, logo, telefono, 
              email, direccion, nombre_fiscal, direccion_ticket
       FROM negocios WHERE id_negocio = ?`,
      [id_negocio]
    );

    if (negocios.length === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }

    res.json(negocios[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { nombre, telefono, direccion, nombre_fiscal, direccion_ticket } = req.body;

    await db.query(
      `UPDATE negocios SET 
       nombre = ?, telefono = ?, direccion = ?,
       nombre_fiscal = ?, direccion_ticket = ?
       WHERE id_negocio = ?`,
      [nombre, telefono, direccion, nombre_fiscal, direccion_ticket, id_negocio]
    );

    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const subirLogo = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;

    if (!req.file) {
      return res.status(400).json({ error: 'No se subio ninguna imagen' });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    await db.query(
      'UPDATE negocios SET logo = ? WHERE id_negocio = ?',
      [logoUrl, id_negocio]
    );

    res.json({ mensaje: 'Logo actualizado correctamente', logo: logoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al subir logo' });
  }
};

module.exports = { registrarNegocio, getPerfil, actualizarPerfil, subirLogo };