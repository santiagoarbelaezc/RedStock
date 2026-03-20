const { Router } = require('express');
const router = Router();
const { getAll, getById, create, update, remove } = require('../controllers/branch.controller');
const { verifyToken, isSuperAdmin } = require('../middlewares/auth.middleware');

// GET  /api/branches
router.get('/', verifyToken, getAll);

// GET  /api/branches/:id
router.get('/:id', verifyToken, getById);

// POST /api/branches
router.post('/', verifyToken, isSuperAdmin, create);

// PUT  /api/branches/:id
router.put('/:id', verifyToken, isSuperAdmin, update);

// DELETE /api/branches/:id
router.delete('/:id', verifyToken, isSuperAdmin, remove);

module.exports = router;
