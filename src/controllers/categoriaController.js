const db = require('../config/database');

// Listar categorias del negocio
const getCategorias = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [categorias] = await db.query(
      'SELECT * FROM categorias WHERE id_negocio = ? ORDER BY nombre ASC',
      [id_negocio]
    );
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorias' });
  }
};

// Crear categoria
const crearCategoria = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { nombre, descripcion } = req.body;

  try {
    const [resultado] = await db.query(
      'INSERT INTO categorias (id_negocio, nombre, descripcion) VALUES (?, ?, ?)',
      [id_negocio, nombre, descripcion]
    );
    res.status(201).json({
      mensaje: 'Categoria creada exitosamente',
      id_categoria: resultado.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear categoria' });
  }
};

// Editar categoria
const editarCategoria = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  try {
    await db.query(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ? AND id_negocio = ?',
      [nombre, descripcion, id, id_negocio]
    );
    res.json({ mensaje: 'Categoria actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar categoria' });
  }
};

// Eliminar categoria
const eliminarCategoria = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;

  try {
    await db.query(
      'DELETE FROM categorias WHERE id_categoria = ? AND id_negocio = ?',
      [id, id_negocio]
    );
    res.json({ mensaje: 'Categoria eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar categoria' });
  }
};

module.exports = { getCategorias, crearCategoria, editarCategoria, eliminarCategoria };