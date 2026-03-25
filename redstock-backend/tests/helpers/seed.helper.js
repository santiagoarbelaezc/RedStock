const pool = require('../../src/config/db');

const cleanAndSeed = async () => {
  // Limpiar en orden por FK
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
  await pool.execute('TRUNCATE TABLE inventory_movements');
  await pool.execute('TRUNCATE TABLE transfer_items');
  await pool.execute('TRUNCATE TABLE transfers');
  await pool.execute('TRUNCATE TABLE sales');
  await pool.execute('TRUNCATE TABLE inventory');
  await pool.execute('TRUNCATE TABLE products');
  await pool.execute('TRUNCATE TABLE users');
  await pool.execute('TRUNCATE TABLE branches');
  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  // Seed base
  await pool.execute("INSERT INTO branches VALUES (1,'Sucursal A','Calle 1',NOW()),(2,'Sucursal B','Calle 2',NOW())");
  await pool.execute("INSERT INTO products (id,name,sku) VALUES (1,'Producto Test','SKU-001'),(2,'Producto Sin Stock','SKU-002')");
  // Admin de sucursal A (password: Test1234!)
  await pool.execute("INSERT INTO users (id,name,email,password,role,branch_id) VALUES (1,'Admin A','admin@test.com','$2b$10$Uq4I8xQG8t1/7E3zI08Jd.G1F1u2G31wN01R19/vI9D0lI9P0h1e','admin',1)");
  // Stock: Sucursal A tiene 10 unidades del producto 1, 0 del producto 2
  await pool.execute("INSERT INTO inventory (branch_id,product_id,quantity) VALUES (1,1,10),(1,2,0)");
};

module.exports = { cleanAndSeed };
