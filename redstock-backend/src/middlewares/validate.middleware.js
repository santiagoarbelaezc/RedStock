const validateCreateSale = (req, res, next) => {
  const { branch_id, product_id, quantity, total } = req.body;
  const errors = [];
  
  if (!branch_id || !Number.isInteger(Number(branch_id)) || Number(branch_id) <= 0)
    errors.push('branch_id debe ser un entero positivo');
  if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0)
    errors.push('product_id debe ser un entero positivo');
  if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
    errors.push('quantity debe ser un entero positivo mayor a 0');
  if (!total || isNaN(Number(total)) || Number(total) <= 0)
    errors.push('total debe ser un número positivo');
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
  }
  next();
};

const validateCreateTransfer = (req, res, next) => {
  const { origin_branch_id, destination_branch_id, items } = req.body;
  const errors = [];
  
  if (!origin_branch_id) errors.push('origin_branch_id es requerido');
  if (!destination_branch_id) errors.push('destination_branch_id es requerido');
  if (Number(origin_branch_id) === Number(destination_branch_id))
    errors.push('El origen y destino no pueden ser la misma sucursal');
  if (!Array.isArray(items) || items.length === 0)
    errors.push('items debe ser un array con al menos un producto');
  
  items?.forEach((item, i) => {
    if (!item.product_id) errors.push(`items[${i}].product_id es requerido`);
    if (!item.requested_qty || Number(item.requested_qty) <= 0)
      errors.push(`items[${i}].requested_qty debe ser mayor a 0`);
  });
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
  }
  next();
};

const validateUpdateTransferStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];
  
  if (!status || status !== 'IN_TRANSIT') {
    errors.push('status es requerido y debe ser "IN_TRANSIT" para este endpoint');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
  }
  next();
};

const validateConfirmReception = (req, res, next) => {
  const { received_items } = req.body;
  const errors = [];
  
  if (!Array.isArray(received_items) || received_items.length === 0) {
    errors.push('received_items debe ser un array con al menos un item');
  }
  
  received_items?.forEach((item, i) => {
    if (!item.transfer_item_id) errors.push(`received_items[${i}].transfer_item_id es requerido`);
    if (item.received_qty === undefined || Number(item.received_qty) < 0)
      errors.push(`received_items[${i}].received_qty no puede ser negativo`);
  });
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
  }
  next();
};

const validateAdjustStock = (req, res, next) => {
  const { product_id, quantity } = req.body;
  const errors = [];
  
  if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) <= 0)
    errors.push('product_id debe ser un entero positivo');
  if (!quantity || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
    errors.push('quantity debe ser un entero positivo mayor a 0');
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
  }
  next();
};

const validateCreateProduct = (req, res, next) => {
  const { name, sku } = req.body;
  const errors = [];
  
  if (!name || typeof name !== 'string') errors.push('name es requerido y debe ser un string');
  if (!sku || typeof sku !== 'string') errors.push('sku es requerido y debe ser un string');
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
  }
  next();
};

module.exports = {
  validateCreateSale,
  validateCreateTransfer,
  validateUpdateTransferStatus,
  validateConfirmReception,
  validateAdjustStock,
  validateCreateProduct
};
