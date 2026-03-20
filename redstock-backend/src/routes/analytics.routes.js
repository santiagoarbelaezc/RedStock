const { Router } = require('express');
const router = Router();
const AnalyticsController = require('../controllers/analytics.controller');
const { verifyToken, isSuperAdmin, isAdmin, isMemberOfBranch } = require('../middlewares/auth.middleware');

// Todas las rutas requieren token
router.use(verifyToken);

// Rutas Globales (Superadmin)
// IMPORTANTE: Definirlas ANTES de las rutas con parámetros :branchId
router.get('/global/summary', isSuperAdmin, AnalyticsController.getGlobalSummary);
router.get('/global/income-by-branch', isSuperAdmin, AnalyticsController.getIncomeByBranch);
router.get('/global/monthly', isSuperAdmin, AnalyticsController.getMonthlyComparison);
router.get('/global/top-products', isSuperAdmin, AnalyticsController.getTopProductsGlobal);
router.get('/global/transfers', isSuperAdmin, AnalyticsController.getTransfersGlobalSummary);
router.get('/global/ranking', isAdmin, AnalyticsController.getGlobalRanking);

// Rutas por Sucursal (Cualquier miembro de la sucursal o Superadmin)
router.get('/:branchId/sales/current-month', isMemberOfBranch, AnalyticsController.getCurrentMonthSales);
router.get('/:branchId/sales/comparison', isMemberOfBranch, AnalyticsController.getSalesComparison);
router.get('/:branchId/sales/daily', isMemberOfBranch, AnalyticsController.getDailySalesCurrentMonth);
router.get('/:branchId/inventory/behavior', isMemberOfBranch, AnalyticsController.getInventoryBehavior);
router.get('/:branchId/inventory/low-stock', isMemberOfBranch, AnalyticsController.getLowStock);
router.get('/:branchId/products/top-selling', isMemberOfBranch, AnalyticsController.getTopSellingProducts);
router.get('/:branchId/transfers/summary', isMemberOfBranch, AnalyticsController.getTransfersSummary);

module.exports = router;
