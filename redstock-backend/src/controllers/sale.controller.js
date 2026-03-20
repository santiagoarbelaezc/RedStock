const SaleModel = require('../models/sale.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse, errorResponse } = require('../utils/response.util');

const SaleController = {
  // GET /api/sales
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const [sales, total] = await Promise.all([
        SaleModel.getAll(page, limit),
        SaleModel.countAll()
      ]);

      return successResponse(res, {
        sales,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }, 'Ventas obtenidas correctamente');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // GET /api/sales/branch/:branchId
  getByBranch: async (req, res) => {
    try {
      const { branchId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const [sales, total] = await Promise.all([
        SaleModel.getByBranch(branchId, page, limit),
        SaleModel.countByBranch(branchId)
      ]);

      return successResponse(res, {
        sales,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }, `Ventas de la sucursal ${branchId} obtenidas`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // GET /api/sales/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await SaleModel.getById(id);
      if (!sale) return errorResponse(res, 'Venta no encontrada', 404);
      return successResponse(res, sale, 'Detalles de la venta obtenida');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // POST /api/sales
  create: async (req, res) => {
    try {
      const { branch_id, product_id, quantity, total, sale_date } = req.body;

      // 1. Validaciones básicas
      if (!branch_id || !product_id || !quantity || !total) {
        return errorResponse(res, 'Faltan campos obligatorios: branch_id, product_id, quantity, total', 400);
      }

      if (quantity <= 0) {
        return errorResponse(res, 'La cantidad debe ser mayor a 0', 400);
      }

      // 2. Validar permisos (Superadmin accede a todo, admin solo a su sucursal)
      if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.branch_id !== parseInt(branch_id)) {
        return errorResponse(res, 'No tienes permiso para registrar ventas en esta sucursal', 403);
      }

      // 3. Validar stock suficiente
      const inv = await InventoryModel.getByBranchAndProduct(branch_id, product_id);
      if (!inv || inv.quantity < quantity) {
        return errorResponse(res, `Stock insuficiente en sucursal. Disponible: ${inv ? inv.quantity : 0}`, 400);
      }

      // 3. Crear venta
      const newSale = await SaleModel.create(branch_id, product_id, quantity, total, sale_date);
      return successResponse(res, newSale, 'Venta registrada exitosamente', 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // DELETE /api/sales/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // 1. Verificar existencia y permisos
      const sale = await SaleModel.getById(id);
      if (!sale) return errorResponse(res, 'Venta no encontrada', 404);

      if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.branch_id !== sale.branch_id) {
        return errorResponse(res, 'No tienes permiso para eliminar ventas de otra sucursal', 403);
      }

      // 2. Eliminar
      const deleted = await SaleModel.delete(id);
      if (!deleted) return errorResponse(res, 'No se pudo eliminar la venta', 500);
      
      return successResponse(res, null, 'Venta eliminada correctamente');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
};

module.exports = SaleController;
