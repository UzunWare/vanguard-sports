const db = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const query = `
      SELECT
        id, email, first_name, last_name, phone, role, status,
        email_verified, last_login_at, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get user by ID error:', error.message);
    throw error;
  }
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  try {
    const allowedFields = ['first_name', 'last_name', 'phone'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      const error = new Error('No valid fields to update');
      error.statusCode = 400;
      error.code = 'NO_FIELDS_TO_UPDATE';
      throw error;
    }

    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, status,
                email_verified, last_login_at, created_at, updated_at
    `;

    const result = await db.query(query, values);
    logger.info(`User profile updated: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Update profile error:', error.message);
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (filters = {}) => {
  try {
    let query = `
      SELECT
        id, email, first_name, last_name, phone, role, status,
        email_verified, last_login_at, created_at, updated_at
      FROM users
      WHERE 1=1
    `;

    const params = [];

    // Filter by role
    if (filters.role) {
      params.push(filters.role);
      query += ` AND role = $${params.length}`;
    }

    // Filter by status
    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    // Search by name or email
    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (
        LOWER(first_name || ' ' || last_name) LIKE LOWER($${params.length})
        OR LOWER(email) LIKE LOWER($${params.length})
      )`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Get all users error:', error.message);
    throw error;
  }
};

/**
 * Update user by admin
 */
const updateUserByAdmin = async (userId, updateData) => {
  try {
    const allowedFields = ['first_name', 'last_name', 'phone', 'role', 'status', 'email_verified'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      const error = new Error('No valid fields to update');
      error.statusCode = 400;
      error.code = 'NO_FIELDS_TO_UPDATE';
      throw error;
    }

    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, status,
                email_verified, last_login_at, created_at, updated_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    logger.info(`User updated by admin: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Update user by admin error:', error.message);
    throw error;
  }
};

/**
 * Suspend user account
 */
const suspendUser = async (userId) => {
  try {
    const query = `
      UPDATE users
      SET status = 'suspended', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, role, status
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Invalidate all refresh tokens for this user
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

    logger.info(`User suspended: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Suspend user error:', error.message);
    throw error;
  }
};

/**
 * Activate user account
 */
const activateUser = async (userId) => {
  try {
    const query = `
      UPDATE users
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, role, status
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    logger.info(`User activated: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Activate user error:', error.message);
    throw error;
  }
};

/**
 * Delete user account (soft delete)
 */
const deleteUser = async (userId) => {
  try {
    // Check if user has active enrollments
    const enrollmentCheck = await db.query(
      `SELECT COUNT(*) as count FROM enrollments
       WHERE parent_id = $1 AND status = 'active'`,
      [userId]
    );

    if (parseInt(enrollmentCheck.rows[0].count) > 0) {
      const error = new Error('Cannot delete user with active enrollments');
      error.statusCode = 400;
      error.code = 'ACTIVE_ENROLLMENTS_EXIST';
      throw error;
    }

    // Soft delete by setting status to 'deleted'
    const query = `
      UPDATE users
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, status
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Invalidate all refresh tokens
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

    logger.info(`User deleted: ${userId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Delete user error:', error.message);
    throw error;
  }
};

module.exports = {
  getUserById,
  updateProfile,
  getAllUsers,
  updateUserByAdmin,
  suspendUser,
  activateUser,
  deleteUser,
};
