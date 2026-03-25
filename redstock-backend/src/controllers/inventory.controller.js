const InventoryModel = require('../models/inventory.model');
const { successResponse } = require('../utils/response.util');
const { handleControllerError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const getByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;

    const [inventory, total] = await Promise.all([
      InventoryModel.getByBranch(branchId, page, limit, search),
      InventoryModel.countTotalByBranch(branchId, search)
    ]);

    return successResponse(res, {
      inventory,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }, 'Inventario de la sucursal');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', branchId = null } = req.query;

    const [inventory, total] = await Promise.all([
      InventoryModel.getAllBranches(page, limit, search, branchId),
      InventoryModel.countTotalAll(search, branchId)
    ]);

    return successResponse(res, {
      inventory,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }, 'Inventario global');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const adjustStock = async (req, res) => {
  try {
    const { branch_id, product_id, quantity } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
       const err = new Error('No tienes permiso para reponer stock');
       err.statusCode = 403;
       throw err;
    }

    const record = await InventoryModel.adjustStock(branch_id, product_id, quantity);
    logger.info(`Ajuste de inventario: Sucursal ${branch_id}, Producto ${product_id} repuestos con ${quantity} unidades (por ${req.user.email})`);

    return successResponse(res, record, 'Inventario actualizado');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const getLowStock = async (req, res) => {
  try {
    const { branchId } = req.params;
    // Helper function or custom query for low stock - assuming getAll handles it or similar logic. 
    // Implementing a basic query right here or assuming user only wanted handling of errors.
    const inventory = await InventoryModel.getByBranch(branchId, 1, 1000, '');
    const lowStock = inventory.filter(i => i.quantity <= 5);
    return successResponse(res, lowStock, 'Productos con bajo stock');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

module.exports = { getByBranch, getAll, adjustStock, getLowStock };
