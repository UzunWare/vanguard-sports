/**
 * Application Constants
 * Centralized configuration values used throughout the application
 */

/**
 * Pricing Constants
 */
export const PRICING = {
  SIBLING_DISCOUNT_RATE: 0.10, // 10% discount for siblings
  MIN_SESSION_PRICE: 50.00,
  MAX_SESSION_PRICE: 500.00,
  DEFAULT_SESSION_PRICE: 90.00,
  DEFAULT_REGISTRATION_FEE: 30.00
};

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  MIN_CAPACITY: 8,
  MAX_CAPACITY: 30,
  DEFAULT_CAPACITY: 20,
  MIN_AGE: 6,
  MAX_AGE: 18,
  DURATIONS: [60, 75, 90, 120], // in minutes
  DEFAULT_DURATION: 90
};

/**
 * Date/Time Constants
 */
export const DATE_TIME = {
  DAYS_OF_WEEK: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  MONTHS_FULL: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

/**
 * Sports Configuration
 */
export const SPORTS = {
  BASKETBALL: 'Basketball',
  VOLLEYBALL: 'Volleyball'
};

/**
 * User Roles
 */
export const ROLES = {
  PARENT: 'Parent',
  COACH: 'Coach',
  ADMIN: 'Admin'
};

/**
 * Status Types
 */
export const STATUS = {
  SESSION: {
    OPEN: 'Open',
    LIMITED: 'Limited',
    WAITLIST_SOON: 'Waitlist Soon',
    FULL: 'Full',
    ARCHIVED: 'Archived'
  },
  USER: {
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    INACTIVE: 'Inactive'
  },
  TRANSACTION: {
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
    PENDING: 'Pending'
  },
  SUBSCRIPTION: {
    ACTIVE: 'Active',
    CANCELED: 'Canceled',
    PAST_DUE: 'Past Due'
  }
};

/**
 * Gender Options
 */
export const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  COED: 'Coed'
};

/**
 * Validation Rules
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{3}\)\s\d{3}-\d{4}$/,
  CARD_LENGTH: 19, // With spaces: "1234 5678 9012 3456"
  CVV_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  TRANSACTION_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100
};

/**
 * File Size Limits
 */
export const FILE_LIMITS = {
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  USER: 'vanguard_user',
  AUTH_TOKEN: 'vanguard_auth_token',
  THEME: 'vanguard_theme',
  PREFERENCES: 'vanguard_preferences'
};

/**
 * API Endpoints (for future backend integration)
 */
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3000/api',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh'
  },
  SESSIONS: '/sessions',
  USERS: '/users',
  ATHLETES: '/athletes',
  EVALUATIONS: '/evaluations',
  TRANSACTIONS: '/transactions'
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number (XXX) XXX-XXXX',
  INVALID_CARD: 'Please enter a valid card number',
  INVALID_CVV: 'Please enter a valid 3-digit CVV',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  AGE_RANGE_INVALID: 'Maximum age must be greater than or equal to minimum age',
  PRICE_OUT_OF_RANGE: `Price must be between $${PRICING.MIN_SESSION_PRICE} and $${PRICING.MAX_SESSION_PRICE}`,
  GENERIC_ERROR: 'An error occurred. Please try again.'
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  SESSION_CREATED: 'Session created successfully',
  SESSION_UPDATED: 'Session updated successfully',
  SESSION_DELETED: 'Session deleted successfully',
  USER_UPDATED: 'User updated successfully',
  PASSWORD_RESET: 'Password reset email sent',
  EVALUATION_SAVED: 'Evaluation saved successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully'
};

export default {
  PRICING,
  SESSION_CONFIG,
  DATE_TIME,
  SPORTS,
  ROLES,
  STATUS,
  GENDER,
  VALIDATION,
  PAGINATION,
  FILE_LIMITS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
