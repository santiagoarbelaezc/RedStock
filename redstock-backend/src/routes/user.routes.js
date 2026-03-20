const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { verifyToken, isSuperAdmin, isAdmin, isAdminOfBranch } = require('../middlewares/auth.middleware');

// Todas las rutas requieren token
router.use(verifyToken);

// Rutas específicas PRIMERO - antes de las paramétricas
router.get('/admins', isSuperAdmin, UserController.getAllAdmins);
router.post('/admin', isSuperAdmin, UserController.createAdmin);
router.post('/employee', isAdmin, UserController.createEmployee);

router.get('/branch/:branchId', isAdminOfBranch, UserController.getAllByBranch);

// Rutas raíz y paramétricas - DESPUÉS
router.get('/', isSuperAdmin, UserController.getAll);
router.get('/:id', UserController.getById);

router.put('/:id', isAdmin, UserController.update);
router.delete('/:id', isAdmin, UserController.delete);

module.exports = router;

