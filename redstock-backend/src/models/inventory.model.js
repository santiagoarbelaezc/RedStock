const pool = require('../config/db');
const { getConnection, commit, rollback } = require('../utils/transaction');

const InventoryModel = {
  getByBranch: async (branchId, page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT i.id, i.branch_id, i.product_id, i.quantity, i.updated_at,
             p.name AS product_name, p.sku, p.description
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      WHERE i.branch_id = ?
    `;
    const params = [branchId];

    if (search) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  countTotalByBranch: async (branchId, search = '') => {
    let query = 'SELECT COUNT(*) as total FROM inventory i JOIN products p ON p.id = i.product_id WHERE i.branch_id = ?';
    const params = [branchId];

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  getAllBranches: async (page = 1, limit = 10, search = '', branchId = null) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT i.id, i.branch_id, i.product_id, i.quantity, i.updated_at,
             b.name AS branch_name, b.address,
             p.name AS product_name, p.sku
      FROM inventory i
      JOIN branches b ON b.id = i.branch_id
      JOIN products p ON p.id = i.product_id
      WHERE 1=1
    `;
    const params = [];

    if (branchId) {
      query += ` AND i.branch_id = ?`;
      params.push(branchId);
    }

    if (search) {
      query += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY b.name, p.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  countTotalAll: async (search = '', branchId = null) => {
    let query = 'SELECT COUNT(*) as total FROM inventory i JOIN products p ON p.id = i.product_id WHERE 1=1';
    const params = [];

    if (branchId) {
      query += ' AND i.branch_id = ?';
      params.push(branchId);
    }

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  getByBranchAndProduct: async (branchId, productId) => {
    const [rows] = await pool.query(
      'SELECT * FROM inventory WHERE branch_id = ? AND product_id = ?',
      [branchId, productId]
    );
    return rows[0] || null;
  },

  upsert: async (branchId, productId, quantity) => {
    await pool.query(
      `INSERT INTO inventory (branch_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
      [branchId, productId, quantity]
    );
    return InventoryModel.getByBranchAndProduct(branchId, productId);
  },

  adjustStock: async (branch_id, product_id, quantity) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw Object.assign(new Error('La cantidad debe ser mayor a 0 para ajustar stock'), { statusCode: 400 });
    }

    const conn = await getConnection(pool);
    try {
      await conn.execute(
        `INSERT INTO inventory (branch_id, product_id, quantity) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
        [branch_id, product_id, quantity]
      );

      await conn.execute(
        `INSERT INTO inventory_movements (branch_id, product_id, type, quantity, reference_type) VALUES (?, ?, 'IN', ?, 'replenishment')`,
        [branch_id, product_id, quantity]
      );

      await commit(conn);
      return InventoryModel.getByBranchAndProduct(branch_id, product_id);
    } catch (err) {
      await rollback(conn);
      throw err;
    }
  },

  // Retenido para compatibilidad
  updateQuantity: async (branchId, productId, quantity) => {
    await pool.query(
      `INSERT INTO inventory (branch_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), updated_at = NOW()`,
      [branchId, productId, quantity]
    );
    return InventoryModel.getByBranchAndProduct(branchId, productId);
  },
};

module.exports = InventoryModel;
