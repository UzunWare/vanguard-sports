/**
 * Color Mappings Utility
 * Centralized color definitions for badges, status indicators, and UI elements
 * Ensures consistency across the application
 */

/**
 * Badge color mappings for use with Badge component
 * Format: Tailwind CSS classes for background, text, and border
 */
export const badgeColors = {
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-slate-100 text-slate-800 border-slate-200'
};

/**
 * Session status color mappings
 */
export const sessionStatusColors = {
  'Open': 'green',
  'Limited': 'yellow',
  'Waitlist Soon': 'orange',
  'Full': 'blue',
  'Archived': 'gray'
};

/**
 * User role color mappings
 */
export const userRoleColors = {
  'Parent': 'blue',
  'Coach': 'purple',
  'Admin': 'red'
};

/**
 * User status color mappings
 */
export const userStatusColors = {
  'Active': 'green',
  'Suspended': 'red',
  'Inactive': 'gray'
};

/**
 * Transaction/Payment status color mappings
 */
export const transactionStatusColors = {
  'Paid': 'green',
  'Failed': 'red',
  'Refunded': 'purple',
  'Pending': 'yellow'
};

/**
 * Sport color mappings
 */
export const sportColors = {
  'Basketball': 'orange',
  'Volleyball': 'blue'
};

/**
 * Gradient color classes for metric cards
 * Used in admin dashboard and statistics displays
 */
export const gradientColors = {
  green: 'from-green-500 to-emerald-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-red-500',
  red: 'from-red-500 to-red-600'
};

/**
 * Get badge color class for a given color name
 * @param {string} color - Color name (orange, green, blue, etc.)
 * @returns {string} Tailwind CSS classes
 */
export const getBadgeColor = (color) => {
  return badgeColors[color] || badgeColors.gray;
};

/**
 * Get session status color
 * @param {string} status - Session status
 * @returns {string} Color name
 */
export const getSessionStatusColor = (status) => {
  return sessionStatusColors[status] || 'gray';
};

/**
 * Get user role color
 * @param {string} role - User role
 * @returns {string} Color name
 */
export const getUserRoleColor = (role) => {
  return userRoleColors[role] || 'gray';
};

/**
 * Get user status color
 * @param {string} status - User status
 * @returns {string} Color name
 */
export const getUserStatusColor = (status) => {
  return userStatusColors[status] || 'gray';
};

/**
 * Get transaction status color
 * @param {string} status - Transaction status
 * @returns {string} Color name
 */
export const getTransactionStatusColor = (status) => {
  return transactionStatusColors[status] || 'gray';
};

/**
 * Get sport color
 * @param {string} sport - Sport name
 * @returns {string} Color name
 */
export const getSportColor = (sport) => {
  return sportColors[sport] || 'gray';
};
