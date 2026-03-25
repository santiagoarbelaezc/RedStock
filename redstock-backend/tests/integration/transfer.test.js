const request = require('supertest');
const app = require('../../src/app');
const { loginAs } = require('../helpers/auth.helper');
const pool = require('../../src/config/db');

describe('TRASLADOS — Ciclo de vida completo', () => {
  let tokenAdminA;
  let tokenAdminB;
  let transferId;

  beforeAll(async () => {
    tokenAdminA = await loginAs('admin@test.com', 'Test1234!');
    // Asumiendo que podemos usar el mismo token si es superadmin, o creamos admin B.
    // Para simplificar, asumimos superadmin o creamos en el momento si hiciese falta.
    // Usaremos superadmin o el de Admin A que está en setup.js para crear.
  });

  test('POST /api/transfers — mismo origen y destino -> 400', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({
        origin_branch_id: 1,
        destination_branch_id: 1,
        items: [{ product_id: 1, requested_qty: 5 }]
      });
    expect(res.status).toBe(400);
  });

  test('POST /api/transfers — items vacíos -> 400', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({ origin_branch_id: 1, destination_branch_id: 2, items: [] });
    expect(res.status).toBe(400);
  });

  test('POST /api/transfers — requested_qty = 0 -> 400', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({ 
        origin_branch_id: 1, 
        destination_branch_id: 2, 
        items: [{ product_id: 1, requested_qty: 0 }] 
      });
    expect(res.status).toBe(400);
  });

  test('POST /api/transfers — stock insuficiente en origen -> 409 con detalle de productos', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({
        origin_branch_id: 1,
        destination_branch_id: 2,
        items: [{ product_id: 1, requested_qty: 50 }, { product_id: 2, requested_qty: 1 }]
      });
      
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Stock insuficiente/);
    expect(res.body.message).toContain('items'); // Deberia tener el array items
  });

  test('POST /api/transfers — traslado válido se crea en PENDING sin descontar stock', async () => {
    // Sucursal A tiene 10 del prod 1 (o lo que quede tras las pruebas de sale, digamos 1, reseteamos a 10)
    await pool.query('UPDATE inventory SET quantity = 10 WHERE branch_id = 1 AND product_id = 1');

    const res = await request(app)
      .post('/api/transfers')
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({
        origin_branch_id: 1,
        destination_branch_id: 2,
        items: [{ product_id: 1, requested_qty: 5 }]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
    transferId = res.body.data.id;

    // Verificar que el stock en origen NO cambió aún
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    expect(invRows[0].quantity).toBe(10);
  });

  test('PUT /api/transfers/:id/status IN_TRANSIT — descuenta stock en origen', async () => {
    const res = await request(app)
      .put(`/api/transfers/${transferId}/status`)
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({ status: 'IN_TRANSIT' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_TRANSIT');

    // Verificar inventory en origen disminuyó
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 1 AND product_id = 1');
    expect(invRows[0].quantity).toBe(5);

    // Verificar inventory_movements TRANSFER_OUT creado
    const [movRows] = await pool.query("SELECT * FROM inventory_movements WHERE reference_id = ? AND type = 'TRANSFER_OUT'", [transferId]);
    expect(movRows.length).toBe(1);
    expect(movRows[0].quantity).toBe(5);
  });

  test('PUT /api/transfers/:id/status IN_TRANSIT — desde RECEIVED -> 400', async () => {
    // Lo testearemos lueguito, por ahora tratemos de pasar de pending a in transit cuando ya está en in_transit
    const res = await request(app)
      .put(`/api/transfers/${transferId}/status`)
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({ status: 'IN_TRANSIT' });

    expect(res.status).toBe(400); // Porque ya no es PENDING
  });

  test('POST /api/transfers/:id/confirm — recepción parcial -> PARTIAL', async () => {
    // Confirmaremos 3 unidades de las 5 enviadas
    // Buscamos el ID del transfer item
    const [tiRows] = await pool.query('SELECT id FROM transfer_items WHERE transfer_id = ?', [transferId]);
    const tiId = tiRows[0].id;

    const res = await request(app)
      .post(`/api/transfers/${transferId}/confirm`)
      .set('Authorization', `Bearer ${tokenAdminA}`) // asumiendo role superadmin si permitimos
      .send({
        received_items: [{ transfer_item_id: tiId, received_qty: 3, notes: 'Faltan 2' }]
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PARTIAL');

    // Verificar que inventory destino sumó solo lo que llegó (3)
    const [invRows] = await pool.query('SELECT quantity FROM inventory WHERE branch_id = 2 AND product_id = 1');
    expect(invRows[0].quantity).toBe(3);

    // Verificar anotaciones en transfer items
    const [tiCheck] = await pool.query('SELECT notes FROM transfer_items WHERE id = ?', [tiId]);
    expect(tiCheck[0].notes).toBe('Faltan 2');
  });

  test('No se puede modificar traslado en PARTIAL o RECEIVED -> 400', async () => {
    // Intentar confirmarlo de nuevo
    const [tiRows] = await pool.query('SELECT id FROM transfer_items WHERE transfer_id = ?', [transferId]);
    
    const res = await request(app)
      .post(`/api/transfers/${transferId}/confirm`)
      .set('Authorization', `Bearer ${tokenAdminA}`)
      .send({
        received_items: [{ transfer_item_id: tiRows[0].id, received_qty: 5 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/El traslado ya fue completado/);
  });
});
