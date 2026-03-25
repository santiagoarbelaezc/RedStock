const pool = require('../config/db');
const { getConnection, commit, rollback } = require('../utils/transaction');

const SaleModel = {
  getAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT s.*, b.name AS branch_name, p.name AS product_name, p.sku
       FROM sales s
       JOIN branches b ON s.branch_id = b.id
       JOIN products p ON s.product_id = p.id
       ORDER BY s.sale_date DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  countAll: async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM sales');
    return rows[0].total;
  },

  getByBranch: async (branchId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT s.*, p.name AS product_name, p.sku
       FROM sales s
       JOIN products p ON p.id = s.product_id
       WHERE s.branch_id = ?
       ORDER BY s.sale_date DESC
       LIMIT ? OFFSET ?`,
      [branchId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  countByBranch: async (branchId) => {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM sales WHERE branch_id = ?', [branchId]);
    return rows[0].total;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT s.*, b.name AS branch_name, p.name AS product_name, p.sku
       FROM sales s
       JOIN branches b ON s.branch_id = b.id
       JOIN products p ON s.product_id = p.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  },

  createSale: async ({ branch_id, product_id, quantity, total }) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw Object.assign(new Error('La cantidad debe ser un entero positivo'), { statusCode: 400 });
    }
    if (isNaN(total) || total <= 0) {
      throw Object.assign(new Error('El total debe ser un valor monetario positivo'), { statusCode: 400 });
    }

    const conn = await getConnection(pool);
    try {
      const [rows] = await conn.execute(
        'SELECT quantity FROM inventory WHERE branch_id = ? AND product_id = ? FOR UPDATE',
        [branch_id, product_id]
      );
      if (rows.length === 0) {
        throw Object.assign(
          new Error('El producto no tiene stock registrado en esta sucursal'),
          { statusCode: 404 }
        );
      }
      const available = rows[0].quantity;
      if (available < quantity) {
        throw Object.assign(
          new Error(`Stock insuficiente. Disponible: ${available} unidades, solicitado: ${quantity} unidades`),
          { statusCode: 409 }
        );
      }

      const [saleResult] = await conn.execute(
        'INSERT INTO sales (branch_id, product_id, quantity, total) VALUES (?, ?, ?, ?)',
        [branch_id, product_id, quantity, total]
      );

      await conn.execute(
        'UPDATE inventory SET quantity = quantity - ? WHERE branch_id = ? AND product_id = ?',
        [quantity, branch_id, product_id]
      );

      await conn.execute(
        `INSERT INTO inventory_movements 
         (branch_id, product_id, type, quantity, reference_id, reference_type) 
         VALUES (?, ?, 'OUT', ?, ?, 'sale')`,
        [branch_id, product_id, quantity, saleResult.insertId]
      );

      await commit(conn);
      return { id: saleResult.insertId, branchId: branch_id, productId: product_id, quantity, total };
    } catch (err) {
      await rollback(conn);
      throw err;
    }
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    return result.affectedRows > 0;
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

  getLastMonths: async (branchId, months = 6) => {
    const [rows] = await pool.query(
      `SELECT YEAR(sale_date) AS year, MONTH(sale_date) AS month,
              SUM(total) AS total_revenue, SUM(quantity) AS total_units,
              COUNT(*) AS total_transactions
       FROM sales WHERE branch_id = ? AND sale_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY YEAR(sale_date), MONTH(sale_date)
       ORDER BY year DESC, month DESC`,
      [branchId, months]
    );
    return rows;
  }
};

module.exports = SaleModel;
