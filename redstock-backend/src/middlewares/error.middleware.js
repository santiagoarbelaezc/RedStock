const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
