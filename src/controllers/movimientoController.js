const db = require('../config/database');

// Registrar un movimiento de inventario
const crearMovimiento = async (req, res) => {
  const { id_usuario, id_negocio } = req.usuario;
  const { id_producto, tipo, cantidad, motivo } = req.body;

  try {
    // Obtener stock actual del producto
    const [productos] = await db.query(
      'SELECT stock_actual FROM productos WHERE id_producto = ? AND id_negocio = ?',
      [id_producto, id_negocio]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const stock_antes = productos[0].stock_actual;
    let stock_despues;

    // Calcular nuevo stock segun tipo de movimiento
    if (tipo === 'entrada') {
      stock_despues = stock_antes + parseInt(cantidad);
    } else if (tipo === 'salida') {
      if (stock_antes < cantidad) {
        return res.status(400).json({ error: 'Stock insuficiente para realizar la salida' });
      }
      stock_despues = stock_antes - parseInt(cantidad);
    } else if (tipo === 'ajuste') {
      stock_despues = parseInt(cantidad);
    } else {
      return res.status(400).json({ error: 'Tipo de movimiento invalido' });
    }

    // Registrar el movimiento
    await db.query(
      `INSERT INTO movimientos (id_producto, id_usuario, tipo, cantidad, stock_antes, stock_despues, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_producto, id_usuario, tipo, cantidad, stock_antes, stock_despues, motivo]
    );

    // Actualizar stock del producto
    await db.query(
      'UPDATE productos SET stock_actual = ? WHERE id_producto = ?',
      [stock_despues, id_producto]
    );

    res.status(201).json({
      mensaje: 'Movimiento registrado exitosamente',
      stock_antes,
      stock_despues
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar movimiento' });
  }
};

// Obtener historial de movimientos del negocio
const getMovimientos = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [movimientos] = await db.query(
      `SELECT m.*, p.nombre AS producto, u.nombre AS usuario
       FROM movimientos m
       INNER JOIN productos p ON m.id_producto = p.id_producto
       INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
       WHERE p.id_negocio = ?
       ORDER BY m.fecha DESC
       LIMIT 100`,
      [id_negocio]
    );
    res.json(movimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

// Obtener movimientos de un producto especifico
const getMovimientosPorProducto = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;

  try {
    const [movimientos] = await db.query(
      `SELECT m.*, u.nombre AS usuario
       FROM movimientos m
       INNER JOIN usuarios u ON m.id_usuario = u.id_usuario
       INNER JOIN productos p ON m.id_producto = p.id_producto
       WHERE m.id_producto = ? AND p.id_negocio = ?
       ORDER BY m.fecha DESC`,
      [id, id_negocio]
    );
    res.json(movimientos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener movimientos del producto' });
  }
};

module.exports = { crearMovimiento, getMovimientos, getMovimientosPorProducto };