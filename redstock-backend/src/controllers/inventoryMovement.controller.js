const InventoryMovementModel = require('../models/inventoryMovement.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse } = require('../utils/response.util');
const { handleControllerError } = require('../utils/errorHandler');

const InventoryMovementController = {
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const [movements, total] = await Promise.all([
        InventoryMovementModel.getAll(page, limit),
        InventoryMovementModel.countAll()
      ]);

      return successResponse(res, {
        movements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }, 'Movimientos obtenidos correctamente');
    } catch (error) {
      return handleControllerError(res, error);
    }
  },

  getByBranch: async (req, res) => {
    try {
      const { branchId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const [movements, total] = await Promise.all([
        InventoryMovementModel.getByBranch(branchId, page, limit),
        InventoryMovementModel.countByBranch(branchId)
      ]);

      return successResponse(res, {
        movements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }, `Movimientos de la sucursal ${branchId} obtenidos`);
    } catch (error) {
      return handleControllerError(res, error);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const movement = await InventoryMovementModel.getById(id);
      if (!movement) {
        const err = new Error('Movimiento no encontrado');
        err.statusCode = 404;
        throw err;
      }
      return successResponse(res, movement, 'Detalles del movimiento');
    } catch (error) {
      return handleControllerError(res, error);
    }
  },

  create: async (req, res) => {
    try {
      const { branchId, productId, type, quantity, referenceId, referenceType } = req.body;

      if (!branchId || !productId || !type || !quantity) {
        const err = new Error('Faltan campos obligatorios: branchId, productId, type, quantity');
        err.statusCode = 400;
        throw err;
      }

      const validTypes = ['IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT'];
      if (!validTypes.includes(type)) {
        const err = new Error('Tipo de movimiento inválido (IN, OUT, TRANSFER_IN, TRANSFER_OUT)');
        err.statusCode = 400;
        throw err;
      }

      if (quantity <= 0) {
        const err = new Error('La cantidad debe ser mayor a 0');
        err.statusCode = 400;
        throw err;
      }

      if (type === 'OUT' || type === 'TRANSFER_OUT') {
        const inv = await InventoryModel.getByBranchAndProduct(branchId, productId);
        if (!inv || inv.quantity < quantity) {
          const err = new Error(`Stock insuficiente para realizar la salida. Disponible: ${inv ? inv.quantity : 0}`);
          err.statusCode = 400;
          throw err;
        }
      }

      const newMovement = await InventoryMovementModel.create(
        branchId, productId, type, quantity, referenceId, referenceType
      );
      return successResponse(res, newMovement, 'Movimiento registrado exitosamente', 201);
    } catch (error) {
      return handleControllerError(res, error);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await InventoryMovementModel.delete(id);
      if (!deleted) {
        const err = new Error('No se pudo eliminar el movimiento o no existe');
        err.statusCode = 404;
        throw err;
      }
      return successResponse(res, null, 'Movimiento eliminado correctamente');
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
};

module.exports = InventoryMovementController;
