const { Router } = require('express');
const router = Router();
const { currentMonthSales, monthlyComparison, inventoryBehavior } = require('../controllers/analytics.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// GET /api/analytics/:branchId/sales — ventas del mes actual
router.get('/:branchId/sales', verifyToken, currentMonthSales);

// GET /api/analytics/:branchId/comparison?months=6 — comparación de meses
router.get('/:branchId/comparison', verifyToken, monthlyComparison);

// GET /api/analytics/:branchId/inventory — comportamiento del inventario
router.get('/:branchId/inventory', verifyToken, inventoryBehavior);

module.exports = router;
