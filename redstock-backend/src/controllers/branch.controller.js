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
    console.log(`[BRANCH] Sucursal creada: ${name} (por ${req.user.email})`);
    return successResponse(res, branch, 'Sucursal creada', 201);
  } catch (err) {
    console.error(`[BRANCH] Error creando sucursal: ${err.message}`);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const existing = await BranchModel.getById(req.params.id);
    if (!existing) return errorResponse(res, 'Sucursal no encontrada', 404);
    const { name, address } = req.body;
    const branch = await BranchModel.update(req.params.id, name, address);
    console.log(`[BRANCH] Sucursal actualizada: ID ${req.params.id} (por ${req.user.email})`);
    return successResponse(res, branch, 'Sucursal actualizada');
  } catch (err) {
    console.error(`[BRANCH] Error actualizando sucursal: ${err.message}`);
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await BranchModel.delete(req.params.id);
    if (!deleted) return errorResponse(res, 'Sucursal no encontrada', 404);
    console.log(`[BRANCH] Sucursal eliminada: ID ${req.params.id} (por ${req.user.email})`);
    return successResponse(res, null, 'Sucursal eliminada');
  } catch (err) {
    console.error(`[BRANCH] Error eliminando sucursal: ${err.message}`);
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
