// src/controllers/reporteController.js - BACKEND
const db = require('../config/database');

const getReporteVentas = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;
    const { desde, hasta } = req.query;

    const fechaDesde = desde || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const [ventas] = await db.query(
      `SELECT v.id_venta, v.fecha, v.total, v.metodo_pago,
              u.nombre AS cajero,
              c.nombre AS cliente
       FROM ventas v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_negocio = ?
       AND DATE(v.fecha) BETWEEN ? AND ?
       ORDER BY v.fecha DESC`,
      [id_negocio, fechaDesde, fechaHasta]
    );

    const [[{ total_general }]] = await db.query(
      `SELECT COALESCE(SUM(total), 0) AS total_general
       FROM ventas
       WHERE id_negocio = ?
       AND DATE(fecha) BETWEEN ? AND ?`,
      [id_negocio, fechaDesde, fechaHasta]
    );

    res.json({
      ventas,
      total_general: parseFloat(total_general).toFixed(2),
      desde: fechaDesde,
      hasta: fechaHasta
    });

  } catch (error) {
    console.error('Error al obtener reporte ventas:', error);
    res.status(500).json({ error: 'Error al obtener reporte de ventas' });
  }
};

const getReporteInventario = async (req, res) => {
  try {
    const id_negocio = req.usuario.id_negocio;

    const [productos] = await db.query(
      `SELECT p.nombre, p.codigo_barras, p.precio_compra, p.precio_venta,
              p.stock_actual, p.stock_minimo,
              c.nombre AS categoria,
              (p.stock_actual * p.precio_compra) AS valor_total,
              CASE WHEN p.stock_actual <= p.stock_minimo THEN 'Stock Bajo' ELSE 'Activo' END AS estado
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.id_negocio = ? AND p.activo = 1
       ORDER BY p.nombre ASC`,
      [id_negocio]
    );

    const [[{ valor_inventario }]] = await db.query(
      `SELECT COALESCE(SUM(stock_actual * precio_compra), 0) AS valor_inventario
       FROM productos
       WHERE id_negocio = ? AND activo = 1`,
      [id_negocio]
    );

    res.json({
      productos,
      valor_inventario: parseFloat(valor_inventario).toFixed(2),
      total_productos: productos.length
    });

  } catch (error) {
    console.error('Error al obtener reporte inventario:', error);
    res.status(500).json({ error: 'Error al obtener reporte de inventario' });
  }
};

module.exports = { getReporteVentas, getReporteInventario };