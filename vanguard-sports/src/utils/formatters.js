/**
 * Formatter Utility Functions
 * Functions for formatting phone numbers, credit cards, dates, and currency
 */

/**
 * Format phone number to (555) 123-4567 format
 * @param {string} value - Raw phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

/**
 * Format credit card number to 0000 0000 0000 0000 format
 * @param {string} value - Raw card number string
 * @returns {string} Formatted card number
 */
export const formatCard = (value) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.length > 1 ? parts.join(' ') : value;
};

/**
 * Format currency to $X.XX format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `$${Number(amount).toFixed(2)}`;
};

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Mask credit card number showing only last 4 digits
 * @param {string} cardNumber - Full card number
 * @returns {string} Masked card number (•••• •••• •••• 1234)
 */
export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  return `•••• •••• •••• ${last4}`;
};
