const request = require('supertest');
const app = require('../../src/app');
const { loginAs } = require('../helpers/auth.helper');
const pool = require('../../src/config/db');

describe('VENTAS — Validación estricta de stock', () => {
  let token;

  beforeAll(async () => {
    token = await loginAs('admin@test.com', 'Test1234!');
  });

  test('POST /api/sales — venta válida descuenta stock correctamente', async () => {
    // 1. Crear venta de 3 unidades del producto 1 en sucursal A (stock: 10)
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        branch_id: 1,
        product_id: 1,
        quantity: 3,
        total: 300,
        sale_date: new Date().toISOString()
      });

    // 2. Verificar respuesta 201
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // 3. Verificar que inventory.quantity ahora es 7
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    expect(invRows[0].quantity).toBe(7);

    // 4. Verificar que se creó registro en inventory_movements con type='OUT'
    const [movRows] = await pool.query("SELECT * FROM inventory_movements WHERE reference_id = ? AND type = 'OUT'", [res.body.data.id]);
    expect(movRows.length).toBe(1);
    expect(movRows[0].quantity).toBe(3);
  });

  test('POST /api/sales — stock insuficiente -> 409 con mensaje claro', async () => {
    // Intentar vender 50 unidades cuando solo hay 7
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        branch_id: 1,
        product_id: 1,
        quantity: 50,
        total: 5000
      });

    // Verificar status 409
    expect(res.status).toBe(409);
    // Verificar mensaje
    expect(res.body.message).toMatch(/Disponible: 7 unidades, solicitado: 50/);

    // Verificar que inventory NO cambió (sigue siendo 7)
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    expect(invRows[0].quantity).toBe(7);
  });

  test('POST /api/sales — producto sin stock registrado en sucursal -> 404', async () => {
    // Intentar vender producto 2 en sucursal A, (está configurado con cantidad 0, que es stock insuficiente, pero veamos si está)
    // Producto que no existe: 999
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        branch_id: 1,
        product_id: 999,
        quantity: 1,
        total: 100
      });

    expect(res.status).toBe(404);
  });

  test('POST /api/sales — quantity = 0 -> 400', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ branch_id: 1, product_id: 1, quantity: 0, total: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/sales — quantity negativa -> 400', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ branch_id: 1, product_id: 1, quantity: -5, total: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/sales — total = 0 -> 400', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ branch_id: 1, product_id: 1, quantity: 1, total: 0 });
    expect(res.status).toBe(400);
  });

  test('POST /api/sales — sin autenticación -> 401', async () => {
    const res = await request(app)
      .post('/api/sales')
      .send({ branch_id: 1, product_id: 1, quantity: 1, total: 100 });
    expect(res.status).toBe(401);
  });

  test('POST /api/sales — venta que agota exactamente el stock -> 201 y stock queda en 0', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ branch_id: 1, product_id: 1, quantity: 7, total: 700 });
      
    expect(res.status).toBe(201);
    
    // Verificar stock 0
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    expect(invRows[0].quantity).toBe(0);
  });

  test('POST /api/sales — dos ventas concurrentes que exceden el stock -> solo una pasa', async () => {
    // Reset stock a 5
    await pool.query('UPDATE inventory SET quantity = 5 WHERE branch_id = 1 AND product_id = 1');

    const p1 = request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ branch_id: 1, product_id: 1, quantity: 4, total: 400 });

    const p2 = request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({ branch_id: 1, product_id: 1, quantity: 4, total: 400 });

    const results = await Promise.allSettled([p1, p2]);
    const responses = results.map(r => r.value.status);
    
    // Una debe ser 201 y la otra 409
    expect(responses).toContain(201);
    expect(responses).toContain(409);

    // Stock final debe ser 1 (5 - 4)
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    expect(invRows[0].quantity).toBe(1);
  });
});
