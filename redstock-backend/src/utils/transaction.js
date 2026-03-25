const getConnection = async (pool) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  return conn;
};

const commit = async (conn) => {
  await conn.commit();
  conn.release();
};

const rollback = async (conn) => {
  await conn.rollback();
  conn.release();
};

module.exports = { getConnection, commit, rollback };
