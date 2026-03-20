const pool = require('../config/db');

const SaleModel = {
  getByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT s.*, p.name AS product_name, p.sku
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.branch_id = ?
       ORDER BY s.sale_date DESC`,
      [branchId]
    );
    return rows;
  },

  getByBranchAndMonth: async (branchId, year, month) => {
    const [rows] = await pool.query(
      `SELECT s.*, p.name AS product_name, p.sku
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.branch_id = ?
         AND YEAR(s.sale_date)  = ?
         AND MONTH(s.sale_date) = ?
       ORDER BY s.sale_date DESC`,
      [branchId, year, month]
    );
    return rows;
  },

  // Retorna los últimos N meses agrupados con total de ventas y unidades
  getLastMonths: async (branchId, months = 6) => {
    const [rows] = await pool.query(
      `SELECT
         YEAR(sale_date)  AS year,
         MONTH(sale_date) AS month,
         SUM(total)       AS total_revenue,
         SUM(quantity)    AS total_units,
         COUNT(*)         AS total_transactions
       FROM sales
       WHERE branch_id = ?
         AND sale_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY YEAR(sale_date), MONTH(sale_date)
       ORDER BY year DESC, month DESC`,
      [branchId, months]
    );
    return rows;
  },

  create: async (branchId, productId, quantity, total) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        `INSERT INTO sales (branch_id, product_id, quantity, total)
         VALUES (?, ?, ?, ?)`,
        [branchId, productId, quantity, total]
      );

      // Registrar movimiento de inventario (Salida por Venta)
      await connection.query(
        `INSERT INTO inventory_movements 
         (branch_id, product_id, type, quantity, reference_id, reference_type) 
         VALUES (?, ?, 'OUT', ?, ?, 'sale')`,
        [branchId, productId, quantity, result.insertId]
      );

      await connection.commit();
      return { id: result.insertId, branchId, productId, quantity, total };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // Obtiene ventas diarias para los últimos N meses (útil para gráficos de línea)
  getDailySales: async (branchId, months = 1) => {
    const [rows] = await pool.query(
      `SELECT
         DATE(sale_date) AS date,
         SUM(total)      AS total_revenue,
         SUM(quantity)   AS total_units,
         COUNT(*)        AS transactions
       FROM sales
       WHERE branch_id = ?
         AND sale_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY DATE(sale_date)
       ORDER BY date ASC`,
      [branchId, months]
    );
    return rows;
  },

  // Obtiene los productos más vendidos
  getTopProducts: async (branchId, limit = 5) => {
    const [rows] = await pool.query(
      `SELECT
         p.name,
         SUM(s.total)    AS total_revenue,
         SUM(s.quantity) AS total_units
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.branch_id = ?
       GROUP BY s.product_id
       ORDER BY total_revenue DESC
       LIMIT ?`,
      [branchId, limit]
    );
    return rows;
  },
};

module.exports = SaleModel;
