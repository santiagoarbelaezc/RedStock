const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_NAME, TEST_DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const dbName = process.env.NODE_ENV === 'test' ? (TEST_DB_NAME || 'redstock_test') : (DB_NAME || 'redstock');

const pool = mysql.createPool({
  host:               DB_HOST     || 'localhost',
  port:               DB_PORT     || 3306,
  database:           dbName,
  user:               DB_USER     || 'root',
  password:           DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// ─── Verificar la conexión al iniciar ────────────────────────
pool.getConnection()
  .then(async (conn) => {
    if (process.env.NODE_ENV !== 'test') {
      const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅  Base de datos conectada correctamente');
      console.log(`    Host     : ${DB_HOST}:${DB_PORT}`);
      console.log(`    Database : ${dbName}`);
      console.log(`    Usuario  : ${DB_USER}`);
      console.log(`    MySQL    : v${version}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    conn.release();
  })
  .catch((err) => {
    if (process.env.NODE_ENV !== 'test') {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌  Error al conectar a la base de datos');
      console.error(`    Host     : ${DB_HOST}:${DB_PORT}`);
      console.error(`    Database : ${dbName}`);
      console.error(`    Motivo   : ${err.message}`);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    process.exit(1); 
  });

module.exports = pool;
