const express = require('express');
const router = express.Router();
const SaleController = require('../controllers/sale.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validateCreateSale } = require('../middlewares/validate.middleware');

router.use(verifyToken);

router.get('/', SaleController.getAll);
router.get('/branch/:branchId', SaleController.getByBranch);
router.get('/:id', SaleController.getById);
router.post('/', validateCreateSale, SaleController.createSale);
router.delete('/:id', SaleController.delete);

module.exports = router;
