const pool = require('../config/db');

const InventoryMovementModel = {
  // Obtener todos los movimientos con JOIN y paginación
  getAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT im.*, b.name AS branch_name, p.name AS product_name, p.sku
       FROM inventory_movements im
       JOIN branches b ON im.branch_id = b.id
       JOIN products p ON im.product_id = p.id
       ORDER BY im.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  countAll: async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM inventory_movements');
    return rows[0].total;
  },

  // Obtener movimientos de una sucursal con paginación
  getByBranch: async (branchId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      `SELECT im.*, p.name AS product_name, p.sku 
       FROM inventory_movements im
       JOIN products p ON im.product_id = p.id
       WHERE im.branch_id = ?
       ORDER BY im.created_at DESC
       LIMIT ? OFFSET ?`,
      [branchId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  countByBranch: async (branchId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as total FROM inventory_movements WHERE branch_id = ?',
      [branchId]
    );
    return rows[0].total;
  },

  // Obtener un movimiento por ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT im.*, b.name AS branch_name, p.name AS product_name, p.sku
       FROM inventory_movements im
       JOIN branches b ON im.branch_id = b.id
       JOIN products p ON im.product_id = p.id
       WHERE im.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Crear un movimiento con sincronización de inventario
  create: async (branchId, productId, type, quantity, referenceId = null, referenceType = null) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insertar el movimiento
      const [result] = await connection.query(
        `INSERT INTO inventory_movements 
         (branch_id, product_id, type, quantity, reference_id, reference_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [branchId, productId, type, quantity, referenceId, referenceType]
      );

      // 2. Determinar operación de inventario
      const isAddition = (type === 'IN' || type === 'TRANSFER_IN');
      const op = isAddition ? '+' : '-';
      
      // 3. Sincronizar tabla inventory
      // Si es adición, INSERT ... ON DUPLICATE KEY UPDATE funciona perfecto
      // Si es sustracción, asumimos que el registro existe (o fallará si quantity queda negativo y hay CHECK, pero MySQL por defecto no lo tiene)
      await connection.query(
        `INSERT INTO inventory (branch_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity ${op} ?`,
        [branchId, productId, isAddition ? quantity : -quantity, quantity]
      );

      await connection.commit();
      return { id: result.insertId, branchId, productId, type, quantity, referenceId, referenceType };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  // Eliminar un movimiento
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM inventory_movements WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Mantener métodos necesarios para analíticas
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

  getSummaryByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT p.name, p.sku,
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
