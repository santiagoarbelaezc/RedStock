const validateStockSufficiency = (available, requested, productInfo = {}) => {
  if (available < requested) {
    const err = new Error(
      `Stock insuficiente. Disponible: ${available} unidades, solicitado: ${requested} unidades`
    );
    err.statusCode = 409;
    err.productInfo = productInfo;
    throw err;
  }
};

const validatePositiveInteger = (value, fieldName) => {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    const err = new Error(`${fieldName} debe ser un entero positivo mayor a 0`);
    err.statusCode = 400;
    throw err;
  }
};

const validateSameOriginDestination = (origin, destination) => {
  if (Number(origin) === Number(destination)) {
    const err = new Error('El origen y destino del traslado no pueden ser la misma sucursal');
    err.statusCode = 400;
    throw err;
  }
};

const validateTransferItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('El traslado debe incluir al menos un producto');
    err.statusCode = 400;
    throw err;
  }
};

module.exports = { 
  validateStockSufficiency, 
  validatePositiveInteger, 
  validateSameOriginDestination, 
  validateTransferItems 
};
