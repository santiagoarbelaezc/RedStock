const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { successResponse } = require('../utils/response.util');
const { handleControllerError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password || !branchId) {
      const err = new Error('Campos requeridos: name, email, password, branchId');
      err.statusCode = 400;
      throw err;
    }

    const existing = await UserModel.getByEmail(email);
    if (existing) {
      const err = new Error('El email ya está registrado');
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create(name, email, hashedPassword, role, branchId);
    logger.info(`Nuevo usuario registrado: ${email} [${user.role}]`);

    return successResponse(res, user, 'Usuario registrado exitosamente', 201);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email y contraseña requeridos');
      err.statusCode = 400;
      throw err;
    }

    const user = await UserModel.getByEmail(email);
    if (!user) {
      logger.warn(`Intento de login fallido - Email no encontrado: ${email}`);
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.warn(`Intento de login fallido - Password incorrecto: ${email}`);
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, branch_id: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    logger.info(`Login exitoso: ${email} [${user.role}]`);

    return successResponse(res, {
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        branch_id: user.branch_id,
        branch_name: user.branch_name 
      },
    }, 'Login exitoso');
  } catch (err) {
    return handleControllerError(res, err);
  }
};

module.exports = { register, login };
