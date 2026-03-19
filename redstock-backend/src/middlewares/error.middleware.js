const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] [ERROR] ${req.method} ${req.originalUrl} - ${err.message}`);
  if (status >= 500) {
    console.error(err.stack);
  }
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
