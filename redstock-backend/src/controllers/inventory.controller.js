const InventoryModel = require('../models/inventory.model');
const { successResponse, errorResponse } = require('../utils/response.util');

// GET /api/inventory/:branchId — inventario de una sucursal
const getByBranch = async (req, res, next) => {
  try {
    const inventory = await InventoryModel.getByBranch(req.params.branchId);
    return successResponse(res, inventory, 'Inventario de la sucursal');
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory — inventario global de todas las sucursales
const getAll = async (req, res, next) => {
  try {
    const inventory = await InventoryModel.getAllBranches();
    return successResponse(res, inventory, 'Inventario global');
  } catch (err) {
    next(err);
  }
};

// PUT /api/inventory/:branchId/:productId — ajustar cantidad manualmente
const updateQuantity = async (req, res, next) => {
  try {
    const { branchId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return errorResponse(res, 'quantity debe ser un número >= 0', 400);
    }

    const record = await InventoryModel.updateQuantity(branchId, productId, quantity);
    console.log(`[INVENTORY] Ajuste manual: Sucursal ${branchId}, Producto ${productId} -> ${quantity} unidades (por ${req.user.email})`);

    return successResponse(res, record, 'Inventario actualizado');
  } catch (err) {
    console.error(`[INVENTORY] Error ajustando cantidad: ${err.message}`);
    next(err);
  }
};

module.exports = { getByBranch, getAll, updateQuantity };
