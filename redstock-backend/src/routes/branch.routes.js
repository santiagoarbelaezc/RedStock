const { Router } = require('express');
const router = Router();
const { getAll, getById, create, update, remove } = require('../controllers/branch.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// GET  /api/branches
router.get('/', verifyToken, getAll);

// GET  /api/branches/:id
router.get('/:id', verifyToken, getById);

// POST /api/branches
router.post('/', verifyToken, create);

// PUT  /api/branches/:id
router.put('/:id', verifyToken, update);

// DELETE /api/branches/:id
router.delete('/:id', verifyToken, remove);

module.exports = router;
