const pool = require('../config/db');

const BranchModel = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM branches ORDER BY id');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM branches WHERE id = ?', [id]);
    return rows[0] || null;
  },

  create: async (name, address) => {
    const [result] = await pool.query(
      'INSERT INTO branches (name, address) VALUES (?, ?)',
      [name, address]
    );
    return { id: result.insertId, name, address };
  },

  update: async (id, name, address) => {
    await pool.query(
      'UPDATE branches SET name = ?, address = ? WHERE id = ?',
      [name, address, id]
    );
    return { id, name, address };
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM branches WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = BranchModel;
