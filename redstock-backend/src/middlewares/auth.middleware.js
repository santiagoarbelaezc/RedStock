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
    // Log exitoso opcional (puede ser ruidoso, morgan ya registra la ruta)
    // console.log(`[AUTH] Usuario verificado: ${decoded.email} [${decoded.role}]`);
    next();
  } catch (err) {
    console.error(`[AUTH] Error verificando token: ${err.message}`);
    return errorResponse(res, 'Token inválido o expirado', 401); // 401 es más preciso para fallos de token
  }
};

const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'No autenticado', 401);
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`[AUTH] Acceso denegado p/ rol [${req.user.role}] en ruta ${req.originalUrl}. Requerido: ${roles.join(',')}`);
      return errorResponse(res, 'No tienes permisos para realizar esta acción', 403);
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
