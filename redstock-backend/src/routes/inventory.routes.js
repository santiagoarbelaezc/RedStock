const { Router } = require('express');
const router = Router();
const { getByBranch, getAll, adjustStock, getLowStock } = require('../controllers/inventory.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateAdjustStock } = require('../middlewares/validate.middleware');

// GET /api/inventory — inventario global de todas las sucursales
router.get('/', verifyToken, getAll);

// GET /api/inventory/low-stock/:branchId — obtener productos con bajo stock
router.get('/low-stock/:branchId', verifyToken, getLowStock);

// GET /api/inventory/:branchId — inventario de una sucursal específica
router.get('/:branchId', verifyToken, getByBranch);

// POST /api/inventory/adjust — reponer stock (solo admin/superadmin)
router.post('/adjust', verifyToken, isAdmin, validateAdjustStock, adjustStock);

module.exports = router;
