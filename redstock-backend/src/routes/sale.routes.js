const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/sale.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', SaleController.getAll);
router.get('/branch/:branchId', SaleController.getByBranch);
router.get('/:id', SaleController.getById);
router.post('/', SaleController.create);
router.delete('/:id', SaleController.delete);

module.exports = router;
