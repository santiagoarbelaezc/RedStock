const pool = require('../config/db');

const InventoryModel = {
  // Inventario de una sucursal con datos del producto
  getByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT i.id, i.branch_id, i.product_id, i.quantity, i.updated_at,
              p.name AS product_name, p.sku, p.description
       FROM inventory i
       JOIN products p ON p.id = i.product_id
       WHERE i.branch_id = ?
       ORDER BY p.name`,
      [branchId]
    );
    return rows;
  },

  // Inventario de todas las sucursales
  getAllBranches: async () => {
    const [rows] = await pool.query(
      `SELECT i.id, i.branch_id, i.product_id, i.quantity, i.updated_at,
              b.name AS branch_name, b.address,
              p.name AS product_name, p.sku
       FROM inventory i
       JOIN branches b ON b.id = i.branch_id
       JOIN products p ON p.id = i.product_id
       ORDER BY b.name, p.name`
    );
    return rows;
  },

  getByBranchAndProduct: async (branchId, productId) => {
    const [rows] = await pool.query(
      'SELECT * FROM inventory WHERE branch_id = ? AND product_id = ?',
      [branchId, productId]
    );
    return rows[0] || null;
  },

  // Inserta o actualiza la cantidad (INSERT ON DUPLICATE KEY UPDATE)
  upsert: async (branchId, productId, quantity) => {
    await pool.query(
      `INSERT INTO inventory (branch_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
      [branchId, productId, quantity]
    );
    return InventoryModel.getByBranchAndProduct(branchId, productId);
  },

  // Reemplaza la cantidad existente (ajuste manual)
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
