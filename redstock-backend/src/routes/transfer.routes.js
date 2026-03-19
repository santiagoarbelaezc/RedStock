const { Router } = require('express');
const router = Router();
const { create, getByBranch, updateStatus, confirmReception } = require('../controllers/transfer.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// POST /api/transfers — crear solicitud de traslado
router.post('/', verifyToken, create);

// GET /api/transfers/:branchId — traslados de una sucursal (como origen o destino)
router.get('/:branchId', verifyToken, getByBranch);

// PUT /api/transfers/:transferId/status — actualizar estado
router.put('/:transferId/status', verifyToken, updateStatus);

// POST /api/transfers/:transferId/confirm — confirmar recepción
router.post('/:transferId/confirm', verifyToken, confirmReception);

module.exports = router;
