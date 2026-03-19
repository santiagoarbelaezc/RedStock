const pool = require('../config/db');

const TransferModel = {
  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT t.*,
              ob.name AS origin_branch_name,
              db2.name AS destination_branch_name
       FROM transfers t
       JOIN branches ob  ON ob.id  = t.origin_branch_id
       JOIN branches db2 ON db2.id = t.destination_branch_id
       ORDER BY t.requested_at DESC`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT t.*,
              ob.name AS origin_branch_name,
              db2.name AS destination_branch_name
       FROM transfers t
       JOIN branches ob  ON ob.id  = t.origin_branch_id
       JOIN branches db2 ON db2.id = t.destination_branch_id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Traslados donde una sucursal es origen o destino
  getByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT t.*,
              ob.name AS origin_branch_name,
              db2.name AS destination_branch_name
       FROM transfers t
       JOIN branches ob  ON ob.id  = t.origin_branch_id
       JOIN branches db2 ON db2.id = t.destination_branch_id
       WHERE t.origin_branch_id = ? OR t.destination_branch_id = ?
       ORDER BY t.requested_at DESC`,
      [branchId, branchId]
    );
    return rows;
  },

  create: async (originBranchId, destinationBranchId) => {
    const [result] = await pool.query(
      `INSERT INTO transfers (origin_branch_id, destination_branch_id, status)
       VALUES (?, ?, 'PENDING')`,
      [originBranchId, destinationBranchId]
    );
    return TransferModel.getById(result.insertId);
  },

  updateStatus: async (transferId, status, receivedAt = null) => {
    await pool.query(
      `UPDATE transfers SET status = ?, received_at = ? WHERE id = ?`,
      [status, receivedAt, transferId]
    );
    return TransferModel.getById(transferId);
  },
};

module.exports = TransferModel;
