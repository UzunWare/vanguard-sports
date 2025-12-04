const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authentication Service
 * Handles user registration, login, token management
 */

/**
 * Register a new user (parent only)
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user
 */
const register = async (userData) => {
  const { email, password, firstName, lastName, phone } = userData;

  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      error.code = 'USER_EXISTS';
      throw error;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, phone, role, status, created_at`,
      [email, passwordHash, firstName, lastName, phone, 'parent']
    );

    const user = result.rows[0];
    logger.info(`New user registered: ${email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    };
  } catch (error) {
    logger.error('Registration error:', error.message);
    throw error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User and tokens
 */
const login = async (email, password) => {
  try {
    // Find user
    const result = await db.query(
      `SELECT id, email, password_hash, first_name, last_name, phone, role, status, require_password_change
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      const error = new Error('Account is inactive or suspended');
      error.statusCode = 403;
      error.code = 'ACCOUNT_INACTIVE';
      throw error;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in database
    await storeRefreshToken(user.id, refreshToken);

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        requirePasswordChange: user.require_password_change || false,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Login error:', error.message);
    throw error;
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const result = await db.query(
      `SELECT rt.*, u.email, u.first_name, u.last_name, u.role, u.status
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > CURRENT_TIMESTAMP`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    const tokenData = result.rows[0];

    // Check if user is still active
    if (tokenData.status !== 'active') {
      const error = new Error('Account is inactive');
      error.statusCode = 403;
      error.code = 'ACCOUNT_INACTIVE';
      throw error;
    }

    // Generate new access token
    const user = {
      id: tokenData.user_id,
      email: tokenData.email,
      first_name: tokenData.first_name,
      last_name: tokenData.last_name,
      role: tokenData.role,
    };

    const accessToken = generateAccessToken(user);

    logger.info(`Access token refreshed for user: ${user.email}`);

    return { accessToken };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      error.message = 'Invalid or expired refresh token';
    }
    logger.error('Token refresh error:', error.message);
    throw error;
  }
};

/**
 * Logout user
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<void>}
 */
const logout = async (refreshToken) => {
  try {
    // Delete refresh token from database
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    logger.info('User logged out');
  } catch (error) {
    logger.error('Logout error:', error.message);
    throw error;
  }
};

/**
 * Generate access token (short-lived)
 * @param {Object} user - User object
 * @returns {string} JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
  });
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} user - User object
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'refresh',
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  });
};

/**
 * Store refresh token in database
 * @param {string} userId - User ID
 * @param {string} token - Refresh token
 * @returns {Promise<void>}
 */
const storeRefreshToken = async (userId, token) => {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await db.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get user
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const user = result.rows[0];

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!passwordMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      error.code = 'INVALID_PASSWORD';
      throw error;
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear require_password_change flag
    await db.query(
      'UPDATE users SET password_hash = $1, require_password_change = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    // Invalidate all refresh tokens for this user
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

    logger.info(`Password changed for user: ${userId}`);
  } catch (error) {
    logger.error('Change password error:', error.message);
    throw error;
  }
};

/**
 * Generate secure temporary password
 * Format: Capital + lowercase + numbers + special char (12 chars)
 * Example: Vg8@mKx2nPq9
 */
const generateTemporaryPassword = () => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%^&*';

  const password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)]
  ];

  // Shuffle to make it more random
  return password.sort(() => Math.random() - 0.5).join('');
};

/**
 * Create parent account with temporary password (for enrollment auto-creation)
 * @param {Object} parentData - Parent information
 * @returns {Promise<Object>} Created user and temporary password
 */
const createParentAccountWithTempPassword = async (parentData) => {
  const { email, firstName, lastName, phone } = parentData;

  try {
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      // User already exists, return existing user info without password
      const user = existingUser.rows[0];
      return {
        isNewAccount: false,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        }
      };
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(temporaryPassword, saltRounds);

    // Insert new user with require_password_change flag
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, require_password_change)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, phone, role, status, created_at`,
      [email, passwordHash, firstName, lastName, phone, 'parent']
    );

    const user = result.rows[0];
    logger.info(`New parent account auto-created during enrollment: ${email}`);

    return {
      isNewAccount: true,
      temporaryPassword,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
      }
    };
  } catch (error) {
    logger.error('Auto-create parent account error:', error.message);
    throw error;
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  changePassword,
  generateTemporaryPassword,
  createParentAccountWithTempPassword,
};
