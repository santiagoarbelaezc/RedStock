const pool = require('../config/db');

const InventoryMovementModel = {
  // Obtener movimientos de una sucursal con datos de producto
  getByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT im.*, p.name as product_name, p.sku 
       FROM inventory_movements im
       JOIN products p ON im.product_id = p.id
       WHERE im.branch_id = ?
       ORDER BY im.created_at DESC`,
      [branchId]
    );
    return rows;
  },

  // Obtener movimientos de un producto específico en los últimos N meses
  getByBranchAndProduct: async (branchId, productId, months = 3) => {
    const [rows] = await pool.query(
      `SELECT im.*, p.name as product_name, p.sku 
       FROM inventory_movements im
       JOIN products p ON im.product_id = p.id
       WHERE im.branch_id = ? 
         AND im.product_id = ?
         AND im.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? MONTH)
       ORDER BY im.created_at DESC`,
      [branchId, productId, months]
    );
    return rows;
  },

  // Crear un nuevo movimiento
  create: async (branchId, productId, type, quantity, referenceId = null, referenceType = null) => {
    const [result] = await pool.query(
      `INSERT INTO inventory_movements 
       (branch_id, product_id, type, quantity, reference_id, reference_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [branchId, productId, type, quantity, referenceId, referenceType]
    );
    return { id: result.insertId, branchId, productId, type, quantity, referenceId, referenceType };
  },

  // Resumen de entradas y salidas por producto en una sucursal
  getSummaryByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT 
         p.name, 
         p.sku,
         SUM(CASE WHEN im.type IN ('IN', 'TRANSFER_IN') THEN im.quantity ELSE 0 END) as total_in,
         SUM(CASE WHEN im.type IN ('OUT', 'TRANSFER_OUT') THEN im.quantity ELSE 0 END) as total_out
       FROM inventory_movements im
       JOIN products p ON im.product_id = p.id
       WHERE im.branch_id = ?
       GROUP BY im.product_id
       ORDER BY p.name ASC`,
      [branchId]
    );
    return rows;
  }
};

module.exports = InventoryMovementModel;
