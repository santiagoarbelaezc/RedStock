const express = require('express');
const router = express.Router();
const InventoryMovementController = require('../controllers/inventoryMovement.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', InventoryMovementController.getAll);
router.get('/branch/:branchId', InventoryMovementController.getByBranch);
router.get('/:id', InventoryMovementController.getById);
router.post('/', InventoryMovementController.create);
router.delete('/:id', InventoryMovementController.delete);

module.exports = router;
