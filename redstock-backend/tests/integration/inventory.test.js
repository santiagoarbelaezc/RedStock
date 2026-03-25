const request = require('supertest');
const app = require('../../src/app');
const { loginAs } = require('../helpers/auth.helper');
const pool = require('../../src/config/db');

describe('INVENTARIO', () => {
  let token;

  beforeAll(async () => {
    token = await loginAs('admin@test.com', 'Test1234!');
  });

  test('GET /api/inventory/:branchId — retorna stock actual', async () => {
    const res = await request(app)
      .get('/api/inventory/1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.inventory).toBeInstanceOf(Array);
  });

  test('GET /api/inventory/low-stock/:branchId — retorna productos con quantity <= 5', async () => {
    // Preparar datos:
    await pool.query('UPDATE inventory SET quantity = 3 WHERE branch_id = 1 AND product_id = 1');
    
    const res = await request(app)
      .get('/api/inventory/low-stock/1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].quantity).toBeLessThanOrEqual(5);
  });

  test('POST /api/inventory/adjust — admin puede reponer stock', async () => {
    const res = await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({
        branch_id: 1,
        product_id: 1,
        quantity: 20
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verificar que quantity aumentó
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    // Previo 3 + 20 = 23
    expect(invRows[0].quantity).toBe(23);

    // Verificar inventory_movements type='IN', reference_type='replenishment'
    const [movRows] = await pool.query("SELECT * FROM inventory_movements WHERE method = 'IN' OR type = 'IN' ORDER BY created_at DESC LIMIT 1");
    expect(movRows[0].reference_type).toBe('replenishment');
    expect(movRows[0].quantity).toBe(20);
  });

  test('POST /api/inventory/adjust — quantity negativa -> 400', async () => {
    const res = await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({
        branch_id: 1,
        product_id: 1,
        quantity: -10
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/inventory/adjust — campos incompletos -> 400', async () => {
    const res = await request(app)
      .post('/api/inventory/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: 1
      });

    expect(res.status).toBe(400);
  });
});
