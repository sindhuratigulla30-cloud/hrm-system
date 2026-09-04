/**
 * ============================================================
 * INPUT VALIDATION UTILITIES
 * ============================================================
 * 
 * Centralized validation functions for common use cases.
 * Prevents code duplication and ensures consistency.
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === "string" && emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, errors }
 */
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Validate required fields
 * @param {Object} data - Object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} { isValid, missingFields }
 */
const validateRequiredFields = (data, requiredFields = []) => {
  const missingFields = requiredFields.filter(
    (field) => !data[field] || data[field].toString().trim() === ""
  );

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 500); // Limit length
};

/**
 * Sanitize email
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  return sanitizeString(email).toLowerCase();
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidPhone,
  validateRequiredFields,
  isValidDate,
  sanitizeString,
  sanitizeEmail,
};
