const { ZodError } = require('zod');

/**
 * API Response formatter
 */
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  res.status(statusCode).json({
    success,
    message,
    data,
    ...(error && { error }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  sendResponse(res, statusCode, true, message, data);
};

/**
 * Send error response
 */
const sendError = (res, message, statusCode = 400, error = null) => {
  sendResponse(res, statusCode, false, message, null, error);
};


const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 */
const handleValidationError = (error) => {
  if (error instanceof ZodError) {
    return {
      message: 'Validation error',
      details: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }
  return {
    message: 'Validation failed',
    details: [{ message: error.message }],
  };
};

/**
 * Extract pagination params
 */
const getPaginationParams = (query, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, parseInt(query.limit, 10) || defaultLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  asyncHandler,
  handleValidationError,
  getPaginationParams,
};
