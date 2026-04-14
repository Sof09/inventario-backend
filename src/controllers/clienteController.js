// src/controllers/clienteController.js - BACKEND
const db = require('../config/database');

// Obtener todos los clientes del negocio
const getClientes = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const [clientes] = await db.query(
      `SELECT * FROM clientes 
       WHERE id_negocio = ? AND activo = 1 
       ORDER BY nombre ASC`,
      [id_negocio]
    );
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Crear cliente
const crearCliente = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { nombre, telefono, email, acepta_credito } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const [resultado] = await db.query(
      `INSERT INTO clientes (id_negocio, nombre, telefono, email, acepta_credito) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_negocio, nombre, telefono || null, email || null, acepta_credito ? 1 : 0]
    );

    res.status(201).json({
      mensaje: 'Cliente creado correctamente',
      id_cliente: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// Desactivar cliente
const eliminarCliente = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { id } = req.params;

    await db.query(
      `UPDATE clientes SET activo = 0 
       WHERE id_cliente = ? AND id_negocio = ?`,
      [id, id_negocio]
    );

    res.json({ mensaje: 'Cliente desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({ error: 'Error al desactivar cliente' });
  }
};

module.exports = { getClientes, crearCliente, eliminarCliente };