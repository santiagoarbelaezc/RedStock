const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Inicializar pool de conexión a MySQL
require('./config/db');

const { errorHandler } = require('./middlewares/error.middleware');

// Importación de Rutas
const authRoutes      = require('./routes/auth.routes');
const branchRoutes    = require('./routes/branch.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const transferRoutes  = require('./routes/transfer.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const productRoutes   = require('./routes/product.routes');
const saleRoutes      = require('./routes/sale.routes');
const movementRoutes  = require('./routes/inventoryMovement.routes');
const userRoutes      = require('./routes/user.routes');
const testUiRoutes    = require('./routes/test-ui.routes'); // 🡨 Added test runner API

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Registro de Rutas
app.use('/api/auth',      authRoutes);
app.use('/api/branches',  branchRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/sales',     saleRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/users',     userRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'RedStock API is running 🚀', version: '1.1.0' });
});

// Registro API Testing Visual Endpoint
app.use('/api/test_api',  testUiRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
});

// Manejo global de errores
app.use(errorHandler);

// En entorno de tests (supertest), el modulo se requiere y NO deberíamos iniciar el servidor
// Esto permite que Jest maneje las conexiones independientemente y evita error "EADDRINUSE" en el port 3000
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
