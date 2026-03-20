const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response.util');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('[AUTH] Intento de acceso sin token');
    return errorResponse(res, 'Token no proporcionado', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`[AUTH] Error verificando token: ${err.message}`);
    return errorResponse(res, 'Token inválido o expirado', 401);
  }
};

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }
  return errorResponse(res, 'Acceso denegado. Se requiere rol superadmin', 403);
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    return next();
  }
  return errorResponse(res, 'Acceso denegado. Se requiere rol admin', 403);
};

const isAdminOfBranch = (req, res, next) => {
  if (!req.user) return errorResponse(res, 'No autenticado', 401);

  const branchId = parseInt(req.params.branchId || req.body.branchId || req.query.branchId);

  if (req.user.role === 'superadmin') {
    return next();
  }

  if (req.user.role === 'admin' && req.user.branch_id === branchId) {
    return next();
  }

  return errorResponse(res, 'Acceso denegado. No tienes permisos para gestionar esta sucursal', 403);
};

const isSuperAdminOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
    return next();
  }
  return errorResponse(res, 'Acceso denegado. Se requiere rol admin o superadmin', 403);
};

const isMemberOfBranch = (req, res, next) => {
  if (!req.user) return errorResponse(res, 'No autenticado', 401);

  const branchId = parseInt(req.params.branchId || req.body.branch_id || req.body.branchId || req.query.branchId || req.params.transferId);

  // Superadmin tiene acceso a todo
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Comparación flexible (soporta string vs number)
  if (req.user.branch_id == branchId) {
    return next();
  }

  // Especial para traslados: si el usuario es del origen o destino
  // Esto se manejaría mejor en el controlador de traslados, pero aquí validamos la sucursal general
  return errorResponse(res, 'Acceso denegado. No tienes permisos para acceder a esta sucursal', 403);
};

module.exports = { 
  verifyToken, 
  isSuperAdmin, 
  isAdmin, 
  isAdminOfBranch, 
  isSuperAdminOrAdmin,
  isMemberOfBranch
};
