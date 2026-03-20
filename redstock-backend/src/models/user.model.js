const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, b.name as branch_name, u.created_at 
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       ORDER BY u.id`
    );
    return rows;
  },

  getAllByBranch: async (branchId) => {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, b.name as branch_name, u.created_at 
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.branch_id = ?
       ORDER BY u.id`,
      [branchId]
    );
    return rows;
  },

  getAllAdmins: async () => {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, b.name as branch_name, u.created_at 
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.role = 'admin'
       ORDER BY u.id`
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, b.name as branch_name, u.created_at 
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  getByEmail: async (email) => {
    const [rows] = await pool.query(
      `SELECT u.*, b.name as branch_name 
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.email = ?`,
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

  updatePassword: async (id, newPassword) => {
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
    return true;
  },

  delete: async (id) => {
    // No permitir eliminar al superadmin por ID o por rol si lo supiéramos, 
    // pero la restricción de rol es mejor en el controlador.
    const [result] = await pool.query('DELETE FROM users WHERE id = ? AND role != "superadmin"', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;
