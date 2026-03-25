const handleControllerError = (res, error, defaultMessage = 'Error interno del servidor') => {
  console.error(`[${new Date().toISOString()}] ${error.message}`, {
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  
  const statusCode = error.statusCode || 500;
  const message = error.statusCode ? error.message : defaultMessage;
  
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && !error.statusCode && {
      debug: { error: error.message, stack: error.stack }
    })
  });
};

module.exports = { handleControllerError };
