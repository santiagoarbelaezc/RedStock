const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const pool = mysql.createPool({
  host:               DB_HOST     || 'localhost',
  port:               DB_PORT     || 3306,
  database:           DB_NAME     || 'redstock',
  user:               DB_USER     || 'root',
  password:           DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// ─── Verificar la conexión al iniciar ────────────────────────
pool.getConnection()
  .then(async (conn) => {
    const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅  Base de datos conectada correctamente');
    console.log(`    Host     : ${DB_HOST}:${DB_PORT}`);
    console.log(`    Database : ${DB_NAME}`);
    console.log(`    Usuario  : ${DB_USER}`);
    console.log(`    MySQL    : v${version}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    conn.release();
  })
  .catch((err) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌  Error al conectar a la base de datos');
    console.error(`    Host     : ${DB_HOST}:${DB_PORT}`);
    console.error(`    Database : ${DB_NAME}`);
    console.error(`    Motivo   : ${err.message}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1); // Detiene el servidor si no hay DB
  });

module.exports = pool;
