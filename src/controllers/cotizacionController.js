// src/controllers/cotizacionController.js - BACKEND
const db = require('../config/database');

const getCotizaciones = async (req, res) => {
  const { id_negocio } = req.usuario;

  try {
    const [cotizaciones] = await db.query(
      `SELECT c.*, cl.nombre AS cliente, u.nombre AS usuario
       FROM cotizaciones c
       LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
       LEFT JOIN usuarios u ON u.id_negocio = c.id_negocio
       WHERE c.id_negocio = ?
       ORDER BY c.fecha DESC`,
      [id_negocio]
    );
    res.json(cotizaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

const crearCotizacion = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id_cliente, nombre_cliente, notas, productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'Agrega al menos un producto' });
  }

  try {
    const total = productos.reduce((acc, p) => {
      const subtotal = p.precio_unitario * p.cantidad * (1 - (p.descuento || 0) / 100);
      return acc + subtotal;
    }, 0);

    const [resultado] = await db.query(
      `INSERT INTO cotizaciones (id_negocio, id_cliente, nombre_cliente, total, notas)
       VALUES (?, ?, ?, ?, ?)`,
      [id_negocio, id_cliente || null, nombre_cliente || null, total.toFixed(2), notas || null]
    );

    const id_cotizacion = resultado.insertId;

    for (const p of productos) {
      const subtotal = p.precio_unitario * p.cantidad * (1 - (p.descuento || 0) / 100);
      await db.query(
        `INSERT INTO detalle_cotizaciones
           (id_cotizacion, id_producto, nombre_producto, precio_unitario, cantidad, descuento, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id_cotizacion, p.id_producto, p.nombre_producto, p.precio_unitario, p.cantidad, p.descuento || 0, subtotal.toFixed(2)]
      );
    }

    res.status(201).json({ mensaje: 'Cotizacion creada exitosamente', id_cotizacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cotizacion' });
  }
};

const getDetalleCotizacion = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;

  try {
    const [[cotizacion]] = await db.query(
      `SELECT c.*, cl.nombre AS cliente, n.nombre AS negocio,
              n.telefono AS telefono_negocio, n.logoBase64
       FROM cotizaciones c
       LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
       JOIN negocios n ON c.id_negocio = n.id_negocio
       WHERE c.id_cotizacion = ? AND c.id_negocio = ?`,
      [id, id_negocio]
    );

    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotizacion no encontrada' });
    }

    const [detalle] = await db.query(
      `SELECT * FROM detalle_cotizaciones WHERE id_cotizacion = ?`,
      [id]
    );

    res.json({ cotizacion, detalle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cotizacion' });
  }
};

const eliminarCotizacion = async (req, res) => {
  const { id_negocio } = req.usuario;
  const { id } = req.params;

  try {
    await db.query(
      'DELETE FROM detalle_cotizaciones WHERE id_cotizacion = ?',
      [id]
    );
    await db.query(
      'DELETE FROM cotizaciones WHERE id_cotizacion = ? AND id_negocio = ?',
      [id, id_negocio]
    );
    res.json({ mensaje: 'Cotizacion eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cotizacion' });
  }
};

module.exports = { getCotizaciones, crearCotizacion, getDetalleCotizacion, eliminarCotizacion };