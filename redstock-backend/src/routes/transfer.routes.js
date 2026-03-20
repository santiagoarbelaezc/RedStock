const { Router } = require('express');
const router = Router();
const { create, getByBranch, updateStatus, confirmReception, deleteTransfer, getById } = require('../controllers/transfer.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// POST /api/transfers — crear solicitud de traslado
router.post('/', verifyToken, create);

// GET /api/transfers/detail/:transferId — Obtener detalle (Mover antes de :branchId)
router.get('/detail/:transferId', verifyToken, getById);

// GET /api/transfers/:branchId — traslados de una sucursal
router.get('/:branchId', verifyToken, getByBranch);

// PUT /api/transfers/:transferId/status — actualizar estado (Despachar)
router.put('/:transferId/status', verifyToken, isAdmin, updateStatus);

// POST /api/transfers/:transferId/confirm — confirmar recepción
router.post('/:transferId/confirm', verifyToken, isAdmin, confirmReception);

// DELETE /api/transfers/:transferId — eliminar solicitud
router.delete('/:transferId', verifyToken, deleteTransfer);

module.exports = router;
