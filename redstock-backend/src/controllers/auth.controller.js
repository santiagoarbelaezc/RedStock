const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response.util');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password || !branchId) {
      return errorResponse(res, 'Campos requeridos: name, email, password, branchId', 400);
    }

    const existing = await UserModel.getByEmail(email);
    if (existing) return errorResponse(res, 'El email ya está registrado', 409);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create(name, email, hashedPassword, role, branchId);
    console.log(`[AUTH] Nuevo usuario registrado: ${email} [${user.role}]`);

    return successResponse(res, user, 'Usuario registrado exitosamente', 201);
  } catch (err) {
    console.error(`[AUTH] Error en registro: ${err.message}`);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email y contraseña requeridos', 400);
    }

    const user = await UserModel.getByEmail(email);
    if (!user) {
      console.warn(`[AUTH] Intento de login fallido - Email no encontrado: ${email}`);
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.warn(`[AUTH] Intento de login fallido - Password incorrecto: ${email}`);
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, branchId: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log(`[AUTH] Login exitoso: ${email} [${user.role}]`);

    return successResponse(res, {
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        branchId: user.branch_id,
        branch_name: user.branch_name 
      },
    }, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
