const ProductModel = require('../models/product.model');
const { successResponse, errorResponse } = require('../utils/response.util');

const getAll = async (req, res, next) => {
  try {
    const products = await ProductModel.getAll();
    return successResponse(res, products, 'Productos obtenidos');
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const product = await ProductModel.getById(req.params.id);
    if (!product) return errorResponse(res, 'Producto no encontrado', 404);
    return successResponse(res, product);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, sku } = req.body;
    if (!name || !sku) return errorResponse(res, 'name y sku son requeridos', 400);

    const existing = await ProductModel.getBySku(sku);
    if (existing) return errorResponse(res, 'El SKU ya está en uso', 409);

    const product = await ProductModel.create(name, description, sku);
    console.log(`[PRODUCT] Producto creado: ${name} (SKU: ${sku}) por ${req.user.email}`);
    
    return successResponse(res, product, 'Producto creado', 201);
  } catch (err) {
    console.error(`[PRODUCT] Error creando producto: ${err.message}`);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, sku } = req.body;

    const existing = await ProductModel.getById(id);
    if (!existing) return errorResponse(res, 'Producto no encontrado', 404);

    const product = await ProductModel.update(id, { name, description, sku });
    console.log(`[PRODUCT] Producto actualizado: ID ${id} por ${req.user.email}`);

    return successResponse(res, product, 'Producto actualizado');
  } catch (err) {
    console.error(`[PRODUCT] Error actualizando producto: ${err.message}`);
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ProductModel.delete(id);
    if (!deleted) return errorResponse(res, 'Producto no encontrado', 404);

    console.log(`[PRODUCT] Producto eliminado: ID ${id} por ${req.user.email}`);
    return successResponse(res, null, 'Producto eliminado');
  } catch (err) {
    console.error(`[PRODUCT] Error eliminando producto: ${err.message}`);
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
