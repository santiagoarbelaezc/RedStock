const SaleModel = require('../models/sale.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse } = require('../utils/response.util');

// GET /api/analytics/:branchId/sales — ventas del mes actual
const currentMonthSales = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const now = new Date();
    const sales = await SaleModel.getByBranchAndMonth(branchId, now.getFullYear(), now.getMonth() + 1);

    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total), 0);
    const totalUnits   = sales.reduce((sum, s) => sum + s.quantity, 0);

    return successResponse(res, {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      totalRevenue,
      totalUnits,
      totalTransactions: sales.length,
      sales,
    }, 'Ventas del mes actual');
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/comparison — comparación de últimos 6 meses
const monthlyComparison = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const months = parseInt(req.query.months) || 6;
    const data = await SaleModel.getLastMonths(branchId, months);

    return successResponse(res, data, `Comparación de los últimos ${months} meses`);
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/:branchId/inventory — comportamiento del inventario
const inventoryBehavior = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const inventory = await InventoryModel.getByBranch(branchId);

    const total   = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const low     = inventory.filter(i => i.quantity <= 5);
    const out     = inventory.filter(i => i.quantity === 0);

    return successResponse(res, {
      totalProducts: inventory.length,
      totalUnits: total,
      lowStock: low,
      outOfStock: out,
      inventory,
    }, 'Comportamiento del inventario');
  } catch (err) {
    next(err);
  }
};

module.exports = { currentMonthSales, monthlyComparison, inventoryBehavior };
