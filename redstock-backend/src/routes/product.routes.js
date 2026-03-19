const { Router } = require('express');
const router = Router();
const { getAll, getById, create, update, remove } = require('../controllers/product.controller');
const { verifyToken, checkRole } = require('../middlewares/auth.middleware');

const adminOnly = ['admin'];
const adminOrManager = ['admin', 'manager'];

// GET  /api/products
router.get('/', verifyToken, getAll);

// GET  /api/products/:id
router.get('/:id', verifyToken, getById);

// POST /api/products
router.post('/', verifyToken, checkRole(adminOnly), create);

// PUT  /api/products/:id
router.put('/:id', verifyToken, checkRole(adminOrManager), update);

// DELETE /api/products/:id
router.delete('/:id', verifyToken, checkRole(adminOnly), remove);

module.exports = router;
