const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response.util');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return errorResponse(res, 'Token no proporcionado', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Token inválido o expirado', 403);
  }
};

module.exports = { verifyToken };
