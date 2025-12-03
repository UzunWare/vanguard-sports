const userService = require('../services/user.service');
const logger = require('../utils/logger');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PATCH /api/users/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      phone,
    };

    const user = await userService.updateProfile(req.user.id, updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    const filters = {
      role,
      status,
      search,
    };

    const users = await userService.getAllUsers(filters);

    res.status(200).json({
      users,
      total: users.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user by admin
 * PATCH /api/admin/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, status, emailVerified } = req.body;

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      phone,
      role,
      status,
      email_verified: emailVerified,
    };

    const user = await userService.updateUserByAdmin(id, updateData);

    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend user account
 * PATCH /api/admin/users/:id/suspend
 */
const suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admins from suspending themselves
    if (id === req.user.id) {
      return res.status(400).json({
        error: {
          code: 'CANNOT_SUSPEND_SELF',
          message: 'You cannot suspend your own account',
        },
      });
    }

    const user = await userService.suspendUser(id);

    res.status(200).json({
      message: 'User suspended successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activate user account
 * PATCH /api/admin/users/:id/activate
 */
const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.activateUser(id);

    res.status(200).json({
      message: 'User activated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admins from deleting themselves
    if (id === req.user.id) {
      return res.status(400).json({
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'You cannot delete your own account',
        },
      });
    }

    const user = await userService.deleteUser(id);

    res.status(200).json({
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  activateUser,
  deleteUser,
};
