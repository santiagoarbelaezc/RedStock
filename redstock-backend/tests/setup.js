const pool = require('../src/config/db');
const { cleanAndSeed } = require('./helpers/seed.helper');

beforeAll(async () => {
  await cleanAndSeed();
});

afterAll(async () => {
  await pool.end();
});
