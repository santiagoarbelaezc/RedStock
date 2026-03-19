/**
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
const successResponse = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 */
const errorResponse = (res, message = 'Error interno del servidor', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { successResponse, errorResponse };
