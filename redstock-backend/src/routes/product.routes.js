const { Router } = require('express');
const router = Router();
const { getAll, getById, create, update, remove } = require('../controllers/product.controller');
const { verifyToken, isSuperAdmin } = require('../middlewares/auth.middleware');

// GET  /api/products
router.get('/', verifyToken, getAll);

// GET  /api/products/:id
router.get('/:id', verifyToken, getById);

// POST /api/products
router.post('/', verifyToken, isSuperAdmin, create);

// PUT  /api/products/:id
router.put('/:id', verifyToken, isSuperAdmin, update);

// DELETE /api/products/:id
router.delete('/:id', verifyToken, isSuperAdmin, remove);

module.exports = router;
