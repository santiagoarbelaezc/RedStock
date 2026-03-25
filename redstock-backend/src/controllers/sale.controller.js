const SaleModel = require('../models/sale.model');
const InventoryModel = require('../models/inventory.model');
const { successResponse } = require('../utils/response.util');
const { handleControllerError } = require('../utils/errorHandler');

const SaleController = {
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
      return handleControllerError(res, error);
    }
  },

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
      return handleControllerError(res, error);
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await SaleModel.getById(id);
      if (!sale) {
        const err = new Error('Venta no encontrada');
        err.statusCode = 404;
        throw err;
      }
      return successResponse(res, sale, 'Detalles de la venta obtenida');
    } catch (error) {
      return handleControllerError(res, error);
    }
  },

  createSale: async (req, res) => {
    try {
      const { branch_id, product_id, quantity, total, sale_date } = req.body;

      if (!branch_id || !product_id || !quantity || !total) {
        const err = new Error('Faltan campos obligatorios: branch_id, product_id, quantity, total');
        err.statusCode = 400;
        throw err;
      }

      if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.branch_id !== parseInt(branch_id)) {
        const err = new Error('No tienes permiso para registrar ventas en esta sucursal');
        err.statusCode = 403;
        throw err;
      }

      const newSale = await SaleModel.createSale({ branch_id, product_id, quantity, total });
      return successResponse(res, newSale, 'Venta registrada exitosamente', 201);
    } catch (error) {
      return handleControllerError(res, error);
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const sale = await SaleModel.getById(id);
      if (!sale) {
        const err = new Error('Venta no encontrada');
        err.statusCode = 404;
        throw err;
      }

      if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.branch_id !== sale.branch_id) {
        const err = new Error('No tienes permiso para eliminar ventas de otra sucursal');
        err.statusCode = 403;
        throw err;
      }

      const deleted = await SaleModel.delete(id);
      if (!deleted) {
        const err = new Error('No se pudo eliminar la venta');
        err.statusCode = 500;
        throw err;
      }
      
      return successResponse(res, null, 'Venta eliminada correctamente');
    } catch (error) {
      return handleControllerError(res, error);
    }
  }
};

module.exports = SaleController;
