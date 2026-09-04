/**
 * ============================================================
 * API RESPONSE UTILITIES
 * ============================================================
 * 
 * Centralized response formatting for all API endpoints.
 * Ensures consistent response structure across the application.
 * 
 * Usage:
 *   res.status(200).json(success(data, "Message"));
 *   res.status(400).json(error("Error message"));
 */

/**
 * Success Response Format
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted success response
 */
const success = (data = null, message = "Operation successful") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Error Response Format
 * @param {string} message - Error message
 * @param {*} errors - Detailed error information
 * @returns {Object} Formatted error response
 */
const error = (message = "An error occurred", errors = null) => {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Pagination Helper
 * @param {Array} items - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated response with metadata
 */
const paginate = (items = [], page = 1, limit = 10) => {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

/**
 * Validation Error Helper
 * @param {Object} errors - Validation errors object
 * @returns {Object} Formatted validation error response
 */
const validationError = (errors = {}) => {
  return error("Validation failed", errors);
};

module.exports = {
  success,
  error,
  paginate,
  validationError,
};
