const pool = require('../config/db');
const { getConnection, commit, rollback } = require('../utils/transaction');

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
    // Para simplificar, obtenemos los items sin join
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

  getByBranch: async (branchId, limit = 10, offset = 0) => {
    const [rows] = await pool.query(
      `SELECT t.*,
              ob.name AS origin_branch_name,
              db2.name AS destination_branch_name
       FROM transfers t
       JOIN branches ob  ON ob.id  = t.origin_branch_id
       JOIN branches db2 ON db2.id = t.destination_branch_id
       WHERE t.origin_branch_id = ? OR t.destination_branch_id = ?
       ORDER BY t.requested_at DESC
       LIMIT ? OFFSET ?`,
      [branchId, branchId, parseInt(limit), parseInt(offset)]
    );
    return rows;
  },

  countByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total
       FROM transfers t
       WHERE t.origin_branch_id = ? OR t.destination_branch_id = ?`,
      [branchId, branchId]
    );
    return rows[0].total;
  },

  createTransfer: async ({ origin_branch_id, destination_branch_id, items }) => {
    if (Number(origin_branch_id) === Number(destination_branch_id)) {
      throw Object.assign(new Error('El origen y destino del traslado no pueden ser la misma sucursal'), { statusCode: 400 });
    }

    const failedItems = [];
    for (const item of items) {
      const [rows] = await pool.execute(
        'SELECT i.quantity, p.name, p.sku FROM inventory i RIGHT JOIN products p ON p.id = i.product_id AND i.branch_id = ? WHERE p.id = ?',
        [origin_branch_id, item.product_id]
      );
      if (rows.length === 0 || rows[0].quantity === null) {
         // product logic slightly simplified for this snippet
         failedItems.push({ product_id: item.product_id, sku: rows[0]?.sku, disponible: 0, solicitado: item.requested_qty });
      } else {
        const available = rows[0].quantity;
        if (available < item.requested_qty) {
          failedItems.push({ product_id: item.product_id, sku: rows[0].sku, disponible: available, solicitado: item.requested_qty });
        }
      }
    }

    if (failedItems.length > 0) {
      const err = new Error('Stock insuficiente para los siguientes productos');
      err.statusCode = 409;
      err.items = failedItems;
      throw err;
    }

    const conn = await getConnection(pool);
    try {
      const [transferResult] = await conn.execute(
        `INSERT INTO transfers (origin_branch_id, destination_branch_id, status) VALUES (?, ?, 'PENDING')`,
        [origin_branch_id, destination_branch_id]
      );
      const transferId = transferResult.insertId;

      for (const item of items) {
        await conn.execute(
          `INSERT INTO transfer_items (transfer_id, product_id, requested_qty) VALUES (?, ?, ?)`,
          [transferId, item.product_id, item.requested_qty]
        );
      }

      await commit(conn);
      return TransferModel.getById(transferId);
    } catch (err) {
      await rollback(conn);
      throw err;
    }
  },

  updateStatusToInTransit: async (transfer_id, requesting_user) => {
    const conn = await getConnection(pool);
    try {
      const transferInfo = await TransferModel.getById(transfer_id);
      if (!transferInfo) throw Object.assign(new Error('Traslado no encontrado'), { statusCode: 404 });
      
      if (requesting_user.role !== 'superadmin' && Number(transferInfo.origin_branch_id) !== Number(requesting_user.branch_id)) {
         throw Object.assign(new Error('Acceso denegado a la sucursal de origen'), { statusCode: 403 });
      }

      const [transfers] = await conn.execute('SELECT status FROM transfers WHERE id = ? FOR UPDATE', [transfer_id]);
      if (transfers.length === 0) throw Object.assign(new Error('Traslado no encontrado'), { statusCode: 404 });
      if (transfers[0].status !== 'PENDING') {
        throw Object.assign(new Error('El traslado debe estar en estado PENDING para enviarse.'), { statusCode: 400 });
      }

      const [items] = await conn.execute('SELECT product_id, requested_qty FROM transfer_items WHERE transfer_id = ?', [transfer_id]);
      for (const item of items) {
        const [invRows] = await conn.execute(
          'SELECT quantity FROM inventory WHERE branch_id = ? AND product_id = ? FOR UPDATE',
          [transferInfo.origin_branch_id, item.product_id]
        );
        const available = invRows.length > 0 ? invRows[0].quantity : 0;
        if (available < item.requested_qty) {
          throw Object.assign(new Error(`Stock insuficiente para el producto ${item.product_id} durante envío.`), { statusCode: 409 });
        }
        
        await conn.execute(
          'UPDATE inventory SET quantity = quantity - ? WHERE branch_id = ? AND product_id = ?',
          [item.requested_qty, transferInfo.origin_branch_id, item.product_id]
        );

        await conn.execute(
          `INSERT INTO inventory_movements (branch_id, product_id, type, quantity, reference_id, reference_type) VALUES (?, ?, 'TRANSFER_OUT', ?, ?, 'transfer')`,
          [transferInfo.origin_branch_id, item.product_id, item.requested_qty, transfer_id]
        );
      }

      await conn.execute(`UPDATE transfers SET status = 'IN_TRANSIT' WHERE id = ?`, [transfer_id]);

      await commit(conn);
      return TransferModel.getById(transfer_id);
    } catch (err) {
      await rollback(conn);
      throw err;
    }
  },

  confirmReception: async (transfer_id, received_items, requesting_user) => {
    const conn = await getConnection(pool);
    try {
       const transferInfo = await TransferModel.getById(transfer_id);
       if (!transferInfo) throw Object.assign(new Error('Traslado no encontrado'), { statusCode: 404 });

       if (requesting_user.role !== 'superadmin' && Number(transferInfo.destination_branch_id) !== Number(requesting_user.branch_id)) {
         throw Object.assign(new Error('Acceso denegado a la sucursal de destino'), { statusCode: 403 });
       }

       const [transfers] = await conn.execute('SELECT status FROM transfers WHERE id = ? FOR UPDATE', [transfer_id]);
       if (transfers.length === 0) throw Object.assign(new Error('Traslado no encontrado'), { statusCode: 404 });
       const currentStatus = transfers[0].status;

       if (currentStatus === 'RECEIVED' || currentStatus === 'PARTIAL') {
         throw Object.assign(new Error('El traslado ya fue completado y no puede modificarse.'), { statusCode: 400 });
       }

       if (currentStatus !== 'IN_TRANSIT') {
         throw Object.assign(new Error('El traslado debe estar en estado IN_TRANSIT para confirmarse.'), { statusCode: 400 });
       }

       let allFull = true;
       for (const rItem of received_items) {
          const [ti] = await conn.execute('SELECT id, product_id, requested_qty FROM transfer_items WHERE id = ? AND transfer_id = ?', [rItem.transfer_item_id, transfer_id]);
          if (ti.length > 0) {
            const reqQty = ti[0].requested_qty;
            const rQty = Number(rItem.received_qty) || 0;
            const notes = rItem.notes || null;
            if (rQty < reqQty) {
              allFull = false;
            }
            await conn.execute(
              'UPDATE transfer_items SET received_qty = ?, notes = ? WHERE id = ?',
              [rQty, notes, rItem.transfer_item_id]
            );

            if (rQty > 0) {
                await conn.execute(
                  `INSERT INTO inventory (branch_id, product_id, quantity) VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
                  [transferInfo.destination_branch_id, ti[0].product_id, rQty]
                );

                await conn.execute(
                  `INSERT INTO inventory_movements (branch_id, product_id, type, quantity, reference_id, reference_type) VALUES (?, ?, 'TRANSFER_IN', ?, ?, 'transfer')`,
                  [transferInfo.destination_branch_id, ti[0].product_id, rQty, transfer_id]
                );
            }
          }
       }

       const newStatus = allFull ? 'RECEIVED' : 'PARTIAL';
       await conn.execute(
         `UPDATE transfers SET status = ?, received_at = NOW() WHERE id = ?`,
         [newStatus, transfer_id]
       );

       await commit(conn);
       return TransferModel.getById(transfer_id);
    } catch (err) {
       await rollback(conn);
       throw err;
    }
  },

  delete: async (transferId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM transfer_items WHERE transfer_id = ?', [transferId]);
      await connection.query('DELETE FROM transfers WHERE id = ?', [transferId]);
      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

};

module.exports = TransferModel;
