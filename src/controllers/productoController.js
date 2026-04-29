// src/controllers/productoController.js - BACKEND
const db = require('../config/database');
const multer = require('multer');
const XLSX = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

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

const getResumen = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [[{ total_productos }]] = await db.query(
      `SELECT COUNT(*) AS total_productos
       FROM productos
       WHERE id_negocio = ? AND activo = 1`,
      [id_negocio]
    );

    const [[{ valor_inventario }]] = await db.query(
      `SELECT COALESCE(SUM(stock_actual * precio_compra), 0) AS valor_inventario
       FROM productos
       WHERE id_negocio = ? AND activo = 1`,
      [id_negocio]
    );

    const [[{ movimientos_hoy }]] = await db.query(
      `SELECT COUNT(*) AS movimientos_hoy
       FROM movimientos m
       JOIN productos p ON m.id_producto = p.id_producto
       WHERE p.id_negocio = ?
       AND DATE(m.fecha) = CURDATE()`,
      [id_negocio]
    );

    res.json({
      total_productos,
      valor_inventario: parseFloat(valor_inventario).toFixed(2),
      movimientos_hoy
    });

  } catch (error) {
    console.error('ERROR RESUMEN:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const importarProductosExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibio ningun archivo' });
  }

  const { id_negocio } = req.usuario;

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const filas = XLSX.utils.sheet_to_json(hoja);

    if (!filas.length) {
      return res.status(400).json({ error: 'El archivo Excel esta vacio' });
    }

    const resultados = { insertados: 0, actualizados: 0, errores: [] };

    for (const fila of filas) {
      const codigo_barras = String(fila['Codigo'] || '').trim();
      const nombre = String(fila['nombre'] || '').trim();
      const precio_compra = parseFloat(fila['Precio compra']) || 0;
      const precio_venta = parseFloat(fila['Precio publico']) || 0;
      const stock_actual = parseInt(fila['cantidad']) || 0;
      const stock_minimo = parseInt(fila['stock_minimo']) || 5;

      if (!nombre) {
        resultados.errores.push({ fila, motivo: 'Nombre vacio' });
        continue;
      }

      if (codigo_barras) {
        const [existente] = await db.query(
          'SELECT id_producto FROM productos WHERE codigo_barras = ? AND id_negocio = ?',
          [codigo_barras, id_negocio]
        );

        if (existente.length > 0) {
          await db.query(
            `UPDATE productos
             SET nombre = ?, precio_compra = ?, precio_venta = ?,
                 stock_actual = ?, stock_minimo = ?
             WHERE codigo_barras = ? AND id_negocio = ?`,
            [nombre, precio_compra, precio_venta, stock_actual, stock_minimo, codigo_barras, id_negocio]
          );
          resultados.actualizados++;
          continue;
        }
      }

      await db.query(
        `INSERT INTO productos
           (id_negocio, codigo_barras, nombre, precio_compra, precio_venta, stock_actual, stock_minimo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_negocio, codigo_barras || null, nombre, precio_compra, precio_venta, stock_actual, stock_minimo]
      );
      resultados.insertados++;
    }

    res.json({ mensaje: 'Importacion completada', ...resultados });

  } catch (error) {
    console.error('Error al importar Excel:', error);
    res.status(500).json({ error: 'Error interno al procesar el archivo' });
  }
};

module.exports = {
  getProductos,
  crearProducto,
  editarProducto,
  eliminarProducto,
  getStockBajo,
  getResumen,
  importarProductosExcel,
  upload
};