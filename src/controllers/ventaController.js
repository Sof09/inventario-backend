// src/controllers/ventaController.js - BACKEND
const db = require('../config/database');

// Obtener todas las ventas del negocio
const getVentas = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const [ventas] = await db.query(
      `SELECT v.id_venta, v.total, v.metodo_pago, v.fecha,
              u.nombre AS usuario,
              c.nombre AS cliente
       FROM ventas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_negocio = ?
       ORDER BY v.fecha DESC`,
      [id_negocio]
    );
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

// Obtener detalle de una venta
const getDetalleVenta = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { id } = req.params;

    const [venta] = await db.query(
      `SELECT v.id_venta, v.total, v.metodo_pago, v.fecha,
              u.nombre AS usuario,
              c.nombre AS cliente
       FROM ventas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ? AND v.id_negocio = ?`,
      [id, id_negocio]
    );

    if (venta.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const [detalle] = await db.query(
      `SELECT dv.cantidad, dv.precio_unitario, dv.subtotal,
              p.nombre AS producto
       FROM detalle_ventas dv
       JOIN productos p ON dv.id_producto = p.id_producto
       WHERE dv.id_venta = ?`,
      [id]
    );

    res.json({ venta: venta[0], detalle });
  } catch (error) {
    console.error('Error al obtener detalle:', error);
    res.status(500).json({ error: 'Error al obtener detalle de venta' });
  }
};

// Crear venta
const crearVenta = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const id_negocio = req.usuario.id_negocio;
    const id_usuario = req.usuario.id_usuario;
    const { id_cliente, metodo_pago, productos } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
    }

    // Calcular total y validar stock
    let total = 0;
    for (const item of productos) {
      const [prod] = await connection.query(
        `SELECT stock_actual, precio_venta FROM productos 
         WHERE id_producto = ? AND id_negocio = ? AND activo = 1`,
        [item.id_producto, id_negocio]
      );

      if (prod.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: `Producto no encontrado` });
      }

      if (prod[0].stock_actual < item.cantidad) {
        await connection.rollback();
        return res.status(400).json({ error: `Stock insuficiente para el producto` });
      }

      item.precio_unitario = prod[0].precio_venta;
      item.subtotal = item.cantidad * prod[0].precio_venta;
      total += item.subtotal;
    }

    // Insertar venta
    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (id_negocio, id_usuario, id_cliente, total, metodo_pago) 
       VALUES (?, ?, ?, ?, ?)`,
      [id_negocio, id_usuario, id_cliente || null, total, metodo_pago || 'efectivo']
    );

    const id_venta = ventaResult.insertId;

    // Insertar detalle y actualizar stock
    for (const item of productos) {
      await connection.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) 
         VALUES (?, ?, ?, ?, ?)`,
        [id_venta, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]
      );

      await connection.query(
        `UPDATE productos SET stock_actual = stock_actual - ? 
         WHERE id_producto = ?`,
        [item.cantidad, item.id_producto]
      );

      // Registrar movimiento de salida
      await connection.query(
        `INSERT INTO movimientos (id_producto, id_usuario, tipo, cantidad, 
          stock_antes, stock_despues, motivo)
         SELECT id_producto, ?, 'salida', ?,
           stock_actual + ?, stock_actual, 'Venta'
         FROM productos WHERE id_producto = ?`,
        [id_usuario, item.cantidad, item.cantidad, item.id_producto]
      );
    }

    // Crear ticket automaticamente
    await connection.query(
      `INSERT INTO tickets (id_venta) VALUES (?)`,
      [id_venta]
    );

    await connection.commit();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      id_venta,
      total
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al registrar venta' });
  } finally {
    connection.release();
  }
};

// Obtener ticket de una venta
const getTicket = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { id } = req.params;

    const [venta] = await db.query(
      `SELECT v.id_venta, v.total, v.metodo_pago, v.fecha,
              u.nombre AS usuario,
              c.nombre AS cliente,
              n.nombre AS negocio,
              n.telefono AS telefono_negocio
       FROM ventas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       JOIN negocios n ON v.id_negocio = n.id_negocio
       WHERE v.id_venta = ? AND v.id_negocio = ?`,
      [id, id_negocio]
    );

    if (venta.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const [detalle] = await db.query(
      `SELECT dv.cantidad, dv.precio_unitario, dv.subtotal,
              p.nombre AS producto
       FROM detalle_ventas dv
       JOIN productos p ON dv.id_producto = p.id_producto
       WHERE dv.id_venta = ?`,
      [id]
    );

    // Marcar como reimpresion si ya existe ticket
    await db.query(
      `UPDATE tickets SET reimpresion = 1 
       WHERE id_venta = ?`,
      [id]
    );

    res.json({ venta: venta[0], detalle });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

module.exports = { getVentas, getDetalleVenta, crearVenta, getTicket };