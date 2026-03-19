const TransferModel = require('../models/transfer.model');
const TransferItemModel = require('../models/transferItem.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse, errorResponse } = require('../utils/response.util');

// POST /api/transfers — crear solicitud de traslado
const create = async (req, res, next) => {
  try {
    const { originBranchId, destinationBranchId, items } = req.body;

    if (!originBranchId || !destinationBranchId || !items || items.length === 0) {
      return errorResponse(res, 'originBranchId, destinationBranchId e items son requeridos', 400);
    }
    if (originBranchId === destinationBranchId) {
      return errorResponse(res, 'El origen y destino no pueden ser la misma sucursal', 400);
    }

    const transfer = await TransferModel.create(originBranchId, destinationBranchId);

    // Crear ítems del traslado
    const createdItems = [];
    for (const item of items) {
      const ti = await TransferItemModel.create(transfer.id, item.productId, item.requestedQty);
      createdItems.push(ti);
    }

    return successResponse(res, { ...transfer, items: createdItems }, 'Traslado solicitado', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/transfers/:branchId — traslados de una sucursal
const getByBranch = async (req, res, next) => {
  try {
    const transfers = await TransferModel.getByBranch(req.params.branchId);
    return successResponse(res, transfers, 'Traslados de la sucursal');
  } catch (err) {
    next(err);
  }
};

// PUT /api/transfers/:transferId/status — actualizar estado (ej: IN_TRANSIT)
const updateStatus = async (req, res, next) => {
  try {
    const { transferId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'IN_TRANSIT', 'RECEIVED', 'PARTIAL'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`, 400);
    }

    const transfer = await TransferModel.getById(transferId);
    if (!transfer) return errorResponse(res, 'Traslado no encontrado', 404);

    const receivedAt = ['RECEIVED', 'PARTIAL'].includes(status) ? new Date() : null;
    const updated = await TransferModel.updateStatus(transferId, status, receivedAt);

    return successResponse(res, updated, 'Estado actualizado');
  } catch (err) {
    next(err);
  }
};

// POST /api/transfers/:transferId/confirm — confirmar recepción ítem por ítem
const confirmReception = async (req, res, next) => {
  try {
    const { transferId } = req.params;
    const { items } = req.body; // [{ itemId, receivedQty, notes }]

    const transfer = await TransferModel.getById(transferId);
    if (!transfer) return errorResponse(res, 'Traslado no encontrado', 404);

    // Confirmar cada ítem y actualizar inventario del destino
    const confirmedItems = [];
    for (const item of items) {
      const confirmed = await TransferItemModel.confirmReception(item.itemId, item.receivedQty, item.notes);
      if (confirmed && item.receivedQty > 0) {
        await InventoryModel.upsert(transfer.destination_branch_id, confirmed.product_id, item.receivedQty);
      }
      confirmedItems.push(confirmed);
    }

    // Determinar si fue completo o con faltantes
    const allItems = await TransferItemModel.getByTransfer(transferId);
    const hasPartial = allItems.some(i => i.received_qty < i.requested_qty);
    const newStatus = hasPartial ? 'PARTIAL' : 'RECEIVED';
    await TransferModel.updateStatus(transferId, newStatus, new Date());

    return successResponse(res, { status: newStatus, items: confirmedItems }, 'Recepción confirmada');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getByBranch, updateStatus, confirmReception };
