const { sendError } = require('../utils/responseHandler');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error('Error:', {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return sendError(res, 'Validation error', 400, { errors });
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, `${field} already exists`, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  // Default error response
  sendError(res, message, statusCode);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = {
  errorHandler,
  notFound,
};
