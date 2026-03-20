const { Router } = require('express');
const router = Router();
const { 
  getCurrentMonthSales, 
  getSalesComparison, 
  getInventoryBehavior,
  getLowStock,
  getTopSellingProducts,
  getTransfersSummary,
  getGlobalRanking,
  getDailySalesCurrentMonth
} = require('../controllers/analytics.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const allowedRoles = ['admin', 'manager'];

// GET /api/analytics/:branchId/sales/current-month
router.get('/:branchId/sales/current-month', verifyToken, checkRole(allowedRoles), getCurrentMonthSales);

// GET /api/analytics/:branchId/sales/comparison
router.get('/:branchId/sales/comparison', verifyToken, checkRole(allowedRoles), getSalesComparison);

// GET /api/analytics/:branchId/sales/daily
router.get('/:branchId/sales/daily', verifyToken, checkRole(allowedRoles), getDailySalesCurrentMonth);

// GET /api/analytics/:branchId/inventory/behavior
router.get('/:branchId/inventory/behavior', verifyToken, checkRole(allowedRoles), getInventoryBehavior);

// GET /api/analytics/:branchId/inventory/low-stock
router.get('/:branchId/inventory/low-stock', verifyToken, checkRole(allowedRoles), getLowStock);

// GET /api/analytics/:branchId/products/top-selling
router.get('/:branchId/products/top-selling', verifyToken, checkRole(allowedRoles), getTopSellingProducts);

// GET /api/analytics/:branchId/transfers/summary
router.get('/:branchId/transfers/summary', verifyToken, checkRole(allowedRoles), getTransfersSummary);

// GET /api/analytics/global/ranking
router.get('/global/ranking', verifyToken, checkRole(['admin']), getGlobalRanking);

module.exports = router;
