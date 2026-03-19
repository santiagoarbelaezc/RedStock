const { Router } = require('express');
const router = Router();

// GET /api/transfers
router.get('/', (req, res) => {
  res.status(501).json({ message: 'TODO: listar traslados' });
});

// GET /api/transfers/:id
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'TODO: obtener traslado' });
});

// POST /api/transfers
router.post('/', (req, res) => {
  res.status(501).json({ message: 'TODO: solicitar traslado' });
});

// PUT /api/transfers/:id/status
router.put('/:id/status', (req, res) => {
  res.status(501).json({ message: 'TODO: actualizar estado de traslado' });
});

// POST /api/transfers/:id/confirm
router.post('/:id/confirm', (req, res) => {
  res.status(501).json({ message: 'TODO: confirmar recepción del traslado' });
});

module.exports = router;
