const pool = require('../config/db');

const ProductModel = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },

  getBySku: async (sku) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE sku = ?', [sku]);
    return rows[0] || null;
  },

  create: async (name, description, sku) => {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, sku) VALUES (?, ?, ?)',
      [name, description, sku]
    );
    return { id: result.insertId, name, description, sku };
  },

  update: async (id, { name, description, sku }) => {
    await pool.query(
      'UPDATE products SET name = ?, description = ?, sku = ? WHERE id = ?',
      [name, description, sku, id]
    );
    return { id, name, description, sku };
  },

  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ProductModel;
