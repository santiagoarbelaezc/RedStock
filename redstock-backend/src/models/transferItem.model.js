const pool = require('../config/db');

const TransferItemModel = {
  getByTransfer: async (transferId) => {
    const [rows] = await pool.query(
      `SELECT ti.*, p.name AS product_name, p.sku
       FROM transfer_items ti
       JOIN products p ON p.id = ti.product_id
       WHERE ti.transfer_id = ?`,
      [transferId]
    );
    return rows;
  },

  create: async (transferId, productId, requestedQty) => {
    const [result] = await pool.query(
      `INSERT INTO transfer_items (transfer_id, product_id, requested_qty)
       VALUES (?, ?, ?)`,
      [transferId, productId, requestedQty]
    );
    return { id: result.insertId, transferId, productId, requestedQty };
  },

  confirmReception: async (itemId, receivedQty, notes = null) => {
    await pool.query(
      `UPDATE transfer_items SET received_qty = ?, notes = ? WHERE id = ?`,
      [receivedQty, notes, itemId]
    );
    const [rows] = await pool.query(
      'SELECT * FROM transfer_items WHERE id = ?',
      [itemId]
    );
    return rows[0] || null;
  },
};

module.exports = TransferItemModel;
