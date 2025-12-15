// Import error logging function from audit logger
const { logError } = require('./auditLogger');

// Global error handling middleware for Express
// Catches all errors thrown in routes and returns appropriate JSON response
const errorHandler = (err, req, res, next) => {
  // Log error to audit log for tracking
  logError(req, err);

  // Log detailed error to console in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Default error response object
  let error = {
    success: false,
    message: err.message || 'Server Error',
    // Include stack trace only in development mode for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json(error);
  }

  // Handle Mongoose duplicate key error (unique constraint violation)
  if (err.code === 11000) {
    // Extract field name that caused the duplicate error
    const field = Object.keys(err.keyValue)[0];
    // Capitalize first letter of field name for user-friendly message
    error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(400).json(error);
  }

  // Handle Mongoose validation errors (schema validation failures)
  if (err.name === 'ValidationError') {
    // Extract all validation error messages into array
    const messages = Object.values(err.errors).map(val => val.message);
    // Join messages with comma for combined error message
    error.message = messages.join(', ');
    return res.status(400).json(error);
  }

  // Handle invalid JWT token errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  // Handle expired JWT token errors
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // Handle Stripe card errors (declined, invalid, etc.)
  if (err.type === 'StripeCardError') {
    error.message = err.message;
    return res.status(400).json(error);
  }

  // Handle Stripe invalid request errors (bad API calls)
  if (err.type === 'StripeInvalidRequestError') {
    error.message = 'Invalid payment request';
    return res.status(400).json(error);
  }

  // Default server error response with custom or 500 status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(error);
};

// Custom error class for operational errors
// Allows setting custom status codes and differentiating from programming errors
class AppError extends Error {
  // Constructor accepts error message and HTTP status code
  constructor(message, statusCode) {
    // Call parent Error constructor with message
    super(message);
    // HTTP status code for this error (400, 404, 500, etc.)
    this.statusCode = statusCode;
    // Status type: 'fail' for 4xx errors, 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Flag to identify operational vs programming errors
    this.isOperational = true;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler utility to wrap async route handlers
// Catches promise rejections and passes them to error middleware
const asyncHandler = (fn) => (req, res, next) => {
  // Execute async function and catch any errors, passing to next()
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export error handler as default, with AppError and asyncHandler as named exports
module.exports = errorHandler;
module.exports.AppError = AppError;
module.exports.asyncHandler = asyncHandler;
