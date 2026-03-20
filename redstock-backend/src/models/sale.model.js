const pool = require('../config/db');

const SaleModel = {
  // Obtener todas las ventas con JOIN y paginación
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

  // Obtener ventas por sucursal con paginación
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

  // Obtener una venta por ID
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

  // Crear una venta con transacción y actualización de inventario
  create: async (branchId, productId, quantity, total, saleDate = null) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insertar la venta
      const [result] = await connection.query(
        `INSERT INTO sales (branch_id, product_id, quantity, total, sale_date)
         VALUES (?, ?, ?, ?, ?)`,
        [branchId, productId, quantity, total, saleDate || new Date()]
      );

      const saleId = result.insertId;

      // 2. Actualizar inventario (Restar cantidad)
      const [invResult] = await connection.query(
        `UPDATE inventory SET quantity = quantity - ? 
         WHERE branch_id = ? AND product_id = ?`,
        [quantity, branchId, productId]
      );

      if (invResult.affectedRows === 0) {
        throw new Error('No se pudo encontrar el producto en el inventario de esta sucursal');
      }

      // 3. Registrar movimiento de inventario (Salida por Venta)
      await connection.query(
        `INSERT INTO inventory_movements 
         (branch_id, product_id, type, quantity, reference_id, reference_type) 
         VALUES (?, ?, 'OUT', ?, ?, 'sale')`,
        [branchId, productId, quantity, saleId]
      );

      await connection.commit();
      return { id: saleId, branchId, productId, quantity, total, saleDate };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // Eliminar una venta
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM sales WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Métodos anteriores para analiticas (mantener compatibilidad si se usan)
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
