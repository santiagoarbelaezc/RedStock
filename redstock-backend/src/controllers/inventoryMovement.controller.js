const InventoryMovementModel = require('../models/inventoryMovement.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse, errorResponse } = require('../utils/response.util');

const InventoryMovementController = {
  // GET /api/movements
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
      return errorResponse(res, error.message);
    }
  },

  // GET /api/movements/branch/:branchId
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
      return errorResponse(res, error.message);
    }
  },

  // GET /api/movements/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const movement = await InventoryMovementModel.getById(id);
      if (!movement) return errorResponse(res, 'Movimiento no encontrado', 404);
      return successResponse(res, movement, 'Detalles del movimiento');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // POST /api/movements
  create: async (req, res) => {
    try {
      const { branchId, productId, type, quantity, referenceId, referenceType } = req.body;

      // 1. Validaciones básicas
      if (!branchId || !productId || !type || !quantity) {
        return errorResponse(res, 'Faltan campos obligatorios: branchId, productId, type, quantity', 400);
      }

      const validTypes = ['IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT'];
      if (!validTypes.includes(type)) {
        return errorResponse(res, 'Tipo de movimiento inválido (IN, OUT, TRANSFER_IN, TRANSFER_OUT)', 400);
      }

      if (quantity <= 0) {
        return errorResponse(res, 'La cantidad debe ser mayor a 0', 400);
      }

      // 2. Validar stock si es salida
      if (type === 'OUT' || type === 'TRANSFER_OUT') {
        const inv = await InventoryModel.getByBranchAndProduct(branchId, productId);
        if (!inv || inv.quantity < quantity) {
          return errorResponse(res, `Stock insuficiente para realizar la salida. Disponible: ${inv ? inv.quantity : 0}`, 400);
        }
      }

      // 3. Crear movimiento
      const newMovement = await InventoryMovementModel.create(
        branchId, productId, type, quantity, referenceId, referenceType
      );
      return successResponse(res, newMovement, 'Movimiento registrado exitosamente', 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // DELETE /api/movements/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await InventoryMovementModel.delete(id);
      if (!deleted) return errorResponse(res, 'No se pudo eliminar el movimiento o no existe', 404);
      return successResponse(res, null, 'Movimiento eliminado correctamente');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
};

module.exports = InventoryMovementController;
