/**
 * Validator Utility Functions
 * Functions for validating email, phone, card numbers, and other form inputs
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format (555) 123-4567
 */
export const isValidPhone = (phone) => {
  return /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);
};

/**
 * Validate credit card number format
 * @param {string} card - Card number to validate
 * @returns {boolean} True if valid card format (16 digits with spaces)
 */
export const isValidCard = (card) => {
  return /^\d{4} \d{4} \d{4} \d{4}$/.test(card);
};

/**
 * Validate CVV format
 * @param {string} cvv - CVV to validate
 * @returns {boolean} True if valid CVV (3 or 4 digits)
 */
export const isValidCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Validate expiry format
 * @param {string} expiry - Expiry to validate
 * @returns {boolean} True if valid expiry format (MM/YY)
 */
export const isValidExpiry = (expiry) => {
  return /^\d{2}\/\d{2}$/.test(expiry);
};

/**
 * Validate signature matches name
 * @param {string} signature - Digital signature
 * @param {string} name - Name to match against
 * @returns {boolean} True if signature matches name (case-insensitive)
 */
export const isSignatureValid = (signature, name) => {
  return signature.toLowerCase() === name.toLowerCase();
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const isRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @returns {boolean} True if meets minimum length
 */
export const minLength = (value, min) => {
  return value && value.length >= min;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} max - Maximum length
 * @returns {boolean} True if within maximum length
 */
export const maxLength = (value, max) => {
  return value && value.length <= max;
};

/**
 * Validate password strength
 * Returns object with strength level and message
 * @param {string} password - Password to validate
 * @returns {object} { strength: 'weak'|'medium'|'strong', message: string }
 */
export const validatePasswordStrength = (password) => {
  if (!password) return { strength: 'weak', message: 'Password is required' };
  if (password.length < 6) return { strength: 'weak', message: 'Too short (min 6 characters)' };
  if (password.length < 8) return { strength: 'medium', message: 'Good, but could be stronger' };

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (strength >= 3 && password.length >= 8) {
    return { strength: 'strong', message: 'Strong password' };
  } else if (strength >= 2) {
    return { strength: 'medium', message: 'Good password' };
  }

  return { strength: 'weak', message: 'Add uppercase, numbers, or symbols' };
};
