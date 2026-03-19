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
    const [result] = await pool.query(
      `INSERT INTO sales (branch_id, product_id, quantity, total)
       VALUES (?, ?, ?, ?)`,
      [branchId, productId, quantity, total]
    );
    return { id: result.insertId, branchId, productId, quantity, total };
  },
};

module.exports = SaleModel;
