const { 
  validateStockSufficiency, 
  validatePositiveInteger, 
  validateSameOriginDestination, 
  validateTransferItems 
} = require('../../src/utils/stockValidator');

describe('Validaciones de stock — unitarias', () => {
  test('validateStockSufficiency — stock suficiente no lanza error', () => {
    expect(() => validateStockSufficiency(10, 5)).not.toThrow();
  });
  
  test('validateStockSufficiency — stock insuficiente lanza error con statusCode 409', () => {
    let error;
    try { validateStockSufficiency(5, 10); } catch (e) { error = e; }
    expect(error).toBeDefined();
    expect(error.statusCode).toBe(409);
    expect(error.message).toMatch(/Stock insuficiente/);
  });

  test('validatePositiveInteger — 0 lanza error 400', () => {
    let error;
    try { validatePositiveInteger(0, 'quantity'); } catch (e) { error = e; }
    expect(error.statusCode).toBe(400);
  });

  test('validatePositiveInteger — número negativo lanza error 400', () => {
    let error;
    try { validatePositiveInteger(-1, 'quantity'); } catch (e) { error = e; }
    expect(error.statusCode).toBe(400);
  });

  test('validatePositiveInteger — string lanza error 400', () => {
    let error;
    try { validatePositiveInteger('abc', 'quantity'); } catch (e) { error = e; }
    expect(error.statusCode).toBe(400);
  });

  test('validateTransferItems — array vacío lanza error 400', () => {
    let error;
    try { validateTransferItems([]); } catch (e) { error = e; }
    expect(error.statusCode).toBe(400);
  });

  test('validateSameOriginDestination — misma sucursal lanza error 400', () => {
    let error;
    try { validateSameOriginDestination(1, 1); } catch (e) { error = e; }
    expect(error.statusCode).toBe(400);
  });
});
