const db = require('../config/database');

// Listar proveedores del negocio
const getProveedores = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [proveedores] = await db.query(
      'SELECT * FROM proveedores WHERE id_negocio = ? AND activo = 1 ORDER BY nombre ASC',
      [id_negocio]
    );
    res.json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

// Crear proveedor
const crearProveedor = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { nombre, telefono, email, direccion } = req.body;

  try {
    const [resultado] = await db.query(
      'INSERT INTO proveedores (id_negocio, nombre, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)',
      [id_negocio, nombre, telefono, email, direccion]
    );
    res.status(201).json({
      mensaje: 'Proveedor creado exitosamente',
      id_proveedor: resultado.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

// Editar proveedor
const editarProveedor = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;

  try {
    await db.query(
      `UPDATE proveedores SET nombre = ?, telefono = ?, email = ?, direccion = ?
       WHERE id_proveedor = ? AND id_negocio = ?`,
      [nombre, telefono, email, direccion, id, id_negocio]
    );
    res.json({ mensaje: 'Proveedor actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

// Desactivar proveedor
const eliminarProveedor = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE proveedores SET activo = 0 WHERE id_proveedor = ? AND id_negocio = ?',
      [id, id_negocio]
    );
    res.json({ mensaje: 'Proveedor desactivado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desactivar proveedor' });
  }
};

module.exports = { getProveedores, crearProveedor, editarProveedor, eliminarProveedor };