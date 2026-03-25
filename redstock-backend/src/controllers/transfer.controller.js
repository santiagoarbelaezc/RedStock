const TransferModel = require('../models/transfer.model');
const TransferItemModel = require('../models/transferItem.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse } = require('../utils/response.util');
const { handleControllerError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const createTransfer = async (req, res) => {
  try {
    const { origin_branch_id, destination_branch_id, items } = req.body;

    if (!origin_branch_id || !destination_branch_id || !items || items.length === 0) {
      const err = new Error('origin_branch_id, destination_branch_id e items son requeridos');
      err.statusCode = 400;
      throw err;
    }
    
    // Auth validation
    if (req.user.role !== 'superadmin' && Number(req.user.branch_id) !== Number(origin_branch_id)) {
      const err = new Error('No tienes permiso para crear traslados desde esta sucursal');
      err.statusCode = 403;
      throw err;
    }

    const transfer = await TransferModel.createTransfer({ origin_branch_id, destination_branch_id, items });
    logger.info(`Nueva solicitud de traslado: Origen ${origin_branch_id} -> Destino ${destination_branch_id} (por ${req.user.email})`);

    const createdItems = await TransferItemModel.getByTransfer(transfer.id);

    return successResponse(res, { ...transfer, items: createdItems }, 'Traslado creado', 201);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const getByBranch = async (req, res) => {
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
    return handleControllerError(res, err);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { status } = req.body;

    if (status !== 'IN_TRANSIT') {
      const err = new Error('Este endpoint solo se utiliza para transicionar a IN_TRANSIT');
      err.statusCode = 400;
      throw err;
    }

    const updated = await TransferModel.updateStatusToInTransit(transferId, req.user);
    logger.info(`Estado actualizado: ID ${transferId} -> IN_TRANSIT (por ${req.user.email})`);

    return successResponse(res, updated, 'Estado actualizado');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const confirmReception = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { received_items } = req.body;

    if (!Array.isArray(received_items) || received_items.length === 0) {
      const err = new Error('Se requiere el array de received_items para confirmar la recepción');
      err.statusCode = 400;
      throw err;
    }

    const updated = await TransferModel.confirmReception(transferId, received_items, req.user);
    logger.info(`Recepción confirmada: ID ${transferId} -> Finalizado como ${updated.status} (por ${req.user.email})`);

    return successResponse(res, updated, 'Recepción confirmada');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const deleteTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const transfer = await TransferModel.getById(transferId);

    if (!transfer) {
      const err = new Error('Traslado no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (transfer.status !== 'PENDING') {
      const err = new Error('Solo se pueden eliminar traslados con estado PENDING');
      err.statusCode = 400;
      throw err;
    }

    await TransferModel.delete(transferId);
    logger.info(`Solicitud eliminada: ID ${transferId} (por ${req.user.email})`);

    return successResponse(res, null, 'Traslado eliminado correctamente');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const getById = async (req, res) => {
  try {
    const { transferId } = req.params;
    const transfer = await TransferModel.getById(transferId);
    if (!transfer) {
      const err = new Error('Traslado no encontrado');
      err.statusCode = 404;
      throw err;
    }
    
    const items = await TransferItemModel.getByTransfer(transferId);
    return successResponse(res, { ...transfer, items }, 'Detalle del traslado');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const getTransfers = async (req, res) => {
  try {
    const transfers = await TransferModel.getAll();
    return successResponse(res, transfers, 'Traslados obtenidos con éxito');
  } catch (err) {
    return handleControllerError(res, err);
  }
}

module.exports = { createTransfer, getByBranch, updateStatus, confirmReception, deleteTransfer, getById, getTransfers };
