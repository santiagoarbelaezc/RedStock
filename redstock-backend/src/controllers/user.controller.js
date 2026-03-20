const UserModel = require('../models/user.model');
const BranchModel = require('../models/branch.model');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../utils/response.util');

const UserController = {
  // GET /api/users
  getAll: async (req, res) => {
    try {
      // Solo superadmin puede ver todos
      const users = await UserModel.getAll();
      return successResponse(res, users, 'Usuarios obtenidos');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // GET /api/users/admins
  getAllAdmins: async (req, res) => {
    try {
      const admins = await UserModel.getAllAdmins();
      return successResponse(res, admins, 'Administradores obtenidos');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // GET /api/users/branch/:branchId
  getAllByBranch: async (req, res) => {
    try {
      const { branchId } = req.params;
      
      // Si es admin, solo puede ver su sucursal
      if (req.user.role === 'admin' && req.user.branch_id !== parseInt(branchId)) {
        return errorResponse(res, 'No tienes permiso para ver usuarios de otra sucursal', 403);
      }

      const users = await UserModel.getAllByBranch(branchId);
      return successResponse(res, users, `Usuarios de la sucursal ${branchId} obtenidos`);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // GET /api/users/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await UserModel.getById(id);
      
      if (!user) return errorResponse(res, 'Usuario no encontrado', 404);

      // Reglas de visibilidad
      if (req.user.role === 'superadmin') {
        // Superadmin ve todo
      } else if (req.user.role === 'admin') {
        if (user.branch_id !== req.user.branch_id) {
          return errorResponse(res, 'No tienes permiso para ver este usuario', 403);
        }
      } else {
        // Employee solo se ve a sí mismo
        if (req.user.id !== parseInt(id)) {
          return errorResponse(res, 'No tienes permiso para ver otros perfiles', 403);
        }
      }

      return successResponse(res, user);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // POST /api/users/admin
  createAdmin: async (req, res) => {
    try {
      const { name, email, password, branch_id } = req.body;
      
      if (!name || !email || !password || !branch_id) {
        return errorResponse(res, 'Faltan campos: name, email, password, branch_id', 400);
      }

      // 1. Validar que la sucursal exista
      // Nota: asumo que BranchModel.getById existe o usamos una query rápida
      const [branchExists] = await require('../config/db').query('SELECT id FROM branches WHERE id = ?', [branch_id]);
      if (branchExists.length === 0) return errorResponse(res, 'La sucursal no existe', 404);

      // 2. Validar que la sucursal no tenga ya un admin
      const [existingAdmin] = await require('../config/db').query('SELECT id FROM users WHERE branch_id = ? AND role = "admin"', [branch_id]);
      if (existingAdmin.length > 0) return errorResponse(res, 'La sucursal ya tiene un administrador asignado', 400);

      // 3. Validar email unico
      const existingEmail = await UserModel.getByEmail(email);
      if (existingEmail) return errorResponse(res, 'El email ya está uso', 409);

      // 4. Crear
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create(name, email, hashedPassword, 'admin', branch_id);
      
      return successResponse(res, newUser, 'Administrador creado exitosamente', 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // POST /api/users/employee
  createEmployee: async (req, res) => {
    try {
      const { name, email, password, branch_id } = req.body;

      if (!name || !email || !password || !branch_id) {
        return errorResponse(res, 'Faltan campos: name, email, password, branch_id', 400);
      }

      // Si es admin, solo puede crear para SU sucursal
      if (req.user.role === 'admin' && req.user.branch_id !== parseInt(branch_id)) {
        return errorResponse(res, 'Solo puedes crear empleados para tu propia sucursal', 403);
      }

      // Validar email unico
      const existingEmail = await UserModel.getByEmail(email);
      if (existingEmail) return errorResponse(res, 'El email ya está uso', 409);

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create(name, email, hashedPassword, 'employee', branch_id);

      return successResponse(res, newUser, 'Empleado creado exitosamente', 201);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // PUT /api/users/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, branch_id } = req.body;
      
      const targetUser = await UserModel.getById(id);
      if (!targetUser) return errorResponse(res, 'Usuario no encontrado', 404);

      // Reglas de actualización
      if (req.user.role === 'superadmin') {
        // Superadmin actualiza todo, excepto su propio rol o el de otros superadmins a algo menor si fuera el caso
        if (targetUser.role === 'superadmin' && role !== 'superadmin') {
          return errorResponse(res, 'No se puede degradar a un superadmin', 403);
        }
        // Admin solo actualiza empleados de su sucursal
        if (targetUser.branch_id !== req.user.branch_id || targetUser.role !== 'employee') {
          return errorResponse(res, 'Solo puedes actualizar empleados de tu sucursal', 403);
        }
        // Admin no puede editarse a sí mismo (para esto debería ir a Mi Perfil, no Gestión de Usuarios)
        if (req.user.id === parseInt(id)) {
          return errorResponse(res, 'No puedes editar tu propio usuario desde la gestión de sucursal', 403);
        }
        // Admin no puede cambiar roles a admin o superadmin
        if (role && role !== 'employee') {
          return errorResponse(res, 'No tienes permiso para cambiar el rol', 403);
        }
      } else {
        return errorResponse(res, 'No tienes permiso para actualizar usuarios', 403);
      }

      const updated = await UserModel.update(id, { name, email, role, branch_id });
      return successResponse(res, updated, 'Usuario actualizado');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  },

  // DELETE /api/users/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const targetUser = await UserModel.getById(id);
      
      if (!targetUser) return errorResponse(res, 'Usuario no encontrado', 404);

      // Reglas de eliminación
      if (targetUser.role === 'superadmin') {
        return errorResponse(res, 'El superadmin no puede ser eliminado', 403);
      }

      if (req.user.role === 'admin') {
        if (targetUser.branch_id !== req.user.branch_id || targetUser.role !== 'employee') {
          return errorResponse(res, 'Solo puedes eliminar empleados de tu sucursal', 403);
        }
      }

      const deleted = await UserModel.delete(id);
      if (!deleted) return errorResponse(res, 'No se pudo eliminar el usuario', 500);
      
      return successResponse(res, null, 'Usuario eliminado correctamente');
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
};

module.exports = UserController;
