/**
 * ============================================================
 * FORM VALIDATION UTILITIES
 * ============================================================
 * 
 * Client-side form validation helper functions.
 * Ensures data quality before sending to API.
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} { isValid, error }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, error, strength }
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      error: "Password is required",
      strength: "weak",
    };
  }

  const errors = [];
  let strength = "weak";

  if (password.length < 6) {
    errors.push("At least 6 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("At least one number");
  }

  if (password.length >= 8 && errors.length === 0) {
    strength = "strong";
  } else if (password.length >= 6 && errors.length <= 1) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? `Password needs: ${errors.join(", ")}` : "",
    strength,
  };
};

/**
 * Validate password match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} { isValid, error }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {boolean} isRequired - Whether field is required
 * @returns {Object} { isValid, error }
 */
export const validatePhone = (phone, isRequired = false) => {
  if (!phone && !isRequired) {
    return { isValid: true, error: "" };
  }

  if (!phone && isRequired) {
    return { isValid: false, error: "Phone number is required" };
  }

  const phoneRegex = /^[0-9]{10,}$/;
  const cleanPhone = phone.replace(/\D/g, "");

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: "Invalid phone number (10+ digits)" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate required field
 * @param {string} value - Field value
 * @param {string} fieldName - Field display name
 * @returns {Object} { isValid, error }
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (!value || value.toString().trim() === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field display name
 * @returns {Object} { isValid, error }
 */
export const validateMinLength = (value, minLength, fieldName = "Field") => {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field display name
 * @returns {Object} { isValid, error }
 */
export const validateMaxLength = (value, maxLength, fieldName = "Field") => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field display name
 * @returns {Object} { isValid, error }
 */
export const validateRange = (value, min, max, fieldName = "Value") => {
  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }

  return { isValid: true, error: "" };
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules
 * @returns {Object} { isValid, errors }
 * 
 * Example:
 * const rules = {
 *   email: [(value) => validateEmail(value)],
 *   password: [(value) => validatePassword(value)],
 * };
 * const result = validateForm(formData, rules);
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const validators = rules[field];
    const value = formData[field];

    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Format phone number display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  return cleaned;
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validateForm,
  formatPhone,
};
