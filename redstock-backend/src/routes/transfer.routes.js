const { Router } = require('express');
const router = Router();
const { createTransfer, getByBranch, updateStatus, confirmReception, deleteTransfer, getById, getTransfers } = require('../controllers/transfer.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateCreateTransfer, validateUpdateTransferStatus, validateConfirmReception } = require('../middlewares/validate.middleware');

// POST /api/transfers — crear solicitud de traslado
router.post('/', verifyToken, validateCreateTransfer, createTransfer);

// GET /api/transfers/detail/:transferId — Obtener detalle
router.get('/detail/:transferId', verifyToken, getById);

// GET /api/transfers/:branchId — traslados de una sucursal
router.get('/:branchId', verifyToken, getByBranch);

// GET /api/transfers — todos los traslados
router.get('/', verifyToken, getTransfers);

// PUT /api/transfers/:transferId/status — actualizar estado (Despachar)
router.put('/:transferId/status', verifyToken, isAdmin, validateUpdateTransferStatus, updateStatus);

// POST /api/transfers/:transferId/confirm — confirmar recepción
router.post('/:transferId/confirm', verifyToken, isAdmin, validateConfirmReception, confirmReception);

// DELETE /api/transfers/:transferId — eliminar solicitud
router.delete('/:transferId', verifyToken, deleteTransfer);

module.exports = router;
