const { Router } = require('express');
const router = Router();
const { currentMonthSales, monthlyComparison, inventoryBehavior } = require('../controllers/analytics.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const allowedRoles = ['admin', 'manager'];

// GET /api/analytics/:branchId/sales — ventas del mes actual
router.get('/:branchId/sales', verifyToken, checkRole(allowedRoles), currentMonthSales);

// GET /api/analytics/:branchId/comparison?months=6 — comparación de meses
router.get('/:branchId/comparison', verifyToken, checkRole(allowedRoles), monthlyComparison);

// GET /api/analytics/:branchId/inventory — comportamiento del inventario
router.get('/:branchId/inventory', verifyToken, checkRole(allowedRoles), inventoryBehavior);

module.exports = router;
