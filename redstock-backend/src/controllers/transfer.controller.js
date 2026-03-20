const TransferModel = require('../models/transfer.model');
const TransferItemModel = require('../models/transferItem.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse, errorResponse } = require('../utils/response.util');

// POST /api/transfers — crear solicitud de traslado
const create = async (req, res, next) => {
  try {
    const { origin_branch_id, destination_branch_id, items } = req.body;

    if (!origin_branch_id || !destination_branch_id || !items || items.length === 0) {
      return errorResponse(res, 'origin_branch_id, destination_branch_id e items son requeridos', 400);
    }
    if (origin_branch_id === destination_branch_id) {
      return errorResponse(res, 'El origen y destino no pueden ser la misma sucursal', 400);
    }

    const transfer = await TransferModel.create(origin_branch_id, destination_branch_id);
    console.log(`[TRANSFER] Nueva solicitud de traslado: Origen ${origin_branch_id} -> Destino ${destination_branch_id} (por ${req.user.email})`);

    // Crear ítems del traslado
    const createdItems = [];
    for (const item of items) {
      const qty = item.requested_qty || item.requestedQty || item.quantity;
      const ti = await TransferItemModel.create(transfer.id, item.product_id || item.productId, qty);
      createdItems.push(ti);
    }

    return successResponse(res, { ...transfer, items: createdItems }, 'Traslado solicitado', 201);
  } catch (err) {
    console.error(`[TRANSFER] Error creando traslado: ${err.message}`);
    next(err);
  }
};

// GET /api/transfers/:branchId — traslados de una sucursal (paginado)
const getByBranch = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      TransferModel.getByBranch(branchId, limit, offset),
      TransferModel.countByBranch(branchId)
    ]);

    return successResponse(res, {
      items: transfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Traslados obtenidos con éxito');
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

    // Si pasa a IN_TRANSIT, restamos del origen
    if (status === 'IN_TRANSIT' && transfer.status === 'PENDING') {
      const items = await TransferItemModel.getByTransfer(transferId);
      for (const item of items) {
        await InventoryModel.upsert(transfer.origin_branch_id, item.product_id, -item.requested_qty);
      }
    }

    const updated = await TransferModel.updateStatus(transferId, status, receivedAt);
    
    console.log(`[TRANSFER] Estado actualizado: ID ${transferId} -> ${status} (por ${req.user.email})`);

    return successResponse(res, updated, 'Estado actualizado');
  } catch (err) {
    console.error(`[TRANSFER] Error actualizando estado: ${err.message}`);
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

    console.log(`[TRANSFER] Recepción confirmada: ID ${transferId} -> Finalizado como ${newStatus} (por ${req.user.email})`);

    return successResponse(res, { status: newStatus, items: confirmedItems }, 'Recepción confirmada');
  } catch (err) {
    console.error(`[TRANSFER] Error confirmando recepción: ${err.message}`);
    next(err);
  }
};

// DELETE /api/transfers/:transferId — eliminar solicitud (solo si es PENDING)
const deleteTransfer = async (req, res, next) => {
  try {
    const { transferId } = req.params;
    const transfer = await TransferModel.getById(transferId);

    if (!transfer) return errorResponse(res, 'Traslado no encontrado', 404);
    if (transfer.status !== 'PENDING') {
      return errorResponse(res, 'Solo se pueden eliminar traslados con estado PENDING', 400);
    }

    await TransferModel.delete(transferId);
    console.log(`[TRANSFER] Solicitud eliminada: ID ${transferId} (por ${req.user.email})`);

    return successResponse(res, null, 'Traslado eliminado correctamente');
  } catch (err) {
    console.error(`[TRANSFER] Error eliminando traslado: ${err.message}`);
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { transferId } = req.params;
    const transfer = await TransferModel.getById(transferId);
    if (!transfer) return errorResponse(res, 'Traslado no encontrado', 404);
    
    const items = await TransferItemModel.getByTransfer(transferId);
    return successResponse(res, { ...transfer, items }, 'Detalle del traslado');
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getByBranch, updateStatus, confirmReception, deleteTransfer, getById };
