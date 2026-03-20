const pool = require('../config/db');

const ProductModel = {
  getFiltered: async ({ page = 1, limit = 10, search = '', branchId = null }) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT DISTINCT p.* 
      FROM products p
    `;
    const params = [];

    if (branchId) {
      query += ` JOIN inventory i ON i.product_id = p.id AND i.branch_id = ?`;
      params.push(branchId);
    }

    const whereClauses = [];
    if (search) {
      whereClauses.push(`(p.name LIKE ? OR p.sku LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY p.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  countFiltered: async ({ search = '', branchId = null }) => {
    let query = `SELECT COUNT(DISTINCT p.id) as total FROM products p`;
    const params = [];

    if (branchId) {
      query += ` JOIN inventory i ON i.product_id = p.id AND i.branch_id = ?`;
      params.push(branchId);
    }

    if (search) {
      query += ` WHERE (p.name LIKE ? OR p.sku LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

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
