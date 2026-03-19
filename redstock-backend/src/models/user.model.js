const pool = require('../config/db');

const UserModel = {
  getAll: async () => {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, branch_id, created_at FROM users ORDER BY id'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, branch_id, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  getByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  create: async (name, email, password, role, branchId) => {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, branch_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, role || 'employee', branchId]
    );
    return { id: result.insertId, name, email, role, branchId };
  },

  update: async (id, { name, email, role, branchId }) => {
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ?, branch_id = ? WHERE id = ?',
      [name, email, role, branchId, id]
    );
    return { id, name, email, role, branchId };
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;
