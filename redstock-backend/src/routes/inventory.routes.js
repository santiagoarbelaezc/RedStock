const { Router } = require('express');
const router = Router();
const { getByBranch, getAll, updateQuantity } = require('../controllers/inventory.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const adminOrManager = ['admin', 'manager'];

// GET /api/inventory — inventario global de todas las sucursales
router.get('/', verifyToken, getAll);

// GET /api/inventory/:branchId — inventario de una sucursal específica
router.get('/:branchId', verifyToken, getByBranch);

// PUT /api/inventory/:branchId/:productId — ajustar cantidad
router.put('/:branchId/:productId', verifyToken, checkRole(adminOrManager), updateQuantity);

module.exports = router;
