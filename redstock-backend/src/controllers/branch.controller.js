const BranchModel = require('../models/branch.model');
const { successResponse, errorResponse } = require('../utils/response.util');

const getAll = async (req, res, next) => {
  try {
    const branches = await BranchModel.getAll();
    return successResponse(res, branches, 'Sucursales obtenidas');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const branch = await BranchModel.getById(req.params.id);
    if (!branch) return errorResponse(res, 'Sucursal no encontrada', 404);
    return successResponse(res, branch);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    if (!name || !address) return errorResponse(res, 'name y address son requeridos', 400);
    const branch = await BranchModel.create(name, address);
    return successResponse(res, branch, 'Sucursal creada', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const existing = await BranchModel.getById(req.params.id);
    if (!existing) return errorResponse(res, 'Sucursal no encontrada', 404);
    const { name, address } = req.body;
    const branch = await BranchModel.update(req.params.id, name, address);
    return successResponse(res, branch, 'Sucursal actualizada');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await BranchModel.delete(req.params.id);
    if (!deleted) return errorResponse(res, 'Sucursal no encontrada', 404);
    return successResponse(res, null, 'Sucursal eliminada');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
