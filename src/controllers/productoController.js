const db = require('../config/database');

// Listar todos los productos del negocio
const getProductos = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [productos] = await db.query(
      `SELECT p.*, c.nombre AS categoria, pr.nombre AS proveedor, u.nombre AS unidad
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
       LEFT JOIN unidades u ON p.id_unidad = u.id_unidad
       WHERE p.id_negocio = ? AND p.activo = 1
       ORDER BY p.nombre ASC`,
      [id_negocio]
    );

    res.json(productos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// Agregar producto
const crearProducto = async (req, res) => {
  const { id_negocio } = req.usuario;
  const {
    nombre, descripcion, codigo_barras,
    precio_compra, precio_venta,
    stock_actual, stock_minimo,
    id_categoria, id_proveedor, id_unidad
  } = req.body;

  try {
    const [resultado] = await db.query(
      `INSERT INTO productos 
       (id_negocio, nombre, descripcion, codigo_barras, precio_compra, precio_venta, stock_actual, stock_minimo, id_categoria, id_proveedor, id_unidad)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_negocio, nombre, descripcion, codigo_barras, precio_compra, precio_venta, stock_actual, stock_minimo, id_categoria, id_proveedor, id_unidad]
    );

    res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      id_producto: resultado.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

// Editar producto
const editarProducto = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;
  const {
    nombre, descripcion, codigo_barras,
    precio_compra, precio_venta,
    stock_minimo, id_categoria,
    id_proveedor, id_unidad
  } = req.body;

  try {
    await db.query(
      `UPDATE productos SET
       nombre = ?, descripcion = ?, codigo_barras = ?,
       precio_compra = ?, precio_venta = ?,
       stock_minimo = ?, id_categoria = ?,
       id_proveedor = ?, id_unidad = ?
       WHERE id_producto = ? AND id_negocio = ?`,
      [nombre, descripcion, codigo_barras, precio_compra, precio_venta, stock_minimo, id_categoria, id_proveedor, id_unidad, id, id_negocio]
    );

    res.json({ mensaje: 'Producto actualizado exitosamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// Desactivar producto (nunca se borra)
const eliminarProducto = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;

  try {
    await db.query(
      'UPDATE productos SET activo = 0 WHERE id_producto = ? AND id_negocio = ?',
      [id, id_negocio]
    );

    res.json({ mensaje: 'Producto desactivado exitosamente' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al desactivar producto' });
  }
};

// Obtener productos con stock bajo
const getStockBajo = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [productos] = await db.query(
      `SELECT nombre, stock_actual, stock_minimo
       FROM productos
       WHERE id_negocio = ? AND activo = 1
       AND stock_actual <= stock_minimo
       ORDER BY stock_actual ASC`,
      [id_negocio]
    );

    res.json(productos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
};

module.exports = { getProductos, crearProducto, editarProducto, eliminarProducto, getStockBajo };