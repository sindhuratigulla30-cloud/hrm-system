/**
 * ============================================================
 * ERROR HANDLING MIDDLEWARE
 * ============================================================
 * 
 * Centralized error handling for all API endpoints.
 * Catches and formats errors consistently.
 * 
 * Usage:
 * Add at the end of all routes in server.js:
 * app.use(errorHandler);
 */

const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err);
  }

  // Default error
  let status = 500;
  let message = "An unexpected error occurred";
  let errors = null;

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation error";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    status = 400;
    message = "Duplicate field value entered";
    const field = Object.keys(err.keyPattern)[0];
    errors = [`${field} already exists`];
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Authentication token expired";
  }

  // Cast Error (Invalid MongoDB ID)
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  }

  // Custom API Error
  if (err.status) {
    status = err.status;
    message = err.message;
    errors = err.errors;
  }

  // Send error response
  res.status(status).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Async Error Wrapper
 * Wrap async route handlers to catch errors automatically
 * 
 * Usage:
 * router.get("/path", asyncHandler(async (req, res) => {
 *   // Your code here
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom API Error Class
 */
class ApiError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = "ApiError";
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  ApiError,
};
