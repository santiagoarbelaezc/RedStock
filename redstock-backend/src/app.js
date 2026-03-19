const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializar pool de conexión a MySQL
require('./config/db');

const { errorHandler } = require('./middlewares/error.middleware');

// Rutas
const authRoutes      = require('./routes/auth.routes');
const branchRoutes    = require('./routes/branch.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const transferRoutes  = require('./routes/transfer.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

// ─── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/branches',  branchRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'RedStock API is running 🚀', version: '1.0.0' });
});

// ─── Ruta no encontrada ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// ─── Manejo global de errores (debe ir al final) ──────────────────────────────
app.use(errorHandler);

// ─── Iniciar servidor ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
