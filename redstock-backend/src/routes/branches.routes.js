const { Router } = require('express');
const router = Router();

// GET /api/branches
router.get('/', (req, res) => {
  res.status(501).json({ message: 'TODO: listar sucursales' });
});

// GET /api/branches/:id
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'TODO: obtener sucursal' });
});

// POST /api/branches
router.post('/', (req, res) => {
  res.status(501).json({ message: 'TODO: crear sucursal' });
});

// PUT /api/branches/:id
router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'TODO: actualizar sucursal' });
});

module.exports = router;
